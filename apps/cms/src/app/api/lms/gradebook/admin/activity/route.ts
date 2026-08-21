import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'
import {
  buildActivityResult,
  buildCourseMap,
} from '../../_utils/activity'

// GET /api/lms/gradebook/admin/activity
//   ?page=&limit=&type=&courseId=&search=
// Returns a paginated, most-recent-first feed of gradebook events across
// enrollments, graded assessment submissions, and graded assignment
// submissions, with derived stats and course options.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'))
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const PER_SOURCE = 1000

    const [coursesRes, enrollmentsRes, assessmentSubs, assignmentSubs] = await Promise.all([
      payload.find({
        collection: 'courses',
        sort: 'title',
        limit: 500,
        depth: 0,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'course-enrollments',
        where: {},
        limit: PER_SOURCE,
        sort: '-updatedAt',
        depth: 2,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'assessment-submissions',
        where: { status: { equals: 'graded' } } as Where,
        limit: PER_SOURCE,
        sort: '-updatedAt',
        depth: 2,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'assignment-submissions',
        where: { status: { equals: 'graded' } } as Where,
        limit: PER_SOURCE,
        sort: '-updatedAt',
        depth: 2,
        overrideAccess: true,
      }),
    ])

    const courseMap = buildCourseMap(coursesRes.docs || [])
    const result = buildActivityResult({
      enrollments: enrollmentsRes.docs || [],
      assessmentSubs: assessmentSubs.docs || [],
      assignmentSubs: assignmentSubs.docs || [],
      courseMap,
      page,
      limit,
      filters: {
        type: searchParams.get('type'),
        courseId: searchParams.get('courseId') != null ? Number(searchParams.get('courseId')) : null,
        search: searchParams.get('search'),
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Gradebook] Error fetching admin activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
