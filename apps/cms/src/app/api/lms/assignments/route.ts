import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const submissionType = searchParams.get('submissionType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = {}

    if (search) {
      where.or = [
        { title: { like: search } } as Where,
      ]
    }

    if (submissionType) {
      where.submissionType = { equals: submissionType }
    }

    const assignments = await payload.find({
      collection: 'assignments',
      where,
      sort,
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: assignments.docs,
      totalDocs: assignments.totalDocs,
      page: assignments.page,
      limit: assignments.limit,
      totalPages: assignments.totalPages,
    })
  } catch (error) {
    console.error('[Assignments] Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
