import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'
import {
  ELIGIBLE_CONDITIONS,
  buildEligibleSearchConditions,
  normalizeEligibleEnrollment,
} from '../_utils/eligible'

// GET /api/lms/enrollments/eligible?page=&limit=&search=
// Returns certificate-eligible enrollments across all courses. Search and
// normalization are owned by this endpoint (see docs/fetching-solution.md).
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = (searchParams.get('search') || '').trim()

    const where: Where = { and: [...ELIGIBLE_CONDITIONS] } as any

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
    console.error('Error fetching eligible enrollments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}