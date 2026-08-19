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

// GET /api/lms/assessments/admin?search=&assessmentType=&moduleId=&page=&limit=&sort=&assessmentId=
// Lists all assessments with module and course options. With ?assessmentId=
// returns the edit data for one assessment.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const moduleOptions = await findModuleOptions(payload)
    const courseOptions = await findCourseOptions(payload)

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
      return NextResponse.json({ assessment, moduleOptions, courseOptions })
    }

    const search = (searchParams.get('search') || '').trim()
    const assessmentType = (searchParams.get('assessmentType') || '').trim()
    const moduleId = (searchParams.get('moduleId') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = {} as any
    if (search) {
      ;(where as any).or = [{ title: { like: search } }]
    }
    if (assessmentType) {
      where.assessmentType = { equals: assessmentType }
    }
    if (moduleId) {
      where.module = { equals: moduleId }
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
    console.error('[Assessments] Error fetching assessments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/assessments/admin
// Creates an assessment. Body is the assessment data.
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    if (!body.title || !body.assessmentType) {
      return NextResponse.json({ error: 'title and assessmentType are required' }, { status: 400 })
    }

    const assessment = await payload.create({
      collection: 'assessments',
      data: normalizeAssessmentData(body) as any,
      overrideAccess: true,
    })

    return NextResponse.json(assessment, { status: 201 })
  } catch (error: any) {
    console.error('[Assessments] Error creating assessment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/assessments/admin
// Updates an assessment. Body: { id, data }.
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

    const data = normalizeAssessmentData(body.data || {})
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }

    const assessment = await payload.update({
      collection: 'assessments',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(assessment)
  } catch (error: any) {
    console.error('[Assessments] Error updating assessment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/assessments/admin?id=
// Deletes an assessment.
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

    await payload.delete({ collection: 'assessments', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Assessments] Error deleting assessment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}
