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

export interface LessonDoc {
  id: string
  title: string
  module: ModuleRef | string
  description?: any
  estimatedDuration?: number
  updatedAt: string
  createdAt: string
}

export interface LessonListResult {
  docs: LessonDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
  moduleOptions: ModuleOption[]
}

export interface ModuleOption {
  id: string
  title: string
}

export interface LessonEditData {
  lesson: LessonDoc
  moduleOptions: ModuleOption[]
}

export async function getLessons(params: {
  search?: string
  moduleId?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<LessonListResult> {
  const queryParts: string[] = []

  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params.moduleId) queryParts.push(`moduleId=${encodeURIComponent(params.moduleId)}`)
  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || '-createdAt'}`)

  const res = await fetch(apiUrl(`/lms/course-lessons?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch lessons: ${res.statusText}`)
  }

  return res.json()
}

export async function getLessonById(id: string): Promise<LessonEditData> {
  const res = await fetch(apiUrl(`/lms/course-lessons/${id}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch lesson: ${res.statusText}`)
  }

  return res.json()
}

export async function createLesson(data: {
  title: string
  module: string
  description?: any
  estimatedDuration?: number
}): Promise<LessonDoc> {
  const res = await fetch(apiUrl('/course-lessons'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create lesson: ${res.statusText}`)
  }

  return res.json()
}

export async function updateLesson(id: string, data: Partial<LessonDoc>): Promise<LessonDoc> {
  const safeData: Record<string, any> = { ...data }
  if (safeData.module != null && typeof safeData.module !== 'object') safeData.module = Number(safeData.module)

  const res = await fetch(apiUrl(`/course-lessons/${id}`), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(safeData),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update lesson: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function getModuleOptions(): Promise<ModuleOption[]> {
  const params = new URLSearchParams({ depth: '0', limit: '100', sort: 'title' })
  const res = await fetch(apiUrl(`/course-modules?${params.toString()}`), {
    headers: headers(), cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs || []).map((d: any) => ({ id: String(d.id), title: d.title || String(d.id) }))
}

export async function deleteLesson(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/course-lessons/${id}`), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete lesson: ${res.statusText}`)
  }
}
