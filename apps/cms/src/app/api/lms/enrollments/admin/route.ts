import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

const ENROLLMENT_FIELDS = [
  'student',
  'course',
  'enrolledAt',
  'enrollmentType',
  'status',
  'paymentStatus',
  'accessExpiresAt',
  'amountPaid',
  'coupon',
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
  'enrolledBy',
  'notes',
  'isArchived',
  'metadata',
] as const

function getEnrollmentData(body: Record<string, any>, includeDefaults = false): Record<string, any> {
  const data: Record<string, any> = {}

  for (const field of ENROLLMENT_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field]
  }

  if (data.student !== undefined) data.student = Number(data.student)
  if (data.course !== undefined) data.course = Number(data.course)
  if (data.enrolledBy !== undefined && data.enrolledBy !== null && data.enrolledBy !== '') {
    data.enrolledBy = Number(data.enrolledBy)
  }
  if (data.coupon !== undefined && data.coupon !== null && data.coupon !== '') {
    data.coupon = Number(data.coupon)
  }

  if (includeDefaults) {
    data.enrolledAt = data.enrolledAt || new Date().toISOString()
    data.status = data.status || 'active'
    data.enrollmentType = data.enrollmentType || 'free'
    data.paymentStatus = data.paymentStatus || 'not_required'
    data.progressPercentage = data.progressPercentage ?? 0
    data.notes = data.notes || ''
  }

  return data
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = (searchParams.get('search') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const id = (searchParams.get('id') || '').trim()

    if (id) {
      const enrollment = await payload.findByID({
        collection: 'course-enrollments',
        id,
        depth: 3,
        overrideAccess: true,
      })

      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
      }

      return NextResponse.json(enrollment)
    }

    const where: Where = {
      and: [
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

    return NextResponse.json({ ...enrollments, counts })
  } catch (error) {
    console.error('Error fetching admin enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { student, course } = body

    if (!student || !course) {
      return NextResponse.json(
        { error: 'student and course are required' },
        { status: 400 }
      )
    }

    const studentId = Number(student)
    const courseId = Number(course)

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'student and course must be valid IDs' },
        { status: 400 }
      )
    }

    const existing = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          { student: { equals: studentId } },
          { course: { equals: courseId } },
          { status: { not_in: 'dropped,expired' } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 409 }
      )
    }

    const enrollment = await payload.create({
      collection: 'course-enrollments',
      data: {
        ...getEnrollmentData(body, true),
        student: studentId,
        course: courseId,
      } as any,
      overrideAccess: true,
    })

    return NextResponse.json(enrollment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating admin enrollment:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      )
    }

    const enrollment = await payload.findByID({
      collection: 'course-enrollments',
      id,
      overrideAccess: true,
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    await payload.update({
      collection: 'course-enrollments',
      id,
      data: {
        status: 'dropped',
        notes: `${(enrollment as any).notes || ''}\nUnassigned by admin at ${new Date().toISOString()}`.trim(),
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error unassigning enrollment:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data = getEnrollmentData(body)
    delete data.id

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'At least one enrollment field is required' }, { status: 400 })
    }

    await payload.update({
      collection: 'course-enrollments',
      id,
      data,
      overrideAccess: true,
      req: { context: { source: 'admin' } },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error patching enrollment:', error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
