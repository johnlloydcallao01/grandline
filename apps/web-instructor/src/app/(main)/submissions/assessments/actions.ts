'use server'

import { cookies } from 'next/headers'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function adminHeaders(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function getInstructorId(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')

  const meRes = await fetch(`${CMS_API}/users/me`, {
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!meRes.ok) throw new Error('Failed to get current user')
  const meData = await meRes.json()
  const userId = meData?.user?.id || meData?.id
  if (!userId) throw new Error('Could not determine user ID')

  const instructorRes = await fetch(
    `${CMS_API}/instructors?where[user][equals]=${encodeURIComponent(userId)}&depth=0&limit=1`,
    { headers: adminHeaders(), cache: 'no-store' },
  )
  if (!instructorRes.ok) throw new Error('Failed to get instructor profile')
  const instructorData = await instructorRes.json()
  const instructorId = instructorData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return String(instructorId)
}

async function getInstructorCourseIds(instructorId: string): Promise<string[]> {
  const params = new URLSearchParams({ depth: '0', limit: '500' })
  params.set('where[or][0][instructor][equals]', instructorId)
  params.set('where[or][1][coInstructors][contains]', instructorId)

  const res = await fetch(`${CMS_API}/courses?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch instructor courses')
  const data = await res.json()
  return (data.docs || []).map((course: any) => String(course.id))
}

async function getScopedSubmission(id: number, courseIds: string[]): Promise<any> {
  const params = new URLSearchParams({ depth: '2', limit: '1' })
  params.set('where[id][equals]', String(id))
  params.set('where[course][in]', courseIds.join(','))

  const res = await fetch(`${CMS_API}/assessment-submissions?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to verify submission access')
  const data = await res.json()
  const submission = data.docs?.[0]
  if (!submission) throw new Error('Unauthorized: submission is outside your courses')
  return submission
}

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (data?.errors?.[0]?.message) return data.errors[0].message
    if (data?.error) return data.error
    if (data?.message) return data.message
  } catch {
    // Fall back to the HTTP status when the response is not JSON.
  }
  return fallback
}

export interface TraineeRef {
  id: number
  srn?: string
  user?: { id: number; firstName?: string; lastName?: string; email?: string }
}

export interface AssessmentRef {
  id: number
  title?: string
  assessmentType?: string
}

export interface CourseRef {
  id: number
  title?: string
}

export interface AssessmentSubmissionDoc {
  id: number
  trainee?: TraineeRef | number
  enrollment?: any
  assessment?: AssessmentRef | number
  course?: CourseRef | number
  status: 'in_progress' | 'submitted' | 'graded'
  attemptNumber: number
  score?: number
  pointsTotal?: number
  pointsPossible?: number
  passingScoreSnapshot?: number
  startedAt: string
  completedAt?: string
  isLatest?: boolean
  createdAt: string
  updatedAt: string
}

export interface SubmissionListResult {
  docs: AssessmentSubmissionDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

function normalizeSubmission(doc: any): AssessmentSubmissionDoc {
  return {
    id: Number(doc.id),
    trainee: doc.trainee,
    enrollment: doc.enrollment,
    assessment: doc.assessment,
    course: doc.course,
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

export async function getAssessmentSubmissions(params: {
  search?: string
  status?: string
  courseId?: string
  page?: number
  limit?: number
}): Promise<SubmissionListResult> {
  const instructorId = await getInstructorId()
  const courseIds = await getInstructorCourseIds(instructorId)
  const limit = params.limit || 20

  if (courseIds.length === 0) {
    return { docs: [], totalDocs: 0, page: 1, limit, totalPages: 0 }
  }

  const queryParts = [
    'depth=2',
    `where[course][in]=${encodeURIComponent(courseIds.join(','))}`,
  ]

  const search = (params.search || '').trim()
  if (search) {
    queryParts.push(`where[or][0][trainee.user.firstName][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][1][trainee.user.lastName][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][2][assessment.title][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][3][course.title][like]=${encodeURIComponent(search)}`)
  }
  if (params.status && params.status !== 'all') {
    queryParts.push(`where[status][equals]=${encodeURIComponent(params.status)}`)
  }
  if (params.courseId && courseIds.includes(String(params.courseId))) {
    queryParts.push(`where[course][equals]=${encodeURIComponent(params.courseId)}`)
  }
  if (params.page) queryParts.push(`page=${params.page}`)
  queryParts.push(`limit=${limit}`)
  queryParts.push('sort=-createdAt')

  const res = await fetch(`${CMS_API}/assessment-submissions?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await extractError(res, 'Failed to fetch assessment submissions'))
  const data = await res.json()

  return {
    docs: (data.docs || []).map(normalizeSubmission),
    totalDocs: data.totalDocs || 0,
    page: data.page || 1,
    limit: data.limit || limit,
    totalPages: data.totalPages || 0,
  }
}

export interface AnswerDoc {
  id: number
  submission: number
  question: { id: number; prompt?: string; type?: string } | number
  questionType: string
  response: any
  isCorrect: boolean
  pointsEarned: number
  feedback?: string | null
}

export async function getSubmissionAnswers(submissionId: number): Promise<AnswerDoc[]> {
  const instructorId = await getInstructorId()
  const courseIds = await getInstructorCourseIds(instructorId)
  if (courseIds.length === 0) return []
  await getScopedSubmission(submissionId, courseIds)

  const params = new URLSearchParams({ depth: '2' })
  params.set('where[submission][equals]', String(submissionId))
  const res = await fetch(`${CMS_API}/submission-answers?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await extractError(res, 'Failed to fetch submission answers'))
  const data = await res.json()
  return data.docs || []
}

export interface CourseOption {
  id: number
  title: string
  code: string
}

export async function getCourseOptions(): Promise<CourseOption[]> {
  const instructorId = await getInstructorId()
  const params = new URLSearchParams({ depth: '0', limit: '500', sort: 'title' })
  params.set('where[or][0][instructor][equals]', instructorId)
  params.set('where[or][1][coInstructors][contains]', instructorId)

  const res = await fetch(`${CMS_API}/courses?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch course options')
  const data = await res.json()
  return (data.docs || []).map((course: any) => ({
    id: Number(course.id),
    title: course.title || course.courseCode || `Course #${course.id}`,
    code: course.courseCode || '',
  }))
}
