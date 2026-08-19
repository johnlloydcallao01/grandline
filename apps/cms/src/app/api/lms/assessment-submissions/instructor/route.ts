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

function normalizeCourseOption(course: any) {
  return {
    id: Number(course.id),
    title: course.title || course.courseCode || `Course #${course.id}`,
    code: course.courseCode || '',
  }
}

// GET /api/lms/assessment-submissions/instructor?userId=
//   &search=&status=&courseId=&page=&limit=   -> paginated list scoped to owned courses
//   &id=<id>                                  -> single owned submission
//   &answersFor=<submissionId>                -> answers for an owned submission
//   &courseOptions=1                          -> courses owned by the instructor
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

    if (searchParams.get('courseOptions') === '1') {
      const courses = await payload.find({
        collection: 'courses',
        where: { id: { in: courseIds } },
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
        collection: 'assessment-submissions',
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

    const answersFor = (searchParams.get('answersFor') || '').trim()
    if (answersFor) {
      const submission = await payload.findByID({
        collection: 'assessment-submissions',
        id: answersFor,
        depth: 0,
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
    const courseId = (searchParams.get('courseId') || '').trim()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || '-createdAt'

    if (courseId && !courseIds.includes(courseId)) {
      return NextResponse.json(
        { error: 'Unauthorized: course does not belong to your account' },
        { status: 403 },
      )
    }

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
          { 'assessment.title': { like: search } },
          { 'course.title': { like: search } },
        ],
      })
    }
    if (status && status !== 'all') {
      ;(where as any).and.push({ status: { equals: status } })
    }
    if (courseId) {
      ;(where as any).and.push({ course: { equals: courseId } })
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
    console.error('[AssessmentSubmissions] Error fetching instructor submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}