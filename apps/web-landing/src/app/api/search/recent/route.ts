import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
        const apiKey = process.env.PAYLOAD_API_KEY || ''
        const { searchParams } = new URL(request.url)
        const userId = Number(searchParams.get('userId') || 0)
        if (!userId || !apiKey) return NextResponse.json({ keywords: [] }, { status: 200 })

        const params = new URLSearchParams()
        params.set('where[user][equals]', String(userId))
        params.set('sort', '-updatedAt')
        params.set('limit', '10')
        params.set('depth', '0')

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `users API-Key ${apiKey}`,
            'PAYLOAD_API_KEY': apiKey,
        }

        const res = await fetch(`${apiUrl}/recent-searches?${params.toString()}`, { headers, cache: 'no-store' })
        if (!res.ok) return NextResponse.json({ keywords: [] }, { status: res.status })
        const json = await res.json()
        const docs: any[] = Array.isArray(json?.docs) ? json.docs : []
        const keywords: string[] = []
        const seen: Record<string, boolean> = {}
        for (const d of docs) {
            const q = String(d?.query || '').trim()
            if (!q) continue
            const k = q.toLowerCase()
            if (seen[k]) continue
            seen[k] = true
            keywords.push(q)
            if (keywords.length >= 10) break
        }
        return NextResponse.json({ keywords })
    } catch (_error) {
        return NextResponse.json({ keywords: [] }, { status: 200 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
        const apiKey = process.env.PAYLOAD_API_KEY || ''
        const body = await request.json()
        const keyword = String(body?.keyword || '').trim()
        const userId = Number(body?.userId || 0)
        const deviceId = request.headers.get('user-agent') || null
        if (!keyword || !userId || !apiKey) return NextResponse.json({ error: 'invalid' }, { status: 400 })

        const normalized = keyword.toLowerCase().replace(/\s+/g, ' ')
        const scope = 'courses'
        const compositeKey = `${userId}:${normalized}:${scope}`

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `users API-Key ${apiKey}`,
            'PAYLOAD_API_KEY': apiKey,
        }

        const res = await fetch(`${apiUrl}/recent-searches`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user: userId,
                query: keyword,
                normalizedQuery: normalized,
                scope,
                compositeKey,
                deviceId,
                source: 'unknown',
            }),
        })

        if (!res.ok) return NextResponse.json({ error: 'cms_error' }, { status: res.status })
        return NextResponse.json({ ok: true })
    } catch (_error) {
        return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }
}
