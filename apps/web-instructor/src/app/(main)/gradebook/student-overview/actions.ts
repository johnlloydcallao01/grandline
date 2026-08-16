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

export interface CourseOption {
  id: number
  title: string
  code: string
  passingGrade: number
}

export interface StudentRow {
  traineeId: number
  name: string
  email: string
  srn: string
  level: string | null
  enrollmentDate: string | null
  enrollmentCount: number
  completedCount: number
  inProgressCount: number
  avgGrade: number | null
  passedCount: number
  certificateCount: number
  pendingCount: number
}

export interface StudentEnrollment {
  id: number
  traineeId: number
  courseId: number
  courseTitle: string
  status: string
  progressPercentage: number | null
  currentGrade: number | null
  finalGrade: number | null
  finalEvaluation: 'passed' | 'failed' | null
  pendingCount: number
}

export interface StudentOverviewData {
  students: StudentRow[]
  enrollments: StudentEnrollment[]
  courses: CourseOption[]
  summary: {
    totalStudents: number
    totalEnrollments: number
    averageGrade: number | null
    totalCompleted: number
    totalPending: number
  }
}

function traineeName(trainee: any): string {
  if (!trainee) return 'Unknown Student'
  if (typeof trainee === 'number') return `Trainee #${trainee}`
  const user = trainee.user
  if (user && typeof user === 'object') {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
    if (name) return name
    if (user.email) return user.email
  }
  return trainee.srn || `Trainee #${trainee.id}`
}

function traineeEmail(trainee: any): string {
  if (!trainee || typeof trainee === 'number') return ''
  const user = trainee.user
  if (user && typeof user === 'object') return user.email || ''
  return ''
}

export async function getInstructorStudentOverview(): Promise<StudentOverviewData> {
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

  if (courseDocs.length === 0) {
    return {
      students: [],
      enrollments: [],
      courses: [],
      summary: { totalStudents: 0, totalEnrollments: 0, averageGrade: null, totalCompleted: 0, totalPending: 0 },
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

  const students = new Map<number, StudentRow>()
  const gradeAccumulators = new Map<number, { sum: number; count: number }>()
  const enrollments: StudentEnrollment[] = []
  for (const enrollment of enrollmentDocs) {
    const courseId = typeof enrollment.course === 'number' ? enrollment.course : enrollment.course?.id
    if (courseId == null || !courseMeta.has(Number(courseId))) continue
    const traineeId = typeof enrollment.student === 'number' ? enrollment.student : enrollment.student?.id
    if (traineeId == null) continue

    const pendingCount = pendingByEnrollment.get(Number(enrollment.id)) || 0
    const finalGrade = enrollment.finalGrade != null ? Number(enrollment.finalGrade) : null
    const currentGrade = enrollment.currentGrade != null ? Number(enrollment.currentGrade) : null

    enrollments.push({
      id: Number(enrollment.id),
      traineeId: Number(traineeId),
      courseId: Number(courseId),
      courseTitle: courseMeta.get(Number(courseId))!.title,
      status: enrollment.status || 'active',
      progressPercentage: enrollment.progressPercentage != null ? Number(enrollment.progressPercentage) : null,
      currentGrade,
      finalGrade,
      finalEvaluation: enrollment.finalEvaluation === 'passed' || enrollment.finalEvaluation === 'failed' ? enrollment.finalEvaluation : null,
      pendingCount,
    })

    let row = students.get(Number(traineeId))
    if (!row) {
      const student = enrollment.student
      row = {
        traineeId: Number(traineeId),
        name: traineeName(student),
        email: traineeEmail(student),
        srn: (student && typeof student === 'object' && student.srn) || '',
        level: (student && typeof student === 'object' && student.currentLevel) || null,
        enrollmentDate: (student && typeof student === 'object' && student.enrollmentDate) || null,
        enrollmentCount: 0,
        completedCount: 0,
        inProgressCount: 0,
        avgGrade: null,
        passedCount: 0,
        certificateCount: 0,
        pendingCount: 0,
      }
      students.set(Number(traineeId), row)
    }

    row.enrollmentCount += 1
    if (enrollment.status === 'completed') row.completedCount += 1
    if (enrollment.status === 'active') row.inProgressCount += 1
    if (finalGrade != null) {
      const acc = gradeAccumulators.get(Number(traineeId)) || { sum: 0, count: 0 }
      acc.sum += finalGrade
      acc.count += 1
      gradeAccumulators.set(Number(traineeId), acc)
    }
    if (enrollment.finalEvaluation === 'passed') row.passedCount += 1
    if (enrollment.certificateIssued) row.certificateCount += 1
    row.pendingCount += pendingCount
  }

  const roster = Array.from(students.values())
    .map((row) => {
      const acc = gradeAccumulators.get(row.traineeId)
      return { ...row, avgGrade: acc && acc.count > 0 ? Math.round(acc.sum / acc.count) : null }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const courses: CourseOption[] = Array.from(courseMeta.entries()).map(([id, meta]) => ({
    id,
    title: meta.title,
    code: meta.code,
    passingGrade: meta.passingGrade,
  }))

  const gradedEnrollments = enrollments.filter((enrollment) => enrollment.finalGrade != null)
  const totalCompleted = enrollments.filter((enrollment) => enrollment.status === 'completed').length

  return {
    students: roster,
    enrollments,
    courses,
    summary: {
      totalStudents: roster.length,
      totalEnrollments: enrollments.length,
      averageGrade: gradedEnrollments.length > 0
        ? Math.round(gradedEnrollments.reduce((sum, enrollment) => sum + (enrollment.finalGrade as number), 0) / gradedEnrollments.length)
        : null,
      totalCompleted,
      totalPending: roster.reduce((sum, row) => sum + row.pendingCount, 0),
    },
  }
}