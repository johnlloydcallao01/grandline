import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'
import {
  ELIGIBLE_CONDITIONS,
  buildEligibleSearchConditions,
  normalizeEligibleEnrollment,
} from '../../_utils/eligible'

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

// GET /api/lms/enrollments/instructor/eligible?userId=&page=&limit=&search=
// Returns certificate-eligible enrollments scoped to the instructor's
// owned/co-taught courses. The endpoint owns instructor context resolution,
// course scoping, and normalization (see docs/fetching-solution.md).
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

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '500')
    const search = (searchParams.get('search') || '').trim()

    const courseRes = await payload.find({
      collection: 'courses',
      where: {
        or: [
          { instructor: { equals: instructorId } },
          { coInstructors: { contains: instructorId } },
        ],
      } as Where,
      sort: 'title',
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })
    const courseDocs = courseRes.docs || []

    const emptyResult = {
      docs: [],
      totalDocs: 0,
      page,
      limit,
      totalPages: 0,
    }

    if (courseDocs.length === 0) {
      return NextResponse.json(emptyResult)
    }

    const courseIds = courseDocs.map((course: any) => String(course.id))

    const where: Where = {
      and: [{ course: { in: courseIds } }, ...ELIGIBLE_CONDITIONS],
    } as any

    if (search) {
      const orConditions = await buildEligibleSearchConditions(payload, search)
      if (orConditions.length > 0) {
        ;(where as any).and.push({ or: orConditions })
      }
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
      docs: (enrollments.docs || []).map(normalizeEligibleEnrollment),
      totalDocs: enrollments.totalDocs,
      page: enrollments.page,
      limit: enrollments.limit,
      totalPages: enrollments.totalPages,
    })
  } catch (error) {
    console.error('Error fetching instructor eligible enrollments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}