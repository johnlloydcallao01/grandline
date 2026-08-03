'use server'

import { cookies } from 'next/headers'

const CMS_API = process.env.NEXT_PUBLIC_API_URL

async function getJwtToken(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')
  return token
}

async function getCurrentUserId(): Promise<number> {
  const token = await getJwtToken()
  const res = await fetch(`${CMS_API}/users/me`, {
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to get current user')
  const data = await res.json()
  const userId = data?.user?.id || data?.id
  if (!userId) throw new Error('Could not determine user ID')
  return Number(userId)
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getJwtToken()

  const headers: Record<string, string> = {
    Authorization: `JWT ${token}`,
  }

  const isFormData = init?.body instanceof FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${CMS_API}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...((init?.headers as Record<string, string>) || {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; errors?: { message: string }[] }
      | null
    const message =
      payload?.error || payload?.errors?.[0]?.message || `Request failed: ${response.statusText}`
    throw new Error(message)
  }

  return response.json()
}

function normalizeMediaDoc(raw: any): MediaDoc {
  const uploadedBy = raw?.uploadedBy
  return {
    id: Number(raw.id),
    url: raw.url ?? null,
    cloudinaryURL: raw.cloudinaryURL ?? null,
    thumbnailURL: raw.thumbnailURL ?? null,
    filename: raw.filename ?? null,
    alt: raw.alt ?? null,
    mimeType: raw.mimeType ?? null,
    filesize: raw.filesize ?? null,
    visibility: raw.visibility ?? 'shared',
    uploadedBy:
      uploadedBy && typeof uploadedBy === 'object' ? Number(uploadedBy.id) : uploadedBy ? Number(uploadedBy) : null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export interface MediaDoc {
  id: number
  url: string | null
  cloudinaryURL: string | null
  thumbnailURL: string | null
  filename: string | null
  alt: string | null
  mimeType: string | null
  filesize: number | null
  visibility: 'shared' | 'private'
  uploadedBy: number | null
  createdAt: string
  updatedAt: string
}

export interface MediaListResult {
  docs: MediaDoc[]
  totalDocs: number
  page: number
  limit: number
  totalPages: number
  currentUserId: number
}

export type MediaScope = 'all' | 'mine' | 'shared'

export async function getMedia(params: {
  search?: string
  scope?: MediaScope
  page?: number
  limit?: number
}): Promise<MediaListResult> {
  const currentUserId = await getCurrentUserId()

  // Scoping boundary: an instructor can see media they uploaded (regardless of
  // visibility) plus any media shared with the library.
  const queryParts: string[] = ['depth=1']

  const scope = params?.scope || 'all'
  if (scope === 'mine') {
    queryParts.push(`where[and][0][uploadedBy][equals]=${encodeURIComponent(currentUserId)}`)
  } else if (scope === 'shared') {
    queryParts.push(`where[and][0][visibility][equals]=shared`)
  } else {
    queryParts.push(`where[and][0][or][0][uploadedBy][equals]=${encodeURIComponent(currentUserId)}`)
    queryParts.push(`where[and][0][or][1][visibility][equals]=shared`)
  }

  const search = (params?.search || '').trim()
  if (search) {
    queryParts.push(`where[and][1][or][0][filename][like]=${encodeURIComponent(search)}`)
    queryParts.push(`where[and][1][or][1][alt][like]=${encodeURIComponent(search)}`)
  }

  if (params?.page) queryParts.push(`page=${params.page}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  queryParts.push('sort=-updatedAt')

  const data = await authFetch<{ docs: any[]; totalDocs: number; page: number; limit: number; totalPages: number }>(
    `/media?${queryParts.join('&')}`,
  )

  return {
    docs: (data.docs || []).map(normalizeMediaDoc),
    totalDocs: data.totalDocs || 0,
    page: data.page || 1,
    limit: data.limit || 10,
    totalPages: data.totalPages || 0,
    currentUserId,
  }
}

export async function uploadMedia(formData: FormData): Promise<MediaDoc> {
  const raw = await authFetch<MediaDoc | { doc: MediaDoc }>('/media', {
    method: 'POST',
    body: formData,
  })
  const doc = 'doc' in raw ? raw.doc : raw
  return normalizeMediaDoc(doc)
}

export interface UpdateMediaData {
  alt?: string | null
  filename?: string | null
  visibility?: 'shared' | 'private'
}

export async function updateMedia(id: number, data: UpdateMediaData): Promise<MediaDoc> {
  const body: Record<string, unknown> = {}
  if (data.alt !== undefined) body.alt = data.alt
  if (data.filename !== undefined) body.filename = data.filename
  if (data.visibility !== undefined) body.visibility = data.visibility

  const doc = await authFetch<MediaDoc>(`/media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  return normalizeMediaDoc(doc)
}
