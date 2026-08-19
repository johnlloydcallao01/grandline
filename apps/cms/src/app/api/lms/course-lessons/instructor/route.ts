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

// Module IDs from every course owned by the instructor.
async function getInstructorModuleIds(payload: Payload, instructorId: string): Promise<string[]> {
  const result = await payload.find({
    collection: 'courses',
    where: { instructor: { equals: instructorId } },
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })
  const ids = new Set<string>()
  for (const course of result.docs) {
    if (!Array.isArray(course.modules)) continue
    for (const m of course.modules) {
      if (m && typeof m === 'object' && m.id) ids.add(String(m.id))
      else if (typeof m === 'string' || typeof m === 'number') ids.add(String(m))
    }
  }
  return [...ids]
}

function lessonModuleId(lesson: any): string {
  if (lesson?.module && typeof lesson.module === 'object') return String(lesson.module.id)
  if (lesson?.module != null) return String(lesson.module)
  return ''
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

// GET /api/lms/course-lessons/instructor?userId=&search=&moduleId=&page=&limit=&sort=&lessonId=&moduleOptions=1
// Lists lessons scoped to the instructor's courses, with module options scoped
// the same way. With ?lessonId= returns the edit data for one owned lesson;
// with ?moduleOptions=1 returns the scoped module options only. The endpoint
// owns the instructor context resolution and the ownership-scoped query.
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

    const moduleIds = await getInstructorModuleIds(payload, instructorId)
    const moduleWhere: Where | undefined =
      moduleIds.length > 0 ? { id: { in: moduleIds } } : undefined
    const moduleOptions = await findModuleOptions(payload, moduleWhere)

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
      if (!moduleIds.includes(lessonModuleId(lesson))) {
        return NextResponse.json(
          { error: 'Unauthorized: lesson does not belong to your courses' },
          { status: 403 },
        )
      }
      return NextResponse.json({ lesson, moduleOptions })
    }

    if (searchParams.get('moduleOptions') === '1') {
      return NextResponse.json({ moduleOptions })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    if (moduleIds.length === 0) {
      return NextResponse.json({ docs: [], totalDocs: 0, page, limit, totalPages: 0, moduleOptions })
    }

    const search = (searchParams.get('search') || '').trim()
    const moduleId = (searchParams.get('moduleId') || '').trim()
    const sort = searchParams.get('sort') || '-createdAt'

    const where: Where = { and: [{ module: { in: moduleIds } }] } as any
    if (search) {
      ;(where as any).and.push({ or: [{ title: { like: search } }] })
    }
    if (moduleId) {
      ;(where as any).and.push({ module: { equals: moduleId } })
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
    console.error('[CourseLessons] Error fetching instructor lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/course-lessons/instructor
// Creates a lesson only if its module belongs to the instructor's courses.
// Body: { userId, data }. The instructor is always resolved server-side.
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
    if (!input.title || !input.module) {
      return NextResponse.json({ error: 'title and module are required' }, { status: 400 })
    }

    const moduleIds = await getInstructorModuleIds(payload, instructorId)
    if (!moduleIds.includes(String(input.module))) {
      return NextResponse.json(
        { error: 'Unauthorized: cannot add lessons to another instructor course' },
        { status: 403 },
      )
    }

    const lesson = await payload.create({
      collection: 'course-lessons',
      data: normalizeLessonData(input) as any,
      overrideAccess: true,
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error: any) {
    console.error('[CourseLessons] Error creating instructor lesson:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/course-lessons/instructor
// Updates a lesson only if it belongs to the instructor's courses, and never
// lets an instructor move a lesson to a module outside their courses.
// Body: { userId, id, data }.
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

    const lesson = await payload.findByID({
      collection: 'course-lessons',
      id: String(id),
      depth: 1,
      overrideAccess: true,
    })
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const moduleIds = await getInstructorModuleIds(payload, instructorId)
    if (!moduleIds.includes(lessonModuleId(lesson))) {
      return NextResponse.json(
        { error: 'Unauthorized: lesson does not belong to your courses' },
        { status: 403 },
      )
    }

    const data = normalizeLessonData(body.data || {})
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }
    if (data.module != null && !moduleIds.includes(String(data.module))) {
      return NextResponse.json(
        { error: 'Unauthorized: cannot move lesson to another instructor course' },
        { status: 403 },
      )
    }

    const updated = await payload.update({
      collection: 'course-lessons',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('[CourseLessons] Error updating instructor lesson:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/course-lessons/instructor?userId=&id=
// Deletes a lesson only if it belongs to the instructor's courses.
export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = (searchParams.get('userId') || '').trim()
    const id = (searchParams.get('id') || '').trim()
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 })
    }
    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, userId)
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    const lesson = await payload.findByID({
      collection: 'course-lessons',
      id: String(id),
      depth: 1,
      overrideAccess: true,
    })
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const moduleIds = await getInstructorModuleIds(payload, instructorId)
    if (!moduleIds.includes(lessonModuleId(lesson))) {
      return NextResponse.json(
        { error: 'Unauthorized: lesson does not belong to your courses' },
        { status: 403 },
      )
    }

    await payload.delete({ collection: 'course-lessons', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[CourseLessons] Error deleting instructor lesson:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}