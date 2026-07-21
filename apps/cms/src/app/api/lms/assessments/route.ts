import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const assessmentType = searchParams.get('assessmentType')
    const moduleId = searchParams.get('moduleId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = {}

    if (search) {
      where.or = [
        { title: { like: search } } as Where,
      ]
    }

    if (assessmentType) {
      where.assessmentType = { equals: assessmentType }
    }

    if (moduleId) {
      where.module = { equals: moduleId }
    }

    const [assessments, modules, courses] = await Promise.all([
      payload.find({
        collection: 'assessments',
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
      payload.find({
        collection: 'courses',
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

    const courseOptions = (courses.docs || []).map((c: any) => ({
      id: String(c.id),
      title: c.title || `Course #${c.id}`,
    }))

    return NextResponse.json({
      docs: assessments.docs,
      totalDocs: assessments.totalDocs,
      page: assessments.page,
      limit: assessments.limit,
      totalPages: assessments.totalPages,
      moduleOptions,
      courseOptions,
    })
  } catch (error) {
    console.error('[Assessments] Error fetching assessments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
