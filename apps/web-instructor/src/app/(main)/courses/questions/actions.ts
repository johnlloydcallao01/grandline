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

  const instRes = await fetch(`${CMS_API}/instructors?where[user][equals]=${userId}&depth=0&limit=1`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })
  if (!instRes.ok) throw new Error('Failed to get instructor profile')
  const instData = await instRes.json()
  const instructorId = instData?.docs?.[0]?.id
  if (!instructorId) throw new Error('Instructor profile not found')

  return String(instructorId)
}

export interface QuestionDoc {
  id: string
  prompt: string
  type: 'single_choice' | 'multiple_choice' | 'true_false'
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'active' | 'deprecated'
  tags?: string[]
  trueFalseCorrect?: 'true' | 'false'
  options?: {
    label: string
    isCorrect: boolean
    id?: string
  }[]
  updatedAt: string
  createdAt: string
}

export interface QuestionListResult {
  docs: QuestionDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

export async function getQuestions(params: {
  search?: string
  type?: string
  difficulty?: string
  status?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<QuestionListResult> {
  // Verify instructor authentication
  await getInstructorId()

  const queryParts: string[] = []

  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`)
  if (params.difficulty) queryParts.push(`difficulty=${encodeURIComponent(params.difficulty)}`)
  if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`)
  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || '-updatedAt'}`)

  const res = await fetch(`${CMS_API}/lms/questions?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch questions: ${res.statusText}`)
  }

  return res.json()
}

export async function getQuestionById(id: string): Promise<QuestionDoc> {
  // Verify instructor authentication
  await getInstructorId()

  const res = await fetch(`${CMS_API}/lms/questions/${id}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch question: ${res.statusText}`)
  }

  return res.json()
}

export async function createQuestion(data: {
  prompt: string
  type: string
  explanation?: string
  difficulty: string
  status: string
  tags?: string[]
  trueFalseCorrect?: 'true' | 'false'
  options?: { label: string; isCorrect: boolean }[]
}): Promise<QuestionDoc> {
  // Verify instructor authentication
  await getInstructorId()

  const payload: Record<string, any> = {
    prompt: data.prompt,
    type: data.type,
    difficulty: data.difficulty,
    status: data.status,
  }

  if (data.explanation) payload.explanation = data.explanation
  if (data.tags && data.tags.length > 0) payload.tags = data.tags
  if (data.type === 'true_false') {
    payload.trueFalseCorrect = data.trueFalseCorrect || 'true'
  } else {
    payload.options = data.options || []
  }

  const res = await fetch(`${CMS_API}/questions`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create question: ${res.statusText}`)
  }

  return res.json()
}

export async function updateQuestion(
  id: string,
  data: Partial<QuestionDoc>,
): Promise<QuestionDoc> {
  // Verify instructor authentication
  await getInstructorId()

  const safeData: Record<string, any> = { ...data }

  const res = await fetch(`${CMS_API}/questions/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(safeData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update question: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteQuestion(id: string): Promise<void> {
  // Verify instructor authentication
  await getInstructorId()

  const res = await fetch(`${CMS_API}/questions/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete question: ${res.statusText}`)
  }
}
