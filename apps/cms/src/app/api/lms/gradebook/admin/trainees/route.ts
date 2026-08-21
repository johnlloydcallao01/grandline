import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'

function normalizeEnrollment(e: any): any {
  const student = e?.student
  const course = e?.course
  return {
    id: Number(e.id),
    student:
      student && typeof student === 'object'
        ? {
            id: Number(student.id),
            firstName: student.user?.firstName,
            lastName: student.user?.lastName,
            email: student.user?.email,
          }
        : typeof student === 'number'
          ? student
          : student,
    course:
      course && typeof course === 'object'
        ? { id: Number(course.id), title: course.title || `Course #${course.id}` }
        : typeof course === 'number'
          ? course
          : course,
    status: e.status || 'active',
    enrollmentType: e.enrollmentType || 'free',
    currentGrade: e.currentGrade != null ? Number(e.currentGrade) : null,
    finalGrade: e.finalGrade != null ? Number(e.finalGrade) : null,
    finalEvaluation: e.finalEvaluation || null,
    progressPercentage: e.progressPercentage != null ? Number(e.progressPercentage) : 0,
    certificateIssued: e.certificateIssued ?? null,
    enrolledAt: e.enrolledAt || e.createdAt,
    completedAt: e.completedAt || null,
    updatedAt: e.updatedAt,
    createdAt: e.createdAt,
    displayTitle: e.displayTitle,
  }
}

function courseTitle(course: any): string {
  if (!course) return 'Unknown Course'
  if (typeof course === 'number') return `Course #${course}`
  return course.title || `Course #${course.id}`
}

function docId(ref: any): number | undefined {
  if (ref == null) return undefined
  return typeof ref === 'number' ? ref : Number(ref?.id)
}

