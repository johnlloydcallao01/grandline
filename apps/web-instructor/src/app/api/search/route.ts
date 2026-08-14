import { NextRequest, NextResponse } from 'next/server'
import {
  API_KEY,
  CMS_API,
  apiHeaders,
  getInstructorId,
  getMyCourseIds,
  type SearchHit,
} from './_shared'

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

    const instructorId = await getInstructorId()
    if (!instructorId) {
      return NextResponse.json({ results: [] }, { status: 401 })
    }

    const courseIds = await getMyCourseIds(instructorId)
    const per = Math.min(limit, 10)
    const enc = encodeURIComponent(q)

    const results = await Promise.all([
      searchCourses(instructorId, enc, per),
      searchAssignments(instructorId, enc, per),
      courseIds.length > 0 ? searchAnnouncements(courseIds, enc, per) : Promise.resolve([]),
      courseIds.length > 0 ? searchAssessments(courseIds, enc, per) : Promise.resolve([]),
      courseIds.length > 0 ? searchTrainees(courseIds, enc, per) : Promise.resolve([]),
      searchLessons(enc, per),
      searchQuestions(enc, per),
    ])

    const deduped = new Map<string, SearchHit>()
    for (const hit of results.flat()) {
      const key = `${hit.type}:${hit.id}`
      if (!deduped.has(key)) deduped.set(key, hit)
    }

    return NextResponse.json({ results: Array.from(deduped.values()) })
  } catch {
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}

