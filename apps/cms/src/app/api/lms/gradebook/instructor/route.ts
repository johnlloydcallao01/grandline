import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Resolves the instructor profile for a signed-in user. Gradebook data shown
// to instructors is scoped to their owned/co-taught courses.
async function resolveInstructorId(payload: Payload, userId: string): Promise<string | null> {
  const result = await payload.find({
    collection: 'instructors',
    where: { user: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = result.docs?.[0]
  return doc ? String(doc.id) : null
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

// GET /api/lms/gradebook/instructor?userId=&courseId=
// Returns courses (with stats), enrollments (with pending counts), and a
// summary, all scoped to the instructor's owned/co-taught courses. When
// courseId is given the course must belong to the instructor's course set.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = (searchParams.get('userId') || '').trim()
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    const courseId = searchParams.get('courseId')

    const ownedOrCoTaught = {
      or: [
        { instructor: { equals: instructorId } },
        { coInstructors: { contains: instructorId } },
      ],
    } as Where

    const courseWhere: Where = courseId != null
      ? {
          and: [
            { id: { equals: courseId } },
            ownedOrCoTaught,
          ],
        }
      : ownedOrCoTaught

    const courseRes = await payload.find({
      collection: 'courses',
      where: courseWhere,
      sort: 'title',
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })
    const courseDocs = courseRes.docs || []

    if (courseDocs.length === 0) {
      return NextResponse.json({
        courses: [],
        enrollments: [],
        summary: { totalCourses: 0, totalEnrollments: 0, totalGraded: 0, averageGrade: null, totalPassed: 0, totalPending: 0 },
      })
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

    const enrollmentRes = await payload.find({
      collection: 'course-enrollments',
      where: { course: { in: courseIds } } as Where,
      limit: 2000,
      depth: 2,
      sort: '-updatedAt',
      overrideAccess: true,
    })
    const enrollmentDocs = enrollmentRes.docs || []

    const enrollmentIds = enrollmentDocs.map((e: any) => String(e.id))
    const enrollmentCourse = new Map<number, number>()
    for (const enrollment of enrollmentDocs) {
      const cid = typeof enrollment.course === 'number' ? enrollment.course : enrollment.course?.id
      if (cid != null) enrollmentCourse.set(Number(enrollment.id), Number(cid))
    }

    const pendingByEnrollment = new Map<number, number>()
    if (enrollmentIds.length > 0) {
      const submissionRes = await payload.find({
        collection: 'assignment-submissions',
        where: {
          and: [
            { enrollment: { in: enrollmentIds } },
            { status: { equals: 'submitted' } },
          ],
        } as Where,
        limit: 500,
        depth: 0,
        overrideAccess: true,
      })
      for (const submission of (submissionRes.docs || []) as any[]) {
        const enrollmentId = typeof submission.enrollment === 'number' ? submission.enrollment : submission.enrollment?.id
        if (enrollmentId != null) {
          pendingByEnrollment.set(Number(enrollmentId), (pendingByEnrollment.get(Number(enrollmentId)) || 0) + 1)
        }
      }
    }

    const stats = new Map<number, { enrollmentCount: number; gradedCount: number; gradeSum: number; passedCount: number; pendingCount: number }>()
    for (const courseIdKey of courseMeta.keys()) {
      stats.set(courseIdKey, { enrollmentCount: 0, gradedCount: 0, gradeSum: 0, passedCount: 0, pendingCount: 0 })
    }

    const enrollments: any[] = []
    for (const enrollment of enrollmentDocs) {
      const cid = enrollmentCourse.get(Number(enrollment.id))
      if (cid == null || !stats.has(cid)) continue
      const course = courseMeta.get(cid)!
      const pendingCount = pendingByEnrollment.get(Number(enrollment.id)) || 0
      const finalGrade = enrollment.finalGrade != null ? Number(enrollment.finalGrade) : null
      const currentGrade = enrollment.currentGrade != null ? Number(enrollment.currentGrade) : null

      const stat = stats.get(cid)!
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
        courseId: cid,
        courseTitle: course.title,
        status: enrollment.status || 'active',
        progressPercentage: enrollment.progressPercentage != null ? Number(enrollment.progressPercentage) : null,
        currentGrade,
        finalGrade,
        finalEvaluation: enrollment.finalEvaluation === 'passed' || enrollment.finalEvaluation === 'failed' ? enrollment.finalEvaluation : null,
        pendingCount,
      })
    }

    const courses: any[] = []
    let totalEnrollments = 0
    let totalGraded = 0
    let gradeSum = 0
    let totalPassed = 0
    let totalPending = 0
    for (const [cid, meta] of courseMeta) {
      const stat = stats.get(cid)!
      totalEnrollments += stat.enrollmentCount
      totalGraded += stat.gradedCount
      gradeSum += stat.gradeSum
      totalPassed += stat.passedCount
      totalPending += stat.pendingCount
      courses.push({
        id: cid,
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

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error('[Gradebook] Error fetching instructor gradebook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
