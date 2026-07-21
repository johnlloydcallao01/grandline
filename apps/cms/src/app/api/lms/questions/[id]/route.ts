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

    const question = await payload.findByID({
      collection: 'questions',
      id,
      depth: 2,
      overrideAccess: true,
    })

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('[Question] Error fetching question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
