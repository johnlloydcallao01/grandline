import { NextRequest, NextResponse } from 'next/server'
import { getPayload, APIError, type Payload, type Where } from 'payload'
import configPromise from '@payload-config'
import { isAuthorizedServiceRequest } from '../../../_utils/service-api-key'

const GRADE_STATUSES = ['graded', 'returned_for_revision']

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
// co-instructor.
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

// Enrollments belonging to the instructor's courses. When courseId is provided
// and belongs to the instructor, only that course's enrollments are returned.
async function resolveInstructorEnrollmentIds(
  payload: Payload,
  instructorId: string,
  courseId?: string,
): Promise<string[]> {
  const courseIds = await resolveInstructorCourseIds(payload, instructorId)
  const selected = courseId && courseIds.includes(courseId) ? [courseId] : courseIds
  if (selected.length === 0) return []

  const enrollments = await payload.find({
    collection: 'course-enrollments',
    where: { course: { in: selected } },
    limit: 2000,
    depth: 0,
    overrideAccess: true,
  })
  return (enrollments.docs || []).map((e) => String(e.id))
}

function submissionEnrollmentId(submission: any): string {
  const e = submission?.enrollment
  if (!e) return ''
  if (typeof e === 'object') return String(e.id)
  return String(e)
}

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

function normalizeCourseOption(course: any) {
  return {
    id: Number(course.id),
    title: course.title || course.courseCode || `Course #${course.id}`,
    code: course.courseCode || '',
  }
}

// Converts plain text into a Payload lexical richText value. Mirrors the
// transformation the frontend action previously performed before grading.
function toLexical(content: string): unknown {
  const children = content
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((text) => ({
      type: 'paragraph',
      version: 1,
      children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
      direction: 'ltr',
      format: '',
      indent: 0,
      textStyle: '',
      textFormat: 0,
    }))

  if (children.length === 0) return null
  return { root: { type: 'root', format: '', indent: 0, version: 1, children, direction: 'ltr' } }
}

// GET /api/lms/assignment-submissions/instructor?userId=
//   &search=&status=&courseId=&page=&limit=    -> paginated list scoped to owned courses
//   &id=<id>                                   -> single owned submission
//   &courseOptions=1                           -> courses owned by the instructor
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

    if (searchParams.get('courseOptions') === '1') {
      const courses = await payload.find({
        collection: 'courses',
        where: { id: { in: await resolveInstructorCourseIds(payload, instructorId) } },
        sort: 'title',
        limit: 500,
        depth: 0,
        overrideAccess: true,
      })
      return NextResponse.json({ docs: (courses.docs || []).map(normalizeCourseOption) })
    }

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
      const enrollmentIds = await resolveInstructorEnrollmentIds(payload, instructorId)
      if (!enrollmentIds.includes(submissionEnrollmentId(submission))) {
        return NextResponse.json(
          { error: 'Unauthorized: submission does not belong to your courses' },
          { status: 403 },
        )
      }
      return NextResponse.json({ submission: normalizeSubmission(submission) })
    }

    const search = (searchParams.get('search') || '').trim()
    const status = (searchParams.get('status') || '').trim()
    const courseId = (searchParams.get('courseId') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-createdAt'

    const courseIds = await resolveInstructorCourseIds(payload, instructorId)
    if (courseId && !courseIds.includes(courseId)) {
      return NextResponse.json(
        { error: 'Unauthorized: course does not belong to your account' },
        { status: 403 },
      )
    }

    const enrollmentIds = await resolveInstructorEnrollmentIds(payload, instructorId, courseId || undefined)
    if (enrollmentIds.length === 0) {
      return NextResponse.json({ docs: [], totalDocs: 0, page: 1, limit, totalPages: 0 })
    }

    const where: Where = { and: [] } as any
    ;(where as any).and.push({ enrollment: { in: enrollmentIds } })
    if (search) {
      ;(where as any).and.push({
        or: [
          { 'trainee.user.firstName': { like: search } },
          { 'trainee.user.lastName': { like: search } },
          { 'assignment.title': { like: search } },
          { 'enrollment.course.title': { like: search } },
        ],
      })
    }
    if (status && status !== 'all') {
      ;(where as any).and.push({ status: { equals: status } })
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
    console.error('[AssignmentSubmissions] Error fetching instructor submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/lms/assignment-submissions/instructor
// Grades (or returns for revision) a submission owned by the instructor.
// Body: { userId, id, status, score?, feedback? }.
export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthorizedServiceRequest(request, process.env.PAYLOAD_API_KEY)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const userId = body?.userId
    const id = body?.id
    const status = body?.status

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    if (!GRADE_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid grading status' }, { status: 400 })
    }

    const instructorId = await resolveInstructorId(payload, String(userId))
    if (!instructorId) {
      return NextResponse.json({ error: 'Instructor profile not found' }, { status: 404 })
    }

    const enrollmentIds = await resolveInstructorEnrollmentIds(payload, instructorId)
    if (enrollmentIds.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized: no instructor course enrollments found' },
        { status: 403 },
      )
    }

    const submission = await payload.findByID({
      collection: 'assignment-submissions',
      id: String(id),
      depth: 2,
      overrideAccess: true,
    })
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }
    if (!enrollmentIds.includes(submissionEnrollmentId(submission))) {
      return NextResponse.json(
        { error: 'Unauthorized: submission does not belong to your courses' },
        { status: 403 },
      )
    }
    if (submission.status === 'draft') {
      return NextResponse.json({ error: 'Draft submissions cannot be graded' }, { status: 400 })
    }
    if (submission.status === 'returned_for_revision') {
      return NextResponse.json(
        { error: "Returned submissions are historical records; grade the trainee's new submission instead" },
        { status: 400 },
      )
    }

    const data: Record<string, unknown> = { status }

    if (status === 'graded') {
      const score = body?.score
      if (score === undefined || !Number.isFinite(Number(score))) {
        return NextResponse.json({ error: 'A valid score is required' }, { status: 400 })
      }
      const assignment = submission.assignment && typeof submission.assignment === 'object'
        ? submission.assignment
        : null
      const maxScore = Number(assignment?.maxScore ?? 100)
      if (Number(score) < 0 || Number(score) > maxScore) {
        return NextResponse.json(
          { error: `Score must be between 0 and ${maxScore}` },
          { status: 400 },
        )
      }
      data.gradedBy = Number(userId)
      data.gradedAt = new Date().toISOString()
      data.score = Number(score)
    } else {
      data.score = null
      data.gradedBy = null
      data.gradedAt = null
    }

    if (body?.feedback !== undefined) {
      data.feedback = toLexical(String(body.feedback))
    }

    const updated = await payload.update({
      collection: 'assignment-submissions',
      id: String(id),
      data,
      overrideAccess: true,
    })

    return NextResponse.json({ submission: normalizeSubmission(updated) })
  } catch (error: any) {
    console.error('[AssignmentSubmissions] Error grading submission:', error)
    const status = error instanceof APIError ? error.status : 500
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status })
  }
}