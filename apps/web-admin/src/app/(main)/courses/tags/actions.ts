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

export interface TagDoc {
  id: string
  name: string
  slug: string
  description?: string
  colorCode?: string
  displayOrder?: number
  isActive: boolean
  updatedAt: string
  createdAt: string
}

export interface TagListResult {
  docs: TagDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

export async function getTagsList(params: {
  search?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<TagListResult> {
  const queryParts: string[] = []
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || 'name'}`)
  const res = await fetch(apiUrl(`/lms/tags?${queryParts.join('&')}`), {
    headers: headers(), cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch tags: ${res.statusText}`)
  }
  return res.json()
}

export async function getTagById(id: string): Promise<TagDoc> {
  const res = await fetch(apiUrl(`/lms/tags/${id}`), {
    headers: headers(), cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch tag: ${res.statusText}`)
  }
  const data = await res.json()
  return data.tag
}

export async function createTag(data: {
  name: string
  slug?: string
  description?: string
  colorCode?: string
  displayOrder?: number
  isActive?: boolean
}): Promise<TagDoc> {
  const body: Record<string, any> = { name: data.name }
  if (data.slug) body.slug = data.slug
  if (data.description) body.description = data.description
  if (data.colorCode) body.colorCode = data.colorCode
  if (data.displayOrder != null) body.displayOrder = data.displayOrder
  if (data.isActive != null) body.isActive = data.isActive
  const res = await fetch(apiUrl('/course-tags'), {
    method: 'POST', headers: headers(), body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create tag: ${res.statusText}`)
  }
  return res.json()
}

export async function updateTag(id: string, data: Partial<TagDoc>): Promise<TagDoc> {
  const res = await fetch(apiUrl(`/course-tags/${id}`), {
    method: 'PATCH', headers: headers(), body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update tag: ${res.statusText}`
    throw new Error(msg)
  }
  return res.json()
}

export async function deleteTag(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/course-tags/${id}`), {
    method: 'DELETE', headers: headers(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete tag: ${res.statusText}`)
  }
}
