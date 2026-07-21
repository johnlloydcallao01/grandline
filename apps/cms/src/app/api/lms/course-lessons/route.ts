import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const moduleId = searchParams.get('moduleId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-createdAt'

    const where: Where = {}

    if (search) {
      where.or = [
        { title: { like: search } } as Where,
      ]
    }

    if (moduleId) {
      where.module = { equals: moduleId }
    }

    const [lessons, modules] = await Promise.all([
      payload.find({
        collection: 'course-lessons',
        where,
        sort,
        page,
        limit,
        depth: 1,
        overrideAccess: true,
      }),
      payload.find({
        collection: 'course-modules',
        limit: 200,
        sort: 'title',
        depth: 0,
        overrideAccess: true,
      }),
    ])

    const moduleOptions = (modules.docs || []).map((m: any) => ({
      id: String(m.id),
      title: m.title || `Module #${m.id}`,
    }))

    return NextResponse.json({
      docs: lessons.docs,
      totalDocs: lessons.totalDocs,
      page: lessons.page,
      limit: lessons.limit,
      totalPages: lessons.totalPages,
      moduleOptions,
    })
  } catch (error) {
    console.error('[CourseLessons] Error fetching lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
