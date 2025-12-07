import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.PAYLOAD_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'PAYLOAD_API_KEY': apiKey,
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
    const { searchParams } = new URL(request.url)
    const fresh = searchParams.get('fresh') === '1'
    const response = await fetch(`${apiUrl}/course-categories/active`, {
      headers,
      cache: fresh ? 'no-store' : 'force-cache',
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
