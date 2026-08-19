import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Coerce client payload values into Payload field formats.
// The collection's beforeChange hook rebuilds the True/False options from
// trueFalseCorrect, so for true_false questions we drop the raw options array
// and let Payload own the canonical True/False pair.
function normalizeQuestionData(data: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = { ...data }

  if (safe.type === 'true_false') {
    safe.trueFalseCorrect = safe.trueFalseCorrect ?? 'true'
    delete safe.options
  }

  return safe
}

// Resolves the instructor profile for a signed-in user. The question bank is a
// shared, unscoped pool, so the backend only verifies the caller is an
// authenticated instructor before allowing access; it does not derive an
// ownership context.
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

// GET /api/lms/questions/instructor?userId=&search=&type=&difficulty=&status=&page=&limit=&sort=
// Lists the shared question bank, or with ?id= returns one question. The
// endpoint owns the instructor context resolution; the frontend only supplies
// the signed-in userId (see docs/fetching-solution.md).
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

    const id = (searchParams.get('id') || '').trim()
    if (id) {
      const question = await payload.findByID({
        collection: 'questions',
        id,
        depth: 2,
        overrideAccess: true,
      })
      if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 })
      }
      return NextResponse.json({ question })
    }

    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-updatedAt'

    const where: Where = {}

    if (search) {
      where.or = [
        { prompt: { like: search } } as Where,
      ]
    }

    if (type) {
      where.type = { equals: type }
    }

    if (difficulty) {
      where.difficulty = { equals: difficulty }
    }

    if (status) {
      where.status = { equals: status }
    }

    const questions = await payload.find({
      collection: 'questions',
      where,
      sort,
      page,
      limit,
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: questions.docs,
      totalDocs: questions.totalDocs,
      page: questions.page,
      limit: questions.limit,
      totalPages: questions.totalPages,
    })
  } catch (error) {
    console.error('[Questions] Error fetching instructor questions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/questions/instructor
// Creates a question. Body: { userId, data }. The instructor is always resolved
// server-side.
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
    if (!input.prompt) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const question = await payload.create({
      collection: 'questions',
      data: normalizeQuestionData(input) as any,
      overrideAccess: true,
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error: any) {
    console.error('[Questions] Error creating instructor question:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/questions/instructor
// Updates a question. Body: { userId, id, data }. The instructor is always
// resolved server-side.
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

    const data = normalizeQuestionData(body.data || {})
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 })
    }

    const question = await payload.update({
      collection: 'questions',
      id: String(id),
      data: data as any,
      overrideAccess: true,
    })

    return NextResponse.json(question)
  } catch (error: any) {
    console.error('[Questions] Error updating instructor question:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/questions/instructor?userId=&id=
// Deletes a question. The instructor is always resolved server-side.
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

    await payload.delete({ collection: 'questions', id: String(id), overrideAccess: true })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Questions] Error deleting instructor question:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}