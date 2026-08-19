import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Statuses an instructor may set manually. `completed` and `expired` are
// system-transitioned states and are intentionally excluded.
const ALLOWED_STATUSES = ['active', 'pending', 'suspended', 'dropped']

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

function normalizeEnrollmentDoc(d: any) {
  const student = d.student && typeof d.student === 'object' ? d.student : null
  const course = d.course && typeof d.course === 'object' ? d.course : null
  return {
    id: String(d.id),
    student: student
      ? {
          id: String(student.id),
          user:
            student.user && typeof student.user === 'object'
              ? {
                  id: String(student.user.id),
                  firstName: student.user.firstName || '',
                  lastName: student.user.lastName || '',
                  email: student.user.email || '',
                }
              : { id: '', firstName: '', lastName: '', email: '' },
          srn: student.srn || '',
        }
      : String(d.student || ''),
    course: course
      ? {
          id: String(course.id),
          title: course.title || '',
          courseCode: course.courseCode || '',
        }
      : String(d.course || ''),
    status: d.status || '',
    enrollmentType: d.enrollmentType || '',
    enrolledAt: d.enrolledAt || '',
    progressPercentage: d.progressPercentage || 0,
    notes: d.notes || '',
  }
}

// GET /api/lms/enrollments/instructor?userId=&search=&status=&page=&limit=
// Lists enrollments scoped to the instructor's courses. The endpoint owns the
// instructor context resolution and the relationship-scoped query.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = (searchParams.get('userId') || '').trim()
    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      )
    }

    const instructorId = await resolveInstructorId(payload, userId)
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 },
      )
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = (searchParams.get('search') || '').trim()
    const status = (searchParams.get('status') || '').trim()

    const where: Where = {
      and: [
        { 'course.instructor': { equals: instructorId } },
        { isArchived: { not_equals: true } },
      ],
    } as any

    if (search) {
      const orConditions: any[] = []

      const matchingUsers = await payload.find({
        collection: 'users',
        where: {
          or: [
            { firstName: { like: search } },
            { lastName: { like: search } },
            { email: { like: search } },
          ],
        },
        limit: 200,
        overrideAccess: true,
      })

      const userIds = matchingUsers.docs.map((u) => String(u.id))

      if (userIds.length > 0) {
        const matchingTrainees = await payload.find({
          collection: 'trainees',
          where: {
            user: { in: userIds },
          },
          limit: 200,
          overrideAccess: true,
        })

        const traineeIds = matchingTrainees.docs.map((t) => String(t.id))
        if (traineeIds.length > 0) {
          orConditions.push({ student: { in: traineeIds } })
        }
      }

      orConditions.push({ 'course.title': { like: search } })

      if (search.includes(' ')) {
        const [first, last] = search.split(' ')
        if (first && last) {
          const firstLastUsers = await payload.find({
            collection: 'users',
            where: {
              and: [
                { firstName: { like: first } },
                { lastName: { like: last } },
              ],
            },
            limit: 200,
            overrideAccess: true,
          })

          const firstLastUserIds = firstLastUsers.docs.map((u) => String(u.id))
          if (firstLastUserIds.length > 0) {
            const firstLastTrainees = await payload.find({
              collection: 'trainees',
              where: {
                user: { in: firstLastUserIds },
              },
              limit: 200,
              overrideAccess: true,
            })

            const flTraineeIds = firstLastTrainees.docs.map((t) => String(t.id))
            if (flTraineeIds.length > 0) {
              orConditions.push({ student: { in: flTraineeIds } })
            }
          }
        }
      }

      if (orConditions.length > 0) {
        ;(where as any).and.push({ or: orConditions })
      }
    }

    // Per-status totals matching the current search but independent of the
    // status filter, so the filter chips stay stable and accurate.
    const countsWhere = JSON.parse(JSON.stringify(where)) as Where
    const STATUSES = ['active', 'pending', 'completed', 'suspended', 'dropped', 'expired'] as const
    const [totalCount, ...statusCounts] = await Promise.all([
      payload.count({
        collection: 'course-enrollments',
        where: countsWhere,
        overrideAccess: true,
      }),
      ...STATUSES.map((s) =>
        payload.count({
          collection: 'course-enrollments',
          where: {
            and: [...(countsWhere.and as any[]), { status: { equals: s } }],
          },
          overrideAccess: true,
        })
      ),
    ])
    const counts: Record<string, number> = { total: totalCount.totalDocs }
    STATUSES.forEach((s, i) => {
      counts[s] = statusCounts[i].totalDocs
    })

    if (status) {
      ;(where as any).and.push({ status: { equals: status } })
    }

    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where,
      page,
      limit,
      depth: 3,
      sort: '-enrolledAt',
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (enrollments.docs || []).map(normalizeEnrollmentDoc),
      totalDocs: enrollments.totalDocs,
      page: enrollments.page,
      limit: enrollments.limit,
      totalPages: enrollments.totalPages,
      counts,
    })
  } catch (error) {
    console.error('Error fetching instructor enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// POST /api/lms/enrollments/instructor
// Creates an enrollment only if the course belongs to the instructor.
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { userId, student, course, status: enrollmentStatus, notes } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, String(userId))
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 },
      )
    }

    if (!student || !course) {
      return NextResponse.json(
        { error: 'student and course are required' },
        { status: 400 },
      )
    }

    const studentId = Number(student)
    const courseId = Number(course)

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'student and course must be valid IDs' },
        { status: 400 },
      )
    }

    // Ownership boundary: the course must belong to the instructor
    const ownedCourse = await payload.find({
      collection: 'courses',
      where: {
        and: [
          { id: { equals: courseId } },
          { instructor: { equals: instructorId } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (ownedCourse.docs.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized: course does not belong to your account' },
        { status: 403 },
      )
    }

    const enrollment = await payload.create({
      collection: 'course-enrollments',
      data: {
        student: studentId,
        course: courseId,
        status: enrollmentStatus || 'active',
        notes: notes || '',
        enrolledBy: Number(userId) || null,
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
        enrollmentType: 'free',
        paymentStatus: 'not_required',
      },
      overrideAccess: true,
    })

    return NextResponse.json(normalizeEnrollmentDoc(enrollment), { status: 201 })
  } catch (error: any) {
    console.error('Error creating instructor enrollment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status },
    )
  }
}

// PATCH /api/lms/enrollments/instructor
// Updates status or unassigns an enrollment owned by the instructor.
export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { userId, id, status, notes, unassign } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, String(userId))
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 },
      )
    }

    // Ownership boundary: the enrollment must belong to one of the instructor's courses
    const owned = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          { id: { equals: String(id) } },
          { 'course.instructor': { equals: instructorId } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const enrollment = owned.docs?.[0]
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Unauthorized: enrollment does not belong to your courses' },
        { status: 403 },
      )
    }

    const data: Record<string, any> = {}

    if (unassign === true) {
      data.status = 'dropped'
      const existingNotes = (enrollment.notes || '').trim()
      data.notes = `${existingNotes ? `${existingNotes}\n` : ''}Unassigned by instructor at ${new Date().toISOString()}`
    } else if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid enrollment status' },
          { status: 400 },
        )
      }
      data.status = status
    }

    if (notes !== undefined && unassign !== true) {
      data.notes = String(notes)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'status or unassign is required' },
        { status: 400 },
      )
    }

    await payload.update({
      collection: 'course-enrollments',
      id: String(id),
      data,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error patching instructor enrollment:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 },
    )
  }
}