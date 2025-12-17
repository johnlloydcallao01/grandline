import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase().replace(/\s+/g, ' ')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const categoryLabel = (searchParams.get('categoryLabel') || '').trim().replace(/\s+/g, ' ')

    const apiKey = process.env.PAYLOAD_API_KEY
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`

    const params = new URLSearchParams()
    params.set('status', 'published')
    params.set('limit', String(limit))
    params.set('page', '1')
    params.set('depth', '2')

    // Server-side filtering: Use PayloadCMS where parameter for category
    if (categoryLabel) {
      // Filter by category name on the server side
      params.set('where[category.name][equals]', categoryLabel)
    } else if (q.length >= 2) {
      // Search by both title AND category name using OR logic
      // This allows searching for "Deck Department" to find courses in that category
      params.set('where[or][0][title][contains]', q)
      params.set('where[or][1][category.name][contains]', q)
    }

    // Early return if invalid query
    if (q.length < 2 && !categoryLabel) {
      return NextResponse.json({ results: [] })
    }

    const res = await fetch(`${apiUrl}/courses?${params.toString()}`, { headers, cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ results: [] }, { status: res.status })
    const data = await res.json()
    const docs = Array.isArray(data.docs) ? data.docs : []

    const results = docs.map((c: any) => {
      const thumb = c.thumbnail?.cloudinaryURL || c.thumbnail?.url || undefined
      const subtitle = Array.isArray(c.category) ? c.category.map((x: any) => x?.name).filter(Boolean).join(', ') : c.excerpt || ''
      return {
        id: String(c.id),
        title: String(c.title || ''),
        subtitle: subtitle || undefined,
        thumbnail: thumb,
        href: `/view-course/${c.id}`,
        type: 'course' as const,
      }
    })

    return NextResponse.json({ results })
  } catch (_error) {
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}
