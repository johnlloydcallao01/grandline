import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raw = (searchParams.get('q') || '').trim()
    const q = raw.replace(/\s+/g, ' ')

    const apiKey = process.env.PAYLOAD_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`

    // If no query yet, just return a few latest published courses as generic suggestions
    if (!q) {
      try {
        const params = new URLSearchParams()
        params.set('status', 'published')
        params.set('limit', '12')
        params.set('page', '1')
        params.set('depth', '0')
        params.set('sort', '-updatedAt')

        const res = await fetch(`${apiUrl}/courses?${params.toString()}`, { headers, cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const docs: any[] = Array.isArray(data.docs) ? data.docs : []
          const suggestions = docs.map(c => ({
            label: String(c.title || ''),
            kind: 'course' as const,
            href: `/view-course/${c.id}`,
          }))
          return NextResponse.json({ suggestions })
        }
      } catch {
        // fall through to empty suggestions below
      }
      return NextResponse.json({ suggestions: [] })
    }

    // For very short queries (e.g. 1 character), always show generic latest courses
    if (q.length < 2) {
      const params = new URLSearchParams()
      params.set('status', 'published')
      params.set('limit', '12')
      params.set('page', '1')
      params.set('depth', '0')
      params.set('sort', '-updatedAt')

      try {
        const res = await fetch(`${apiUrl}/courses?${params.toString()}`, { headers, cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const docs: any[] = Array.isArray(data.docs) ? data.docs : []
          const suggestions = docs.map(c => ({
            label: String(c.title || ''),
            kind: 'course' as const,
            href: `/view-course/${c.id}`,
          }))
          return NextResponse.json({ suggestions })
        }
      } catch {
        // fall through to empty
      }

      return NextResponse.json({ suggestions: [] })
    }

    // With a query length >= 2: search published courses by title and category name
    try {
      const params = new URLSearchParams()
      params.set('status', 'published')
      params.set('limit', '20')
      params.set('page', '1')
      params.set('depth', '0')
      params.set('where[or][0][title][contains]', q.toLowerCase())
      params.set('where[or][1][category.name][contains]', q.toLowerCase())

      const res = await fetch(`${apiUrl}/courses?${params.toString()}`, { headers, cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const docs: any[] = Array.isArray(data.docs) ? data.docs : []

        const dedup: Record<string, boolean> = {}
        const suggestions: { label: string; kind: 'category' | 'course'; href?: string }[] = []

        for (const c of docs) {
          const title = String(c.title || '').trim()
          if (!title) continue
          if (dedup[title]) continue
          dedup[title] = true
          suggestions.push({
            label: title,
            kind: 'course',
            href: `/view-course/${c.id}`,
          })
          if (suggestions.length >= 12) break
        }

        return NextResponse.json({ suggestions })
      }
    } catch {
      // fall through to empty suggestions below
    }

    return NextResponse.json({ suggestions: [] })
  } catch (_error) {
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}
