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

export interface GradebookCourse {
  id: number
  title: string
  code: string
  passingGrade: number
  enrollmentCount: number
  gradedCount: number
  avgGrade: number | null
  passedCount: number
  pendingCount: number
}

export interface GradebookEnrollment {
  id: number
  traineeName: string
  traineeEmail: string
  courseId: number
  courseTitle: string
  status: string
  progressPercentage: number | null
  currentGrade: number | null
  finalGrade: number | null
  finalEvaluation: 'passed' | 'failed' | null
  pendingCount: number
}

export interface GradebookSummary {
  totalCourses: number
  totalEnrollments: number
  totalGraded: number
  averageGrade: number | null
  totalPassed: number
  totalPending: number
}

export interface GradebookData {
  courses: GradebookCourse[]
  enrollments: GradebookEnrollment[]
  summary: GradebookSummary
}

function traineeName(student: any): string {
  if (!student) return 'Unknown Student'
  if (typeof student === 'number') return `Trainee #${student}`
  const user = student.user
  if (user && typeof user === 'object') {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    if (name) return name
    if (user.email) return user.email
  }
  return student.srn || `Trainee #${student.id}`
}

function traineeEmail(student: any): string {
  if (!student || typeof student === 'number') return ''
  const user = student.user
  if (user && typeof user === 'object') return user.email || ''
  return ''
}

