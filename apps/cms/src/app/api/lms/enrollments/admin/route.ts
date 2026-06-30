import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = (searchParams.get('search') || '').trim()
    const status = (searchParams.get('status') || '').trim()

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

    return NextResponse.json(enrollments)
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

    const { student, course, status: enrollmentStatus, notes, enrolledBy } = body

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
        student: studentId,
        course: courseId,
        status: enrollmentStatus || 'active',
        notes: notes || '',
        enrolledBy: enrolledBy || null,
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
        enrollmentType: 'free',
        paymentStatus: 'not_required',
      },
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

    const { id, status, isArchived } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data: Record<string, any> = {}
    if (status) data.status = status
    if (typeof isArchived === 'boolean') data.isArchived = isArchived

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'status or isArchived is required' }, { status: 400 })
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
