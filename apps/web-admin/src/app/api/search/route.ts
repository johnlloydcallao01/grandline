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
      return NextResponse.json({ results: [] }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim().toLowerCase().replace(/\s+/g, ' ')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    if (q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const perCollectionLimit = Math.min(limit, 10)

    const searchParamOr = (field: string, idx: number) =>
      `where[or][${idx}][${field}][like]=${encodeURIComponent(q)}`

    const queries = [
      // Users
      fetch(
        `${CMS_API}/users?${searchParamOr('firstName', 0)}&${searchParamOr('lastName', 1)}&${searchParamOr('email', 2)}&limit=${perCollectionLimit}&depth=0&sort=-updatedAt`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).map((d: any) => ({
          id: String(d.id),
          title: `${d.firstName || ''} ${d.lastName || ''}`.trim() || d.email,
          subtitle: d.role || 'User',
          type: 'user',
          icon: 'fa-user',
          typeLabel: 'User',
          href: '/users',
        }))
      }).catch(() => []),

      // Courses
      fetch(
        `${CMS_API}/courses?${searchParamOr('title', 0)}&${searchParamOr('courseCode', 1)}&status=published&limit=${perCollectionLimit}&depth=0&sort=-updatedAt`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).map((d: any) => ({
          id: String(d.id),
          title: d.title || '',
          subtitle: d.courseCode || 'Course',
          type: 'course',
          icon: 'fa-book',
          typeLabel: 'Course',
          href: `/courses/${d.id}/edit`,
        }))
      }).catch(() => []),

      // Announcements
      fetch(
        `${CMS_API}/announcements?${searchParamOr('title', 0)}&limit=${perCollectionLimit}&depth=1&sort=-updatedAt`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).map((d: any) => ({
          id: String(d.id),
          title: d.title || '',
          subtitle: d.course?.title || 'Announcement',
          type: 'announcement',
          icon: 'fa-bullhorn',
          typeLabel: 'Announcement',
          href: '/announcements',
        }))
      }).catch(() => []),

      // Posts (blog)
      fetch(
        `${CMS_API}/posts?${searchParamOr('title', 0)}&status=published&limit=${perCollectionLimit}&depth=0&sort=-updatedAt`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).map((d: any) => ({
          id: String(d.id),
          title: d.title || '',
          subtitle: d.slug || 'Post',
          type: 'post',
          icon: 'fa-newspaper',
          typeLabel: 'Post',
          href: `/cms/posts/${d.id}/edit`,
        }))
      }).catch(() => []),

      // Certificates
      fetch(
        `${CMS_API}/certificates?${searchParamOr('certificateCode', 0)}&limit=${perCollectionLimit}&depth=2&sort=-updatedAt`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).map((d: any) => {
          const traineeUser = d.trainee?.user
          const traineeName = traineeUser
            ? `${traineeUser.firstName || ''} ${traineeUser.lastName || ''}`.trim()
            : ''
          return {
            id: String(d.id),
            title: d.certificateCode || `Certificate ${d.id}`,
            subtitle: traineeName || d.status || 'Certificate',
            type: 'certificate',
            icon: 'fa-certificate',
            typeLabel: 'Certificate',
            href: '/certifications/issuance',
          }
        })
      }).catch(() => []),

      // Course categories
      fetch(
        `${CMS_API}/course-categories?${searchParamOr('name', 0)}&limit=${perCollectionLimit}&depth=0&sort=-updatedAt`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).map((d: any) => ({
          id: String(d.id),
          title: d.name || '',
          subtitle: d.categoryType || 'Category',
          type: 'category',
          icon: 'fa-folder',
          typeLabel: 'Category',
          href: '/courses',
        }))
      }).catch(() => []),

      // Instructors
      fetch(
        `${CMS_API}/instructors?${searchParamOr('specialization', 0)}&limit=${perCollectionLimit}&depth=2&sort=-updatedAt`,
        { headers: headers(), cache: 'no-store' },
      ).then(async (r) => {
        if (!r.ok) return []
        const data = await r.json()
        return (data.docs || []).map((d: any) => {
          const instructorUser = d.user
          const instructorName = instructorUser
            ? `${instructorUser.firstName || ''} ${instructorUser.lastName || ''}`.trim()
            : ''
          return {
            id: String(d.id),
            title: instructorName || d.specialization || `Instructor ${d.id}`,
            subtitle: d.specialization || 'Instructor',
            type: 'instructor',
            icon: 'fa-chalkboard-teacher',
            typeLabel: 'Instructor',
            href: '/instructors',
          }
        })
      }).catch(() => []),
    ]

    const allResults = await Promise.all(queries)
    const flat = allResults.flat()

    const deduped = new Map<string, any>()
    for (const r of flat) {
      const key = `${r.type}:${r.id}`
      if (!deduped.has(key)) {
        deduped.set(key, r)
      }
    }

    return NextResponse.json({ results: Array.from(deduped.values()) })
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}
