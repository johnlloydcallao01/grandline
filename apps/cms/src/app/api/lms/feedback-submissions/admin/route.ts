import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Shared normalization previously duplicated in the frontend actions. Keeps the
// response shape identical for both the admin and instructor scopes.
function normalizeSubmission(doc: any) {
  const f = doc?.form
  const c = doc?.course
  const t = doc?.trainee
  return {
    id: Number(doc.id),
    form: f
      ? {
          id: Number(f.id),
          title: f?.title,
          description: f?.description,
          fields: f?.fields,
        }
      : doc.form != null
        ? Number(doc.form)
        : undefined,
    course: c
      ? { id: Number(c.id), title: c?.title }
      : doc.course != null
        ? Number(doc.course)
        : undefined,
    trainee: t
      ? {
          id: Number(t.id),
          srn: t?.srn,
          user: t?.user
            ? {
                id: Number(t.user.id),
                firstName: t?.user?.firstName,
                lastName: t?.user?.lastName,
                email: t?.user?.email,
              }
            : undefined,
        }
      : doc.trainee != null
        ? Number(doc.trainee)
        : undefined,
    responses: doc.responses || {},
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}

function normalizeFormOption(form: any) {
  return {
    id: Number(form.id),
    title: form.title || `Form #${form.id}`,
  }
}

// GET /api/lms/feedback-submissions/admin
//   ?search=&formId=&page=&limit=&sort=       -> paginated list
//   ?id=<id>                                  -> single submission
//   ?formOptions=1                            -> all feedback forms for the filter dropdown
// DELETE /api/lms/feedback-submissions/admin?id=<id>
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)

    const submissionId = (searchParams.get('id') || '').trim()
    if (submissionId) {
      const submission = await payload.findByID({
        collection: 'feedback-submissions',
        id: submissionId,
        depth: 2,
        overrideAccess: true,
      })
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }
      return NextResponse.json({ submission: normalizeSubmission(submission) })
    }

    if (searchParams.get('formOptions') === '1') {
      const forms = await payload.find({
        collection: 'feedback-forms',
        limit: 200,
        sort: 'title',
        depth: 0,
        overrideAccess: true,
      })
      return NextResponse.json({ docs: (forms.docs || []).map(normalizeFormOption) })
    }

    const search = (searchParams.get('search') || '').trim()
    const formId = (searchParams.get('formId') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-createdAt'

    const where: Where = {} as any
    if (search) {
      ;(where as any).or = [
        { 'trainee.user.firstName': { like: search } },
        { 'trainee.user.lastName': { like: search } },
        { 'form.title': { like: search } },
        { 'course.title': { like: search } },
      ]
    }
    if (formId) {
      ;(where as any).and = [{ form: { equals: formId } }]
    }

    const submissions = await payload.find({
      collection: 'feedback-submissions',
      where,
      sort,
      page,
      limit,
      depth: 2,
      overrideAccess: true,
    })

    return NextResponse.json({
      docs: (submissions.docs || []).map(normalizeSubmission),
      totalDocs: submissions.totalDocs,
      page: submissions.page,
      limit: submissions.limit,
      totalPages: submissions.totalPages,
    })
  } catch (error) {
    console.error('[FeedbackSubmissions] Error fetching admin submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/lms/feedback-submissions/admin?id=<id>
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

    const submission = await payload.findByID({
      collection: 'feedback-submissions',
      id: String(id),
      depth: 0,
      overrideAccess: true,
    })
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    await payload.delete({
      collection: 'feedback-submissions',
      id: String(id),
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[FeedbackSubmissions] Error deleting submission:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}