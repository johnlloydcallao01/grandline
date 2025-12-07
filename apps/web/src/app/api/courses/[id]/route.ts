import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Missing course id' }, { status: 400 })
    }

    const apiKey = process.env.PAYLOAD_API_KEY
    if (!apiKey) {
      console.error('PAYLOAD_API_KEY is not configured')
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `users API-Key ${apiKey}`,
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
    const response = await fetch(`${apiUrl}/courses/${id}?depth=3`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }
      console.error(`PayloadCMS course fetch error: ${response.status}`)
      return NextResponse.json({ error: 'Failed to fetch course' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error in course detail API route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
