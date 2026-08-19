import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Shared normalization previously duplicated in the frontend actions. Keeps the
// response shape identical for both the admin and instructor scopes.
function normalizeSubmission(doc: any) {
  const a = doc?.assignment
  const t = doc?.trainee
  const e = doc?.enrollment
  const ec = e?.course
  const gb = doc?.gradedBy
  return {
    id: Number(doc.id),
    assignment: a
      ? { id: Number(a.id), title: a?.title, maxScore: a?.maxScore, passingScore: a?.passingScore }
      : Number(doc.assignment),
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
      : Number(doc.trainee),
    enrollment: e
      ? { id: Number(e.id), course: ec ? { id: Number(ec.id), title: ec?.title } : Number(e.course) }
      : Number(doc.enrollment),
    status: doc.status || 'draft',
    submittedText: doc.submittedText,
    uploadedFiles: Array.isArray(doc.uploadedFiles)
      ? doc.uploadedFiles.map((f: any) =>
          f && typeof f === 'object'
            ? {
                id: Number(f.id),
                filename: f?.filename,
                url: f?.url,
                mimeType: f?.mimeType,
                filesize: f?.filesize,
              }
            : Number(f),
        )
      : [],
    score: doc.score ?? undefined,
    feedback: doc.feedback,
    submittedAt: doc.submittedAt ?? undefined,
    gradedAt: doc.gradedAt ?? undefined,
    gradedBy: gb
      ? { id: Number(gb.id), firstName: gb?.firstName, lastName: gb?.lastName }
      : doc.gradedBy
        ? Number(doc.gradedBy)
        : undefined,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}

// GET /api/lms/assignment-submissions/admin
//   ?search=&status=&page=&limit=&sort=       -> paginated list
//   ?id=<id>                                  -> single submission
// DELETE /api/lms/assignment-submissions/admin?id=<id>
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
        collection: 'assignment-submissions',
        id: submissionId,
        depth: 2,
        overrideAccess: true,
      })
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }
      return NextResponse.json({ submission: normalizeSubmission(submission) })
    }

    const search = (searchParams.get('search') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-createdAt'

    const where: Where = {} as any
    if (search) {
      ;(where as any).or = [
        { 'trainee.user.firstName': { like: search } },
        { 'trainee.user.lastName': { like: search } },
        { 'assignment.title': { like: search } },
      ]
    }
    if (status && status !== 'all') {
      ;(where as any).and = [{ status: { equals: status } }]
    }

    const submissions = await payload.find({
      collection: 'assignment-submissions',
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
    console.error('[AssignmentSubmissions] Error fetching admin submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/lms/assignment-submissions/admin?id=<id>
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
      collection: 'assignment-submissions',
      id: String(id),
      depth: 0,
      overrideAccess: true,
    })
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    await payload.delete({
      collection: 'assignment-submissions',
      id: String(id),
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[AssignmentSubmissions] Error deleting submission:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}