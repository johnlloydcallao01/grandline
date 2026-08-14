import { NextRequest, NextResponse } from 'next/server'
import {
  API_KEY,
  CMS_API,
  apiHeaders,
  getInstructorId,
  getMyCourseIds,
} from '../_shared'

type Suggestion = {
  label: string
  kind: string
  icon?: string
  typeLabel?: string
  href?: string
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

    const instructorId = await getInstructorId()
    if (!instructorId) {
      return NextResponse.json({ suggestions: [] }, { status: 401 })
    }

    const courseIds = await getMyCourseIds(instructorId)
    const enc = encodeURIComponent(q.toLowerCase())
    const limit = 6

    const batches = await Promise.all([
      fetch(
        `${CMS_API}/courses?where[instructor][equals]=${instructorId}&where[or][0][title][like]=${enc}&where[or][1][courseCode][like]=${enc}&limit=${limit}&depth=0`,
        { headers: apiHeaders(), cache: 'no-store' },
      )
        .then(async (r) => {
          if (!r.ok) return [] as Suggestion[]
          const data = await r.json()
          return (data.docs || []).slice(0, 4).map(
            (d: { id: string | number; title?: string; courseCode?: string }) => ({
              label: d.title || '',
              kind: 'course',
              icon: 'fa-book',
              typeLabel: d.courseCode || 'Course',
              href: `/courses/${d.id}/edit`,
            }),
          )
        })
        .catch(() => [] as Suggestion[]),

      fetch(
        `${CMS_API}/assignments?where[instructor][equals]=${instructorId}&where[title][like]=${enc}&limit=${limit}&depth=0`,
        { headers: apiHeaders(), cache: 'no-store' },
      )
        .then(async (r) => {
          if (!r.ok) return [] as Suggestion[]
          const data = await r.json()
          return (data.docs || []).slice(0, 3).map(
            (d: { id: string | number; title?: string }) => ({
              label: d.title || '',
              kind: 'assignment',
              icon: 'fa-tasks',
              typeLabel: 'Assignment',
              href: `/courses/assignments/${d.id}/edit`,
            }),
          )
        })
        .catch(() => [] as Suggestion[]),

      courseIds.length > 0
        ? fetch(
            `${CMS_API}/announcements?where[title][like]=${enc}&${courseIds.map((id, i) => `where[course][in][${i}]=${id}`).join('&')}&limit=${limit}&depth=0`,
            { headers: apiHeaders(), cache: 'no-store' },
          )
            .then(async (r) => {
              if (!r.ok) return [] as Suggestion[]
              const data = await r.json()
              return (data.docs || []).slice(0, 2).map(
                (d: { id: string | number; title?: string }) => ({
                  label: d.title || '',
                  kind: 'announcement',
                  icon: 'fa-bullhorn',
                  typeLabel: 'Announcement',
                  href: '/announcements',
                }),
              )
            })
            .catch(() => [] as Suggestion[])
        : Promise.resolve([] as Suggestion[]),

      courseIds.length > 0
        ? fetch(
            `${CMS_API}/course-enrollments?${courseIds.map((id, i) => `where[course][in][${i}]=${id}`).join('&')}&where[or][0][student.user.firstName][like]=${enc}&where[or][1][student.user.lastName][like]=${enc}&where[or][2][student.srn][like]=${enc}&limit=${limit}&depth=2`,
            { headers: apiHeaders(), cache: 'no-store' },
          )
            .then(async (r) => {
              if (!r.ok) return [] as Suggestion[]
              const data = await r.json()
              return (data.docs || []).slice(0, 3).map(
                (d: {
                  student?: {
                    srn?: string
                    user?: { firstName?: string; lastName?: string; email?: string }
                  }
                }) => {
                  const u = d.student?.user
                  const name =
                    `${u?.firstName || ''} ${u?.lastName || ''}`.trim() ||
                    u?.email ||
                    d.student?.srn ||
                    'Trainee'
                  return {
                    label: name,
                    kind: 'trainee',
                    icon: 'fa-user-graduate',
                    typeLabel: d.student?.srn || 'Trainee',
                    href: '/enrollments/roster',
                  }
                },
              )
            })
            .catch(() => [] as Suggestion[])
        : Promise.resolve([] as Suggestion[]),
    ])

    const flat = batches.flat()
    const seen = new Set<string>()
    const deduped = flat.filter((s) => {
      if (!s.label || seen.has(s.label)) return false
      seen.add(s.label)
      return true
    })

    return NextResponse.json({ suggestions: deduped.slice(0, 12) })
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 200 })
  }
}
