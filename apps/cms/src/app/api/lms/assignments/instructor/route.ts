import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Payload, type Where } from 'payload'
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

function assignmentInstructorId(assignment: any): string {
  const ref = assignment?.instructor
  if (!ref) return ''
  if (typeof ref === 'object') return String(ref.id)
  return String(ref)
}

// GET /api/lms/assignments/instructor?userId=&search=&submissionType=&page=&limit=&sort=&id=
// Lists assignments owned by the instructor. With ?id= returns one owned
// assignment. The endpoint owns the instructor context resolution and the
// ownership-scoped query.
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
      if (assignmentInstructorId(assignment) !== instructorId) {
        return NextResponse.json(
          { error: 'Unauthorized: assignment does not belong to you' },
          { status: 403 },
        )
      }
      return NextResponse.json({ assignment })
    }

    const search = (searchParams.get('search') || '').trim()
    const submissionType = (searchParams.get('submissionType') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = { and: [] } as any
    ;(where as any).and.push({ instructor: { equals: instructorId } })
    if (search) {
      ;(where as any).and.push({ title: { like: search } })
    }
    if (submissionType) {
      ;(where as any).and.push({ submissionType: { equals: submissionType } })
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
    console.error('[Assignments] Error fetching instructor assignments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/assignments/instructor
// Creates an assignment owned by the instructor. Body: { userId, data }.
// The instructor is always resolved server-side and assigned as owner.
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
    if (!input.title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const data = normalizeAssignmentData(input)
    // Instructors always own what they create; never allow reassignment.
    data.instructor = instructorId

    const assignment = await payload.create({
      collection: 'assignments',
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error: any) {
    console.error('[Assignments] Error creating instructor assignment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/assignments/instructor
// Updates an assignment only if it belongs to the instructor, and never lets an
// instructor reassign ownership. Body: { userId, id, data }.
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

    const assignment = await payload.findByID({
      collection: 'assignments',
      id: String(id),
      depth: 1,
      overrideAccess: true,
    })
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }
    if (assignmentInstructorId(assignment) !== instructorId) {
      return NextResponse.json(
        { error: 'Unauthorized: assignment does not belong to you' },
        { status: 403 },
      )
    }

    const data = normalizeAssignmentData(body.data || {})
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }
    // Instructors cannot reassign ownership of an assignment.
    delete data.instructor

    const updated = await payload.update({
      collection: 'assignments',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('[Assignments] Error updating instructor assignment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/assignments/instructor?userId=&id=
// Deletes an assignment only if it belongs to the instructor.
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

    const assignment = await payload.findByID({
      collection: 'assignments',
      id: String(id),
      depth: 1,
      overrideAccess: true,
    })
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }
    if (assignmentInstructorId(assignment) !== instructorId) {
      return NextResponse.json(
        { error: 'Unauthorized: assignment does not belong to you' },
        { status: 403 },
      )
    }

    await payload.delete({ collection: 'assignments', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Assignments] Error deleting instructor assignment:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}