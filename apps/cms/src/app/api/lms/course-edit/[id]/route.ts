import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id } = await context.params

    const [course, categories, modules] = await Promise.all([
      payload.findByID({ collection: 'courses', id, depth: 2, overrideAccess: true }),
      payload.find({ collection: 'course-categories', limit: 100, sort: 'name', depth: 0, overrideAccess: true }),
      payload.find({ collection: 'course-modules', limit: 10, sort: '-createdAt', depth: 0, overrideAccess: true }),
    ])

    const categoryOptions = (categories.docs || []).map((c: any) => ({
      id: String(c.id),
      name: c.name || '',
    }))

    const moduleOptions = (modules.docs || []).map((m: any) => ({
      id: String(m.id),
      title: m.title || m.name || String(m.id),
      name: m.name || undefined,
    }))

    return NextResponse.json({ course, categories: categoryOptions, modules: moduleOptions })
  } catch (error) {
    console.error('[CourseEdit] Error loading course data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
