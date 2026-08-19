import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Coerce client payload values into Payload relationship/richText formats.
// Mirrors the normalization the frontend actions previously duplicated.
function normalizeAssessmentData(data: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = { ...data }

  if (safe.module != null && typeof safe.module !== 'object') safe.module = Number(safe.module)
  if (safe.course != null && typeof safe.course !== 'object') safe.course = Number(safe.course)

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

// Course IDs and module IDs from every course owned by the instructor.
async function getInstructorCourseAndModuleIds(
  payload: Payload,
  instructorId: string,
): Promise<{ courseIds: string[]; moduleIds: string[] }> {
  const result = await payload.find({
    collection: 'courses',
    where: { instructor: { equals: instructorId } },
    limit: 100,
    depth: 1,
    overrideAccess: true,
  })
  const courseIds = new Set<string>()
  const moduleIds = new Set<string>()
  for (const course of result.docs) {
    courseIds.add(String(course.id))
    if (!Array.isArray(course.modules)) continue
    for (const m of course.modules) {
      if (m && typeof m === 'object' && m.id) moduleIds.add(String(m.id))
      else if (typeof m === 'string' || typeof m === 'number') moduleIds.add(String(m))
    }
  }
  return { courseIds: [...courseIds], moduleIds: [...moduleIds] }
}

function assessmentRefId(assessment: any, field: 'module' | 'course'): string {
  const ref = assessment?.[field]
  if (!ref) return ''
  if (typeof ref === 'object') return String(ref.id)
  return String(ref)
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

async function findCourseOptions(payload: Payload, where?: Where) {
  const courses = await payload.find({
    collection: 'courses',
    limit: 200,
    sort: 'title',
    depth: 0,
    where,
    overrideAccess: true,
  })
  return (courses.docs || []).map((c: any) => ({
    id: String(c.id),
    title: c.title || `Course #${c.id}`,
  }))
}

// GET /api/lms/assessments/instructor?userId=&search=&assessmentType=&moduleId=&page=&limit=&sort=&assessmentId=
// Lists assessments scoped to the instructor's courses, with module and course
// options scoped the same way. With ?assessmentId= returns the edit data for
// one owned assessment. The endpoint owns the instructor context resolution
// and the ownership-scoped query.
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

    const { courseIds, moduleIds } = await getInstructorCourseAndModuleIds(payload, instructorId)
    const moduleOptions = await findModuleOptions(
      payload,
      moduleIds.length > 0 ? { id: { in: moduleIds } } : undefined,
    )
    const courseOptions = await findCourseOptions(
      payload,
      courseIds.length > 0 ? { id: { in: courseIds } } : undefined,
    )

    const assessmentId = (searchParams.get('assessmentId') || '').trim()
    if (assessmentId) {
      const assessment = await payload.findByID({
        collection: 'assessments',
        id: assessmentId,
        depth: 2,
        overrideAccess: true,
      })
      if (!assessment) {
        return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
      }
      const moduleId = assessmentRefId(assessment, 'module')
      const courseId = assessmentRefId(assessment, 'course')
      const owned =
        (moduleId && moduleIds.includes(moduleId)) || (courseId && courseIds.includes(courseId))
      if (!owned) {
        return NextResponse.json(
          { error: 'Unauthorized: assessment does not belong to your courses' },
          { status: 403 },
        )
      }
      return NextResponse.json({ assessment, moduleOptions, courseOptions })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    if (courseIds.length === 0 && moduleIds.length === 0) {
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
        page,
        limit,
        totalPages: 0,
        moduleOptions,
        courseOptions,
      })
    }

    const search = (searchParams.get('search') || '').trim()
    const assessmentType = (searchParams.get('assessmentType') || '').trim()
    const moduleId = (searchParams.get('moduleId') || '').trim()
    const sort = searchParams.get('sort') || '-createdAt'

    const where: Where = { and: [] } as any
    ;(where as any).and.push({
      or: [{ module: { in: moduleIds } }, { course: { in: courseIds } }],
    })
    if (search) {
      ;(where as any).and.push({ or: [{ title: { like: search } }] })
    }
    if (assessmentType) {
      ;(where as any).and.push({ assessmentType: { equals: assessmentType } })
    }
    if (moduleId) {
      ;(where as any).and.push({ module: { equals: moduleId } })
    }

    const assessments = await payload.find({
      collection: 'assessments',
      where,
      sort,
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: assessments.docs,
      totalDocs: assessments.totalDocs,
      page: assessments.page,
      limit: assessments.limit,
      totalPages: assessments.totalPages,
      moduleOptions,
      courseOptions,
    })
  } catch (error) {
    console.error('[Assessments] Error fetching instructor assessments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/assessments/instructor
// Creates an assessment only if its module/course belongs to the instructor's
// courses. Body: { userId, data }. The instructor is always resolved server-side.
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
    if (!input.title || !input.assessmentType) {
      return NextResponse.json({ error: 'title and assessmentType are required' }, { status: 400 })
    }

    const { courseIds, moduleIds } = await getInstructorCourseAndModuleIds(payload, instructorId)

    if (input.assessmentType === 'final_exam') {
      if (!input.course) {
        return NextResponse.json({ error: 'Course is required for final exams' }, { status: 400 })
      }
      if (!courseIds.includes(String(input.course))) {
        return NextResponse.json(
          { error: 'Unauthorized: cannot create assessments for another instructor course' },
          { status: 403 },
        )
      }
    } else {
      if (!input.module) {
        return NextResponse.json({ error: 'Module is required for quiz and exam assessments' }, { status: 400 })
      }
      if (!moduleIds.includes(String(input.module))) {
        return NextResponse.json(
          { error: 'Unauthorized: cannot create assessments for a module not in your courses' },
          { status: 403 },
        )
      }
    }

    const assessment = await payload.create({
      collection: 'assessments',
      data: normalizeAssessmentData(input) as any,
      overrideAccess: true,
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error: any) {
    console.error('[Assessments] Error creating instructor assessment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/assessments/instructor
// Updates an assessment only if it belongs to the instructor's courses, and
// never lets an instructor move an assessment to a module/course outside their
// courses. Body: { userId, id, data }.
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

    const assessment = await payload.findByID({
      collection: 'assessments',
      id: String(id),
      depth: 1,
      overrideAccess: true,
    })
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const { courseIds, moduleIds } = await getInstructorCourseAndModuleIds(payload, instructorId)
    const existingModuleId = assessmentRefId(assessment, 'module')
    const existingCourseId = assessmentRefId(assessment, 'course')
    const owned =
      (existingModuleId && moduleIds.includes(existingModuleId)) ||
      (existingCourseId && courseIds.includes(existingCourseId))
    if (!owned) {
      return NextResponse.json(
        { error: 'Unauthorized: assessment does not belong to your courses' },
        { status: 403 },
      )
    }

    const data = normalizeAssessmentData(body.data || {})
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }
    if (data.module != null && !moduleIds.includes(String(data.module))) {
      return NextResponse.json(
        { error: 'Unauthorized: cannot move assessment to another instructor course' },
        { status: 403 },
      )
    }
    if (data.course != null && !courseIds.includes(String(data.course))) {
      return NextResponse.json(
        { error: 'Unauthorized: cannot move assessment to another instructor course' },
        { status: 403 },
      )
    }

    const updated = await payload.update({
      collection: 'assessments',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('[Assessments] Error updating instructor assessment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/assessments/instructor?userId=&id=
// Deletes an assessment only if it belongs to the instructor's courses.
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

    const assessment = await payload.findByID({
      collection: 'assessments',
      id: String(id),
      depth: 1,
      overrideAccess: true,
    })
    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const { courseIds, moduleIds } = await getInstructorCourseAndModuleIds(payload, instructorId)
    const moduleId = assessmentRefId(assessment, 'module')
    const courseId = assessmentRefId(assessment, 'course')
    const owned =
      (moduleId && moduleIds.includes(moduleId)) || (courseId && courseIds.includes(courseId))
    if (!owned) {
      return NextResponse.json(
        { error: 'Unauthorized: assessment does not belong to your courses' },
        { status: 403 },
      )
    }

    await payload.delete({ collection: 'assessments', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Assessments] Error deleting instructor assessment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}
