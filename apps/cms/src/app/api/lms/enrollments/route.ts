import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

// GET /api/lms/enrollments - Get enrollments with filtering
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const student = searchParams.get('student')
    const course = searchParams.get('course')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    // Build where clause
    const where: Where = {}

    // Resolve student from userId when provided
    let effectiveStudent = student

    if (!effectiveStudent && userId) {
      try {
        const traineesForUser = await payload.find({
          collection: 'trainees',
          where: {
            user: { equals: userId },
          } as Where,
          limit: 1,
        })

        const firstTrainee = Array.isArray(traineesForUser.docs)
          ? traineesForUser.docs[0]
          : null

        if (firstTrainee && (firstTrainee as any).id != null) {
          effectiveStudent = String((firstTrainee as any).id)
        }
      } catch (resolveError) {
        console.error('Error resolving trainee from userId:', resolveError)
      }
    }

    if (effectiveStudent) {
      ; (where as any).student = { equals: effectiveStudent }
    }

    if (course) {
      ; (where as any).course = { equals: course }
    }

    if (status) {
      ; (where as any).status = { equals: status }
    }

    // Get enrollments with relationships
    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where,
      page,
      limit,
      depth: 4, // Depth 1: Course, Depth 2: Instructor, Depth 3: User, Depth 4: Profile Picture (Media)
      sort: '-enrolledAt',
    })

    return NextResponse.json(enrollments)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lms/enrollments - Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    // Check if enrollment already exists
    const existingEnrollment = await payload.find({
      collection: 'course-enrollments',
      where: {
        and: [
          { student: { equals: body.student } },
          { course: { equals: body.course } }
        ]
      } as Where
    })

    if (existingEnrollment.docs.length > 0) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment
    const newEnrollment = await payload.create({
      collection: 'course-enrollments',
      data: {
        ...body,
        enrolledAt: new Date().toISOString(),
        status: body.status || 'active',
        progressPercentage: 0,
      },
    })

    // ─────────────────────────────────────────────────────────────
    // CREATE ENROLLMENT NOTIFICATION (NEW)
    // ─────────────────────────────────────────────────────────────
    try {
      // Only notify if enrollment is active
      if (newEnrollment.status === 'active') {
        // 1. Get trainee's user ID
        const studentId = typeof newEnrollment.student === 'object'
          ? newEnrollment.student.id
          : newEnrollment.student
        const trainee = await payload.findByID({
          collection: 'trainees',
          id: studentId,
          depth: 0,
        })

        const userId = typeof trainee.user === 'object' ? trainee.user.id : trainee.user

        // 2. Get course details
        const courseId = typeof newEnrollment.course === 'object'
          ? newEnrollment.course.id
          : newEnrollment.course
        const course = await payload.findByID({
          collection: 'courses',
          id: courseId,
          depth: 0,
        })

        // 3. Find COURSE_ENROLLED template
        const templateRes = await payload.find({
          collection: 'notification-templates',
          where: {
            code: { equals: 'COURSE_ENROLLED' }
          },
          limit: 1,
        })

        const template = templateRes.docs[0]

        // 4. Create broadcast notification
        const notification = await payload.create({
          collection: 'notifications',
          data: {
            ...(template && { template: template.id }),
            category: 'learning',
            title: `🎓 Welcome to ${course.title}!`,
            body: `You have been successfully enrolled in ${course.title}. Start learning now!`,
            metadata: {
              enrollmentId: newEnrollment.id,
              courseId: course.id,
              courseName: course.title,
              enrollmentType: newEnrollment.enrollmentType,
            },
            sourceType: 'enrollment',
            sourceId: String(newEnrollment.id),
            origin: 'automatic',
            audienceType: 'specific-users',
            status: 'sent',
          },
        })

        // 5. Create per-user notification (for bell icon)
        await payload.create({
          collection: 'user-notifications',
          data: {
            user: userId,
            notification: notification.id,
            category: 'learning',
            title: `🎓 Welcome to ${course.title}!`,
            body: `You have been successfully enrolled in ${course.title}. Start learning now!`,
            link: `/portal/courses/${course.id}`,
            metadata: {
              enrollmentId: newEnrollment.id,
              courseId: course.id,
              courseName: course.title,
            },
            channel: 'in-app',
            deliveredAt: new Date().toISOString(),
          },
        })

        console.log(`[Notification] Enrollment notification created for user ${userId}, course ${course.title}`)
      }
    } catch (notifyError) {
      // Log error but don't fail the enrollment
      console.error('[Notification] Failed to create enrollment notification:', notifyError)
    }
    // ─────────────────────────────────────────────────────────────

    return NextResponse.json(newEnrollment, { status: 201 })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
