'use server'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function headers(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

function apiUrl(path: string): string {
  if (!CMS_API) throw new Error('Missing NEXT_PUBLIC_API_URL')
  return `${CMS_API}${path}`
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
  }
  course: {
    id: string
    title: string
    courseCode: string
    status: string
  }
  status: string
  enrollmentType: string
  enrolledAt: string
  progressPercentage: number
  completedAt: string | null
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
  status: string
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

export async function getEnrollments(params: {
  search?: string
  status?: string
  page?: number
  limit?: number
}): Promise<EnrollmentListResult> {
  const url = new URL(apiUrl('/lms/enrollments/admin'))
  if (params.search) url.searchParams.set('search', params.search)
  if (params.status) url.searchParams.set('status', params.status)
  if (params.page) url.searchParams.set('page', String(params.page))
  if (params.limit) url.searchParams.set('limit', String(params.limit))

  const res = await fetch(url.toString(), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch enrollments: ${res.statusText}`)
  }

  return res.json()
}

export async function getCourses(): Promise<CourseOption[]> {
  const res = await fetch(apiUrl('/courses?depth=0&limit=200&sort=title'), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch courses: ${res.statusText}`)
  }

  const data = await res.json()
  return (data.docs || []).map((c: any) => ({
    id: String(c.id),
    title: c.title,
    courseCode: c.courseCode || '',
    status: c.status,
  }))
}

export async function searchCourses(search: string): Promise<CourseOption[]> {
  if (!search || search.length < 1) return []

  const limit = search.length <= 2 ? '8' : '20'

  const params = new URLSearchParams({
    depth: '0',
    limit,
    sort: 'title',
    'where[or][0][title][like]': search,
    'where[or][1][courseCode][like]': search,
  })

  const res = await fetch(apiUrl(`/courses?${params.toString()}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to search courses: ${res.statusText}`)
  }

  const data = await res.json()
  return (data.docs || []).map((c: any) => ({
    id: String(c.id),
    title: c.title,
    courseCode: c.courseCode || '',
    status: c.status,
  }))
}

export async function searchTrainees(search: string): Promise<TraineeOption[]> {
  if (!search || search.length < 1) return []

  const url = new URL(apiUrl('/lms/enrollments/admin/trainees'))
  url.searchParams.set('search', search)
  url.searchParams.set('limit', '20')

  const res = await fetch(url.toString(), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to search trainees: ${res.statusText}`)
  }

  const data = await res.json()
  return (data.docs || []).map((t: any) => ({
    id: String(t.id),
    user: t.user && typeof t.user === 'object'
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
  status?: string
  notes?: string
}): Promise<EnrollmentDoc> {
  const res = await fetch(apiUrl('/lms/enrollments/admin'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create enrollment: ${res.statusText}`)
  }

  return res.json()
}

export async function deleteEnrollment(id: string): Promise<void> {
  const url = new URL(apiUrl('/lms/enrollments/admin'))
  url.searchParams.set('id', id)

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete enrollment: ${res.statusText}`)
  }
}

export async function archiveEnrollment(id: string): Promise<void> {
  const res = await fetch(apiUrl('/lms/enrollments/admin'), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ id, isArchived: true }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to archive enrollment: ${res.statusText}`)
  }
}

export async function updateEnrollmentStatus(id: string, status: string): Promise<void> {
  const res = await fetch(apiUrl('/lms/enrollments/admin'), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ id, status }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to update enrollment status: ${res.statusText}`)
  }
}
