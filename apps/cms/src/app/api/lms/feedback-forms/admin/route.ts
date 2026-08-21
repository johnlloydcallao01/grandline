import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

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

// Strip Payload block ids before write. Mirrors what the form editor does on the
// client before submitting, keeping the endpoint robust on its own.
function sanitizeFields(fields: any): any[] {
  if (!Array.isArray(fields)) return []
  return fields
    .filter((f) => f && typeof f === 'object')
    .map((f: any) => {
      const { id, ...rest } = f
      void id
      return rest
    })
}

// GET /api/lms/feedback-forms/admin
//   ?search=&page=&limit=&sort=    -> paginated list with stats
//   ?id=<id>                       -> single form
// POST   /api/lms/feedback-forms/admin        -> create form
// PATCH  /api/lms/feedback-forms/admin?id=<id> -> update form
// DELETE /api/lms/feedback-forms/admin?id=<id> -> delete form
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

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

    const search = (searchParams.get('search') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || '-createdAt'

    const where: Where = {} as any
    if (search) {
      ;(where as any).title = { like: search }
    }

    const all = await payload.find({
      collection: 'feedback-forms',
      where,
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })
    const allForms = all.docs || []
    const totalFields = allForms.reduce(
      (acc, f: any) => acc + (Array.isArray(f.fields) ? f.fields.length : 0),
      0,
    )
    const stats = {
      totalForms: allForms.length,
      totalFields,
      avgFieldsPerForm: allForms.length > 0 ? Math.round((totalFields / allForms.length) * 10) / 10 : 0,
    }

    const result = await payload.find({
      collection: 'feedback-forms',
      where,
      sort,
      page,
      limit,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (result.docs || []).map((f: any) => normalizeForm(f)),
      totalDocs: allForms.length,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      stats,
    })
  } catch (error) {
    console.error('[FeedbackForms] Error fetching admin forms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/lms/feedback-forms/admin
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json().catch(() => null)

    if (!body || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const data: any = { title: body.title.trim(), fields: sanitizeFields(body.fields) }
    if (typeof body.description === 'string' && body.description.trim()) {
      data.description = body.description.trim()
    }

    const created = await payload.create({
      collection: 'feedback-forms',
      data,
      overrideAccess: true,
    })

    return NextResponse.json({ form: normalizeForm(created) }, { status: 201 })
  } catch (error: any) {
    console.error('[FeedbackForms] Error creating form:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// PATCH /api/lms/feedback-forms/admin?id=<id>
export async function PATCH(request: NextRequest) {
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

    const existing = await payload.findByID({
      collection: 'feedback-forms',
      id: String(id),
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    const data: any = {}
    if (body?.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 })
      }
      data.title = body.title.trim()
    }
    if (body?.description !== undefined) {
      data.description = typeof body.description === 'string' ? body.description.trim() : null
    }
    if (body?.fields !== undefined) {
      data.fields = sanitizeFields(body.fields)
    }

    const updated = await payload.update({
      collection: 'feedback-forms',
      id: String(id),
      data,
      overrideAccess: true,
    })

    return NextResponse.json({ form: normalizeForm(updated) })
  } catch (error: any) {
    console.error('[FeedbackForms] Error updating form:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}

// DELETE /api/lms/feedback-forms/admin?id=<id>
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

    const existing = await payload.findByID({
      collection: 'feedback-forms',
      id: String(id),
      depth: 0,
      overrideAccess: true,
    })
    if (!existing) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    await payload.delete({
      collection: 'feedback-forms',
      id: String(id),
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[FeedbackForms] Error deleting form:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}