import { NextRequest, NextResponse } from 'next/server'

function rank(a: string, q: string) {
    const s = a.toLowerCase()
    if (s === q) return 3
    if (s.startsWith(q)) return 2
    if (s.includes(q)) return 1
    return 0
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const raw = (searchParams.get('q') || '').trim().toLowerCase().replace(/\s+/g, ' ')
        const q = raw

        const apiKey = process.env.PAYLOAD_API_KEY
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`

        // Fetch active categories using the same data source as homepage
        const catHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
        if (apiKey) catHeaders['PAYLOAD_API_KEY'] = apiKey
        const catRes = await fetch(`${apiUrl}/course-categories/active`, { headers: catHeaders, cache: 'no-store' })
        const catJson = await catRes.json()
        const cats: any[] = Array.isArray(catJson.categories) ? catJson.categories : []

        const crsRes = await fetch(`${apiUrl}/courses?status=published&limit=50&depth=0`, { headers, cache: 'no-store' })
        const crsJson = await crsRes.json()
        const crs: any[] = Array.isArray(crsJson.docs) ? crsJson.docs : []

        let suggestions: { label: string; kind: 'category' | 'course'; href?: string; score: number }[] = []

        if (!q) {
            const topCats = cats.slice(0, 8).map(c => ({ label: String(c.name || ''), kind: 'category' as const, href: `/courses?category=${encodeURIComponent(c.slug || '')}`, score: 0 }))
            const topCourses = crs.slice(0, 8).map(c => ({ label: String(c.title || ''), kind: 'course' as const, href: `https://app.grandlinemaritime.com/view-course/${c.id}`, score: 0 }))
            suggestions = [...topCats, ...topCourses]
        } else {
            const catMatches = cats.map(c => ({ label: String(c.name || ''), kind: 'category' as const, href: `/courses?category=${encodeURIComponent(c.slug || '')}`, score: rank(String(c.name || ''), q) }))
            const courseMatches = crs.map(c => ({ label: String(c.title || ''), kind: 'course' as const, href: `https://app.grandlinemaritime.com/view-course/${c.id}`, score: rank(String(c.title || ''), q) }))
            suggestions = [...catMatches, ...courseMatches].filter(x => x.score > 0)
            suggestions.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
        }

        const dedup: Record<string, boolean> = {}
        const final = [] as { label: string; kind: 'category' | 'course'; href?: string }[]
        for (const s of suggestions) {
            if (dedup[s.label]) continue
            dedup[s.label] = true
            final.push({ label: s.label, kind: s.kind, href: s.href })
            if (final.length >= 12) break
        }

        return NextResponse.json({ suggestions: final })
    } catch (_error) {
        return NextResponse.json({ suggestions: [] }, { status: 200 })
    }
}
