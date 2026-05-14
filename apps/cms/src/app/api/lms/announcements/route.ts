import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

// GET /api/lms/announcements - Get announcements for a trainee's enrolled courses
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('userId')
    const course = searchParams.get('course')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      )
    }

    const traineesForUser = await payload.find({
      collection: 'trainees',
      where: {
        user: { equals: userId },
      } as Where,
      limit: 1,
      overrideAccess: true,
    })

    const trainee = Array.isArray(traineesForUser.docs) ? traineesForUser.docs[0] : null

    if (!trainee || (trainee as any).id == null) {
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
      })
    }

    const enrollmentWhere: Where = {
      student: { equals: String((trainee as any).id) },
    }

    if (course) {
      ;(enrollmentWhere as any).course = { equals: course }
    }

    const enrollments = await payload.find({
      collection: 'course-enrollments',
      where: enrollmentWhere,
      depth: 1,
      limit: 200,
      sort: '-enrolledAt',
      overrideAccess: true,
    })

    const courseIds = Array.from(
      new Set(
        (Array.isArray(enrollments.docs) ? enrollments.docs : [])
          .map((enrollment: any) => {
            if (enrollment?.course && typeof enrollment.course === 'object') {
              return String(enrollment.course.id)
            }

            return enrollment?.course ? String(enrollment.course) : null
          })
          .filter(Boolean),
      ),
    ) as string[]

    if (courseIds.length === 0) {
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
      })
    }

    const announcements = await payload.find({
      collection: 'announcements',
      where: {
        course: { in: courseIds },
      },
      sort: '-pinned,-visibleFrom,-createdAt',
      limit,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: announcements.docs,
      totalDocs: announcements.totalDocs,
      limit: announcements.limit,
      totalPages: announcements.totalPages,
      page: announcements.page,
    })
  } catch (error) {
    console.error('Error fetching LMS announcements:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
