import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

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

// Courses owned by the instructor, either as the primary instructor or as a
// co-instructor. Forms attached to these courses are the ones returned.
async function resolveInstructorCourseIds(payload: Payload, instructorId: string): Promise<string[]> {
  const courses = await payload.find({
    collection: 'courses',
    where: {
      or: [
        { instructor: { equals: instructorId } },
        { coInstructors: { contains: instructorId } },
      ],
    },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })
  return (courses.docs || []).map((c) => String(c.id))
}

// Shared normalization previously duplicated in the frontend actions. Keeps the
// response shape identical for both the admin and instructor scopes.
function normalizeForm(doc: any, courses: Array<{ id: number; title: string }> = []) {
  return {
    id: Number(doc.id),
    title: doc.title || `Form #${doc.id}`,
    description: doc.description ?? null,
    fields: Array.isArray(doc.fields) ? doc.fields : [],
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
    courses,
  }
}

// GET /api/lms/feedback-forms/instructor?userId=
//   &search=&page=&limit=          -> paginated list scoped to owned courses with stats
//   &id=<id>                       -> single owned form
// The endpoint owns the instructor context resolution and ownership scoping.
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

    const courseIds = await resolveInstructorCourseIds(payload, instructorId)

    if (courseIds.length === 0) {
      const limit = parseInt(searchParams.get('limit') || '20')
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
        totalPages: 0,
        page: 1,
        limit,
        stats: { totalForms: 0, totalFields: 0, avgFieldsPerForm: 0 },
      })
    }

    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const formId = (searchParams.get('id') || '').trim()
    if (formId) {
      const form = await payload.findByID({
        collection: 'feedback-forms',
        id: formId,
        depth: 2,
        overrideAccess: true,
      })
      if (!form) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 })
      }
      return NextResponse.json({ form: normalizeForm(form) })
    }

    const courses = await payload.find({
      collection: 'courses',
      where: {
        or: [
          { instructor: { equals: instructorId } },
          { coInstructors: { contains: instructorId } },
        ],
      },
      limit: 500,
      depth: 2,
      overrideAccess: true,
    })

    const formMap = new Map<number, any>()
    for (const course of courses.docs || []) {
      const form = (course as any).feedbackForm
      if (!form || typeof form !== 'object') continue
      const id = Number(form.id)
      let entry = formMap.get(id)
      if (!entry) {
        entry = normalizeForm(form)
        formMap.set(id, entry)
      }
      entry.courses.push({ id: Number(course.id), title: (course as any).title || `Course #${course.id}` })
    }

    let allForms = Array.from(formMap.values())

    if (search) {
      allForms = allForms.filter(
        (f) =>
          (f.title || '').toLowerCase().includes(search) ||
          (f.description || '').toLowerCase().includes(search),
      )
    }

    const totalFields = allForms.reduce((acc, f) => acc + (f.fields?.length || 0), 0)
    const stats = {
      totalForms: allForms.length,
      totalFields,
      avgFieldsPerForm: allForms.length > 0 ? Math.round((totalFields / allForms.length) * 10) / 10 : 0,
    }

    allForms.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))

    const totalDocs = allForms.length
    const totalPages = Math.max(1, Math.ceil(totalDocs / limit))
    const start = (page - 1) * limit
    const docs = allForms.slice(start, start + limit)

    return NextResponse.json({ docs, totalDocs, totalPages, page, limit, stats })
  } catch (error) {
    console.error('[FeedbackForms] Error fetching instructor forms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}