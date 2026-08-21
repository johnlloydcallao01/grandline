import { NextRequest, NextResponse } from 'next/server'
import { APIError } from 'payload'
import {
  getPayloadClient,
  normalizeUserNotification,
  requireServiceAuth,
} from './_shared'

function getSearchParams(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  return {
    id: searchParams.get('id'),
    userId: searchParams.get('userId'),
  }
}

// Returns a valid numeric user id or null.
function getUserId(request: NextRequest): string | null {
  const userId = getSearchParams(request).userId
  if (!userId || Number.isNaN(Number(userId))) return null
  return userId
}

export async function GET(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const userId = getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    const list = await payload.find({
      collection: 'user-notifications',
      where: { user: { equals: userId } },
      sort: '-deliveredAt',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })

    const docs = (list.docs || []).map(normalizeUserNotification)
    return NextResponse.json({
      docs,
      unreadCount: docs.filter((d: any) => !d.readAt).length,
      unseenCount: docs.filter((d: any) => !d.seenAt).length,
    })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const userId = getUserId(request)
    const body = await request.json().catch(() => ({}))
    const payload = await getPayloadClient()

    if (!params.id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const patchData: Record<string, unknown> = {}
    if (body.readAt !== undefined) patchData.readAt = body.readAt
    if (body.seenAt !== undefined) patchData.seenAt = body.seenAt
    if (body.archived !== undefined) patchData.archived = Boolean(body.archived)

    if (Object.keys(patchData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    // Ownership check: only the owning user may update their own inbox entry.
    const owned = await payload.find({
      collection: 'user-notifications',
      where: { id: { equals: params.id }, user: { equals: userId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (!owned.docs?.length) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const doc = await payload.update({
      collection: 'user-notifications',
      id: params.id,
      data: patchData,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeUserNotification(doc))
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const userId = getUserId(request)
    const body = await request.json().catch(() => ({}))
    const payload = await getPayloadClient()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const action = body.action
    if (action !== 'mark-all-read' && action !== 'mark-all-seen') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const field = action === 'mark-all-read' ? 'readAt' : 'seenAt'
    const where: any = {
      user: { equals: userId },
      [field]: { exists: false },
    }

    const result = await payload.update({
      collection: 'user-notifications',
      where,
      data: { [field]: new Date().toISOString() },
      limit: 0,
      overrideAccess: true,
    })

    const docs = (result as any)?.docs || []
    return NextResponse.json({ success: true, updated: docs.length })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireServiceAuth(request)
  if (unauthorized) return unauthorized

  try {
    const params = getSearchParams(request)
    const userId = getUserId(request)
    const payload = await getPayloadClient()

    if (!params.id) {
      return NextResponse.json({ error: 'Notification id is required' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Ownership check: only the owning user may delete their own inbox entry.
    const owned = await payload.find({
      collection: 'user-notifications',
      where: { id: { equals: params.id }, user: { equals: userId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (!owned.docs?.length) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    await payload.delete({
      collection: 'user-notifications',
      id: params.id,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error instanceof APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 })
  }
}