import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

// Shared normalization previously duplicated in the frontend actions. Keeps the
// response shape identical for both the admin and instructor scopes.
function normalizeSubmission(doc: any) {
  const t = doc?.trainee
  const a = doc?.assessment
  const c = doc?.course
  return {
    id: Number(doc.id),
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
    enrollment: doc.enrollment,
    assessment: a
      ? { id: Number(a.id), title: a?.title, assessmentType: a?.assessmentType }
      : Number(doc.assessment),
    course: c ? { id: Number(c.id), title: c?.title } : Number(doc.course),
    status: doc.status || 'in_progress',
    attemptNumber: Number(doc.attemptNumber || 1),
    score: doc.score ?? undefined,
    pointsTotal: doc.pointsTotal ?? undefined,
    pointsPossible: doc.pointsPossible ?? undefined,
    passingScoreSnapshot: doc.passingScoreSnapshot ?? undefined,
    startedAt: doc.startedAt || doc.createdAt || '',
    completedAt: doc.completedAt ?? undefined,
    isLatest: doc.isLatest ?? undefined,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}

function normalizeAnswer(doc: any) {
  return {
    id: Number(doc.id),
    submission:
      doc.submission && typeof doc.submission === 'object'
        ? Number(doc.submission.id)
        : Number(doc.submission),
    question:
      doc.question && typeof doc.question === 'object'
        ? {
            id: Number(doc.question.id),
            prompt: doc.question?.prompt,
            type: doc.question?.type,
          }
        : Number(doc.question),
    questionType: doc.questionType || '',
    response: doc.response,
    isCorrect: Boolean(doc.isCorrect),
    pointsEarned: Number(doc.pointsEarned || 0),
    feedback: doc.feedback ?? null,
  }
}

// GET /api/lms/assessment-submissions/admin
//   ?search=&status=&page=&limit=&sort=      -> paginated list
//   ?id=<id>                                 -> single submission
//   ?answersFor=<submissionId>               -> answers for one submission
// DELETE /api/lms/assessment-submissions/admin?id=<id>
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
        collection: 'assessment-submissions',
        id: submissionId,
        depth: 2,
        overrideAccess: true,
      })
      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }
      return NextResponse.json({ submission: normalizeSubmission(submission) })
    }

    const answersFor = (searchParams.get('answersFor') || '').trim()
    if (answersFor) {
      const answers = await payload.find({
        collection: 'submission-answers',
        where: { submission: { equals: answersFor } },
        sort: 'id',
        limit: 500,
        depth: 2,
        overrideAccess: true,
      })
      return NextResponse.json({ answers: (answers.docs || []).map(normalizeAnswer) })
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
        { 'assessment.title': { like: search } },
        { 'course.title': { like: search } },
      ]
    }
    if (status && status !== 'all') {
      ;(where as any).and = [{ status: { equals: status } }]
    }

    const submissions = await payload.find({
      collection: 'assessment-submissions',
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
    console.error('[AssessmentSubmissions] Error fetching admin submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/lms/assessment-submissions/admin?id=<id>
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
      collection: 'assessment-submissions',
      id: String(id),
      depth: 0,
      overrideAccess: true,
    })
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    await payload.delete({
      collection: 'assessment-submissions',
      id: String(id),
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[AssessmentSubmissions] Error deleting submission:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}