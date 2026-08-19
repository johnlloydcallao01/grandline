import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// GET /api/lms/tags/admin?search=&page=&limit=&sort=
// Lists the shared course tag pool, or with ?id= returns one tag. The backend
// owns the query logic; the frontend consumes one prepared response
// (see docs/fetching-solution.md).
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const id = (searchParams.get('id') || '').trim()
    if (id) {
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
    }

    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'name'

    const where: Where = {}

    if (search) {
      where.or = [
        { name: { like: search } } as Where,
        { slug: { like: search } } as Where,
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

// POST /api/lms/tags/admin
// Creates a tag. Body is the tag data. The collection hook generates the slug
// from the name when omitted.
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    if (!body?.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const tag = await payload.create({
      collection: 'course-tags',
      data: body as any,
      overrideAccess: true,
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error: any) {
    console.error('[Tags] Error creating tag:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/tags/admin
// Updates a tag. Body: { id, data }.
export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data = body.data || {}
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }

    const tag = await payload.update({
      collection: 'course-tags',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(tag)
  } catch (error: any) {
    console.error('[Tags] Error updating tag:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/tags/admin?id=
// Deletes a tag.
export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    await payload.delete({ collection: 'course-tags', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Tags] Error deleting tag:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}
