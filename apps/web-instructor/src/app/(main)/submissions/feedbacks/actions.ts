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

async function getInstructorContext(): Promise<{ instructorId: string; userId: string }> {
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

  const instRes = await fetch(`${CMS_API}/instructors?where[user][equals]=${userId}&depth=0&limit=1`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!instRes.ok) throw new Error('Failed to get instructor profile')
  const instData = await instRes.json()
  const instructorId = instData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return { instructorId: String(instructorId), userId: String(userId) }
}

// Resolves the course ids the instructor owns or co-teaches, mirroring the
// scoping chain used by the dashboard summary endpoint.
async function getCourseIds(instructorId: string): Promise<string[]> {
  const params = new URLSearchParams({ depth: '0', limit: '500' })
  params.set('where[or][0][instructor][equals]', instructorId)
  params.set('where[or][1][coInstructors][contains]', instructorId)

  const res = await fetch(`${CMS_API}/courses?${params.toString()}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((c: any) => String(c.id))
}

async function extractError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (data?.errors?.[0]?.message) return data.errors[0].message
    if (data?.error) return data.error
    if (data?.message) return data.message
  } catch {
    // ignore parse failures and fall back to the status text
  }
  return fallback
}

export interface TraineeRef {
  id: number
  srn?: string
  user?: { id: number; firstName?: string; lastName?: string; email?: string }
}

export interface FormRef {
  id: number
  title?: string
  description?: string
  fields?: any[]
}

export interface CourseRef {
  id: number
  title?: string
}

export interface FeedbackSubmissionDoc {
  id: number
  form?: FormRef | number
  course?: CourseRef | number
  trainee?: TraineeRef | number
  responses: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface FeedbackListResult {
  docs: FeedbackSubmissionDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

function normalizeFeedbackDoc(d: any): FeedbackSubmissionDoc {
  return {
    id: Number(d.id),
    form: d.form && typeof d.form === 'object' ? d.form : d.form ?? undefined,
    course: d.course && typeof d.course === 'object' ? d.course : d.course ?? undefined,
    trainee: d.trainee && typeof d.trainee === 'object' ? d.trainee : d.trainee ?? undefined,
    responses: d.responses || {},
    createdAt: d.createdAt || '',
    updatedAt: d.updatedAt || '',
  }
}

export async function getFeedbackSubmissions(params: {
  search?: string
  formId?: string
  page?: number
  limit?: number
}): Promise<FeedbackListResult> {
  const { instructorId } = await getInstructorContext()
  const courseIds = await getCourseIds(instructorId)
  if (courseIds.length === 0) {
    return { docs: [], totalDocs: 0, page: 1, limit: params.limit || 20, totalPages: 0 }
  }

  // Scoping boundary: feedback submissions for the instructor's courses only.
  const queryParts: string[] = ['depth=2', `where[course][in]=${encodeURIComponent(courseIds.join(','))}`]

  const search = (params?.search || '').trim()
  if (search) {
    queryParts.push(`where[or][0][trainee.user.firstName][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][1][trainee.user.lastName][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][2][form.title][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[or][3][course.title][like]=${encodeURIComponent(search)}`)
  }
  if (params?.formId) {
    queryParts.push(`where[and][form][equals]=${encodeURIComponent(params.formId)}`)
  }
  if (params?.page) queryParts.push(`page=${params.page}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push('sort=-createdAt')

  const res = await fetch(`${CMS_API}/feedback-submissions?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(await extractError(res, `Failed to fetch feedback submissions: ${res.statusText}`))
  }

  const data = await res.json()
  return {
    docs: (data.docs || []).map(normalizeFeedbackDoc),
    totalDocs: data.totalDocs || 0,
    page: data.page || 1,
    limit: data.limit || 20,
    totalPages: data.totalPages || 0,
  }
}

export interface FeedbackFormOption {
  id: number
  title: string
}

export async function getFeedbackFormOptions(): Promise<FeedbackFormOption[]> {
  const res = await fetch(`${CMS_API}/feedback-forms?depth=0&limit=200&sort=title`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((f: any) => ({
    id: Number(f.id),
    title: f.title || `Form #${f.id}`,
  }))
}
