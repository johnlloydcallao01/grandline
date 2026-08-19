import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// GET /api/lms/course-categories/admin?search=&categoryType=&isActive=&page=&limit=&sort=
// Lists the course category pool, or with ?id= returns one category. With
// ?all=true returns a lightweight { id, name } option list for parent pickers.
// The backend owns the query logic; the frontend consumes one prepared
// response (see docs/fetching-solution.md).
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    if (searchParams.get('all') === 'true') {
      const all = await payload.find({
        collection: 'course-categories',
        sort: 'name',
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
      return NextResponse.json({
        categories: (all.docs || []).map((c: any) => ({
          id: String(c.id),
          name: c.name || '',
        })),
      })
    }

    const id = (searchParams.get('id') || '').trim()
    if (id) {
      const category = await payload.findByID({
        collection: 'course-categories',
        id,
        depth: 2,
        overrideAccess: true,
      })
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
      return NextResponse.json({ category })
    }

    const search = searchParams.get('search')
    const categoryType = searchParams.get('categoryType')
    const isActive = searchParams.get('isActive')
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

    if (categoryType) {
      where.categoryType = { equals: categoryType }
    }

    if (isActive) {
      where.isActive = { equals: isActive === 'true' }
    }

    const categories = await payload.find({
      collection: 'course-categories',
      where,
      sort,
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: categories.docs,
      totalDocs: categories.totalDocs,
      page: categories.page,
      limit: categories.limit,
      totalPages: categories.totalPages,
    })
  } catch (error) {
    console.error('[CourseCategories] Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/course-categories/admin
// Creates a category. Body is the category data. The collection hook generates
// the slug from the name when omitted.
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

    const category = await payload.create({
      collection: 'course-categories',
      data: body as any,
      overrideAccess: true,
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('[CourseCategories] Error creating category:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/course-categories/admin
// Updates a category. Body: { id, data }.
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

    const category = await payload.update({
      collection: 'course-categories',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(category)
  } catch (error: any) {
    console.error('[CourseCategories] Error updating category:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/course-categories/admin?id=
// Deletes a category.
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

    await payload.delete({ collection: 'course-categories', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[CourseCategories] Error deleting category:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}