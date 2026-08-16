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

  const instructorRes = await fetch(
    `${CMS_API}/instructors?where[user][equals]=${encodeURIComponent(userId)}&depth=0&limit=1`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!instructorRes.ok) throw new Error('Failed to get instructor profile')
  const instructorData = await instructorRes.json()
  const instructorId = instructorData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return String(instructorId)
}

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (data?.errors?.[0]?.message) return data.errors[0].message
    if (data?.error) return data.error
    if (data?.message) return data.message
  } catch {
    // Fall back to the HTTP status when the response is not JSON.
  }
  return fallback
}

export interface EligibleEnrollment {
  id: number
  studentName: string
  studentEmail: string
  courseId: number
  courseTitle: string
  hasTemplate: boolean
  completedAt?: string
}

export async function getEligibleEnrollments(): Promise<EligibleEnrollment[]> {
  const instructorId = await getInstructorId()

  const courseParams = new URLSearchParams({ depth: '0', limit: '500', sort: 'title' })
  courseParams.set('where[or][0][instructor][equals]', instructorId)
  courseParams.set('where[or][1][coInstructors][contains]', instructorId)

  const courseRes = await fetch(`${CMS_API}/courses?${courseParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!courseRes.ok) throw new Error(await extractError(courseRes, 'Failed to fetch instructor courses'))
  const courseDocs = (await courseRes.json()).docs || []
  if (courseDocs.length === 0) return []

  const courseIds = courseDocs.map((course: any) => String(course.id))

  const enrollmentParams = new URLSearchParams({ depth: '2', limit: '500', sort: '-completedAt' })
  enrollmentParams.set('where[course][in]', courseIds.join(','))
  enrollmentParams.set('where[finalEvaluation][equals]', 'passed')
  enrollmentParams.set('where[certificateIssued][not_equals]', 'true')
  enrollmentParams.set('where[isArchived][not_equals]', 'true')
  enrollmentParams.set('where[status][not_in]', 'dropped,expired,suspended')

  const enrollmentRes = await fetch(`${CMS_API}/course-enrollments?${enrollmentParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!enrollmentRes.ok) throw new Error(await extractError(enrollmentRes, 'Failed to fetch eligible enrollments'))
  const enrollmentDocs = (await enrollmentRes.json()).docs || []

  return enrollmentDocs.map((enrollment: any) => {
    const student = enrollment.student
    const course = enrollment.course
    const studentUser =
      student && typeof student === 'object' && student.user && typeof student.user === 'object'
        ? student.user
        : null
    const courseTitle =
      course && typeof course === 'object'
        ? course.title || `Course #${course.id}`
        : 'Unknown Course'
    const hasTemplate = Boolean(course && typeof course === 'object' && course.certificateTemplate)

    let studentName = `Trainee #${student && typeof student === 'object' ? student.id : enrollment.student}`
    if (studentUser) {
      const name = [studentUser.firstName, studentUser.lastName].filter(Boolean).join(' ')
      studentName = name || studentUser.email || studentName
    } else if (student && typeof student === 'object' && student.srn) {
      studentName = student.srn
    }

    return {
      id: Number(enrollment.id),
      studentName,
      studentEmail: studentUser?.email || '',
      courseId: typeof course === 'number' ? course : course?.id,
      courseTitle,
      hasTemplate,
      completedAt: enrollment.completedAt,
    }
  })
}