// GET /api/lms/gradebook/admin/trainees
//   ?overviewId= -> single trainee overview (profile, enrollments, submissions, stats)
//   ?page=&limit=&search= -> paginated trainee list with enrollment stats
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const overviewId = (searchParams.get('overviewId') || '').trim()
    if (overviewId) {
      const trainee = await payload.findByID({
        collection: 'trainees',
        id: overviewId,
        depth: 2,
        overrideAccess: true,
      })
      if (!trainee) {
        return NextResponse.json({ error: 'Trainee not found' }, { status: 404 })
      }

      const [enrResult, assessResult, assignResult] = await Promise.all([
        payload.find({
          collection: 'course-enrollments',
          where: { student: { equals: overviewId } } as Where,
          limit: 50,
          depth: 2,
          sort: '-updatedAt',
          overrideAccess: true,
        }),
        payload.find({
          collection: 'assessment-submissions',
          where: { trainee: { equals: overviewId } } as Where,
          limit: 20,
          depth: 2,
          sort: '-updatedAt',
          overrideAccess: true,
        }),
        payload.find({
          collection: 'assignment-submissions',
          where: { trainee: { equals: overviewId } } as Where,
          limit: 20,
          depth: 2,
          sort: '-updatedAt',
          overrideAccess: true,
        }),
      ])

      const enrollments = (enrResult.docs || []).map(normalizeEnrollment)

      const submissions: any[] = []
      for (const s of (assessResult.docs || []) as any[]) {
        const title = s.assessment && typeof s.assessment === 'object' ? s.assessment.title || 'Assessment' : 'Assessment'
        const c = s.enrollment?.course
        submissions.push({
          id: `assessment-${s.id}`,
          type: 'assessment',
          title,
          score: s.score != null ? Number(s.score) : null,
          status: s.status,
          submittedAt: s.updatedAt,
          courseTitle: c ? courseTitle(c) : undefined,
          courseId: docId(c),
        })
      }
      for (const s of (assignResult.docs || []) as any[]) {
        const title = s.assignment && typeof s.assignment === 'object' ? s.assignment.title || 'Assignment' : 'Assignment'
        const c = s.enrollment?.course
        submissions.push({
          id: `assignment-${s.id}`,
          type: 'assignment',
          title,
          score: s.score != null ? Number(s.score) : null,
          status: s.status,
          submittedAt: s.gradedAt || s.updatedAt,
          courseTitle: c ? courseTitle(c) : undefined,
          courseId: docId(c),
        })
      }
      submissions.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

      const completed = enrollments.filter((e: any) => e.status === 'completed')
      const gradedEnrollments = enrollments.filter((e: any) => e.finalGrade != null)
      const avgGrade =
        gradedEnrollments.length > 0
          ? Math.round(gradedEnrollments.reduce((s: number, e: any) => s + (e.finalGrade ?? 0), 0) / gradedEnrollments.length)
          : null

      const overview = {
        trainee: {
          id: Number(trainee.id),
          user: {
            id: Number(typeof trainee.user === 'object' && trainee.user ? trainee.user.id : trainee.id),
            firstName: (typeof trainee.user === 'object' && trainee.user ? trainee.user.firstName : '') || '',
            lastName: (typeof trainee.user === 'object' && trainee.user ? trainee.user.lastName : '') || '',
            email: (typeof trainee.user === 'object' && trainee.user ? trainee.user.email : '') || '',
          },
          srn: trainee.srn || '',
          currentLevel: trainee.currentLevel || null,
          enrollmentDate: trainee.enrollmentDate || null,
          updatedAt: trainee.updatedAt,
          createdAt: trainee.createdAt,
        },
        enrollments,
        submissions: submissions.slice(0, 10),
        stats: {
          totalCourses: enrollments.length,
          completedCourses: completed.length,
          inProgressCourses: enrollments.filter((e: any) => e.status === 'active').length,
          avgGrade,
          passedCount: completed.filter((e: any) => e.finalEvaluation === 'passed').length,
          failedCount: completed.filter((e: any) => e.finalEvaluation === 'failed').length,
          certificateCount: enrollments.filter((e: any) => e.certificateIssued).length,
          totalSubmissions: submissions.length,
        },
      }

      return NextResponse.json({ overview })
    }

    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')

    const where: Where = {}
    if (search) {
      where.or = [
        { srn: { like: search } } as Where,
        { 'user.firstName': { like: search } } as Where,
        { 'user.lastName': { like: search } } as Where,
      ]
    }

    const traineeRes = await payload.find({
      collection: 'trainees',
      where,
      page,
      limit,
      sort: '-updatedAt',
      depth: 2,
      overrideAccess: true,
    })
    const trainees = traineeRes.docs || []
    const totalDocs = traineeRes.totalDocs || 0
    const totalPages = traineeRes.totalPages || 0

    if (trainees.length === 0) {
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page,
        summary: { totalStudents: 0, totalEnrollments: 0, completedCount: 0, avgGrade: null, certificateCount: 0 },
      })
    }

    // All matching trainees (depth 0) drive the shared enrollment aggregation so
    // the global summary reflects the full result set, not just the current page.
    const allRes = await payload.find({
      collection: 'trainees',
      where,
      limit: 1000,
      depth: 0,
      sort: '-updatedAt',
      overrideAccess: true,
    })
    const allTraineeIds = (allRes.docs || []).map((t: any) => String(t.id))

    const enrResult = await payload.find({
      collection: 'course-enrollments',
      where: { student: { in: allTraineeIds } } as Where,
      limit: 2000,
      depth: 0,
      overrideAccess: true,
    })
    const allEnrollments = enrResult.docs || []

    const grouped = new Map<
      number,
      { total: number; completed: number; gradeSum: number; gradedCount: number; passed: number; failed: number; certificates: number }
    >()
    for (const t of trainees) {
      grouped.set(Number(t.id), { total: 0, completed: 0, gradeSum: 0, gradedCount: 0, passed: 0, failed: 0, certificates: 0 })
    }
    for (const e of allEnrollments) {
      const sid = typeof e.student === 'number' ? e.student : e.student?.id
      if (!sid || !grouped.has(Number(sid))) continue
      const g = grouped.get(Number(sid))!
      g.total++
      if (e.status === 'completed') g.completed++
      if (e.finalGrade != null) {
        g.gradedCount++
        g.gradeSum += Number(e.finalGrade)
      }
      if (e.finalEvaluation === 'passed') g.passed++
      if (e.finalEvaluation === 'failed') g.failed++
      if (e.certificateIssued) g.certificates++
    }

    const docs = trainees.map((t: any) => {
      const g = grouped.get(Number(t.id))!
      return {
        id: Number(t.id),
        user: {
          id: Number(typeof t.user === 'object' && t.user ? t.user.id : t.id),
          firstName: (typeof t.user === 'object' && t.user ? t.user.firstName : '') || '',
          lastName: (typeof t.user === 'object' && t.user ? t.user.lastName : '') || '',
          email: (typeof t.user === 'object' && t.user ? t.user.email : '') || '',
        },
        srn: t.srn || '',
        currentLevel: t.currentLevel || null,
        enrollmentDate: t.enrollmentDate || null,
        updatedAt: t.updatedAt,
        createdAt: t.createdAt,
        enrollmentCount: g.total,
        completedCount: g.completed,
        avgGrade: g.gradedCount > 0 ? Math.round(g.gradeSum / g.gradedCount) : null,
        passedCount: g.passed,
        failedCount: g.failed,
        certificateCount: g.certificates,
      }
    })

    const gradedAll = allEnrollments.filter((e: any) => e.finalGrade != null)
    const summary = {
      totalStudents: totalDocs,
      totalEnrollments: allEnrollments.length,
      completedCount: allEnrollments.filter((e: any) => e.status === 'completed').length,
      avgGrade:
        gradedAll.length > 0
          ? Math.round(gradedAll.reduce((sum, e: any) => sum + Number(e.finalGrade), 0) / gradedAll.length)
          : null,
      certificateCount: allEnrollments.filter((e: any) => e.certificateIssued).length,
    }

    return NextResponse.json({
      docs,
      totalDocs,
      totalPages,
      page,
      summary,
    })
  } catch (error) {
    console.error('[Gradebook] Error fetching admin trainees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
