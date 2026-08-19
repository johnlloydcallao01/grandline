import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Payload, type Where } from 'payload'
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

async function resolveInstructorId(payload: Payload, userId: string): Promise<string | null> {
  const result = await payload.find({
    collection: 'instructors',
    where: { user: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = result.docs?.[0]
  return doc ? String(doc.id) : null
}

// GET /api/lms/courses/instructor?userId=&search=&status=&page=&limit=&sort=
// Lists courses owned by the instructor, or (with ?courseId=) returns the edit
// data for one owned course. The endpoint owns the instructor context
// resolution and the ownership-scoped query.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = (searchParams.get('userId') || '').trim()
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    const courseId = (searchParams.get('courseId') || '').trim()

    if (courseId) {
      const owned = await payload.find({
        collection: 'courses',
        where: {
          and: [
            { id: { equals: courseId } },
            { instructor: { equals: instructorId } },
          ],
        },
        limit: 1,
        depth: 2,
        overrideAccess: true,
      })

      if (owned.docs.length === 0) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
      }

      const [categories, tags, modules] = await Promise.all([
        payload.find({
          collection: 'course-categories',
          limit: 100,
          sort: 'name',
          depth: 0,
          overrideAccess: true,
        }),
        payload.find({
          collection: 'course-tags',
          limit: 100,
          sort: 'name',
          depth: 0,
          overrideAccess: true,
        }),
        payload.find({
          collection: 'course-modules',
          limit: 10,
          sort: '-createdAt',
          depth: 0,
          overrideAccess: true,
        }),
      ])

      return NextResponse.json({
        course: owned.docs[0],
        categories: (categories.docs || []).map((c: any) => ({
          id: String(c.id),
          name: c.name || '',
        })),
        tags: (tags.docs || []).map((t: any) => ({
          id: String(t.id),
          name: t.name || '',
        })),
        modules: (modules.docs || []).map((m: any) => ({
          id: String(m.id),
          title: m.title || m.name || String(m.id),
          name: m.name || undefined,
        })),
      })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = (searchParams.get('search') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = {
      and: [{ instructor: { equals: instructorId } }],
    } as any

    if (search) {
      ;(where as any).and.push({
        or: [
          { title: { like: search } },
          { courseCode: { like: search } },
        ],
      })
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
    console.error('Error fetching instructor courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/courses/instructor
// Creates a course owned by the instructor. Body: { userId, data }.
// The instructor is always resolved server-side and never trusted from input.
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { userId, data: rawData } = body
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, String(userId))
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    const input = (rawData && typeof rawData === 'object' ? rawData : {}) as Record<string, unknown>
    if (!input.title || !input.courseCode) {
      return NextResponse.json({ error: 'title and courseCode are required' }, { status: 400 })
    }

    const data = normalizeCourseData(input)

    // Ownership boundary: the course belongs to the caller, not to a client-supplied instructor.
    delete data.instructor
    delete data.coInstructors

    data.instructor = Number(instructorId)

    const payloadData: Record<string, unknown> = {
      status: data.status || 'draft',
      difficultyLevel: data.difficultyLevel || 'standard',
      language: data.language || 'en',
      passingGrade: data.passingGrade || 70,
      evaluationMode: data.evaluationMode || 'lessons_exam',
      ...data,
    }

    const course = await payload.create({
      collection: 'courses',
      data: payloadData as any,
      overrideAccess: true,
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error: any) {
    console.error('Error creating instructor course:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/courses/instructor
// Updates a course only if it belongs to the instructor. Body: { userId, id, data }.
export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { userId, id } = body
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, String(userId))
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    // Ownership boundary: the course must belong to the instructor.
    const owned = await payload.find({
      collection: 'courses',
      where: {
        and: [
          { id: { equals: String(id) } },
          { instructor: { equals: instructorId } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (owned.docs.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized: course does not belong to your account' },
        { status: 403 },
      )
    }

    const data = normalizeCourseData(body.data || {})

    // Ownership boundary: instructors cannot reassign ownership through updates.
    delete data.instructor
    delete data.coInstructors

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
    console.error('Error updating instructor course:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}