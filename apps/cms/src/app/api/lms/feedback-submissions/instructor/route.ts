import { NextRequest, NextResponse } from 'next/server'
import { getPayload, type Payload, type Where } from 'payload'
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
// co-instructor. Submissions are scoped to these courses.
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

function submissionCourseId(submission: any): string {
  const course = submission?.course
  if (!course) return ''
  if (typeof course === 'object') return String(course.id)
  return String(course)
}

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

// GET /api/lms/feedback-submissions/instructor?userId=
//   &search=&formId=&page=&limit=            -> paginated list scoped to owned courses
//   &id=<id>                                 -> single owned submission
//   &formOptions=1                           -> all feedback forms for the filter dropdown
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
      if (!courseIds.includes(submissionCourseId(submission))) {
        return NextResponse.json(
          { error: 'Unauthorized: submission does not belong to your courses' },
          { status: 403 },
        )
      }
      return NextResponse.json({ submission: normalizeSubmission(submission) })
    }

    const search = (searchParams.get('search') || '').trim()
    const formId = (searchParams.get('formId') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-createdAt'

    if (courseIds.length === 0) {
      return NextResponse.json({ docs: [], totalDocs: 0, page: 1, limit, totalPages: 0 })
    }

    const where: Where = { and: [] } as any
    ;(where as any).and.push({ course: { in: courseIds } })
    if (search) {
      ;(where as any).and.push({
        or: [
          { 'trainee.user.firstName': { like: search } },
          { 'trainee.user.lastName': { like: search } },
          { 'form.title': { like: search } },
          { 'course.title': { like: search } },
        ],
      })
    }
    if (formId) {
      ;(where as any).and.push({ form: { equals: formId } })
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
    console.error('[FeedbackSubmissions] Error fetching instructor submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}