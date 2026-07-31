import type { PayloadRequest } from 'payload'

interface MonthlyBucket {
  month: string
  count: number
}

function buildTrendMap(docs: any[], dateField: string): MonthlyBucket[] {
  const map = new Map<string, number>()
  for (const doc of docs) {
    const raw = doc[dateField]
    if (!raw) continue
    const key = raw.slice(0, 7)
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

function getStudentName(trainee: any): string {
  if (!trainee) return 'Unknown'
  const user = trainee.user
  if (typeof user === 'object' && user) {
    const first = user.firstName || ''
    const last = user.lastName || ''
    if (first || last) return `${first} ${last}`.trim()
    return user.email || 'Unknown'
  }
  return `Student #${trainee.id}`
}

export const getInstructorDashboardSummary = async (req: PayloadRequest): Promise<Response> => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7)

  try {
    const { payload } = req
    const url = new URL(req.url || '', 'http://localhost')
    const userIdFromQuery = url.searchParams.get('userId')

    if (!userIdFromQuery) {
      return Response.json(
        { error: 'userId query parameter required' },
        { status: 400 }
      )
    }

    // 1. Fetch Instructor Profile
    const instructorsRes = await payload.find({
      collection: 'instructors',
      where: {
        user: { equals: userIdFromQuery },
      },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })

    const instructor = instructorsRes.docs[0]
    if (!instructor) {
      return Response.json(
        { error: 'Instructor profile not found' },
        { status: 404 }
      )
    }

    const instructorId = String(instructor.id)

    // 2. Fetch all courses where this instructor is primary or co-instructor
    const coursesRes = await payload.find({
      collection: 'courses',
      where: {
        or: [
          { instructor: { equals: instructorId } },
          { coInstructors: { contains: instructorId } },
        ],
      },
      depth: 1,
      limit: 200,
      overrideAccess: true,
    })

    const courses = coursesRes.docs
    const courseIds = courses.map((c: any) => String(c.id))

    if (courseIds.length === 0) {
      return Response.json({
        success: true,
        data: {
          instructor: { id: instructor.id, specialization: instructor.specialization },
          stats: {
            totalCourses: 0,
            activeCourses: 0,
            totalStudents: 0,
            activeEnrollments: 0,
            completedEnrollments: 0,
            pendingGrading: 0,
            averageProgress: 0,
            averageGrade: 0,
            completionRate: 0,
            totalAssessments: 0,
            totalAssignments: 0,
            unreadFeedbacks: 0,
            recentSubmissions: 0,
            totalCertificates: 0,
          },
          courseStats: [],
          courseTrends: { monthlyEnrollments: [], monthlyCompletions: [] },
          gradeDistribution: [],
          statusDistribution: [],
          recentActivity: [],
          announcements: [],
          pendingSubmissions: [],
        },
        meta: { timestamp: new Date().toISOString(), requestId, responseTimeMs: Date.now() - startTime },
      })
    }

    // 3. Fetch all enrollments for these courses
    const enrollmentsRes = await payload.find({
      collection: 'course-enrollments',
      where: {
        course: { in: courseIds },
      },
      depth: 2,
      limit: 2000,
      overrideAccess: true,
    })

    const enrollments = enrollmentsRes.docs
    const enrollmentIds = enrollments.map((e: any) => String(e.id))

    // 4. Fetch submissions, progress, assessments, assignments in parallel
    const [
      assessmentSubmissionsRes,
      assignmentSubmissionsRes,
      progressRes,
      announcementsRes,
      feedbackSubmissionsRes,
      certificatesRes,
    ] = await Promise.all([
      payload.find({
        collection: 'assessment-submissions',
        where: { course: { in: courseIds } },
        depth: 2,
        limit: 2000,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'assignment-submissions',
        where: { enrollment: { in: enrollmentIds } },
        depth: 2,
        limit: 2000,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'course-item-progress',
        where: { course: { in: courseIds } },
        depth: 1,
        limit: 2000,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'announcements',
        where: { course: { in: courseIds } },
        sort: '-pinned,-createdAt',
        limit: 20,
        depth: 1,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'feedback-submissions',
        where: { course: { in: courseIds } },
        depth: 2,
        limit: 500,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'certificates',
        where: { course: { in: courseIds } },
        depth: 1,
        limit: 500,
        overrideAccess: true,
      }),
    ])

    const assessmentSubmissions = assessmentSubmissionsRes.docs
    const assignmentSubmissions = assignmentSubmissionsRes.docs

    const totalCertificates = certificatesRes.docs.length

    // 5. Compute Stats
    const activeEnrollments = enrollments.filter((e: any) => e.status === 'active')
    const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed')
    const droppedEnrollments = enrollments.filter((e: any) => e.status === 'dropped' || e.status === 'expired')

    const uniqueStudents = new Set(enrollments.map((e: any) =>
      typeof e.student === 'object' ? String(e.student.id) : String(e.student)
    ))

    const pendingGrading = assignmentSubmissions.filter(
      (s: any) => s.status === 'submitted' || s.status === 'returned_for_revision'
    )

    const recentSubmissions = assignmentSubmissions.filter((s: any) => {
      if (!s.submittedAt) return false
      const submittedDate = new Date(s.submittedAt)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return submittedDate >= sevenDaysAgo
    })

    const grades = enrollments
      .map((e: any) => e.currentGrade)
      .filter((g: any) => typeof g === 'number')

    const averageGrade = grades.length > 0
      ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length)
      : 0

    const completionRate = enrollments.length > 0
      ? Math.round((completedEnrollments.length / enrollments.length) * 100)
      : 0

    const itemProgressValues = progressRes.docs
      .map((p: any) => p.progressPercentage)
      .filter((p: any) => typeof p === 'number')

    const averageProgress = itemProgressValues.length > 0
      ? Math.round(itemProgressValues.reduce((a: number, b: number) => a + b, 0) / itemProgressValues.length)
      : enrollments.length > 0
        ? Math.round(enrollments.reduce((a: number, e: any) => a + (e.progressPercentage || 0), 0) / enrollments.length)
        : 0

    const unreadFeedbacks = feedbackSubmissionsRes.docs.filter(
      (f: any) => f.isFeedbackRead === false
    ).length

    // 6. Course-level stats
    const courseStats = courses.map((course: any) => {
      const courseId = String(course.id)
      const courseEnrollments = enrollments.filter((e: any) => {
        const ec = typeof e.course === 'object' ? String(e.course.id) : String(e.course)
        return ec === courseId
      })
      const courseGrades = courseEnrollments
        .map((e: any) => e.currentGrade)
        .filter((g: any) => typeof g === 'number')
      const courseAvgGrade = courseGrades.length > 0
        ? Math.round(courseGrades.reduce((a: number, b: number) => a + b, 0) / courseGrades.length)
        : 0
      const coursePendingGrading = assignmentSubmissions.filter((s: any) => {
        const enrollment = typeof s.enrollment === 'object' ? s.enrollment : null
        if (!enrollment) return false
        const ec = typeof enrollment.course === 'object' ? String(enrollment.course.id) : String(enrollment.course)
        return ec === courseId && (s.status === 'submitted' || s.status === 'returned_for_revision')
      })
      return {
        id: courseId,
        title: course.title,
        courseCode: course.courseCode,
        totalEnrollments: courseEnrollments.length,
        activeEnrollments: courseEnrollments.filter((e: any) => e.status === 'active').length,
        completedEnrollments: courseEnrollments.filter((e: any) => e.status === 'completed').length,
        averageGrade: courseAvgGrade,
        averageProgress: courseEnrollments.length > 0
          ? Math.round(courseEnrollments.reduce((a: number, e: any) => a + (e.progressPercentage || 0), 0) / courseEnrollments.length)
          : 0,
        pendingGrading: coursePendingGrading.length,
      }
    })

    // 7. Grade Distribution
    const gradeDistribution = [
      { range: '90-100%', count: 0, label: 'A' },
      { range: '80-89%', count: 0, label: 'B' },
      { range: '70-79%', count: 0, label: 'C' },
      { range: '60-69%', count: 0, label: 'D' },
      { range: '0-59%', count: 0, label: 'F' },
    ]
    for (const grade of grades) {
      if (grade >= 90) gradeDistribution[0].count++
      else if (grade >= 80) gradeDistribution[1].count++
      else if (grade >= 70) gradeDistribution[2].count++
      else if (grade >= 60) gradeDistribution[3].count++
      else gradeDistribution[4].count++
    }

    // 8. Status Distribution
    const statusDistribution = [
      { status: 'active', count: activeEnrollments.length },
      { status: 'completed', count: completedEnrollments.length },
      { status: 'dropped', count: droppedEnrollments.length },
      { status: 'pending', count: enrollments.filter((e: any) => e.status === 'pending').length },
      { status: 'suspended', count: enrollments.filter((e: any) => e.status === 'suspended').length },
    ].filter(d => d.count > 0)

    // 9. Enrollment Trends
    const monthlyEnrollments = buildTrendMap(enrollments, 'enrolledAt')
    const monthlyCompletions = buildTrendMap(completedEnrollments, 'completedAt')

    // 10. Recent Activity
    const recentActivity: any[] = []

    for (const submission of assignmentSubmissions.slice(0, 10)) {
      const trainee = typeof submission.trainee === 'object' ? submission.trainee : null
      const assignment = typeof submission.assignment === 'object' ? submission.assignment : null
      const enrollment = typeof submission.enrollment === 'object' ? submission.enrollment : null
      let courseTitle = ''
      if (enrollment?.course && typeof enrollment.course === 'object') {
        courseTitle = enrollment.course.title || ''
      }
      recentActivity.push({
        id: `sub-${submission.id}`,
        type: 'submission',
        message: `${getStudentName(trainee)} submitted ${assignment?.title || 'an assignment'}`,
        courseTitle,
        timestamp: submission.submittedAt || submission.createdAt,
      })
    }

    for (const enrollment of enrollments.slice(0, 10)) {
      const student = typeof enrollment.student === 'object' ? enrollment.student : null
      const course = typeof enrollment.course === 'object' ? enrollment.course : null
      recentActivity.push({
        id: `enroll-${enrollment.id}`,
        type: enrollment.status === 'completed' ? 'completion' : 'enrollment',
        message: enrollment.status === 'completed'
          ? `${getStudentName(student)} completed ${course?.title || 'a course'}`
          : `${getStudentName(student)} enrolled in ${course?.title || 'a course'}`,
        courseTitle: course?.title || '',
        timestamp: enrollment.completedAt || enrollment.enrolledAt || enrollment.createdAt,
      })
    }

    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const uniqueActivity = recentActivity.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id)
    ).slice(0, 20)

    // 11. Announcements
    const announcements = announcementsRes.docs.map((a: any) => ({
      id: a.id,
      title: a.title,
      pinned: a.pinned,
      createdAt: a.createdAt,
      courseId: typeof a.course === 'object' && a.course !== null ? String(a.course.id) : String(a.course),
      courseTitle: typeof a.course === 'object' && a.course !== null ? a.course.title : '',
    }))

    // 12. Pending Submissions (detailed)
    const pendingSubmissions = pendingGrading.slice(0, 20).map((s: any) => {
      const trainee = typeof s.trainee === 'object' ? s.trainee : null
      const user = trainee?.user && typeof trainee.user === 'object' ? trainee.user : null
      const assignment = typeof s.assignment === 'object' ? s.assignment : null
      const enrollment = typeof s.enrollment === 'object' ? s.enrollment : null
      let courseTitle = ''
      if (enrollment?.course && typeof enrollment.course === 'object') {
        courseTitle = enrollment.course.title || ''
      }
      return {
        id: s.id,
        traineeName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown',
        assignmentTitle: assignment?.title || 'Unknown',
        courseTitle,
        status: s.status,
        submittedAt: s.submittedAt || s.createdAt,
        score: s.score ?? null,
      }
    })

    return Response.json(
      {
        success: true,
        data: {
          instructor: {
            id: instructor.id,
            specialization: instructor.specialization,
            yearsExperience: instructor.yearsExperience,
            coursesCount: courses.length,
          },
          stats: {
            totalCourses: courses.length,
            activeCourses: courses.filter((c: any) => c.status === 'published').length,
            totalStudents: uniqueStudents.size,
            activeEnrollments: activeEnrollments.length,
            completedEnrollments: completedEnrollments.length,
            pendingGrading: pendingGrading.length,
            averageProgress,
            averageGrade,
            completionRate,
            totalAssessments: assessmentSubmissions.length,
            totalAssignments: assignmentSubmissions.length,
            unreadFeedbacks,
            recentSubmissions: recentSubmissions.length,
            totalCertificates,
          },
          courseStats,
          courseTrends: {
            monthlyEnrollments,
            monthlyCompletions,
          },
          gradeDistribution,
          statusDistribution,
          recentActivity: uniqueActivity,
          announcements,
          pendingSubmissions,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          responseTimeMs: Date.now() - startTime,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[getInstructorDashboardSummary] ERROR:`, error)
    return Response.json(
      {
        success: false,
        error: 'Failed to generate instructor dashboard summary',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
