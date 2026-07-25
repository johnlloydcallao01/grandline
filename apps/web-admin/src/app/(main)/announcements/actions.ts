'use server'

import { getServerToken } from '@/app/actions/auth'
import { env } from '@/lib/env'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getServerToken()
    if (!token) {
        throw new Error('No admin session available.')
    }

    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
        ...init,
        headers: {
            Authorization: `JWT ${token}`,
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
            ...(init?.headers || {}),
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

export interface CourseRef {
    id: number
    title?: string
    courseCode?: string
}

export interface AnnouncementDoc {
    id: number
    title: string
    course: CourseRef | number
    bodyBlocks?: any
    pinned?: boolean | null
    visibleFrom?: string | null
    visibleUntil?: string | null
    createdBy?: { id: number; firstName?: string; lastName?: string; email?: string } | number | null
    createdAt: string
    updatedAt: string
}

export interface AnnouncementListResult {
    docs: AnnouncementDoc[]
    totalDocs: number
    page: number
    limit: number
    totalPages: number
}

export async function getAnnouncements(params: {
    search?: string
    page?: number
    limit?: number
    sort?: string
}): Promise<AnnouncementListResult> {
    const queryParts: string[] = ['depth=2']

    if (params.search) {
        queryParts.push(`where[or][0][title][like]=${encodeURIComponent(params.search)}`)
    }

    if (params.page) queryParts.push(`page=${params.page}`)
    if (params.limit) queryParts.push(`limit=${params.limit}`)
    queryParts.push(`sort=${params.sort || '-pinned,-visibleFrom,-createdAt'}`)

    return authFetch<AnnouncementListResult>(`/announcements?${queryParts.join('&')}`)
}

export async function getAnnouncement(id: number): Promise<AnnouncementDoc> {
    return authFetch<AnnouncementDoc>(`/announcements/${id}?depth=2`)
}

export interface CreateAnnouncementData {
    title: string
    course: number
    content?: string
    pinned?: boolean
    visibleFrom?: string
    visibleUntil?: string
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<AnnouncementDoc> {
    const body: Record<string, unknown> = {
        title: data.title,
        course: data.course,
        pinned: data.pinned ?? false,
    }

    if (data.content?.trim()) {
        body.bodyBlocks = {
            root: {
                type: 'root', format: '', indent: 0, version: 1,
                children: [{
                    type: 'paragraph', version: 1,
                    children: [{ mode: 'normal', text: data.content.trim(), type: 'text', style: '', detail: 0, format: 0, version: 1 }],
                    direction: 'ltr', format: '', indent: 0, textStyle: '', textFormat: 0,
                }],
                direction: 'ltr',
            },
        }
    }

    if (data.visibleFrom) body.visibleFrom = data.visibleFrom
    if (data.visibleUntil) body.visibleUntil = data.visibleUntil

    return authFetch<AnnouncementDoc>('/announcements', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

export interface UpdateAnnouncementData {
    title?: string
    course?: number
    content?: string | null
    pinned?: boolean
    visibleFrom?: string | null
    visibleUntil?: string | null
}

export async function updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<AnnouncementDoc> {
    const body: Record<string, unknown> = {}

    if (data.title !== undefined) body.title = data.title
    if (data.course !== undefined) body.course = data.course
    if (data.pinned !== undefined) body.pinned = data.pinned
    if (data.visibleFrom !== undefined) body.visibleFrom = data.visibleFrom
    if (data.visibleUntil !== undefined) body.visibleUntil = data.visibleUntil

    if (data.content !== undefined) {
        if (data.content?.trim()) {
            body.bodyBlocks = {
                root: {
                    type: 'root', format: '', indent: 0, version: 1,
                    children: [{
                        type: 'paragraph', version: 1,
                        children: [{ mode: 'normal', text: data.content.trim(), type: 'text', style: '', detail: 0, format: 0, version: 1 }],
                        direction: 'ltr', format: '', indent: 0, textStyle: '', textFormat: 0,
                    }],
                    direction: 'ltr',
                },
            }
        } else {
            body.bodyBlocks = null
        }
    }

    return authFetch<AnnouncementDoc>(`/announcements/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    })
}

export async function deleteAnnouncement(id: number): Promise<void> {
    await authFetch<{ id: number }>(`/announcements/${id}`, {
        method: 'DELETE',
    })
}

export interface CourseOption {
    id: number
    title: string
    code: string
}

export async function getCourseOptions(): Promise<CourseOption[]> {
    const data = await authFetch<{ docs: any[] }>('/courses?depth=0&limit=200&sort=title')
    return (data.docs || []).map((c: any) => ({
        id: c.id,
        title: c.title || c.courseCode || `Course #${c.id}`,
        code: c.courseCode || '',
    }))
}
