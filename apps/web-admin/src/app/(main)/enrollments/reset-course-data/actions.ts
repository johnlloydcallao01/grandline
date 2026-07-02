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

export interface EnrollmentOption {
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
  }
  status: string
  progressPercentage: number
  enrolledAt: string
}

export interface ResetResult {
  success: boolean
  summary: {
    deleted: number
    reset: boolean
  }
}

export async function searchEnrollments(search: string): Promise<EnrollmentOption[]> {
  if (!search || search.length < 1) return []

  const params = new URLSearchParams({ search, limit: '20' })
  const res = await fetch(apiUrl(`/lms/enrollments/admin?${params.toString()}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) return []

  const data = await res.json()
  return (data.docs || []).map((d: any) => ({
    id: String(d.id),
    student: d.student && typeof d.student === 'object' ? {
      id: String(d.student.id),
      user: d.student.user && typeof d.student.user === 'object' ? {
        id: String(d.student.user.id),
        firstName: d.student.user.firstName || '',
        lastName: d.student.user.lastName || '',
        email: d.student.user.email || '',
      } : { id: '', firstName: '', lastName: '', email: '' },
    } : { id: '', user: { id: '', firstName: '', lastName: '', email: '' } },
    course: d.course && typeof d.course === 'object' ? {
      id: String(d.course.id),
      title: d.course.title || '',
      courseCode: d.course.courseCode || '',
    } : { id: '', title: '', courseCode: '' },
    status: d.status || '',
    progressPercentage: d.progressPercentage || 0,
    enrolledAt: d.enrolledAt || '',
  }))
}

export async function resetEnrollment(enrollmentId: string): Promise<ResetResult> {
  const res = await fetch(apiUrl('/lms/enrollments/admin/reset'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ enrollmentId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to reset enrollment: ${res.statusText}`)
  }

  return res.json()
}

export async function getEnrollmentProgress(enrollmentId: string): Promise<{ progressPercentage: number; completedItems: number; totalItems: number }> {
  const url = new URL(apiUrl('/lms/enrollments/admin/progress'))
  url.searchParams.set('enrollmentId', enrollmentId)

  const res = await fetch(url.toString(), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    return { progressPercentage: 0, completedItems: 0, totalItems: 0 }
  }

  return res.json()
}
