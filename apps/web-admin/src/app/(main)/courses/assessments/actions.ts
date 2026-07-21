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

export interface ModuleRef {
  id: string
  title?: string
}

export interface AssessmentDoc {
  id: string
  title: string
  description?: any
  assessmentType: 'quiz' | 'exam' | 'final_exam'
  module?: ModuleRef | string
  course?: ModuleRef | string
  passingScore?: number
  maxAttempts?: number
  timeLimitMinutes?: number
  showCorrectAnswer?: boolean
  items?: {
    question: any
    order?: number
    points?: number
    id?: string
  }[]
  updatedAt: string
  createdAt: string
}

export interface AssessmentListResult {
  docs: AssessmentDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
  moduleOptions: ModuleOption[]
  courseOptions?: CourseOption[]
}

export interface ModuleOption {
  id: string
  title: string
}

export interface CourseOption {
  id: string
  title: string
}

export interface AssessmentEditData {
  assessment: AssessmentDoc
  moduleOptions: ModuleOption[]
  courseOptions: CourseOption[]
}

export interface QuestionOption {
  id: string
  prompt: string
  type: string
  difficulty: string
}

export async function getAssessments(params: {
  search?: string
  assessmentType?: string
  moduleId?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<AssessmentListResult> {
  const queryParts: string[] = []

  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params.assessmentType) queryParts.push(`assessmentType=${encodeURIComponent(params.assessmentType)}`)
  if (params.moduleId) queryParts.push(`moduleId=${encodeURIComponent(params.moduleId)}`)
  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || '-updatedAt'}`)

  const res = await fetch(apiUrl(`/lms/assessments?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch assessments: ${res.statusText}`)
  }

  return res.json()
}

export async function getAssessmentById(id: string): Promise<AssessmentEditData> {
  const res = await fetch(apiUrl(`/lms/assessments/${id}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch assessment: ${res.statusText}`)
  }

  return res.json()
}

export async function getQuestions(params?: { search?: string; limit?: number }): Promise<QuestionOption[]> {
  const queryParts: string[] = []
  if (params?.search) queryParts.push(`where[prompt][like]=${encodeURIComponent(params.search)}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`depth=0`)

  const res = await fetch(apiUrl(`/questions?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch questions: ${res.statusText}`)
  }

  const data = await res.json()
  return (data.docs || []).map((q: any) => ({
    id: String(q.id),
    prompt: q.prompt,
    type: q.type,
    difficulty: q.difficulty,
  }))
}

export async function createAssessment(data: {
  title: string
  assessmentType: string
  module?: string
  course?: string
  passingScore?: number
  maxAttempts?: number
  timeLimitMinutes?: number
  showCorrectAnswer?: boolean
  items?: { question: string; order?: number; points?: number }[]
}): Promise<AssessmentDoc> {
  const body: Record<string, any> = {
    title: data.title,
    assessmentType: data.assessmentType,
    passingScore: data.passingScore ?? 70,
    maxAttempts: data.maxAttempts ?? 1,
    showCorrectAnswer: data.showCorrectAnswer ?? false,
    items: data.items && data.items.length > 0 ? data.items : [],
  }

  if (data.assessmentType === 'final_exam') {
    if (data.course) body.course = data.course
  } else {
    if (data.module) body.module = data.module
  }

  if (data.timeLimitMinutes) body.timeLimitMinutes = data.timeLimitMinutes

  const res = await fetch(apiUrl('/assessments'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create assessment: ${res.statusText}`)
  }

  return res.json()
}

export async function updateAssessment(id: string, data: Partial<AssessmentDoc>): Promise<AssessmentDoc> {
  const safeData: Record<string, any> = { ...data }
  if (safeData.module != null && typeof safeData.module !== 'object') safeData.module = Number(safeData.module)
  if (safeData.course != null && typeof safeData.course !== 'object') safeData.course = Number(safeData.course)

  const res = await fetch(apiUrl(`/assessments/${id}`), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(safeData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update assessment: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteAssessment(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/assessments/${id}`), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete assessment: ${res.statusText}`)
  }
}
