import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'name'

    const where: Where = {}

    if (search) {
      where.or = [
        { name: { like: search } } as Where,
      ]
    }

    const tags = await payload.find({
      collection: 'course-tags',
      where,
      sort,
      page,
      limit,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: tags.docs,
      totalDocs: tags.totalDocs,
      page: tags.page,
      limit: tags.limit,
      totalPages: tags.totalPages,
    })
  } catch (error) {
    console.error('[Tags] Error fetching tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
