import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Coerce client payload values into Payload relationship/richText formats.
// Mirrors the normalization the frontend actions previously duplicated.
function normalizeAssignmentData(data: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = { ...data }

  if (safe.instructor != null && typeof safe.instructor !== 'object') safe.instructor = Number(safe.instructor)

  if (typeof safe.description === 'string') {
    try {
      safe.description = JSON.parse(safe.description as string)
    } catch {
      // keep the plain string
    }
  }

  return safe
}

// GET /api/lms/assignments/admin?search=&submissionType=&page=&limit=&sort=&id=
// Lists all assignments. With ?id= returns one assignment.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const assignmentId = (searchParams.get('id') || '').trim()
    if (assignmentId) {
      const assignment = await payload.findByID({
        collection: 'assignments',
        id: assignmentId,
        depth: 2,
        overrideAccess: true,
      })
      if (!assignment) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
      }
      return NextResponse.json({ assignment })
    }

    const search = (searchParams.get('search') || '').trim()
    const submissionType = (searchParams.get('submissionType') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = {} as any
    if (search) {
      ;(where as any).or = [{ title: { like: search } }]
    }
    if (submissionType) {
      where.submissionType = { equals: submissionType }
    }

    const assignments = await payload.find({
      collection: 'assignments',
      where,
      sort,
      page,
      limit,
      depth: 1,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: assignments.docs,
      totalDocs: assignments.totalDocs,
      page: assignments.page,
      limit: assignments.limit,
      totalPages: assignments.totalPages,
    })
  } catch (error) {
    console.error('[Assignments] Error fetching assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/assignments/admin
// Creates an assignment. Body is the assignment data.
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    if (!body.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const assignment = await payload.create({
      collection: 'assignments',
      data: normalizeAssignmentData(body) as any,
      overrideAccess: true,
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    console.error('[Assignments] Error creating assignment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/assignments/admin
// Updates an assignment. Body: { id, data }.
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

    const data = normalizeAssignmentData(body.data || {})
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }

    const assignment = await payload.update({
      collection: 'assignments',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(assignment)
  } catch (error: any) {
    console.error('[Assignments] Error updating assignment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/assignments/admin?id=
// Deletes an assignment.
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

    await payload.delete({ collection: 'assignments', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Assignments] Error deleting assignment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}