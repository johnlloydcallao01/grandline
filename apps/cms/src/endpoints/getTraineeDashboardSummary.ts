import type { PayloadRequest } from 'payload'

export const getTraineeDashboardSummary = async (req: PayloadRequest): Promise<Response> => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7)

  console.log(`[Dashboard] Request received: ${req.url}`)

  try {
    const { payload } = req

    // Get userId from query parameter (same pattern as /api/lms/enrollments)
    const url = new URL(req.url || '', `http://localhost`)
    const userIdFromQuery = url.searchParams.get('userId')

    if (!userIdFromQuery) {
      return Response.json(
        { error: 'userId query parameter required' },
        { status: 400 }
      )
    }

    const effectiveUserId = userIdFromQuery

    // 1. Fetch Trainee Profile
    const traineesRes = await payload.find({
      collection: 'trainees',
      where: {
        user: { equals: effectiveUserId },
      },
      limit: 1,
      overrideAccess: true,
    })

    const trainee = traineesRes.docs[0]
    if (!trainee) {
      return Response.json(
        { error: 'Trainee profile not found' },
        { status: 404 }
      )
    }

    const traineeId = String(trainee.id)

    console.log(`📊 [Dashboard] Fetching summary for Trainee: ${traineeId} (User: ${effectiveUserId})`)

    // 2. Parallel Fetching for Dashboard Components
    const [
      enrollmentsRes,
      progressRes,
      assignmentsRes,
      assessmentsRes,
      certificatesRes,
      assessmentSubmissionsRes,
    ] = await Promise.all([
      // Enrollments
      payload.find({
        collection: 'course-enrollments',
        where: {
          student: { equals: traineeId },
        },
        depth: 4, // Depth 4: Populates Course -> Instructor -> User -> ProfilePicture
        limit: 100,
        overrideAccess: true,
      }),
      // Last accessed item
      payload.find({
        collection: 'course-item-progress',
        where: {
          trainee: { equals: traineeId },
        },
        sort: '-lastAccessedAt',
        depth: 1,
        limit: 1,
        overrideAccess: true,
      }),
      // All Assignment Submissions (for assignments section)
      payload.find({
        collection: 'assignment-submissions',
        where: {
          trainee: { equals: traineeId },
        },
        depth: 2,
        limit: 1000,
        overrideAccess: true,
      }),
      // Recent Assessment Scores
      payload.find({
        collection: 'assessment-submissions',
        where: {
          trainee: { equals: traineeId },
          isLatest: { equals: true },
        },
        sort: '-completedAt',
        depth: 2,
        limit: 5,
        overrideAccess: true,
      }),
      // Certificates Earned
      payload.find({
        collection: 'certificates',
        where: {
          trainee: { equals: traineeId },
          status: { equals: 'active' },
        },
        depth: 1,
        limit: 50,
        overrideAccess: true,
      }),
      // Assessment Submissions (for quizzes/exams)
      payload.find({
        collection: 'assessment-submissions',
        where: {
          trainee: { equals: traineeId },
        },
        depth: 2,
        limit: 1000,
        overrideAccess: true,
      }),
    ])

    const enrollments = enrollmentsRes.docs
    const assessmentSubmissions = assessmentSubmissionsRes.docs

    // Debug logging
    console.log(`📊 [Dashboard] Found ${enrollments.length} total enrollments`)
    const statusBreakdown = enrollments.reduce((acc: Record<string, number>, e: any) => {
      acc[e.status] = (acc[e.status] || 0) + 1
      return acc
    }, {})
    console.log(`📊 [Dashboard] Status breakdown:`, statusBreakdown)

    // Calculating Stats - Dashboard "My Courses" includes Active, Pending, and Suspended (current courses)
    const currentCourses = enrollments.filter((e: any) => e.status === 'active' || e.status === 'pending' || e.status === 'suspended')
    const completedCourses = enrollments.filter((e: any) => e.status === 'completed')

    console.log(`📊 [Dashboard] Current courses (active/pending/suspended): ${currentCourses.length}`)
    console.log(`📊 [Dashboard] Completed courses: ${completedCourses.length}`)

    let activeAvgGrade = 0
    if (completedCourses.length > 0) {
      const sum = completedCourses.reduce((acc: number, curr: any) => acc + (typeof curr.finalGrade === 'number' ? curr.finalGrade : 0), 0)
      activeAvgGrade = sum / completedCourses.length
    }

    // Process Enrollments Payload
    const prunedEnrollments = currentCourses.map((e: any) => {
      const course = typeof e.course === 'object' && e.course !== null ? (e.course as any) : null

      // Improved Thumbnail Resolution Logic
      let thumbnailUrl = null
      if (course?.thumbnail && typeof course.thumbnail === 'object') {
        thumbnailUrl = course.thumbnail.cloudinaryURL || course.thumbnail.url || null

        // Ensure absolute URL for local files
        if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
          const baseUrl = (process.env.PAYLOAD_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '')
          thumbnailUrl = `${baseUrl}${thumbnailUrl}`
        }
      }

      return {
        id: e.id,
        status: e.status,
        progressPercentage: e.progressPercentage,
        lastAccessedAt: e.lastAccessedAt,
        courseId: course?.id,
        courseTitle: course?.title,
        courseCode: course?.courseCode,
        thumbnailUrl,
      }
    })

    // Process Completed Courses (Passed Courses)
    const prunedCompletedCourses = completedCourses.map((e: any) => {
      const course = typeof e.course === 'object' && e.course !== null ? (e.course as any) : null

      let thumbnailUrl = null
      if (course?.thumbnail && typeof course.thumbnail === 'object') {
        thumbnailUrl = course.thumbnail.cloudinaryURL || course.thumbnail.url || null
        if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
          const baseUrl = (process.env.PAYLOAD_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '')
          thumbnailUrl = `${baseUrl}${thumbnailUrl}`
        }
      }

      return {
        id: e.id,
        status: e.status,
        finalEvaluation: e.finalEvaluation,
        progressPercentage: e.progressPercentage,
        lastAccessedAt: e.lastAccessedAt,
        courseId: course?.id,
        courseTitle: course?.title,
        courseCode: course?.courseCode,
        thumbnailUrl,
      }
    })

    // Prepare enrolled course IDs to fetch announcements
    const enrolledCourseIds = currentCourses
      .map((e: any) => (typeof e.course === 'object' && e.course !== null ? e.course.id : e.course))
      .filter(Boolean)

    let announcements: any[] = []
    if (enrolledCourseIds.length > 0) {
      const announcementsRes = await payload.find({
        collection: 'announcements',
        where: {
          course: { in: enrolledCourseIds },
        },
        sort: '-pinned,-createdAt',
        limit: 10,
        depth: 1,
        overrideAccess: true,
      })
      announcements = announcementsRes.docs.map((a) => ({
        id: a.id,
        title: a.title,
        pinned: a.pinned,
        createdAt: a.createdAt,
        courseId: typeof a.course === 'object' && a.course !== null ? a.course.id : a.course,
      }))
    }

    // Prepare Last Accessed / Continue Learning
    const lastAccessedItemDoc = progressRes.docs[0]
    let continueLearning = null

    if (lastAccessedItemDoc) {
      continueLearning = {
        id: lastAccessedItemDoc.id,
        status: lastAccessedItemDoc.status,
        lastAccessedAt: lastAccessedItemDoc.lastAccessedAt,
        itemType: lastAccessedItemDoc.item && typeof lastAccessedItemDoc.item === 'object' && 'relationTo' in lastAccessedItemDoc.item
          ? lastAccessedItemDoc.item.relationTo
          : 'unknown',
        itemId: lastAccessedItemDoc.item && typeof lastAccessedItemDoc.item === 'object' && 'value' in lastAccessedItemDoc.item
          ? lastAccessedItemDoc.item.value
          : null,
      }
    }

    // Process Certificates
    const certificates = certificatesRes.docs.map((c) => ({
      id: c.id,
      certificateCode: c.certificateCode,
      issueDate: c.issueDate,
      verificationUrl: c.verificationUrl,
      file: typeof c.file === 'object' && c.file !== null ? {
        id: c.file.id,
        url: c.file.url,
        filename: c.file.filename,
        cloudinaryURL: c.file.cloudinaryURL || null,
      } : null,
      courseTitle: typeof c.course === 'object' && c.course !== null ? c.course.title : null,
    }))

    // Process Pending Work (only draft and returned_for_revision)
    const pendingWork = assignmentsRes.docs
      .filter((a) => a.status === 'draft' || a.status === 'returned_for_revision')
      .map((a) => {
        const assignment = typeof a.assignment === 'object' && a.assignment !== null ? a.assignment : null
        return {
          id: a.id,
          status: a.status,
          type: 'assignment',
          title: assignment?.title,
          dueDate: assignment?.dueDate,
        }
      })

    // Process Recent Scores
    const recentScores = assessmentsRes.docs.map((a) => {
      const assessment = typeof a.assessment === 'object' && a.assessment !== null ? a.assessment : null
      return {
        id: a.id,
        score: a.score,
        status: a.status,
        completedAt: a.completedAt,
        passingScoreSnapshot: a.passingScoreSnapshot,
        title: assessment?.title,
        assessmentType: assessment?.assessmentType,
      }
    })

    // Extract unique instructors from enrollments (same logic as /api/instructors/enrolled)
    const instructorsMap = new Map()
    for (const enrollment of enrollments) {
      const course = typeof enrollment.course === 'object' && enrollment.course !== null ? enrollment.course : null
      if (!course) continue

      if (course.instructor && typeof course.instructor === 'object') {
        const instructor = course.instructor
        if (!instructorsMap.has(instructor.id)) {
          instructorsMap.set(instructor.id, instructor)
        }
      }

      if (course.coInstructors && Array.isArray(course.coInstructors)) {
        for (const coInstructor of course.coInstructors) {
          if (coInstructor && typeof coInstructor === 'object') {
            if (!instructorsMap.has(coInstructor.id)) {
              instructorsMap.set(coInstructor.id, coInstructor)
            }
          }
        }
      }
    }

    const instructors = Array.from(instructorsMap.values()).map((instructor: any) => {
      const user = instructor.user || {};
      let profilePictureUrl = null;

      if (user.profilePicture && typeof user.profilePicture === 'object') {
        if (user.profilePicture.cloudinaryURL) {
          profilePictureUrl = user.profilePicture.cloudinaryURL.replace(/[`'"]/g, '').trim();
        } else if (user.profilePicture.url) {
          const baseUrl = (process.env.PAYLOAD_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');
          profilePictureUrl = user.profilePicture.url.startsWith('http')
            ? user.profilePicture.url
            : `${baseUrl}${user.profilePicture.url}`;
        }
      }

      return {
        id: instructor.id,
        user: {
          ...user,
          profilePictureUrl,
        },
        specialization: instructor.specialization,
        bio: instructor.bio,
      };
    })

    // Extract Assignments from course modules
    const extractedAssignments = new Map<string, any>()
    for (const enrollment of enrollments) {
      const course = typeof enrollment.course === 'object' && enrollment.course !== null ? enrollment.course : null
      if (!course) continue

      if (course.modules && Array.isArray(course.modules)) {
        for (const mod of course.modules) {
          if (typeof mod !== 'object' || mod === null) continue
          if (!mod.items || !Array.isArray(mod.items)) continue

          for (const item of mod.items) {
            if (item.relationTo === 'assignments' && item.value && typeof item.value === 'object') {
              const assignment = item.value
              extractedAssignments.set(String(assignment.id), {
                id: String(assignment.id),
                title: assignment.title,
                courseId: String(course.id),
                courseTitle: course.title,
                moduleSlug: mod.title ? mod.title.toLowerCase().replace(/\s+/g, '-') : null,
                assignmentSlug: assignment.title ? assignment.title.toLowerCase().replace(/\s+/g, '-') : null,
                dueDate: assignment.dueDate || null,
                maxScore: assignment.maxScore || 100,
                passingScore: assignment.passingScore || 75,
                submissionType: assignment.submissionType || 'both',
              })
            }
          }
        }
      }
    }

    // Map assignment submissions to assignments
    const assignmentSubmissionsMap = new Map<string, any>()
    for (const sub of assignmentsRes.docs) {
      const assignmentId = typeof sub.assignment === 'object' ? String(sub.assignment.id) : String(sub.assignment)
      const existing = assignmentSubmissionsMap.get(assignmentId)

      if (!existing) {
        assignmentSubmissionsMap.set(assignmentId, sub)
      } else {
        const rank = (s: string) => s === 'graded' ? 3 : s === 'returned_for_revision' ? 2 : s === 'submitted' ? 1 : 0
        const subRank = rank(sub.status)
        const existingRank = rank(existing.status)

        if (subRank > existingRank) {
          assignmentSubmissionsMap.set(assignmentId, sub)
        } else if (subRank === existingRank) {
          if (new Date(sub.updatedAt) > new Date(existing.updatedAt)) {
            assignmentSubmissionsMap.set(assignmentId, sub)
          }
        }
      }
    }

    // Merge assignments with submissions
    const mergedAssignments: any[] = []
    extractedAssignments.forEach((baseData, assignId) => {
      const sub = assignmentSubmissionsMap.get(assignId)

      let status = 'pending'
      let score = null
      let feedback = null
      let submittedAt = null

      if (sub && sub.status !== 'draft') {
        status = sub.status
        score = sub.score ?? null
        feedback = sub.feedback ?? null
        submittedAt = sub.submittedAt ?? null

        // Auto-correct: If an instructor added a score but forgot to change the status dropdown to 'Graded'
        if (score !== null && status === 'submitted') {
          status = 'graded'
        }
      }

      mergedAssignments.push({
        ...baseData,
        status,
        score,
        feedback,
        submittedAt,
      })
    })

    // Sort: pending first (by due date), then others
    mergedAssignments.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (a.status !== 'pending' && b.status === 'pending') return 1

      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

    // Extract Assessments from course modules and final exams
    const extractedAssessments = new Map<string, any>()
    for (const enrollment of enrollments) {
      const course = typeof enrollment.course === 'object' && enrollment.course !== null ? enrollment.course : null
      if (!course) continue

      // Handle Module Assessments (Quizzes/Exams)
      if (course.modules && Array.isArray(course.modules)) {
        for (const mod of course.modules) {
          if (typeof mod !== 'object' || mod === null) continue
          if (!mod.items || !Array.isArray(mod.items)) continue

          for (const item of mod.items) {
            if (item.relationTo === 'assessments' && item.value && typeof item.value === 'object') {
              const assessment = item.value
              extractedAssessments.set(String(assessment.id), {
                id: String(assessment.id),
                title: assessment.title,
                courseId: String(course.id),
                courseTitle: course.title,
                moduleSlug: mod.title ? mod.title.toLowerCase().replace(/\s+/g, '-') : null,
                assessmentSlug: assessment.title ? assessment.title.toLowerCase().replace(/\s+/g, '-') : null,
                assessmentKind: assessment.assessmentType || 'quiz',
                maxAttempts: assessment.maxAttempts || null,
                passingScore: assessment.passingScore || 70,
              })
            }
          }
        }
      }

      // Handle Final Exam (check if course has curriculum property)
      const courseAny = course as any
      if (courseAny.curriculum?.finalExam && typeof courseAny.curriculum.finalExam === 'object') {
        const finalExam = courseAny.curriculum.finalExam
        extractedAssessments.set(String(finalExam.id), {
          id: String(finalExam.id),
          title: finalExam.title,
          courseId: String(course.id),
          courseTitle: course.title,
          moduleSlug: null,
          assessmentSlug: finalExam.title ? finalExam.title.toLowerCase().replace(/\s+/g, '-') : null,
          assessmentKind: 'final',
          maxAttempts: finalExam.maxAttempts || null,
          passingScore: finalExam.passingScore || 70,
        })
      }
    }

    // Map submissions to assessments (keeping the latest attempt)
    const submissionsMap = new Map<string, any>()
    for (const sub of assessmentSubmissions) {
      const assessmentId = typeof sub.assessment === 'object' ? String(sub.assessment.id) : String(sub.assessment)
      const existing = submissionsMap.get(assessmentId)

      if (!existing) {
        submissionsMap.set(assessmentId, sub)
      } else {
        // Prefer highest attempt number
        if ((sub.attemptNumber || 0) > (existing.attemptNumber || 0)) {
          submissionsMap.set(assessmentId, sub)
        } else if ((sub.attemptNumber || 0) === (existing.attemptNumber || 0)) {
          if (new Date(sub.updatedAt) > new Date(existing.updatedAt)) {
            submissionsMap.set(assessmentId, sub)
          }
        }
      }
    }

    // Merge assessments with submissions and filter for completed
    const completedAssessments: any[] = []
    extractedAssessments.forEach((baseData, assessId) => {
      const sub = submissionsMap.get(assessId)

      let status = 'pending'
      let score: number | null = null
      let attemptNumber = 0
      let completedAt = null
      let isPassed: boolean | null = null

      if (sub) {
        status = sub.status
        score = sub.score ?? null
        attemptNumber = sub.attemptNumber ?? 1
        completedAt = sub.completedAt ?? null

        if (score !== null) {
          const passingThreshold = sub.passingScoreSnapshot ?? baseData.passingScore
          isPassed = score >= passingThreshold
        }
      }

      // Only include completed assessments (submitted or graded)
      if (status === 'submitted' || status === 'graded') {
        completedAssessments.push({
          ...baseData,
          status,
          score,
          attemptNumber,
          completedAt,
          isPassed,
        })
      }
    })

    const responseTime = Date.now() - startTime

    return Response.json(
      {
        success: true,
        data: {
          trainee: {
            id: trainee.id,
            srn: trainee.srn,
            currentLevel: trainee.currentLevel,
          },
          stats: {
            activeCoursesCount: enrollments.filter((e: any) => e.status === 'active').length,
            completedCoursesCount: completedCourses.length,
            activeAvgGrade: Math.round(activeAvgGrade),
            certificatesCount: certificatesRes.totalDocs,
          },
          hero: {
            continueLearning,
          },
          myCourses: prunedEnrollments,
          completedCourses: prunedCompletedCourses,
          completedAssessments,
          assignments: mergedAssignments,
          pendingWork,
          recentScores,
          certificates,
          announcements,
          instructors,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          responseTimeMs: responseTime,
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0', // Prevent caching for personalized dashboard
        },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`🚨 [getTraineeDashboardSummary] ERROR:`, error)

    return Response.json(
      {
        success: false,
        error: 'Failed to generate dashboard summary',
        message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
