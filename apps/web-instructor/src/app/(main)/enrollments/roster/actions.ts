'use server'

import { cookies } from 'next/headers'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function adminHeaders(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function getInstructorId(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')

  const meRes = await fetch(`${CMS_API}/users/me`, {
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!meRes.ok) throw new Error('Failed to get current user')
  const meData = await meRes.json()
  const userId = meData?.user?.id || meData?.id
  if (!userId) throw new Error('Could not determine user ID')

  const instRes = await fetch(`${CMS_API}/instructors?where[user][equals]=${userId}&depth=0&limit=1`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!instRes.ok) throw new Error('Failed to get instructor profile')
  const instData = await instRes.json()
  const instructorId = instData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return String(instructorId)
}

export interface RosterCourseOption {
  id: string
  title: string
  courseCode: string
}

export interface RosterDoc {
  id: string
  student: {
    id: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
    srn?: string
  } | string
  course: {
    id: string
    title: string
    courseCode: string
  } | string
  status: string
  enrollmentType: string
  enrolledAt: string
  progressPercentage: number
  currentGrade?: number | null
  finalGrade?: number | null
  certificateIssued?: boolean
}

export interface RosterListResult {
  docs: RosterDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
  selectedCourseId: string | null
}

export async function searchCourses(search: string, limit = 10): Promise<RosterCourseOption[]> {
  const instructorId = await getInstructorId()
  const trimmed = (search || '').trim()

  const params = new URLSearchParams({
    depth: '0',
    limit: String(limit),
    sort: 'title',
  })
  params.set('where[and][0][instructor][equals]', instructorId)

  if (trimmed) {
    params.set('where[and][1][or][0][title][like]', trimmed)
    params.set('where[and][1][or][1][courseCode][like]', trimmed)
  }

  const res = await fetch(`${CMS_API}/courses?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []

  const data = await res.json()
  return (data.docs || []).map((c: any) => ({
    id: String(c.id),
    title: c.title || `Course #${c.id}`,
    courseCode: c.courseCode || '',
  }))
}

export async function getRoster(params?: {
  courseId?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}): Promise<RosterListResult> {
  const instructorId = await getInstructorId()

  // Determine the scoping boundary: a specific validated course, or all of the
  // instructor's courses via relationship traversal (handles thousands of courses
  // without building a giant `in` list in the URL).
  let selectedCourseId: string | null = null
  const queryParts: string[] = ['depth=3', 'where[isArchived][not_equals]=true']

  if (params?.courseId) {
    const verifyRes = await fetch(
      `${CMS_API}/courses?where[instructor][equals]=${instructorId}&where[id][equals]=${params.courseId}&depth=0&limit=1`,
      { headers: adminHeaders(), cache: 'no-store' },
    )
    if (!verifyRes.ok) throw new Error('Failed to verify course')
    const verifyData = await verifyRes.json()
    if (!verifyData.docs || verifyData.docs.length === 0) {
      throw new Error('Unauthorized: course does not belong to your account')
    }
    selectedCourseId = params.courseId
    queryParts.push(`where[course][equals]=${encodeURIComponent(selectedCourseId)}`)
  } else {
    queryParts.push(`where[course.instructor][equals]=${encodeURIComponent(instructorId)}`)
  }

  if (params?.status && params.status !== 'all') {
    queryParts.push(`where[status][equals]=${encodeURIComponent(params.status)}`)
  }

  const search = (params?.search || '').trim()
  if (search) {
    const traineeIds = await resolveTraineeIdsByUserSearch(search)
    if (traineeIds.length === 0) {
      return {
        docs: [],
        totalDocs: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0,
        selectedCourseId,
      }
    }
    queryParts.push(`where[student][in]=${encodeURIComponent(traineeIds.join(','))}`)
  }

  if (params?.page) queryParts.push(`page=${params.page}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push('sort=-enrolledAt')

  const res = await fetch(`${CMS_API}/course-enrollments?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch roster: ${res.statusText}`)
  }

  const data = await res.json()

  return {
    docs: (data.docs || []).map((d: any) => normalizeRosterDoc(d)),
    totalDocs: data.totalDocs || 0,
    page: data.page || 1,
    limit: data.limit || 10,
    totalPages: data.totalPages || 0,
    selectedCourseId,
  }
}

async function resolveTraineeIdsByUserSearch(search: string): Promise<string[]> {
  const params = new URLSearchParams({ limit: '200', depth: '0' })
  params.set('where[or][0][firstName][like]', search)
  params.set('where[or][1][lastName][like]', search)
  params.set('where[or][2][email][like]', search)

  if (search.includes(' ')) {
    const [first, last] = search.split(' ')
    if (first && last) {
      params.set('where[or][3][and][0][firstName][like]', first)
      params.set('where[or][3][and][1][lastName][like]', last)
    }
  }

  const userRes = await fetch(`${CMS_API}/users?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!userRes.ok) return []
  const userData = await userRes.json()
  const userIds = (userData.docs || []).map((u: any) => String(u.id))
  if (userIds.length === 0) return []

  const traineeRes = await fetch(
    `${CMS_API}/trainees?where[user][in]=${encodeURIComponent(userIds.join(','))}&depth=0&limit=200`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!traineeRes.ok) return []
  const traineeData = await traineeRes.json()
  return (traineeData.docs || []).map((t: any) => String(t.id))
}

function normalizeRosterDoc(d: any): RosterDoc {
  const student = d.student && typeof d.student === 'object' ? d.student : null
  const course = d.course && typeof d.course === 'object' ? d.course : null
  return {
    id: String(d.id),
    student: student
      ? {
          id: String(student.id),
          user:
            student.user && typeof student.user === 'object'
              ? {
                  id: String(student.user.id),
                  firstName: student.user.firstName || '',
                  lastName: student.user.lastName || '',
                  email: student.user.email || '',
                }
              : { id: '', firstName: '', lastName: '', email: '' },
          srn: student.srn || '',
        }
      : String(d.student || ''),
    course: course
      ? {
          id: String(course.id),
          title: course.title || '',
          courseCode: course.courseCode || '',
        }
      : String(d.course || ''),
    status: d.status || '',
    enrollmentType: d.enrollmentType || '',
    enrolledAt: d.enrolledAt || '',
    progressPercentage: d.progressPercentage || 0,
    currentGrade: d.currentGrade ?? null,
    finalGrade: d.finalGrade ?? null,
    certificateIssued: d.certificateIssued ?? false,
  }
}
