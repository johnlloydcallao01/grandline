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

function courseTitle(course: any): string {
  if (!course) return 'Unknown Course'
  if (typeof course === 'number') return `Course #${course}`
  return course.title || `Course #${course.id}`
}

export interface ActivityEvent {
  id: string
  type: 'enrollment_created' | 'enrollment_completed' | 'grade_updated' | 'assignment_graded' | 'assessment_graded'
  timestamp: string
  traineeName?: string
  traineeId?: number
  courseTitle?: string
  courseId?: number
  enrollmentId?: number
  description: string
  detail: string
  metadata?: Record<string, any>
}

export interface ActivityStats {
  totalEvents: number
  gradedAssignments: number
  gradedAssessments: number
  newEnrollments: number
  completions: number
}

export interface CourseOption {
  id: number
  title: string
}

export interface RecentActivityResult {
  events: ActivityEvent[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  stats: ActivityStats
  courses: CourseOption[]
}

function emptyResult(): RecentActivityResult {
  return {
    events: [],
    totalDocs: 0,
    totalPages: 0,
    page: 1,
    limit: 20,
    stats: { totalEvents: 0, gradedAssignments: 0, gradedAssessments: 0, newEnrollments: 0, completions: 0 },
    courses: [],
  }
}

export async function getRecentActivity(params: {
  page?: number
  limit?: number
  type?: string
  courseId?: number | string
  search?: string
}): Promise<RecentActivityResult> {
  const instructorId = await getInstructorId()

  // Scoping boundary: only events tied to the instructor's owned/co-taught courses.
  const courseParams = new URLSearchParams({ depth: '0', limit: '500', sort: 'title' })
  courseParams.set('where[or][0][instructor][equals]', instructorId)
  courseParams.set('where[or][1][coInstructors][contains]', instructorId)

  const courseRes = await fetch(`${CMS_API}/courses?${courseParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!courseRes.ok) throw new Error(await extractError(courseRes, 'Failed to fetch instructor courses'))
  const courseDocs = (await courseRes.json()).docs || []

  if (courseDocs.length === 0) return emptyResult()

  const courseMap = new Map<number, string>()
  for (const course of courseDocs) {
    courseMap.set(Number(course.id), course.title || course.courseCode || `Course #${course.id}`)
  }
  const courseIds = courseDocs.map((course: any) => String(course.id))

  const enrollmentParams = new URLSearchParams({ depth: '2', limit: '1000', sort: '-updatedAt' })
  enrollmentParams.set('where[course][in]', courseIds.join(','))
  const enrollmentRes = await fetch(`${CMS_API}/course-enrollments?${enrollmentParams.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!enrollmentRes.ok) throw new Error(await extractError(enrollmentRes, 'Failed to fetch enrollments'))
  const enrollmentDocs = (await enrollmentRes.json()).docs || []

  const enrollmentIds = enrollmentDocs.map((enrollment: any) => String(enrollment.id))

  let assessDocs: any[] = []
  let assignDocs: any[] = []
  if (enrollmentIds.length > 0) {
    const assessParams = new URLSearchParams({ depth: '2', limit: '1000', sort: '-updatedAt' })
    assessParams.set('where[enrollment][in]', enrollmentIds.join(','))
    assessParams.set('where[status][equals]', 'graded')

    const assignParams = new URLSearchParams({ depth: '2', limit: '1000', sort: '-updatedAt' })
    assignParams.set('where[enrollment][in]', enrollmentIds.join(','))
    assignParams.set('where[status][equals]', 'graded')

    const [assessRes, assignRes] = await Promise.all([
      fetch(`${CMS_API}/assessment-submissions?${assessParams.toString()}`, {
        headers: adminHeaders(),
        cache: 'no-store',
      }),
      fetch(`${CMS_API}/assignment-submissions?${assignParams.toString()}`, {
        headers: adminHeaders(),
        cache: 'no-store',
      }),
    ])
    if (!assessRes.ok) throw new Error(await extractError(assessRes, 'Failed to fetch graded assessments'))
    if (!assignRes.ok) throw new Error(await extractError(assignRes, 'Failed to fetch graded assignments'))
    assessDocs = (await assessRes.json()).docs || []
    assignDocs = (await assignRes.json()).docs || []
  }

  const events: ActivityEvent[] = []

  for (const enrollment of enrollmentDocs) {
    const student = enrollment.student
    const studentName = traineeName(student)
    const studentId = typeof student === 'number' ? student : student?.id
    const course = enrollment.course
    const courseId = typeof course === 'number' ? course : course?.id
    const courseName = courseTitle(course)

    if (enrollment.createdAt && Math.abs(new Date(enrollment.createdAt).getTime() - new Date(enrollment.updatedAt).getTime()) < 5000) {
      events.push({
        id: `enroll-created-${enrollment.id}`,
        type: 'enrollment_created',
        timestamp: enrollment.createdAt,
        traineeName: studentName,
        traineeId: studentId,
        courseTitle: courseName,
        courseId,
        enrollmentId: Number(enrollment.id),
        description: `${studentName} enrolled`,
        detail: courseName,
        metadata: { enrollmentType: enrollment.enrollmentType, status: enrollment.status },
      })
    }

    if (enrollment.status === 'completed' && enrollment.completedAt) {
      events.push({
        id: `enroll-completed-${enrollment.id}`,
        type: 'enrollment_completed',
        timestamp: enrollment.completedAt,
        traineeName: studentName,
        traineeId: studentId,
        courseTitle: courseName,
        courseId,
        enrollmentId: Number(enrollment.id),
        description: `${studentName} completed`,
        detail: `${courseName}${enrollment.finalGrade != null ? ` — ${Math.round(enrollment.finalGrade)}%` : ''}${enrollment.finalEvaluation ? ` (${enrollment.finalEvaluation})` : ''}`,
        metadata: { finalGrade: enrollment.finalGrade, finalEvaluation: enrollment.finalEvaluation },
      })
    }

    if (enrollment.currentGrade != null && enrollment.status !== 'completed') {
      events.push({
        id: `grade-${enrollment.id}-${enrollment.updatedAt}`,
        type: 'grade_updated',
        timestamp: enrollment.updatedAt,
        traineeName: studentName,
        traineeId: studentId,
        courseTitle: courseName,
        courseId,
        enrollmentId: Number(enrollment.id),
        description: `${studentName} grade updated`,
        detail: `${Math.round(enrollment.currentGrade)}% in ${courseName}`,
        metadata: { currentGrade: enrollment.currentGrade, finalGrade: enrollment.finalGrade },
      })
    }
  }

  for (const submission of assessDocs) {
    const submissionTrainee = submission.trainee
    const submissionName = traineeName(submissionTrainee)
    const submissionId = typeof submissionTrainee === 'number' ? submissionTrainee : submissionTrainee?.id
    const assessmentTitle = typeof submission.assessment === 'object' ? submission.assessment?.title || 'Assessment' : 'Assessment'
    const enrollment = submission.enrollment
    const course = enrollment?.course
    const courseId = typeof course === 'number' ? course : course?.id
    const courseName = courseTitle(course)

    events.push({
      id: `assess-graded-${submission.id}`,
      type: 'assessment_graded',
      timestamp: submission.updatedAt,
      traineeName: submissionName,
      traineeId: submissionId,
      courseTitle: courseName,
      courseId,
      enrollmentId: typeof enrollment === 'number' ? enrollment : enrollment?.id,
      description: `${submissionName} scored ${submission.score ?? 0}%`,
      detail: `on ${assessmentTitle}${courseName !== 'Unknown Course' ? ` — ${courseName}` : ''}`,
      metadata: { score: submission.score, assessmentTitle },
    })
  }

  for (const submission of assignDocs) {
    const submissionTrainee = submission.trainee
    const submissionName = traineeName(submissionTrainee)
    const submissionId = typeof submissionTrainee === 'number' ? submissionTrainee : submissionTrainee?.id
    const assignmentTitle = typeof submission.assignment === 'object' ? submission.assignment?.title || 'Assignment' : 'Assignment'
    const enrollment = submission.enrollment
    const course = enrollment?.course
    const courseId = typeof course === 'number' ? course : course?.id
    const courseName = courseTitle(course)

    events.push({
      id: `assign-graded-${submission.id}`,
      type: 'assignment_graded',
      timestamp: submission.gradedAt || submission.updatedAt,
      traineeName: submissionName,
      traineeId: submissionId,
      courseTitle: courseName,
      courseId,
      enrollmentId: typeof enrollment === 'number' ? enrollment : enrollment?.id,
      description: `${submissionName} scored ${submission.score ?? 0}%`,
      detail: `on ${assignmentTitle}${courseName !== 'Unknown Course' ? ` — ${courseName}` : ''}`,
      metadata: { score: submission.score, assignmentTitle },
    })
  }

  // Sort every event by timestamp before any slicing so the feed is truly most-recent-first.
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const stats: ActivityStats = {
    totalEvents: events.length,
    gradedAssignments: events.filter((e) => e.type === 'assignment_graded').length,
    gradedAssessments: events.filter((e) => e.type === 'assessment_graded').length,
    newEnrollments: events.filter((e) => e.type === 'enrollment_created').length,
    completions: events.filter((e) => e.type === 'enrollment_completed').length,
  }

  let filtered = events
  const typeFilter = params.type
  if (typeFilter) filtered = filtered.filter((e) => e.type === typeFilter)

  const courseFilter = params.courseId != null ? Number(params.courseId) : null
  if (courseFilter) filtered = filtered.filter((e) => e.courseId === courseFilter)

  const query = (params.search || '').trim().toLowerCase()
  if (query) {
    filtered = filtered.filter((e) =>
      [e.traineeName, e.courseTitle, e.description, e.detail]
        .some((value) => value != null && value.toLowerCase().includes(query)),
    )
  }

  const limit = params.limit || 20
  const page = params.page || 1
  const totalDocs = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
  const start = (page - 1) * limit
  const docs = filtered.slice(start, start + limit)

  const courses: CourseOption[] = Array.from(courseMap.entries()).map(([id, title]) => ({ id, title }))

  return { events: docs, totalDocs, totalPages, page, limit, stats, courses }
}
