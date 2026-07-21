'use server'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

function headers(): Record<string, string> {
  return {
    Authorization: `users API-Key ${API_KEY}`,
    'Content-Type': 'application/json',
  }
}

function apiUrl(path: string): string {
  if (!CMS_API) throw new Error('Missing NEXT_PUBLIC_API_URL')
  return `${CMS_API}${path}`
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
  const queryParts: string[] = []

  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`)
  if (params.difficulty) queryParts.push(`difficulty=${encodeURIComponent(params.difficulty)}`)
  if (params.status) queryParts.push(`status=${encodeURIComponent(params.status)}`)
  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || '-updatedAt'}`)

  const res = await fetch(apiUrl(`/lms/questions?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch questions: ${res.statusText}`)
  }

  return res.json()
}

export async function getQuestionById(id: string): Promise<QuestionDoc> {
  const res = await fetch(apiUrl(`/lms/questions/${id}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch question: ${res.statusText}`)
  }

  const data = await res.json()
  return data.question
}

export async function createQuestion(data: {
  prompt: string
  type: string
  explanation?: string
  difficulty: string
  status: string
  tags?: string[]
  trueFalseCorrect?: string
  options?: { label: string; isCorrect: boolean }[]
}): Promise<QuestionDoc> {
  const body: Record<string, any> = {
    prompt: data.prompt,
    type: data.type,
    difficulty: data.difficulty,
    status: data.status,
  }

  if (data.explanation) body.explanation = data.explanation
  if (data.tags && data.tags.length > 0) body.tags = data.tags
  if (data.type === 'true_false' && data.trueFalseCorrect) {
    body.trueFalseCorrect = data.trueFalseCorrect
  }
  if (data.type !== 'true_false' && data.options && data.options.length > 0) {
    body.options = data.options
  }

  const res = await fetch(apiUrl('/questions'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create question: ${res.statusText}`)
  }

  return res.json()
}

export async function updateQuestion(id: string, data: Partial<QuestionDoc>): Promise<QuestionDoc> {
  const body: Record<string, any> = { ...data }

  const res = await fetch(apiUrl(`/questions/${id}`), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update question: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteQuestion(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/questions/${id}`), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete question: ${res.statusText}`)
  }
}
