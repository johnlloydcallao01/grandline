import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
    const apiKey = process.env.PAYLOAD_API_KEY || ''
    const body = await request.json()
    const keyword = String(body?.keyword || '').trim()
    const userId = Number(body?.userId || 0)
    const deviceId = request.headers.get('user-agent') || null
    if (!keyword || !userId || !apiKey) return NextResponse.json({ error: 'invalid' }, { status: 400 })

    const res = await fetch(`${apiUrl}/recent-searches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `users API-Key ${apiKey}`,
        'PAYLOAD_API_KEY': apiKey,
      },
      body: JSON.stringify({ keyword, userId, deviceId }),
    })

    if (!res.ok) return NextResponse.json({ error: 'cms_error' }, { status: res.status })
    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
