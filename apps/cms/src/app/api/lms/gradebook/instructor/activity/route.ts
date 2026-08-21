import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'
import {
  buildActivityResult,
  buildCourseMap,
} from '../../_utils/activity'

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

// GET /api/lms/gradebook/instructor/activity
//   ?userId=&page=&limit=&type=&courseId=&search=
// Returns a scoped, paginated, most-recent-first activity feed across the
// instructor's owned/co-taught courses, with derived stats and course options.
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

    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20'))
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

    const emptyResult = {
      events: [],
      totalDocs: 0,
      totalPages: 0,
      page,
      limit,
      stats: { totalEvents: 0, gradedAssignments: 0, gradedAssessments: 0, newEnrollments: 0, completions: 0 },
      courses: [],
    }

    // Scoping boundary: only events tied to the instructor's owned/co-taught courses.
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

    if (courseDocs.length === 0) {
      return NextResponse.json(emptyResult)
    }

    const courseMap = buildCourseMap(courseDocs)
    const courseIds = courseDocs.map((course: any) => String(course.id))

    const enrollmentRes = await payload.find({
      collection: 'course-enrollments',
      where: { course: { in: courseIds } } as Where,
      limit: 1000,
      depth: 2,
      sort: '-updatedAt',
      overrideAccess: true,
    })
    const enrollmentDocs = enrollmentRes.docs || []

    const enrollmentIds = enrollmentDocs.map((e: any) => String(e.id))

    let assessDocs: any[] = []
    let assignDocs: any[] = []
    if (enrollmentIds.length > 0) {
      const [assessRes, assignRes] = await Promise.all([
        payload.find({
          collection: 'assessment-submissions',
          where: {
            and: [
              { enrollment: { in: enrollmentIds } },
              { status: { equals: 'graded' } },
            ],
          } as Where,
          limit: 1000,
          depth: 2,
          sort: '-updatedAt',
          overrideAccess: true,
        }),
        payload.find({
          collection: 'assignment-submissions',
          where: {
            and: [
              { enrollment: { in: enrollmentIds } },
              { status: { equals: 'graded' } },
            ],
          } as Where,
          limit: 1000,
          depth: 2,
          sort: '-updatedAt',
          overrideAccess: true,
        }),
      ])
      assessDocs = assessRes.docs || []
      assignDocs = assignRes.docs || []
    }

    const result = buildActivityResult({
      enrollments: enrollmentDocs,
      assessmentSubs: assessDocs,
      assignmentSubs: assignDocs,
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
    console.error('[Gradebook] Error fetching instructor activity:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
