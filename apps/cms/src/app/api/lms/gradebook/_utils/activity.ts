// Shared logic for the admin and instructor gradebook activity feeds.
//
// Each route owns its authentication, scoping, and data fetching; this module
// owns the event building, stats, sorting, filtering, and pagination so both
// scopes stay in lockstep (see docs/fetching-solution.md).

export interface ActivityFilters {
  type?: string | null
  courseId?: number | null
  search?: string | null
}

export function studentName(student: any): string {
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

export function courseTitle(course: any): string {
  if (!course) return 'Unknown Course'
  if (typeof course === 'number') return `Course #${course}`
  return course.title || `Course #${course.id}`
}

export function docId(ref: any): number | undefined {
  if (ref == null) return undefined
  return typeof ref === 'number' ? ref : Number(ref?.id)
}

export function buildCourseMap(courseDocs: any[]): Map<number, string> {
  const courseMap = new Map<number, string>()
  for (const course of courseDocs || []) {
    courseMap.set(Number(course.id), course.title || course.courseCode || `Course #${course.id}`)
  }
  return courseMap
}

export function buildEnrollmentEvents(enrollments: any[]): any[] {
  const events: any[] = []
  for (const e of enrollments || []) {
    const name = studentName(e.student)
    const course = courseTitle(e.course)
    const courseId = docId(e.course)
    const studentId = docId(e.student)

    if (e.createdAt && Math.abs(new Date(e.createdAt).getTime() - new Date(e.updatedAt).getTime()) < 5000) {
      events.push({
        id: `enroll-created-${e.id}`,
        type: 'enrollment_created',
        timestamp: e.createdAt,
        traineeName: name,
        traineeId: studentId,
        courseTitle: course,
        courseId,
        enrollmentId: Number(e.id),
        description: `${name} enrolled`,
        detail: course,
        metadata: { enrollmentType: e.enrollmentType, status: e.status },
      })
    }

    if (e.status === 'completed' && e.completedAt) {
      events.push({
        id: `enroll-completed-${e.id}`,
        type: 'enrollment_completed',
        timestamp: e.completedAt,
        traineeName: name,
        traineeId: studentId,
        courseTitle: course,
        courseId,
        enrollmentId: Number(e.id),
        description: `${name} completed`,
        detail: `${course}${e.finalGrade != null ? ` — ${Math.round(Number(e.finalGrade))}%` : ''}${e.finalEvaluation ? ` (${e.finalEvaluation})` : ''}`,
        metadata: { finalGrade: e.finalGrade != null ? Number(e.finalGrade) : null, finalEvaluation: e.finalEvaluation },
      })
    }

    if (e.currentGrade != null && e.status !== 'completed') {
      events.push({
        id: `grade-${e.id}-${e.updatedAt}`,
        type: 'grade_updated',
        timestamp: e.updatedAt,
        traineeName: name,
        traineeId: studentId,
        courseTitle: course,
        courseId,
        enrollmentId: Number(e.id),
        description: `${name} grade updated`,
        detail: `${Math.round(Number(e.currentGrade))}% in ${course}`,
        metadata: { currentGrade: Number(e.currentGrade), finalGrade: e.finalGrade != null ? Number(e.finalGrade) : null },
      })
    }
  }
  return events
}

export function buildAssessmentEvents(submissions: any[]): any[] {
  const events: any[] = []
  for (const s of submissions || []) {
    const name = studentName(s.trainee)
    const assessmentTitle = s.assessment && typeof s.assessment === 'object' ? s.assessment.title || 'Assessment' : 'Assessment'
    const enrollment = s.enrollment
    const course = enrollment?.course
    const courseName = courseTitle(course)

    events.push({
      id: `assess-graded-${s.id}`,
      type: 'assessment_graded',
      timestamp: s.updatedAt,
      traineeName: name,
      traineeId: docId(s.trainee),
      courseTitle: courseName,
      courseId: docId(course),
      enrollmentId: docId(enrollment),
      description: `${name} scored ${s.score ?? 0}%`,
      detail: `on ${assessmentTitle}${courseName !== 'Unknown Course' ? ` — ${courseName}` : ''}`,
      metadata: { score: s.score != null ? Number(s.score) : null, assessmentTitle },
    })
  }
  return events
}

export function buildAssignmentEvents(submissions: any[]): any[] {
  const events: any[] = []
  for (const s of submissions || []) {
    const name = studentName(s.trainee)
    const assignmentTitle = s.assignment && typeof s.assignment === 'object' ? s.assignment.title || 'Assignment' : 'Assignment'
    const enrollment = s.enrollment
    const course = enrollment?.course
    const courseName = courseTitle(course)

    events.push({
      id: `assign-graded-${s.id}`,
      type: 'assignment_graded',
      timestamp: s.gradedAt || s.updatedAt,
      traineeName: name,
      traineeId: docId(s.trainee),
      courseTitle: courseName,
      courseId: docId(course),
      enrollmentId: docId(enrollment),
      description: `${name} scored ${s.score ?? 0}%`,
      detail: `on ${assignmentTitle}${courseName !== 'Unknown Course' ? ` — ${courseName}` : ''}`,
      metadata: { score: s.score != null ? Number(s.score) : null, assignmentTitle },
    })
  }
  return events
}

export function computeStats(events: any[]) {
  return {
    totalEvents: events.length,
    gradedAssignments: events.filter((e) => e.type === 'assignment_graded').length,
    gradedAssessments: events.filter((e) => e.type === 'assessment_graded').length,
    newEnrollments: events.filter((e) => e.type === 'enrollment_created').length,
    completions: events.filter((e) => e.type === 'enrollment_completed').length,
  }
}

export function filterEvents(events: any[], filters: ActivityFilters): any[] {
  let filtered = events

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter((e) => e.type === filters.type)
  }

  if (filters.courseId) {
    filtered = filtered.filter((e) => e.courseId === filters.courseId)
  }

  const query = (filters.search || '').trim().toLowerCase()
  if (query) {
    filtered = filtered.filter((e) =>
      [e.traineeName, e.courseTitle, e.description, e.detail]
        .some((value) => value != null && value.toLowerCase().includes(query)),
    )
  }

  return filtered
}

export function paginateEvents(events: any[], page: number, limit: number) {
  const totalDocs = events.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
  const start = (page - 1) * limit
  return { docs: events.slice(start, start + limit), totalDocs, totalPages }
}

export function buildActivityResult(input: {
  enrollments: any[]
  assessmentSubs: any[]
  assignmentSubs: any[]
  courseMap: Map<number, string>
  page: number
  limit: number
  filters: ActivityFilters
}) {
  const events = [
    ...buildEnrollmentEvents(input.enrollments),
    ...buildAssessmentEvents(input.assessmentSubs),
    ...buildAssignmentEvents(input.assignmentSubs),
  ]
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const stats = computeStats(events)
  const filtered = filterEvents(events, input.filters)
  const { docs, totalDocs, totalPages } = paginateEvents(filtered, input.page, input.limit)
  const courses = Array.from(input.courseMap.entries()).map(([id, title]) => ({ id, title }))

  return { events: docs, totalDocs, totalPages, page: input.page, limit: input.limit, stats, courses }
}
