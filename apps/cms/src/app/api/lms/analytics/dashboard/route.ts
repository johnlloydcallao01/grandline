import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cachedPayloadFind } from '@/utils/redis-cache'

export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const [coursesResult, enrollmentsResult, studentsResult, instructorsResult] = await Promise.all([
      cachedPayloadFind(payload, { collection: 'courses', limit: 0 }),
      cachedPayloadFind(payload, { collection: 'course-enrollments', limit: 0 }),
      cachedPayloadFind(payload, { collection: 'trainees', limit: 0 }),
      cachedPayloadFind(payload, { collection: 'instructors', limit: 0 }),
    ])

    const recentEnrollments = await cachedPayloadFind(payload, {
      collection: 'course-enrollments',
      limit: 5,
      sort: '-enrolledAt',
      depth: 2,
    })

    const popularCourses = await cachedPayloadFind(payload, {
      collection: 'courses',
      limit: 5,
      depth: 1,
    })

    const dashboardData = {
      overview: {
        totalCourses: coursesResult.totalDocs,
        totalEnrollments: enrollmentsResult.totalDocs,
        totalStudents: studentsResult.totalDocs,
        totalInstructors: instructorsResult.totalDocs,
        activeEnrollments: enrollmentsResult.totalDocs,
        completionRate: 0,
      },
      recentActivity: {
        recentEnrollments: recentEnrollments.docs,
        enrollmentTrends: [],
      },
      popularCourses: popularCourses.docs,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
