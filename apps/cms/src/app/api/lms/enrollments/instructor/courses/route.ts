import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../../_utils/service-api-key'

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

// GET /api/lms/enrollments/instructor/courses?userId=&search=&limit=
// Searches courses scoped to the instructor's own courses.
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const userId = (searchParams.get('userId') || '').trim()
    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 },
      )
    }

    const instructorId = await resolveInstructorId(payload, userId)
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor profile not found' },
        { status: 404 },
      )
    }

    const search = (searchParams.get('search') || '').trim()
    const limit = parseInt(searchParams.get('limit') || '20')

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

    const courses = await payload.find({
      collection: 'courses',
      where,
      limit,
      depth: 0,
      sort: 'title',
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (courses.docs || []).map((c: any) => ({
        id: String(c.id),
        title: c.title || `Course #${c.id}`,
        courseCode: c.courseCode || '',
        status: c.status || '',
      })),
    })
  } catch (error) {
    console.error('Error searching instructor courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}