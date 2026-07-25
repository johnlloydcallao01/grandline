'use server'

import { getServerToken } from '@/app/actions/auth'
import { env } from '@/lib/env'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getServerToken()
    if (!token) throw new Error('No admin session available.')

    const headers: Record<string, string> = {
        Authorization: `JWT ${token}`,
    }

    const isFormData = init?.body instanceof FormData
    if (!isFormData) {
        headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
        ...init,
        headers: {
            ...headers,
            ...(init?.headers as Record<string, string> || {}),
        },
        cache: 'no-store',
    })

    if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string; errors?: { message: string }[] } | null
        const message = payload?.error || payload?.errors?.[0]?.message || `Request failed: ${response.statusText}`
        throw new Error(message)
    }

    return response.json()
}

export interface MediaDoc {
    id: number
    url?: string | null
    cloudinaryURL?: string | null
    thumbnailURL?: string | null
    filename?: string | null
    alt?: string | null
    mimeType?: string | null
    filesize?: number | null
    createdAt: string
    updatedAt: string
}

export interface MediaListResult {
    docs: MediaDoc[]
    totalDocs: number
    page: number
    limit: number
    totalPages: number
}

export async function getMedia(params: {
    search?: string
    page?: number
    limit?: number
    sort?: string
}): Promise<MediaListResult> {
    const queryParts: string[] = ['depth=1']

    if (params.search) {
        queryParts.push(`where[or][0][filename][like]=${encodeURIComponent(params.search)}`)
        queryParts.push(`where[or][1][alt][like]=${encodeURIComponent(params.search)}`)
    }
    if (params.page) queryParts.push(`page=${params.page}`)
    if (params.limit) queryParts.push(`limit=${params.limit}`)
    queryParts.push(`sort=${params.sort || '-updatedAt'}`)

    return authFetch<MediaListResult>(`/media?${queryParts.join('&')}`)
}

export async function getMediaItem(id: number): Promise<MediaDoc> {
    return authFetch<MediaDoc>(`/media/${id}?depth=1`)
}

export async function uploadMedia(formData: FormData): Promise<MediaDoc> {
    const raw = await authFetch<MediaDoc | { doc: MediaDoc }>('/media', {
        method: 'POST',
        body: formData,
    })
    return 'doc' in raw ? raw.doc : raw
}

export interface UpdateMediaData {
    alt?: string | null
    filename?: string | null
}

export async function updateMedia(id: number, data: UpdateMediaData): Promise<MediaDoc> {
    const body: Record<string, unknown> = {}
    if (data.alt !== undefined) body.alt = data.alt
    if (data.filename !== undefined) body.filename = data.filename

    return authFetch<MediaDoc>(`/media/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    })
}

export async function deleteMedia(id: number): Promise<void> {
    await authFetch<{ id: number }>(`/media/${id}`, {
        method: 'DELETE',
    })
}


