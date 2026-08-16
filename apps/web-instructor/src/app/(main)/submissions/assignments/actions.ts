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

async function getInstructorContext(): Promise<{ instructorId: string; userId: string; token: string }> {
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

  return { instructorId: String(instructorId), userId: String(userId), token }
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

async function getEnrollmentIds(courseIds: string[], courseId?: string): Promise<string[]> {
  const selectedCourseIds = courseId && courseIds.includes(String(courseId)) ? [String(courseId)] : courseIds
  if (selectedCourseIds.length === 0) return []

  const params = new URLSearchParams({ depth: '0', limit: '2000' })
  params.set('where[course][in]', selectedCourseIds.join(','))
  const res = await fetch(`${CMS_API}/course-enrollments?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch course enrollments')
  const data = await res.json()
  return (data.docs || []).map((enrollment: any) => String(enrollment.id))
}

async function getScopedSubmission(id: number, enrollmentIds: string[]): Promise<any> {
  const params = new URLSearchParams({ depth: '2', limit: '1' })
  params.set('where[id][equals]', String(id))
  params.set('where[enrollment][in]', enrollmentIds.join(','))
  const res = await fetch(`${CMS_API}/assignment-submissions?${params.toString()}`, {
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

export interface TraineeRef {
  id: number
  srn?: string
  user?: { id: number; firstName?: string; lastName?: string; email?: string }
}

export interface AssignmentRef {
  id: number
  title?: string
  maxScore?: number
  passingScore?: number
}

export interface CourseRef {
  id: number
  title?: string
}

export interface MediaRef {
  id: number
  filename?: string
  url?: string
  mimeType?: string
  filesize?: number
}

export interface AssignmentSubmissionDoc {
  id: number
  assignment?: AssignmentRef | number
  trainee?: TraineeRef | number
  enrollment?: { id: number; course?: CourseRef | number } | number
  status: 'draft' | 'submitted' | 'graded' | 'returned_for_revision'
  submittedText?: any
  uploadedFiles?: MediaRef[] | number[]
  score?: number
  feedback?: any
  submittedAt?: string
  gradedAt?: string
  gradedBy?: { id: number; firstName?: string; lastName?: string } | number
  createdAt: string
  updatedAt: string
}

export interface SubmissionListResult {
  docs: AssignmentSubmissionDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

function normalizeSubmission(doc: any): AssignmentSubmissionDoc {
  return {
    id: Number(doc.id),
    assignment: doc.assignment,
    trainee: doc.trainee,
    enrollment: doc.enrollment,
    status: doc.status || 'draft',
    submittedText: doc.submittedText,
    uploadedFiles: doc.uploadedFiles || [],
    score: doc.score ?? undefined,
    feedback: doc.feedback,
    submittedAt: doc.submittedAt ?? undefined,
    gradedAt: doc.gradedAt ?? undefined,
    gradedBy: doc.gradedBy ?? undefined,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
  }
}

export async function getAssignmentSubmissions(params: {
  search?: string
  status?: string
  courseId?: string
  page?: number
  limit?: number
}): Promise<SubmissionListResult> {
  const { instructorId } = await getInstructorContext()
  const courseIds = await getInstructorCourseIds(instructorId)
  const enrollmentIds = await getEnrollmentIds(courseIds, params.courseId)
  const limit = params.limit || 20

  if (enrollmentIds.length === 0) {
    return { docs: [], totalDocs: 0, page: 1, limit, totalPages: 0 }
  }

  const queryParts = [
    'depth=2',
    `where[enrollment][in]=${encodeURIComponent(enrollmentIds.join(','))}`,
  ]
  const search = (params.search || '').trim()
  if (search) {
    queryParts.push(`where[or][0][trainee.user.firstName][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][1][trainee.user.lastName][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][2][assignment.title][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][3][enrollment.course.title][like]=${encodeURIComponent(search)}`)
  }
  if (params.status && params.status !== 'all') {
    queryParts.push(`where[status][equals]=${encodeURIComponent(params.status)}`)
  }
  if (params.page) queryParts.push(`page=${params.page}`)
  queryParts.push(`limit=${limit}`)
  queryParts.push('sort=-createdAt')

  const res = await fetch(`${CMS_API}/assignment-submissions?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await extractError(res, 'Failed to fetch assignment submissions'))
  const data = await res.json()

  return {
    docs: (data.docs || []).map(normalizeSubmission),
    totalDocs: data.totalDocs || 0,
    page: data.page || 1,
    limit: data.limit || limit,
    totalPages: data.totalPages || 0,
  }
}

export interface CourseOption {
  id: number
  title: string
  code: string
}

export async function getCourseOptions(): Promise<CourseOption[]> {
  const { instructorId } = await getInstructorContext()
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

export type GradeStatus = 'graded' | 'returned_for_revision'

export async function gradeAssignmentSubmission(data: {
  id: number
  status: GradeStatus
  score?: number
  feedback?: string
}): Promise<AssignmentSubmissionDoc> {
  const { instructorId, userId, token } = await getInstructorContext()
  const courseIds = await getInstructorCourseIds(instructorId)
  const enrollmentIds = await getEnrollmentIds(courseIds)
  if (enrollmentIds.length === 0) throw new Error('Unauthorized: no instructor course enrollments found')

  const submission = await getScopedSubmission(data.id, enrollmentIds)
  if (submission.status === 'draft') throw new Error('Draft submissions cannot be graded')
  if (submission.status === 'returned_for_revision') {
    throw new Error('Returned submissions are historical records; grade the trainee\'s new submission instead')
  }

  const assignment = submission.assignment && typeof submission.assignment === 'object' ? submission.assignment : null
  const maxScore = Number(assignment?.maxScore ?? 100)
  if (data.status === 'graded') {
    if (data.score === undefined || !Number.isFinite(data.score)) throw new Error('A valid score is required')
    if (data.score < 0 || data.score > maxScore) throw new Error(`Score must be between 0 and ${maxScore}`)
  }

  const body: Record<string, unknown> = { status: data.status }
  if (data.status === 'graded') {
    body.gradedBy = Number(userId)
    body.gradedAt = new Date().toISOString()
    body.score = data.score
  } else {
    body.score = null
    body.gradedBy = null
    body.gradedAt = null
  }
  if (data.feedback !== undefined) body.feedback = toLexical(data.feedback)

  const res = await fetch(`${CMS_API}/assignment-submissions/${encodeURIComponent(data.id)}`, {
    method: 'PATCH',
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await extractError(res, 'Failed to update assignment submission'))
  return normalizeSubmission(await res.json())
}
