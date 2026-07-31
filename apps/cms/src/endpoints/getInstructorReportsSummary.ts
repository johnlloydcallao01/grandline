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

export const getInstructorReportsSummary = async (req: PayloadRequest): Promise<Response> => {
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

    const instructorsRes = await payload.find({
      collection: 'instructors',
      where: { user: { equals: userIdFromQuery } },
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

    const emptyResponse = () => ({
      overview: {
        totalCourses: 0,
        totalEnrollments: 0,
        totalStudents: 0,
        totalInstructors: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        droppedEnrollments: 0,
        completionRate: 0,
        totalCertificates: 0,
        totalAssessments: 0,
        totalAssignments: 0,
        avgGrade: 0,
        avgProgress: 0,
      },
      learners: {
        totalTrainees: 0,
        enrollmentStatusDistribution: [],
        gradeDistribution: [],
        enrollmentTypeDistribution: [],
        newTraineesThisMonth: 0,
        activeTrainees: 0,
      },
      courses: {
        totalCourses: 0,
        courseStatusDistribution: [],
        categoryDistribution: [],
        topCourses: [],
        avgCompletionRate: 0,
        avgEnrollmentPerCourse: 0,
        difficultyDistribution: [],
      },
      assessments: {
        totalSubmissions: 0,
        totalAssessments: 0,
        passRate: 0,
        avgScore: 0,
        passFailDistribution: [],
        scoreDistribution: [],
        monthlySubmissions: [],
        avgAttempts: 0,
      },
      certifications: {
        totalCertificates: 0,
        activeCertificates: 0,
        revokedCertificates: 0,
        expiredCertificates: 0,
        certificateDates: [],
        topCourses: [],
        certComplianceRate: 0,
      },
    })

    if (courseIds.length === 0) {
      return Response.json({
        success: true,
        data: emptyResponse(),
        meta: { timestamp: new Date().toISOString(), requestId, responseTimeMs: Date.now() - startTime },
      })
    }

    // 1. Fetch enrollments first (needed for enrollmentIds used by assignment-submissions)
    const enrollmentsRes = await payload.find({
      collection: 'course-enrollments',
      where: { course: { in: courseIds } },
      depth: 2,
      limit: 2000,
      overrideAccess: true,
    })

    const enrollments = enrollmentsRes.docs
    const enrollmentIds = enrollments.map((e: any) => String(e.id))

    // 2. Fetch in parallel: assessment submissions, assignment submissions, certificates
    const [assessmentSubmissionsRes, assignmentSubmissionsRes, certificatesRes] = await Promise.all([
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
        collection: 'certificates',
        where: { course: { in: courseIds } },
        depth: 1,
        limit: 500,
        overrideAccess: true,
      }),
    ])

    const assessmentSubmissions = assessmentSubmissionsRes.docs
    const assignmentSubmissions = assignmentSubmissionsRes.docs
    const certificates = certificatesRes.docs

    // === OVERVIEW COMPUTATION ===

    const activeEnrollments = enrollments.filter((e: any) => e.status === 'active')
    const completedEnrollments = enrollments.filter((e: any) => e.status === 'completed')
    const droppedEnrollments = enrollments.filter((e: any) => e.status === 'dropped' || e.status === 'expired')

    const uniqueStudents = new Set(enrollments.map((e: any) =>
      typeof e.student === 'object' ? String(e.student.id) : String(e.student)
    ))

    const grades = enrollments
      .map((e: any) => e.currentGrade)
      .filter((g: any) => typeof g === 'number')

    const avgGrade = grades.length > 0
      ? Math.round(grades.reduce((a: number, b: number) => a + b, 0) / grades.length)
      : 0

    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((a: number, e: any) => a + (e.progressPercentage || 0), 0) / enrollments.length)
      : 0

    const completionRate = enrollments.length > 0
      ? Math.round((completedEnrollments.length / enrollments.length) * 100)
      : 0

    // === LEARNERS COMPUTATION ===

    const gradeDistribution = [
      { range: '90-100%', count: 0 },
      { range: '80-89%', count: 0 },
      { range: '70-79%', count: 0 },
      { range: '60-69%', count: 0 },
      { range: '0-59%', count: 0 },
    ]
    for (const grade of grades) {
      if (grade >= 90) gradeDistribution[0].count++
      else if (grade >= 80) gradeDistribution[1].count++
      else if (grade >= 70) gradeDistribution[2].count++
      else if (grade >= 60) gradeDistribution[3].count++
      else gradeDistribution[4].count++
    }

    const enrollmentStatusDistribution = [
      { status: 'active', count: activeEnrollments.length },
      { status: 'completed', count: completedEnrollments.length },
      { status: 'dropped', count: droppedEnrollments.length },
    ].filter(d => d.count > 0)

    const enrollmentTypeMap = new Map<string, number>()
    for (const e of enrollments) {
      const type = e.enrollmentType || 'free'
      enrollmentTypeMap.set(type, (enrollmentTypeMap.get(type) || 0) + 1)
    }
    const enrollmentTypeDistribution = Array.from(enrollmentTypeMap.entries())
      .map(([type, count]) => ({ type, count }))

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const newTraineesThisMonth = enrollments.filter((e: any) => {
      if (!e.enrolledAt) return false
      return e.enrolledAt.slice(0, 7) === currentMonth
    }).length

    // === COURSES COMPUTATION ===

    const courseStatusMap = new Map<string, number>()
    const categoryMap = new Map<string, number>()
    const difficultyMap = new Map<string, number>()
    const courseEnrollmentCounts: { id: string; title: string; enrollmentCount: number; completionRate: number; avgGrade: number; status: string }[] = []

    for (const course of courses) {
      const cId = String(course.id)
      const status = course.status || 'draft'
      courseStatusMap.set(status, (courseStatusMap.get(status) || 0) + 1)

      // category is hasMany: true — array of relationships
      const cats = course.category
      if (Array.isArray(cats)) {
        for (const cat of cats) {
          const catName = typeof cat === 'object' && cat !== null ? (cat as any).name || 'Unknown' : 'Unknown'
          categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1)
        }
      }

      const diff = course.difficultyLevel || 'standard'
      difficultyMap.set(diff, (difficultyMap.get(diff) || 0) + 1)

      const courseEnrollments = enrollments.filter((e: any) => {
        const ec = typeof e.course === 'object' ? String(e.course.id) : String(e.course)
        return ec === cId
      })
      const courseGrades = courseEnrollments
        .map((e: any) => e.currentGrade)
        .filter((g: any) => typeof g === 'number')
      const courseAvgGrade = courseGrades.length > 0
        ? Math.round(courseGrades.reduce((a: number, b: number) => a + b, 0) / courseGrades.length)
        : 0
      const courseCompleted = courseEnrollments.filter((e: any) => e.status === 'completed')
      const courseCompletionRate = courseEnrollments.length > 0
        ? Math.round((courseCompleted.length / courseEnrollments.length) * 100)
        : 0

      courseEnrollmentCounts.push({
        id: cId,
        title: course.title || 'Untitled',
        enrollmentCount: courseEnrollments.length,
        completionRate: courseCompletionRate,
        avgGrade: courseAvgGrade,
        status,
      })
    }

    const courseStatusDistribution = Array.from(courseStatusMap.entries())
      .map(([status, count]) => ({ status, count }))

    const categoryDistribution = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count, percentage: 0 }))
    const totalCats = categoryDistribution.reduce((s, d) => s + d.count, 0)
    for (const d of categoryDistribution) {
      d.percentage = totalCats > 0 ? Math.round((d.count / totalCats) * 100) : 0
    }

    const difficultyDistribution = Array.from(difficultyMap.entries())
      .map(([level, count]) => ({ level, count }))

    const topCourses = [...courseEnrollmentCounts]
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, 10)

    const avgEnrollmentPerCourse = courses.length > 0
      ? Math.round(enrollments.length / courses.length)
      : 0

    const avgCompletionRate = courses.length > 0
      ? Math.round(topCourses.reduce((s, c) => s + c.completionRate, 0) / topCourses.length)
      : 0

    // === ASSESSMENTS COMPUTATION ===
    // AssessmentSubmission statuses: in_progress, submitted, graded
    // Determine pass/fail based on score vs 70% threshold when status is 'graded'

    const gradedSubmissions = assessmentSubmissions.filter((s: any) => s.status === 'graded')
    const passedSubmissions = gradedSubmissions.filter((s: any) => {
      const score = s.score
      return typeof score === 'number' && score >= 70
    })
    const failedSubmissions = gradedSubmissions.filter((s: any) => {
      const score = s.score
      return typeof score === 'number' && score < 70
    })

    const passFailDistribution = [
      { status: 'passed', count: passedSubmissions.length },
      { status: 'failed', count: failedSubmissions.length },
    ].filter(d => d.count > 0)

    const assessmentScores = assessmentSubmissions
      .map((s: any) => s.score)
      .filter((s: any) => typeof s === 'number')
    const avgScore = assessmentScores.length > 0
      ? Math.round(assessmentScores.reduce((a: number, b: number) => a + b, 0) / assessmentScores.length)
      : 0
    const passRate = gradedSubmissions.length > 0
      ? Math.round((passedSubmissions.length / gradedSubmissions.length) * 100)
      : 0

    const scoreDistribution = [
      { range: '90-100%', count: 0 },
      { range: '80-89%', count: 0 },
      { range: '70-79%', count: 0 },
      { range: '60-69%', count: 0 },
      { range: '0-59%', count: 0 },
    ]
    for (const score of assessmentScores) {
      if (score >= 90) scoreDistribution[0].count++
      else if (score >= 80) scoreDistribution[1].count++
      else if (score >= 70) scoreDistribution[2].count++
      else if (score >= 60) scoreDistribution[3].count++
      else scoreDistribution[4].count++
    }

    // AssessmentSubmissions has completedAt (not submittedAt)
    const monthlySubmissions = buildTrendMap(assessmentSubmissions, 'completedAt')

    const attempts = assessmentSubmissions
      .map((s: any) => s.attemptNumber)
      .filter((a: any) => typeof a === 'number')
    const avgAttempts = attempts.length > 0
      ? Math.round((attempts.reduce((a: number, b: number) => a + b, 0) / attempts.length) * 10) / 10
      : 0

    // === CERTIFICATIONS COMPUTATION ===
    // Certificate statuses: active, revoked, expired
    // Date field: issueDate (not issuedAt)

    const activeCertificates = certificates.filter((c: any) => c.status === 'active')
    const revokedCerts = certificates.filter((c: any) => c.status === 'revoked')
    const expiredCerts = certificates.filter((c: any) => c.status === 'expired')

    const certificateDates = certificates
      .map((c: any) => c.issueDate)
      .filter(Boolean)

    const certCourseMap = new Map<string, number>()
    for (const cert of certificates) {
      const c = typeof cert.course === 'object' && cert.course !== null ? cert.course : null
      if (c && c.title) {
        certCourseMap.set(c.title, (certCourseMap.get(c.title) || 0) + 1)
      }
    }
    const topCertCourses = Array.from(certCourseMap.entries())
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const certComplianceRate = completedEnrollments.length > 0
      ? Math.round((certificates.length / completedEnrollments.length) * 100)
      : 0

    return Response.json(
      {
        success: true,
        data: {
          overview: {
            totalCourses: courses.length,
            totalEnrollments: enrollments.length,
            totalStudents: uniqueStudents.size,
            totalInstructors: 1,
            activeEnrollments: activeEnrollments.length,
            completedEnrollments: completedEnrollments.length,
            droppedEnrollments: droppedEnrollments.length,
            completionRate,
            totalCertificates: certificates.length,
            totalAssessments: assessmentSubmissions.length,
            totalAssignments: assignmentSubmissions.length,
            avgGrade,
            avgProgress,
          },
          learners: {
            totalTrainees: uniqueStudents.size,
            enrollmentStatusDistribution,
            gradeDistribution,
            enrollmentTypeDistribution,
            newTraineesThisMonth,
            activeTrainees: activeEnrollments.length,
          },
          courses: {
            totalCourses: courses.length,
            courseStatusDistribution,
            categoryDistribution,
            topCourses,
            avgCompletionRate: avgCompletionRate || 0,
            avgEnrollmentPerCourse,
            difficultyDistribution,
          },
          assessments: {
            totalSubmissions: assessmentSubmissions.length,
            totalAssessments: new Set(assessmentSubmissions.map((s: any) =>
              typeof s.assessment === 'object' ? String(s.assessment.id) : String(s.assessment)
            )).size,
            passRate,
            avgScore,
            passFailDistribution,
            scoreDistribution,
            monthlySubmissions,
            avgAttempts,
          },
          certifications: {
            totalCertificates: certificates.length,
            activeCertificates: activeCertificates.length,
            revokedCertificates: revokedCerts.length,
            expiredCertificates: expiredCerts.length,
            certificateDates,
            topCourses: topCertCourses,
            certComplianceRate,
          },
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
    console.error(`[getInstructorReportsSummary] ERROR:`, error)
    return Response.json(
      {
        success: false,
        error: 'Failed to generate instructor reports summary',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
