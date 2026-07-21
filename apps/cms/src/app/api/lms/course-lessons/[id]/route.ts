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

    const lesson = await payload.findByID({
      collection: 'course-lessons',
      id,
      depth: 2,
      overrideAccess: true,
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const modules = await payload.find({
      collection: 'course-modules',
      limit: 200,
      sort: 'title',
      depth: 0,
      overrideAccess: true,
    })

    const moduleOptions = (modules.docs || []).map((m: any) => ({
      id: String(m.id),
      title: m.title || `Module #${m.id}`,
    }))

    return NextResponse.json({ lesson, moduleOptions })
  } catch (error) {
    console.error('[CourseLesson] Error fetching lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
