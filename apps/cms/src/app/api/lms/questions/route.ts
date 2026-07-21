import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = {}

    if (search) {
      where.or = [
        { prompt: { like: search } } as Where,
      ]
    }

    if (type) {
      where.type = { equals: type }
    }

    if (difficulty) {
      where.difficulty = { equals: difficulty }
    }

    if (status) {
      where.status = { equals: status }
    }

    const questions = await payload.find({
      collection: 'questions',
      where,
      sort,
      page,
      limit,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: questions.docs,
      totalDocs: questions.totalDocs,
      page: questions.page,
      limit: questions.limit,
      totalPages: questions.totalPages,
    })
  } catch (error) {
    console.error('[Questions] Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
