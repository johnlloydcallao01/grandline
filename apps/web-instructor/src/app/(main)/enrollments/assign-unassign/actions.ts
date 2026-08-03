'use server'

import { cookies } from 'next/headers'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

// Statuses an instructor may set manually. `completed` and `expired` are
// system-transitioned states and are intentionally excluded.
const ALLOWED_STATUSES = ['active', 'pending', 'suspended', 'dropped']

function adminHeaders(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function getInstructorContext(): Promise<{ instructorId: string; userId: string }> {
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

  return { instructorId: String(instructorId), userId: String(userId) }
}

export interface EnrollmentDoc {
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
  notes: string
}

export interface EnrollmentListResult {
  docs: EnrollmentDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

export interface CourseOption {
  id: string
  title: string
  courseCode: string
}

export interface TraineeOption {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  srn: string
}

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (data?.errors?.[0]?.message) return data.errors[0].message
    if (data?.error) return data.error
    if (data?.message) return data.message
  } catch {
    // ignore parse failures and fall back to the status text
  }
  return fallback
}

export async function getEnrollments(params: {
  search?: string
  status?: string
  page?: number
  limit?: number
}): Promise<EnrollmentListResult> {
  const { instructorId } = await getInstructorContext()

  // Scoping boundary: relationship traversal to the instructor's courses only
  // (handles thousands of courses without building a giant `in` list).
  const queryParts = [
    'depth=3',
    `where[course.instructor][equals]=${encodeURIComponent(instructorId)}`,
    'where[isArchived][not_equals]=true',
  ]

  const search = (params?.search || '').trim()
  if (search) {
    const traineeIds = await resolveTraineeIdsByUserSearch(search)
    let orIndex = 0
    if (traineeIds.length > 0) {
      queryParts.push(`where[or][${orIndex}][student][in]=${encodeURIComponent(traineeIds.join(','))}`)
      orIndex++
    }
    queryParts.push(`where[or][${orIndex}][course.title][like]=${encodeURIComponent(search)}`)
  }

  if (params?.status) {
    queryParts.push(`where[status][equals]=${encodeURIComponent(params.status)}`)
  }

  if (params?.page) queryParts.push(`page=${params.page}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push('sort=-enrolledAt')

  const res = await fetch(`${CMS_API}/course-enrollments?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(await extractError(res, `Failed to fetch enrollments: ${res.statusText}`))
  }

  const data = await res.json()

  return {
    docs: (data.docs || []).map((d: any) => normalizeEnrollmentDoc(d)),
    totalDocs: data.totalDocs || 0,
    page: data.page || 1,
    limit: data.limit || 10,
    totalPages: data.totalPages || 0,
  }
}

export async function searchCourses(search: string, limit = 10): Promise<CourseOption[]> {
  const { instructorId } = await getInstructorContext()
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

export async function searchTrainees(search: string): Promise<TraineeOption[]> {
  const trimmed = (search || '').trim()
  if (trimmed.length < 1) return []

  const params = new URLSearchParams({ limit: '200', depth: '0' })
  params.set('where[or][0][firstName][like]', trimmed)
  params.set('where[or][1][lastName][like]', trimmed)
  params.set('where[or][2][email][like]', trimmed)

  if (trimmed.includes(' ')) {
    const [first, last] = trimmed.split(' ')
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
    `${CMS_API}/trainees?where[user][in]=${encodeURIComponent(userIds.join(','))}&depth=2&limit=20&sort=-createdAt`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!traineeRes.ok) return []

  const traineeData = await traineeRes.json()
  return (traineeData.docs || []).map((t: any) => ({
    id: String(t.id),
    user:
      t.user && typeof t.user === 'object'
        ? {
            id: String(t.user.id),
            firstName: t.user.firstName || '',
            lastName: t.user.lastName || '',
            email: t.user.email || '',
          }
        : { id: '', firstName: '', lastName: '', email: '' },
    srn: t.srn || '',
  }))
}

export async function createEnrollment(data: {
  student: string
  course: string
  notes?: string
}): Promise<EnrollmentDoc> {
  const { instructorId, userId } = await getInstructorContext()
  await verifyCourseOwnership(instructorId, data.course)

  const res = await fetch(`${CMS_API}/course-enrollments`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({
      student: Number(data.student),
      course: Number(data.course),
      status: 'active',
      notes: data.notes || '',
      enrolledBy: userId ? Number(userId) : null,
      enrolledAt: new Date().toISOString(),
      progressPercentage: 0,
      enrollmentType: 'free',
      paymentStatus: 'not_required',
    }),
  })

  if (!res.ok) {
    throw new Error(await extractError(res, 'Failed to create enrollment'))
  }

  return normalizeEnrollmentDoc(await res.json())
}

export async function updateEnrollmentStatus(id: string, status: string): Promise<void> {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error('Invalid enrollment status')
  }

  const { instructorId } = await getInstructorContext()
  const enrollment = await getOwnedEnrollment(instructorId, id)
  if (!enrollment) throw new Error('Unauthorized: enrollment does not belong to your courses')

  const res = await fetch(`${CMS_API}/course-enrollments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    throw new Error(await extractError(res, 'Failed to update enrollment status'))
  }
}

export async function unassignEnrollment(id: string): Promise<void> {
  const { instructorId } = await getInstructorContext()
  const enrollment = await getOwnedEnrollment(instructorId, id)
  if (!enrollment) throw new Error('Unauthorized: enrollment does not belong to your courses')

  const notes = (enrollment.notes || '').trim()
  const updatedNotes = `${notes ? `${notes}\n` : ''}Unassigned by instructor at ${new Date().toISOString()}`

  const res = await fetch(`${CMS_API}/course-enrollments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify({ status: 'dropped', notes: updatedNotes }),
  })

  if (!res.ok) {
    throw new Error(await extractError(res, 'Failed to unassign enrollment'))
  }
}

async function verifyCourseOwnership(instructorId: string, courseId: string): Promise<void> {
  const res = await fetch(
    `${CMS_API}/courses?where[instructor][equals]=${encodeURIComponent(instructorId)}&where[id][equals]=${encodeURIComponent(courseId)}&depth=0&limit=1`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!res.ok) throw new Error('Failed to verify course')
  const data = await res.json()
  if (!data.docs || data.docs.length === 0) {
    throw new Error('Unauthorized: course does not belong to your account')
  }
}

async function getOwnedEnrollment(instructorId: string, id: string): Promise<any | null> {
  const res = await fetch(
    `${CMS_API}/course-enrollments?where[id][equals]=${encodeURIComponent(id)}&where[course.instructor][equals]=${encodeURIComponent(instructorId)}&depth=0&limit=1`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!res.ok) throw new Error('Failed to verify enrollment')
  const data = await res.json()
  return data.docs?.[0] || null
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

function normalizeEnrollmentDoc(d: any): EnrollmentDoc {
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
    notes: d.notes || '',
  }
}
