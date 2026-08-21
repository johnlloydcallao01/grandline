import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Statuses an instructor may set manually. `completed` and `expired` are
// system-transitioned states and are intentionally excluded.
const ALLOWED_STATUSES = ['active', 'pending', 'suspended', 'dropped']

// Instructor-writable enrollment fields. Admin-only controls (isArchived,
// enrolledBy reassignment, coupon relationship search) are intentionally omitted.
const INSTRUCTOR_ENROLLMENT_FIELDS = [
  'enrolledAt',
  'enrollmentType',
  'status',
  'paymentStatus',
  'accessExpiresAt',
  'amountPaid',
  'couponCode',
  'couponDiscountAmount',
  'listPriceSnapshot',
  'finalPriceSnapshot',
  'pricingBreakdown',
  'progressPercentage',
  'lastAccessedAt',
  'completedAt',
  'currentGrade',
  'finalGrade',
  'finalEvaluation',
  'certificateIssued',
  'notes',
  'metadata',
] as const

function getInstructorEnrollmentData(body: Record<string, any>, includeDefaults = false): Record<string, any> {
  const data: Record<string, any> = {}

  for (const field of INSTRUCTOR_ENROLLMENT_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field]
  }

  if (includeDefaults) {
    data.enrolledAt = data.enrolledAt || new Date().toISOString()
    data.status = data.status || 'active'
    data.enrollmentType = data.enrollmentType || 'free'
    data.paymentStatus = data.paymentStatus || 'not_required'
    data.progressPercentage = data.progressPercentage ?? 0
    data.notes = data.notes || ''
  }

  if (data.status && !ALLOWED_STATUSES.includes(data.status) && !includeDefaults) {
    // Keep existing completed/expired values only when not changing status.
  }

  return data
}

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
    paymentStatus: d.paymentStatus ?? null,
    accessExpiresAt: d.accessExpiresAt ?? null,
    amountPaid: d.amountPaid ?? null,
    coupon:
      d.coupon && typeof d.coupon === 'object'
        ? { id: Number(d.coupon.id), code: d.coupon.code || '', name: d.coupon.name || '' }
        : d.coupon ?? null,
    couponCode: d.couponCode ?? null,
    couponDiscountAmount: d.couponDiscountAmount ?? null,
    listPriceSnapshot: d.listPriceSnapshot ?? null,
    finalPriceSnapshot: d.finalPriceSnapshot ?? null,
    pricingBreakdown: d.pricingBreakdown ?? null,
    progressPercentage: d.progressPercentage || 0,
    lastAccessedAt: d.lastAccessedAt ?? null,
    completedAt: d.completedAt ?? null,
    currentGrade: d.currentGrade ?? null,
    finalGrade: d.finalGrade ?? null,
    finalEvaluation: d.finalEvaluation ?? null,
    certificateIssued: d.certificateIssued ?? null,
    enrolledBy:
      d.enrolledBy && typeof d.enrolledBy === 'object'
        ? {
            id: Number(d.enrolledBy.id),
            firstName: d.enrolledBy.firstName || '',
            lastName: d.enrolledBy.lastName || '',
            email: d.enrolledBy.email || '',
          }
        : d.enrolledBy ?? null,
    notes: d.notes || '',
    isArchived: d.isArchived ?? null,
    metadata: d.metadata ?? null,
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
    const id = (searchParams.get('id') || '').trim()

    if (id) {
      const owned = await payload.find({
        collection: 'course-enrollments',
        where: {
          and: [
            { id: { equals: id } },
            { 'course.instructor': { equals: instructorId } },
          ],
        },
        limit: 1,
        depth: 3,
        overrideAccess: true,
      })

      const enrollment = owned.docs?.[0]
      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
      }

      return NextResponse.json(normalizeEnrollmentDoc(enrollment))
    }

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

    const { userId, student, course } = body

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

    const enrollmentData = getInstructorEnrollmentData(body, true)
    if (enrollmentData.status && !ALLOWED_STATUSES.includes(enrollmentData.status)) {
      return NextResponse.json(
        { error: 'Invalid enrollment status' },
        { status: 400 },
      )
    }

    const enrollment = await payload.create({
      collection: 'course-enrollments',
      data: {
        ...enrollmentData,
        student: studentId,
        course: courseId,
        enrolledBy: Number(userId) || null,
      } as any,
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
// Updates enrollment fields or unassigns an enrollment owned by the instructor.
export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { userId, id, unassign } = body

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
    } else {
      Object.assign(data, getInstructorEnrollmentData(body))
      if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
        return NextResponse.json(
          { error: 'Invalid enrollment status' },
          { status: 400 },
        )
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'At least one enrollment field or unassign is required' },
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
