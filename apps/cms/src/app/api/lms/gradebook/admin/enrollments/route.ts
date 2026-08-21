import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
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

// GET /api/lms/gradebook/admin/enrollments
//   ?id=          -> single enrollment (depth 2, normalized)
//   ?courseId=&search=&page=&limit=&status= -> paginated list
// POST creates an enrollment from { course, studentEmail, enrollmentType }.
// PATCH updates grades with { id, data }.
// DELETE ?id= hard-deletes the enrollment (original behavior).
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const id = (searchParams.get('id') || '').trim()
    if (id) {
      const enrollment = await payload.findByID({
        collection: 'course-enrollments',
        id,
        depth: 2,
        overrideAccess: true,
      })
      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
      }
      return NextResponse.json({ enrollment: normalizeEnrollment(enrollment) })
    }

    const courseId = searchParams.get('courseId')
    const search = (searchParams.get('search') || '').trim()
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')

    const where: Where = {}

    if (courseId) {
      where.course = { equals: Number(courseId) }
    }

    if (status && status !== 'all') {
      where.status = { equals: status }
    }

    if (search) {
      // Resolve matching users by email, then trainees by srn/name/user.
      const userRes = await payload.find({
        collection: 'users',
        where: { email: { like: search } } as Where,
        limit: 50,
        depth: 0,
        overrideAccess: true,
      })
      const userIds = (userRes.docs || []).map((u: any) => String(u.id))

      const traineeOr: Where[] = [
        { srn: { like: search } } as Where,
        { 'user.firstName': { like: search } } as Where,
        { 'user.lastName': { like: search } } as Where,
      ]
      if (userIds.length > 0) {
        traineeOr.push({ user: { in: userIds } } as Where)
      }
      const traineeRes = await payload.find({
        collection: 'trainees',
        where: { or: traineeOr } as Where,
        limit: 50,
        depth: 0,
        overrideAccess: true,
      })
      const traineeIds = (traineeRes.docs || []).map((t: any) => String(t.id))
      if (traineeIds.length > 0) {
        where.student = { in: traineeIds }
      } else {
        // No matching students: return an empty page.
        return NextResponse.json({ docs: [], totalDocs: 0, totalPages: 0, page, limit })
      }
    }

    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where,
      page,
      limit,
      sort: '-updatedAt',
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (enrollments.docs || []).map(normalizeEnrollment),
      totalDocs: enrollments.totalDocs,
      totalPages: enrollments.totalPages,
      page: enrollments.page,
      limit: enrollments.limit,
    })
  } catch (error) {
    console.error('[Gradebook] Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const courseId = body?.course
    const studentEmail = (body?.studentEmail || '').trim().toLowerCase()
    const enrollmentType = body?.enrollmentType || 'free'

    if (!courseId) {
      return NextResponse.json({ error: 'course is required' }, { status: 400 })
    }
    if (!studentEmail) {
      return NextResponse.json({ error: 'studentEmail is required' }, { status: 400 })
    }

    const userRes = await payload.find({
      collection: 'users',
      where: { email: { equals: studentEmail } } as Where,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const user = userRes.docs?.[0]
    if (!user) {
      return NextResponse.json({ error: 'No student found with that email' }, { status: 400 })
    }

    const traineeRes = await payload.find({
      collection: 'trainees',
      where: { user: { equals: user.id } } as Where,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const trainee = traineeRes.docs?.[0]
    if (!trainee) {
      return NextResponse.json({ error: 'No student profile found for that email' }, { status: 400 })
    }

    const existing = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          { student: { equals: trainee.id } },
          { course: { equals: Number(courseId) } },
          { status: { equals: 'active' } },
        ],
      } as Where,
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if ((existing.docs || []).length > 0) {
      return NextResponse.json({ error: 'Student is already enrolled in this course' }, { status: 409 })
    }

    const created = await payload.create({
      collection: 'course-enrollments',
      data: {
        student: trainee.id,
        course: Number(courseId),
        status: 'active',
        enrollmentType,
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
      },
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeEnrollment(created), { status: 201 })
  } catch (error: any) {
    console.error('[Gradebook] Error creating enrollment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data = body.data || {}
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }

    const updated = await payload.update({
      collection: 'course-enrollments',
      id: String(id),
      data: data as any,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json(normalizeEnrollment(updated))
  } catch (error: any) {
    console.error('[Gradebook] Error updating enrollment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    await payload.delete({ collection: 'course-enrollments', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Gradebook] Error deleting enrollment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}
