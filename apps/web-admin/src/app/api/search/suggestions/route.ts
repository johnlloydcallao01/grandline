import { NextRequest, NextResponse } from 'next/server'

const CMS_API = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api'
const API_KEY = process.env.PAYLOAD_API_KEY

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `users API-Key ${API_KEY}`,
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ suggestions: [] })
    }

    const { searchParams } = new URL(request.url)
    const raw = (searchParams.get('q') || '').trim()
    const q = raw.replace(/\s+/g, ' ')

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const searchParamOr = (field: string, idx: number) =>
      `where[or][${idx}][${field}][like]=${encodeURIComponent(q.toLowerCase())}`

    const limit = '8'

    const queries = [
      // Users
      fetch(
        `${CMS_API}/users?${searchParamOr('firstName', 0)}&${searchParamOr('lastName', 1)}&${searchParamOr('email', 2)}&limit=${limit}&depth=0`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).slice(0, 4).map((d: any) => ({
          label: `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.email,
          kind: 'user',
          icon: 'fa-user',
          typeLabel: 'User',
          href: '/users',
        }))
      }).catch(() => []),

      // Courses
      fetch(
        `${CMS_API}/courses?${searchParamOr('title', 0)}&${searchParamOr('courseCode', 1)}&status=published&limit=${limit}&depth=0`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).slice(0, 4).map((d: any) => ({
          label: d.title || '',
          kind: 'course',
          icon: 'fa-book',
          typeLabel: d.courseCode || 'Course',
          href: `/courses/${d.id}/edit`,
        }))
      }).catch(() => []),

      // Announcements
      fetch(
        `${CMS_API}/announcements?${searchParamOr('title', 0)}&limit=${limit}&depth=0`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).slice(0, 2).map((d: any) => ({
          label: d.title || '',
          kind: 'announcement',
          icon: 'fa-bullhorn',
          typeLabel: 'Announcement',
          href: '/announcements',
        }))
      }).catch(() => []),

      // Posts
      fetch(
        `${CMS_API}/posts?${searchParamOr('title', 0)}&status=published&limit=${limit}&depth=0`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).slice(0, 2).map((d: any) => ({
          label: d.title || '',
          kind: 'post',
          icon: 'fa-newspaper',
          typeLabel: 'Post',
          href: `/cms/posts/${d.id}/edit`,
        }))
      }).catch(() => []),

      // Certificates
      fetch(
        `${CMS_API}/certificates?${searchParamOr('certificateCode', 0)}&limit=${limit}&depth=0`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).slice(0, 2).map((d: any) => ({
          label: d.certificateCode || `Certificate ${d.id}`,
          kind: 'certificate',
          icon: 'fa-certificate',
          typeLabel: 'Certificate',
          href: '/certifications/issuance',
        }))
      }).catch(() => []),
    ]

    const allSuggestions = await Promise.all(queries)
    const flat = allSuggestions.flat()

    const seen = new Set<string>()
    const deduped = flat.filter((s) => {
      if (seen.has(s.label)) return false
      seen.add(s.label)
      return true
    })

    return NextResponse.json({ suggestions: deduped.slice(0, 12) })
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}
