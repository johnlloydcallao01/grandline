import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'

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

// GET /api/lms/gradebook/instructor/student-overview
//   ?userId=&search=&courseId=&page=&limit=
// Returns a roster of students across the instructor's owned/co-taught
// courses with per-student stats, all enrollments, and the course set. Search,
// course membership filtering, and pagination are owned by this endpoint.
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

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '25'))
    const query = (searchParams.get('search') || '').trim().toLowerCase()
    const courseFilter = searchParams.get('courseId') != null ? Number(searchParams.get('courseId')) : null

    const courseWhere: Where = {
      or: [
        { instructor: { equals: instructorId } },
        { coInstructors: { contains: instructorId } },
      ],
    }
    const courseRes = await payload.find({
      collection: 'courses',
      where: courseWhere,
      sort: 'title',
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })
    const courseDocs = courseRes.docs || []

    const emptyResult = {
      students: [],
      enrollments: [],
      courses: [],
      summary: { totalStudents: 0, totalEnrollments: 0, averageGrade: null, totalCompleted: 0, totalPending: 0 },
      page,
      totalDocs: 0,
      totalPages: 0,
    }

    if (courseDocs.length === 0) {
      return NextResponse.json(emptyResult)
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

    const students = new Map<number, any>()
    const gradeAccumulators = new Map<number, { sum: number; count: number }>()
    const enrollments: any[] = []
    for (const enrollment of enrollmentDocs) {
      const cid = typeof enrollment.course === 'number' ? enrollment.course : enrollment.course?.id
      if (cid == null || !courseMeta.has(Number(cid))) continue
      const traineeId = typeof enrollment.student === 'number' ? enrollment.student : enrollment.student?.id
      if (traineeId == null) continue

      const pendingCount = pendingByEnrollment.get(Number(enrollment.id)) || 0
      const finalGrade = enrollment.finalGrade != null ? Number(enrollment.finalGrade) : null
      const currentGrade = enrollment.currentGrade != null ? Number(enrollment.currentGrade) : null

      enrollments.push({
        id: Number(enrollment.id),
        traineeId: Number(traineeId),
        courseId: Number(cid),
        courseTitle: courseMeta.get(Number(cid))!.title,
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

    const courses = Array.from(courseMeta.entries()).map(([id, meta]) => ({
      id,
      title: meta.title,
      code: meta.code,
      passingGrade: meta.passingGrade,
    }))

    const courseMembership = new Map<number, Set<number>>()
    for (const enrollment of enrollments) {
      let set = courseMembership.get(enrollment.courseId)
      if (!set) {
        set = new Set()
        courseMembership.set(enrollment.courseId, set)
      }
      set.add(enrollment.traineeId)
    }

    let filtered = roster
    if (courseFilter != null) {
      const memberIds = courseMembership.get(courseFilter) || new Set<number>()
      filtered = filtered.filter((row) => memberIds.has(row.traineeId))
    }
    if (query) {
      filtered = filtered.filter(
        (row) =>
          row.name.toLowerCase().includes(query) ||
          row.email.toLowerCase().includes(query) ||
          row.srn.toLowerCase().includes(query),
      )
    }

    const totalDocs = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const start = (page - 1) * limit
    const studentsPage = filtered.slice(start, start + limit)

    const gradedEnrollments = enrollments.filter((enrollment) => enrollment.finalGrade != null)
    const totalCompleted = enrollments.filter((enrollment) => enrollment.status === 'completed').length

    return NextResponse.json({
      students: studentsPage,
      enrollments,
      courses,
      summary: {
        totalStudents: roster.length,
        totalEnrollments: enrollments.length,
        averageGrade:
          gradedEnrollments.length > 0
            ? Math.round(gradedEnrollments.reduce((sum, enrollment) => sum + (enrollment.finalGrade as number), 0) / gradedEnrollments.length)
            : null,
        totalCompleted,
        totalPending: roster.reduce((sum, row) => sum + row.pendingCount, 0),
      },
      page,
      totalDocs,
      totalPages,
    })
  } catch (error) {
    console.error('[Gradebook] Error fetching instructor student overview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
