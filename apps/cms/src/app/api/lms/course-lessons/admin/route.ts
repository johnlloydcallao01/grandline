import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Coerce client payload values into Payload relationship/richText formats.
// Mirrors the normalization the frontend actions previously duplicated.
function normalizeLessonData(data: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = { ...data }

  if (safe.module != null && typeof safe.module !== 'object') safe.module = Number(safe.module)

  if (typeof safe.description === 'string') {
    try {
      safe.description = JSON.parse(safe.description as string)
    } catch {
      // keep the plain string
    }
  }

  return safe
}

async function findModuleOptions(payload: Payload, where?: Where) {
  const modules = await payload.find({
    collection: 'course-modules',
    limit: 200,
    sort: 'title',
    depth: 0,
    where,
    overrideAccess: true,
  })
  return (modules.docs || []).map((m: any) => ({
    id: String(m.id),
    title: m.title || `Module #${m.id}`,
  }))
}

// GET /api/lms/course-lessons/admin?search=&moduleId=&page=&limit=&sort=&lessonId=&moduleOptions=1
// Lists all lessons with their module options. With ?lessonId= returns the
// edit data for one lesson; with ?moduleOptions=1 returns module options only.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const moduleOptions = await findModuleOptions(payload)

    const lessonId = (searchParams.get('lessonId') || '').trim()
    if (lessonId) {
      const lesson = await payload.findByID({
        collection: 'course-lessons',
        id: lessonId,
        depth: 2,
        overrideAccess: true,
      })
      if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      }
      return NextResponse.json({ lesson, moduleOptions })
    }

    if (searchParams.get('moduleOptions') === '1') {
      return NextResponse.json({ moduleOptions })
    }

    const search = (searchParams.get('search') || '').trim()
    const moduleId = (searchParams.get('moduleId') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-createdAt'

    const where: Where = {} as any
    if (search) {
      ;(where as any).or = [{ title: { like: search } }]
    }
    if (moduleId) {
      where.module = { equals: moduleId }
    }

    const lessons = await payload.find({
      collection: 'course-lessons',
      where,
      sort,
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: lessons.docs,
      totalDocs: lessons.totalDocs,
      page: lessons.page,
      limit: lessons.limit,
      totalPages: lessons.totalPages,
      moduleOptions,
    })
  } catch (error) {
    console.error('[CourseLessons] Error fetching lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/course-lessons/admin
// Creates a lesson. Body is the lesson data.
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    if (!body.title || !body.module) {
      return NextResponse.json({ error: 'title and module are required' }, { status: 400 })
    }

    const lesson = await payload.create({
      collection: 'course-lessons',
      data: normalizeLessonData(body) as any,
      overrideAccess: true,
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error: any) {
    console.error('[CourseLessons] Error creating lesson:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/course-lessons/admin
// Updates a lesson. Body: { id, data }.
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

    const data = normalizeLessonData(body.data || {})
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }

    const lesson = await payload.update({
      collection: 'course-lessons',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(lesson)
  } catch (error: any) {
    console.error('[CourseLessons] Error updating lesson:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/course-lessons/admin?id=
// Deletes a lesson.
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

    await payload.delete({ collection: 'course-lessons', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[CourseLessons] Error deleting lesson:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}