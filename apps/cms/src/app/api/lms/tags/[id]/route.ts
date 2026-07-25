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

    const tag = await payload.findByID({
      collection: 'course-tags',
      id,
      depth: 0,
      overrideAccess: true,
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    return NextResponse.json({ tag })
  } catch (error) {
    console.error('[Tag] Error fetching tag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
