import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/app/actions/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'

type PushSubscriptionBody = {
  endpoint?: string
  keys?: {
    p256dh?: string
    auth?: string
  }
}

function getApiHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `users API-Key ${apiKey}`,
    PAYLOAD_API_KEY: apiKey,
  }
}

async function fetchUserSubscriptions(userId: number, apiKey: string) {
  const params = new URLSearchParams()
  params.set('where[user][equals]', String(userId))
  params.set('limit', '100')
  params.set('depth', '0')

  const response = await fetch(`${API_URL}/web-push-subscriptions?${params.toString()}`, {
    method: 'GET',
    headers: getApiHeaders(apiKey),
    cache: 'no-store',
  })

  const result = await response.json().catch(() => ({ docs: [] }))
  return {
    ok: response.ok,
    docs: Array.isArray(result.docs) ? result.docs : [],
    status: response.status,
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    const apiKey = process.env.PAYLOAD_API_KEY || ''

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
    }

    const body = await request.json()
    const subscription = body?.subscription as PushSubscriptionBody | undefined
    const permissionState = body?.permissionState || 'granted'

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid push subscription payload' }, { status: 400 })
    }

    const existing = await fetchUserSubscriptions(user.id, apiKey)
    if (!existing.ok) {
      return NextResponse.json({ error: 'Failed to load existing subscriptions' }, { status: existing.status || 500 })
    }

    const matchingSubscription = existing.docs.find((doc: any) => doc.endpoint === subscription.endpoint)
    const now = new Date().toISOString()
    const payload = {
      user: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: request.headers.get('user-agent') || '',
      browser: request.headers.get('sec-ch-ua') || '',
      platform: request.headers.get('sec-ch-ua-platform') || '',
      permissionState,
      isActive: true,
      lastSeenAt: now,
      lastSubscribedAt: now,
      subscriptionJSON: subscription,
    }

    const response = await fetch(
      matchingSubscription
        ? `${API_URL}/web-push-subscriptions/${matchingSubscription.id}`
        : `${API_URL}/web-push-subscriptions`,
      {
        method: matchingSubscription ? 'PATCH' : 'POST',
        headers: getApiHeaders(apiKey),
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    )

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ error: result?.error || result?.message || 'Failed to save push subscription' }, { status: response.status })
    }

    return NextResponse.json({ success: true, doc: result.doc || result })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save push subscription' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getServerUser()
    const apiKey = process.env.PAYLOAD_API_KEY || ''

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const endpoint = body?.endpoint

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing subscription endpoint' }, { status: 400 })
    }

    const existing = await fetchUserSubscriptions(user.id, apiKey)
    if (!existing.ok) {
      return NextResponse.json({ error: 'Failed to load existing subscriptions' }, { status: existing.status || 500 })
    }

    const matchingSubscription = existing.docs.find((doc: any) => doc.endpoint === endpoint)
    if (!matchingSubscription) {
      return NextResponse.json({ success: true })
    }

    const response = await fetch(`${API_URL}/web-push-subscriptions/${matchingSubscription.id}`, {
      method: 'PATCH',
      headers: getApiHeaders(apiKey),
      body: JSON.stringify({
        isActive: false,
        lastSeenAt: new Date().toISOString(),
      }),
      cache: 'no-store',
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      return NextResponse.json({ error: result?.error || result?.message || 'Failed to disable push subscription' }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to disable push subscription' }, { status: 500 })
  }
}
