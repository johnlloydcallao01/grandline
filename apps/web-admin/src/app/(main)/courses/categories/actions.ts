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

export interface CategoryDoc {
  id: string
  name: string
  slug: string
  description?: string
  parent?: { id: string; name: string } | string
  categoryType: 'course' | 'skill' | 'topic' | 'industry'
  icon?: any
  colorCode?: string
  displayOrder?: number
  isActive: boolean
  metadata?: any
  updatedAt: string
  createdAt: string
}

export interface CategoryListResult {
  docs: CategoryDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
}

export async function getCategoriesList(params: {
  search?: string
  categoryType?: string
  isActive?: string
  page?: number
  limit?: number
  sort?: string
}): Promise<CategoryListResult> {
  const queryParts: string[] = []

  queryParts.push('depth=1')
  if (params.search) queryParts.push(`where[or][0][name][like]=${encodeURIComponent(params.search)}`)
  if (params.categoryType) queryParts.push(`where[categoryType][equals]=${encodeURIComponent(params.categoryType)}`)
  if (params.isActive) queryParts.push(`where[isActive][equals]=${encodeURIComponent(params.isActive)}`)
  if (params.page) queryParts.push(`page=${params.page}`)
  if (params.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push(`sort=${params.sort || 'name'}`)

  const res = await fetch(apiUrl(`/course-categories?${queryParts.join('&')}`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch categories: ${res.statusText}`)
  }

  return res.json()
}

export async function getCategoryById(id: string): Promise<CategoryDoc> {
  const res = await fetch(apiUrl(`/course-categories/${id}?depth=2`), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to fetch category: ${res.statusText}`)
  }

  return res.json()
}

export async function createCategory(data: {
  name: string
  slug?: string
  description?: string
  parent?: string
  categoryType: string
  colorCode?: string
  displayOrder?: number
  isActive?: boolean
  metadata?: any
}): Promise<CategoryDoc> {
  const body: Record<string, any> = {
    name: data.name,
    categoryType: data.categoryType,
  }

  if (data.slug) body.slug = data.slug
  if (data.description) body.description = data.description
  if (data.parent) body.parent = data.parent
  if (data.colorCode) body.colorCode = data.colorCode
  if (data.displayOrder != null) body.displayOrder = data.displayOrder
  if (data.isActive != null) body.isActive = data.isActive
  if (data.metadata) body.metadata = data.metadata

  const res = await fetch(apiUrl('/course-categories'), {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to create category: ${res.statusText}`)
  }

  return res.json()
}

export async function updateCategory(id: string, data: Partial<CategoryDoc>): Promise<CategoryDoc> {
  const res = await fetch(apiUrl(`/course-categories/${id}`), {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = (err as any).errors?.[0]?.message || (err as any).error || `Failed to update category: ${res.statusText}`
    throw new Error(msg)
  }

  return res.json()
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/course-categories/${id}`), {
    method: 'DELETE',
    headers: headers(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).error || `Failed to delete category: ${res.statusText}`)
  }
}

export async function getAllCategories(): Promise<{ id: string; name: string }[]> {
  const res = await fetch(apiUrl('/course-categories?depth=0&limit=200&sort=name'), {
    headers: headers(),
    cache: 'no-store',
  })

  if (!res.ok) return []

  const data = await res.json()
  return (data.docs || []).map((c: any) => ({
    id: String(c.id),
    name: c.name || '',
  }))
}
