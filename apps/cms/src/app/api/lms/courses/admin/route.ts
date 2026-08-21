import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Statuses surfaced in the UI filter chips / metric cards.
const STATUSES = ['published', 'draft', 'archived'] as const

function toLexical(text: string): unknown {
  return {
    root: {
      children: [
        {
          type: 'paragraph',
          children: [{ text }],
        },
      ],
    },
  }
}

// Coerce client payload values into Payload relationship/richText formats.
// Mirrors the normalization the frontend actions previously duplicated.
function normalizeCourseData(data: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = { ...data }

  for (const key of ['instructor', 'certificateTemplate', 'feedbackForm']) {
    if (safe[key] != null && typeof safe[key] !== 'object') safe[key] = Number(safe[key])
  }

  for (const key of ['category', 'coInstructors', 'modules', 'tags']) {
    const val = safe[key]
    if (Array.isArray(val)) safe[key] = val.map((v) => (typeof v === 'object' ? v : Number(v)))
  }

  if (typeof safe.description === 'string') safe.description = toLexical(safe.description as string)

  return safe
}

// GET /api/lms/courses/admin?search=&status=&page=&limit=&sort=
// Lists all courses with per-status totals independent of the status filter,
// so the filter chips and metric cards stay stable and accurate.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = (searchParams.get('search') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const tag = (searchParams.get('tag') || '').trim()
    const category = (searchParams.get('category') || '').trim()
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = { and: [] } as any

    if (search) {
      ;(where as any).and.push({
        or: [
          { title: { like: search } },
          { courseCode: { like: search } },
        ],
      })
    }

    if (tag) {
      ;(where as any).and.push({ tags: { contains: tag } })
    }

    if (category) {
      ;(where as any).and.push({ category: { contains: category } })
    }

    const countsWhere = JSON.parse(JSON.stringify(where)) as Where
    const [totalCount, ...statusCounts] = await Promise.all([
      payload.count({ collection: 'courses', where: countsWhere, overrideAccess: true }),
      ...STATUSES.map((s) =>
        payload.count({
          collection: 'courses',
          where: {
            and: [...(countsWhere.and as any[]), { status: { equals: s } }],
          },
          overrideAccess: true,
        })
      ),
    ])
    const counts: Record<string, number> = { total: totalCount.totalDocs }
    STATUSES.forEach((s, i) => {
      counts[s] = statusCounts[i].totalDocs
    })

    if (status && status !== 'all') {
      ;(where as any).and.push({ status: { equals: status } })
    }

    const courses = await payload.find({
      collection: 'courses',
      where,
      page,
      limit,
      depth: 2,
      sort,
      overrideAccess: true,
    })

    return NextResponse.json({ ...courses, counts })
  } catch (error) {
    console.error('Error fetching admin courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/courses/admin
// Creates a course. Body is the course data (admin supplies the instructor).
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    if (!body.title || !body.courseCode) {
      return NextResponse.json({ error: 'title and courseCode are required' }, { status: 400 })
    }

    const course = await payload.create({
      collection: 'courses',
      data: normalizeCourseData(body) as any,
      overrideAccess: true,
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    console.error('Error creating course:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/courses/admin
// Updates a course. Body: { id, data }.
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

    const data = normalizeCourseData(body.data || {})
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }

    const course = await payload.update({
      collection: 'courses',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(course)
  } catch (error: any) {
    console.error('Error updating course:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/courses/admin?id=
// Deletes a course.
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

    await payload.delete({ collection: 'courses', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting course:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}