async function searchCourses(
  instructorId: string,
  q: string,
  per: number,
): Promise<SearchHit[]> {
  // Match getCourses pattern: instructor scope + title/code OR
  const parts = [
    'depth=0',
    `limit=${per}`,
    'sort=-updatedAt',
    `where[instructor][equals]=${instructorId}`,
    `where[or][0][title][like]=${q}`,
    `where[or][1][courseCode][like]=${q}`,
  ]
  const res = await fetch(`${CMS_API}/courses?${parts.join('&')}`, {
    headers: apiHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map(
    (d: { id: string | number; title?: string; courseCode?: string; status?: string }) => ({
      id: String(d.id),
      title: d.title || '',
      subtitle: [d.courseCode, d.status].filter(Boolean).join(' · ') || 'Course',
      type: 'course',
      icon: 'fa-book',
      typeLabel: 'Course',
      href: `/courses/${d.id}/edit`,
    }),
  )
}

async function searchAssignments(
  instructorId: string,
  q: string,
  per: number,
): Promise<SearchHit[]> {
  const parts = [
    'depth=0',
    `limit=${per}`,
    'sort=-updatedAt',
    `where[instructor][equals]=${instructorId}`,
    `where[title][like]=${q}`,
  ]
  const res = await fetch(`${CMS_API}/assignments?${parts.join('&')}`, {
    headers: apiHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((d: { id: string | number; title?: string }) => ({
    id: String(d.id),
    title: d.title || '',
    subtitle: 'Assignment',
    type: 'assignment',
    icon: 'fa-tasks',
    typeLabel: 'Assignment',
    href: `/courses/assignments/${d.id}/edit`,
  }))
}

async function searchAnnouncements(
  courseIds: string[],
  q: string,
  per: number,
): Promise<SearchHit[]> {
  const parts = [
    'depth=1',
    `limit=${per}`,
    'sort=-updatedAt',
    `where[title][like]=${q}`,
    ...courseIds.map((id, i) => `where[course][in][${i}]=${id}`),
  ]
  const res = await fetch(`${CMS_API}/announcements?${parts.join('&')}`, {
    headers: apiHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map(
    (d: { id: string | number; title?: string; course?: { title?: string } }) => ({
      id: String(d.id),
      title: d.title || '',
      subtitle: d.course?.title || 'Announcement',
      type: 'announcement',
      icon: 'fa-bullhorn',
      typeLabel: 'Announcement',
      href: '/announcements',
    }),
  )
}

async function searchAssessments(
  courseIds: string[],
  q: string,
  per: number,
): Promise<SearchHit[]> {
  // Assessments link via course (final_exam) or module; filter title then keep those on my graph loosely
  const parts = [
    'depth=1',
    `limit=${Math.max(per * 2, 20)}`,
    'sort=-updatedAt',
    `where[title][like]=${q}`,
  ]
  const res = await fetch(`${CMS_API}/assessments?${parts.join('&')}`, {
    headers: apiHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  const courseSet = new Set(courseIds)
  const docs = (data.docs || []).filter(
    (d: { course?: string | number | { id?: string | number }; module?: unknown }) => {
      const c = d.course
      if (c == null) return true
      const cid = typeof c === 'object' ? String(c.id) : String(c)
      return courseSet.has(cid)
    },
  )
  return docs.slice(0, per).map(
    (d: { id: string | number; title?: string; assessmentType?: string }) => ({
      id: String(d.id),
      title: d.title || '',
      subtitle: d.assessmentType || 'Assessment',
      type: 'assessment',
      icon: 'fa-clipboard-check',
      typeLabel: 'Assessment',
      href: `/courses/assessments/${d.id}/edit`,
    }),
  )
}

async function searchTrainees(
  courseIds: string[],
  q: string,
  per: number,
): Promise<SearchHit[]> {
  const parts = [
    'depth=2',
    `limit=${per}`,
    'sort=-updatedAt',
    ...courseIds.map((id, i) => `where[course][in][${i}]=${id}`),
    `where[or][0][student.user.firstName][like]=${q}`,
    `where[or][1][student.user.lastName][like]=${q}`,
    `where[or][2][student.srn][like]=${q}`,
  ]
  const res = await fetch(`${CMS_API}/course-enrollments?${parts.join('&')}`, {
    headers: apiHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map(
    (d: {
      id: string | number
      student?: {
        srn?: string
        user?: { firstName?: string; lastName?: string; email?: string }
      }
      course?: { title?: string }
      status?: string
    }) => {
      const u = d.student?.user
      const name =
        `${u?.firstName || ''} ${u?.lastName || ''}`.trim() ||
        u?.email ||
        d.student?.srn ||
        `Enrollment ${d.id}`
      return {
        id: String(d.id),
        title: name,
        subtitle:
          [d.student?.srn, d.course?.title, d.status].filter(Boolean).join(' · ') ||
          'Trainee',
        type: 'trainee',
        icon: 'fa-user-graduate',
        typeLabel: 'Trainee',
        href: '/enrollments/roster',
      }
    },
  )
}

async function searchLessons(q: string, per: number): Promise<SearchHit[]> {
  const parts = [
    'depth=1',
    `limit=${per}`,
    'sort=-updatedAt',
    `where[title][like]=${q}`,
  ]
  const res = await fetch(`${CMS_API}/course-lessons?${parts.join('&')}`, {
    headers: apiHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map(
    (d: { id: string | number; title?: string; module?: { title?: string } }) => ({
      id: String(d.id),
      title: d.title || '',
      subtitle: d.module?.title || 'Lesson',
      type: 'lesson',
      icon: 'fa-book-open',
      typeLabel: 'Lesson',
      href: `/courses/lessons/${d.id}/edit`,
    }),
  )
}

async function searchQuestions(q: string, per: number): Promise<SearchHit[]> {
  const parts = [
    'depth=0',
    `limit=${per}`,
    'sort=-updatedAt',
    `where[prompt][like]=${q}`,
  ]
  const res = await fetch(`${CMS_API}/questions?${parts.join('&')}`, {
    headers: apiHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map(
    (d: { id: string | number; prompt?: string; type?: string }) => ({
      id: String(d.id),
      title: d.prompt || `Question ${d.id}`,
      subtitle: d.type || 'Question',
      type: 'question',
      icon: 'fa-question-circle',
      typeLabel: 'Question',
      href: `/courses/questions/${d.id}/edit`,
    }),
  )
}
