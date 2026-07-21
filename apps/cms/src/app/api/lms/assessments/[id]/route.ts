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

    const assessment = await payload.findByID({
      collection: 'assessments',
      id,
      depth: 2,
      overrideAccess: true,
    })

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const [modules, courses] = await Promise.all([
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

    return NextResponse.json({ assessment, moduleOptions, courseOptions })
  } catch (error) {
    console.error('[Assessment] Error fetching assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
