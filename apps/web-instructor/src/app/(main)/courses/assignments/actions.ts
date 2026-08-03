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

async function getInstructorAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')
  return {
    Authorization: `JWT ${token}`,
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
  gradeWeight?: number
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

function extractRelationshipId(value: any): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') return value.id != null ? String(value.id) : null
  return String(value)
}

export async function getAssignments(params?: {
  search?: string
  submissionType?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<AssignmentListResult> {
  const instructorId = await getInstructorId()

  const queryParts: string[] = [
    'depth=1',
    `where[instructor][equals]=${encodeURIComponent(instructorId)}`,
  ]

  if (params?.search) {
    queryParts.push(`where[title][like]=${encodeURIComponent(params.search)}`)
  }
  if (params?.submissionType) {
    queryParts.push(`where[submissionType][equals]=${encodeURIComponent(params.submissionType)}`)
  }
  if (params?.page) queryParts.push(`page=${params.page}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params?.sort || '-updatedAt'}`)

  const res = await fetch(`${CMS_API}/assignments?${queryParts.join('&')}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch assignments: ${res.statusText}`)
  }

  return res.json()
}

export async function getAssignmentById(id: string): Promise<AssignmentDoc> {
  const instructorId = await getInstructorId()

  const res = await fetch(`${CMS_API}/lms/assignments/${id}`, {
    headers: adminHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch assignment: ${res.statusText}`)
  }

  const data = await res.json()
  const assignment: AssignmentDoc = data.assignment

  const ownerId = extractRelationshipId(assignment.instructor)
  if (ownerId !== instructorId) {
    throw new Error('Unauthorized: assignment does not belong to you')
  }

  return assignment
}

export async function createAssignment(data: {
  title: string
  maxScore: number
  passingScore: number
  submissionType: string
  description?: any
  attachments?: string[]
  allowedFileTypes?: string[]
  dueDate?: string
}): Promise<AssignmentDoc> {
  const instructorId = await getInstructorId()

  const body: Record<string, any> = {
    title: data.title,
    maxScore: data.maxScore,
    passingScore: data.passingScore,
    submissionType: data.submissionType,
    instructor: instructorId,
  }

  if (data.description) body.description = data.description
  if (data.allowedFileTypes && data.allowedFileTypes.length > 0) body.allowedFileTypes = data.allowedFileTypes
  if (data.dueDate) body.dueDate = data.dueDate

  // The assignments collection excludes the service role from create, so use the instructor JWT
  const res = await fetch(`${CMS_API}/assignments`, {
    method: 'POST',
    headers: await getInstructorAuthHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create assignment: ${res.statusText}`)
  }

  return res.json()
}

export async function updateAssignment(
  id: string,
  data: Partial<AssignmentDoc>,
): Promise<AssignmentDoc> {
  // Verifies ownership and throws if the assignment is not owned by the instructor
  await getAssignmentById(id)

  const body: Record<string, any> = { ...data }
  // Instructors cannot reassign ownership of an assignment
  delete body.instructor

  // The assignments collection excludes the service role from update, so use the instructor JWT
  const res = await fetch(`${CMS_API}/assignments/${id}`, {
    method: 'PATCH',
    headers: await getInstructorAuthHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update assignment: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteAssignment(id: string): Promise<void> {
  // Verifies ownership and throws if the assignment is not owned by the instructor
  await getAssignmentById(id)

  // The assignments collection excludes the service role from delete, so use the instructor JWT
  const res = await fetch(`${CMS_API}/assignments/${id}`, {
    method: 'DELETE',
    headers: await getInstructorAuthHeaders(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete assignment: ${res.statusText}`)
  }
}
