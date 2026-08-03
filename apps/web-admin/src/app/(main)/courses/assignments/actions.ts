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

export interface AssignmentDoc {
  id: string
  title: string
  description?: any
  attachments?: any[]
  instructor?: { id: string } | string | null
  maxScore: number
  passingScore: number
  submissionType: 'file_upload' | 'text_entry' | 'both'
  allowedFileTypes?: string[]
  dueDate?: string
  updatedAt: string
  createdAt: string
}

export interface AssignmentListResult {
  docs: AssignmentDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

export async function getAssignments(params: {
  search?: string
  submissionType?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<AssignmentListResult> {
  const queryParts: string[] = []

  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params.submissionType) queryParts.push(`submissionType=${encodeURIComponent(params.submissionType)}`)
  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || '-updatedAt'}`)

  const res = await fetch(apiUrl(`/lms/assignments?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch assignments: ${res.statusText}`)
  }

  return res.json()
}

export async function getAssignmentById(id: string): Promise<AssignmentDoc> {
  const res = await fetch(apiUrl(`/lms/assignments/${id}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch assignment: ${res.statusText}`)
  }

  const data = await res.json()
  return data.assignment
}

export async function createAssignment(data: {
  title: string
  maxScore: number
  passingScore: number
  submissionType: string
  description?: any
  allowedFileTypes?: string[]
  dueDate?: string
  instructor?: string
}): Promise<AssignmentDoc> {
  const body: Record<string, any> = {
    title: data.title,
    maxScore: data.maxScore,
    passingScore: data.passingScore,
    submissionType: data.submissionType,
  }

  if (data.description) body.description = data.description
  if (data.allowedFileTypes && data.allowedFileTypes.length > 0) body.allowedFileTypes = data.allowedFileTypes
  if (data.dueDate) body.dueDate = data.dueDate
  if (data.instructor) body.instructor = data.instructor

  const res = await fetch(apiUrl('/assignments'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create assignment: ${res.statusText}`)
  }

  return res.json()
}

export async function updateAssignment(id: string, data: Partial<AssignmentDoc>): Promise<AssignmentDoc> {
  const res = await fetch(apiUrl(`/assignments/${id}`), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update assignment: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/assignments/${id}`), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete assignment: ${res.statusText}`)
  }
}