export async function getGradebookData(courseId?: number): Promise<GradebookData> {
  const instructorId = await getInstructorId()

  const courseParams = new URLSearchParams({ depth: '0', limit: '500', sort: 'title' })
  if (courseId != null) {
    // Scoped single-course fetch: must belong to the instructor/co-instructed set.
    courseParams.set('where[or][0][id][equals]', String(courseId))
    courseParams.set('where[and][0][or][0][instructor][equals]', instructorId)
    courseParams.set('where[and][0][or][1][coInstructors][contains]', instructorId)
  } else {
    courseParams.set('where[or][0][instructor][equals]', instructorId)
    courseParams.set('where[or][1][coInstructors][contains]', instructorId)
  }

  const courseRes = await fetch(`${CMS_API}/courses?${courseParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!courseRes.ok) throw new Error(await extractError(courseRes, 'Failed to fetch instructor courses'))
  const courseDocs = (await courseRes.json()).docs || []

  if (courseDocs.length === 0) {
    return {
      courses: [],
      enrollments: [],
      summary: { totalCourses: 0, totalEnrollments: 0, totalGraded: 0, averageGrade: null, totalPassed: 0, totalPending: 0 },
    }
  }

  const courseMeta = new Map<number, { title: string; code: string; passingGrade: number }>()
  for (const course of courseDocs) {
    courseMeta.set(Number(course.id), {
      title: course.title || course.courseCode || `Course #${course.id}`,
      code: course.courseCode || '',
      passingGrade: Number(course.passingGrade ?? 70),
    })
  }

  const courseIds = courseDocs.map((course: any) => String(course.id))

  const enrollmentParams = new URLSearchParams({ depth: '2', limit: '2000', sort: '-updatedAt' })
  enrollmentParams.set('where[course][in]', courseIds.join(','))
  const enrollmentRes = await fetch(`${CMS_API}/course-enrollments?${enrollmentParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!enrollmentRes.ok) throw new Error(await extractError(enrollmentRes, 'Failed to fetch enrollments'))
  const enrollmentDocs = (await enrollmentRes.json()).docs || []

  const enrollmentIds = enrollmentDocs.map((enrollment: any) => String(enrollment.id))
  const enrollmentCourse = new Map<number, number>()
  for (const enrollment of enrollmentDocs) {
    const courseId = typeof enrollment.course === 'number' ? enrollment.course : enrollment.course?.id
    if (courseId != null) enrollmentCourse.set(Number(enrollment.id), Number(courseId))
  }

  const pendingByEnrollment = new Map<number, number>()
  if (enrollmentIds.length > 0) {
    const submissionParams = new URLSearchParams({ depth: '0', limit: '500' })
    submissionParams.set('where[enrollment][in]', enrollmentIds.join(','))
    submissionParams.set('where[status][equals]', 'submitted')
    const submissionRes = await fetch(`${CMS_API}/assignment-submissions?${submissionParams.toString()}`, {
      headers: adminHeaders(),
      cache: 'no-store',
    })
    if (!submissionRes.ok) throw new Error(await extractError(submissionRes, 'Failed to fetch pending submissions'))
    const submissionDocs = (await submissionRes.json()).docs || []
    for (const submission of submissionDocs) {
      const enrollmentId = typeof submission.enrollment === 'number' ? submission.enrollment : submission.enrollment?.id
      if (enrollmentId != null) {
        pendingByEnrollment.set(Number(enrollmentId), (pendingByEnrollment.get(Number(enrollmentId)) || 0) + 1)
      }
    }
  }

  const stats = new Map<number, { enrollmentCount: number; gradedCount: number; gradeSum: number; passedCount: number; pendingCount: number }>()
  for (const courseId of courseMeta.keys()) {
    stats.set(courseId, { enrollmentCount: 0, gradedCount: 0, gradeSum: 0, passedCount: 0, pendingCount: 0 })
  }

  const enrollments: GradebookEnrollment[] = []
  for (const enrollment of enrollmentDocs) {
    const courseId = enrollmentCourse.get(Number(enrollment.id))
    if (courseId == null || !stats.has(courseId)) continue
    const course = courseMeta.get(courseId)!
    const pendingCount = pendingByEnrollment.get(Number(enrollment.id)) || 0
    const finalGrade = enrollment.finalGrade != null ? Number(enrollment.finalGrade) : null
    const currentGrade = enrollment.currentGrade != null ? Number(enrollment.currentGrade) : null

    const stat = stats.get(courseId)!
    stat.enrollmentCount += 1
    if (finalGrade != null) {
      stat.gradedCount += 1
      stat.gradeSum += finalGrade
    }
    if (enrollment.finalEvaluation === 'passed') stat.passedCount += 1
    stat.pendingCount += pendingCount

    enrollments.push({
      id: Number(enrollment.id),
      traineeName: traineeName(enrollment.student),
      traineeEmail: traineeEmail(enrollment.student),
      courseId,
      courseTitle: course.title,
      status: enrollment.status || 'active',
      progressPercentage: enrollment.progressPercentage != null ? Number(enrollment.progressPercentage) : null,
      currentGrade,
      finalGrade,
      finalEvaluation: enrollment.finalEvaluation === 'passed' || enrollment.finalEvaluation === 'failed' ? enrollment.finalEvaluation : null,
      pendingCount,
    })
  }

  const courses: GradebookCourse[] = []
  let totalEnrollments = 0
  let totalGraded = 0
  let gradeSum = 0
  let totalPassed = 0
  let totalPending = 0
  for (const [courseId, meta] of courseMeta) {
    const stat = stats.get(courseId)!
    totalEnrollments += stat.enrollmentCount
    totalGraded += stat.gradedCount
    gradeSum += stat.gradeSum
    totalPassed += stat.passedCount
    totalPending += stat.pendingCount
    courses.push({
      id: courseId,
      title: meta.title,
      code: meta.code,
      passingGrade: meta.passingGrade,
      enrollmentCount: stat.enrollmentCount,
      gradedCount: stat.gradedCount,
      avgGrade: stat.gradedCount > 0 ? Math.round(stat.gradeSum / stat.gradedCount) : null,
      passedCount: stat.passedCount,
      pendingCount: stat.pendingCount,
    })
  }

  return {
    courses,
    enrollments,
    summary: {
      totalCourses: courses.length,
      totalEnrollments,
      totalGraded,
      averageGrade: totalGraded > 0 ? Math.round(gradeSum / totalGraded) : null,
      totalPassed,
      totalPending,
    },
  }
}