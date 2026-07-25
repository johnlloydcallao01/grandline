'use server'

import { getServerToken } from '@/app/actions/auth'
import { env } from '@/lib/env'

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getServerToken()
    if (!token) throw new Error('No admin session available.')

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

export interface NotificationDoc {
    id: number
    title: string
    category: 'learning' | 'account' | 'system-update' | 'other'
    body?: string | null
    template?: { id: number; name?: string; code?: string } | number | null
    origin: 'manual' | 'automatic'
    audienceType: 'all-users' | 'role' | 'segment' | 'specific-users'
    audienceRole?: 'trainee' | 'instructor' | 'admin' | 'service' | null
    audienceUsers?: { id: number; email?: string; firstName?: string; lastName?: string }[] | number[] | null
    segmentDefinition?: any
    sourceType?: string | null
    sourceId?: string | null
    actor?: { id: number; email?: string; firstName?: string; lastName?: string } | number | null
    metadata?: any
    scheduledAt?: string | null
    expiresAt?: string | null
    status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
    createdAt: string
    updatedAt: string
}

export interface NotificationListResult {
    docs: NotificationDoc[]
    totalDocs: number
    page: number
    limit: number
    totalPages: number
}

export async function getNotifications(params: {
    search?: string
    status?: string
    category?: string
    page?: number
    limit?: number
    sort?: string
}): Promise<NotificationListResult> {
    const queryParts: string[] = ['depth=2']

    if (params.search) {
        queryParts.push(`where[or][0][title][like]=${encodeURIComponent(params.search)}`)
    }
    if (params.status) {
        queryParts.push(`where[and][status][equals]=${encodeURIComponent(params.status)}`)
    }
    if (params.category) {
        queryParts.push(`where[and][category][equals]=${encodeURIComponent(params.category)}`)
    }
    if (params.page) queryParts.push(`page=${params.page}`)
    if (params.limit) queryParts.push(`limit=${params.limit}`)
    queryParts.push(`sort=${params.sort || '-createdAt'}`)

    return authFetch<NotificationListResult>(`/notifications?${queryParts.join('&')}`)
}

export async function getNotification(id: number): Promise<NotificationDoc> {
    return authFetch<NotificationDoc>(`/notifications/${id}?depth=2`)
}

export interface CreateNotificationData {
    title: string
    category: 'learning' | 'account' | 'system-update' | 'other'
    body?: string
    template?: number | null
    origin: 'manual' | 'automatic'
    audienceType: 'all-users' | 'role' | 'segment' | 'specific-users'
    audienceRole?: string | null
    audienceUsers?: number[] | null
    segmentDefinition?: any
    sourceType?: string
    sourceId?: string
    scheduledAt?: string | null
    expiresAt?: string | null
    status: 'draft' | 'scheduled' | 'sent' | 'cancelled'
}

export async function createNotification(data: CreateNotificationData): Promise<NotificationDoc> {
    const body: Record<string, unknown> = {
        title: data.title,
        category: data.category,
        origin: data.origin,
        audienceType: data.audienceType,
        status: data.status,
    }

    if (data.body?.trim()) body.body = data.body.trim()
    if (data.template) body.template = data.template
    if (data.audienceRole) body.audienceRole = data.audienceRole
    if (data.audienceUsers && data.audienceUsers.length > 0) body.audienceUsers = data.audienceUsers
    if (data.segmentDefinition) body.segmentDefinition = data.segmentDefinition
    if (data.sourceType?.trim()) body.sourceType = data.sourceType.trim()
    if (data.sourceId?.trim()) body.sourceId = data.sourceId.trim()
    if (data.scheduledAt) body.scheduledAt = data.scheduledAt
    if (data.expiresAt) body.expiresAt = data.expiresAt

    return authFetch<NotificationDoc>('/notifications', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

export interface UpdateNotificationData {
    title?: string
    category?: 'learning' | 'account' | 'system-update' | 'other'
    body?: string | null
    template?: number | null
    origin?: 'manual' | 'automatic'
    audienceType?: 'all-users' | 'role' | 'segment' | 'specific-users'
    audienceRole?: string | null
    audienceUsers?: number[] | null
    segmentDefinition?: any
    sourceType?: string | null
    sourceId?: string | null
    scheduledAt?: string | null
    expiresAt?: string | null
    status?: 'draft' | 'scheduled' | 'sent' | 'cancelled'
}

export async function updateNotification(id: number, data: UpdateNotificationData): Promise<NotificationDoc> {
    const body: Record<string, unknown> = {}

    if (data.title !== undefined) body.title = data.title
    if (data.category !== undefined) body.category = data.category
    if (data.body !== undefined) body.body = data.body?.trim() || null
    if (data.template !== undefined) body.template = data.template
    if (data.origin !== undefined) body.origin = data.origin
    if (data.audienceType !== undefined) body.audienceType = data.audienceType
    if (data.audienceRole !== undefined) body.audienceRole = data.audienceRole || null
    if (data.audienceUsers !== undefined) body.audienceUsers = data.audienceUsers && data.audienceUsers.length > 0 ? data.audienceUsers : null
    if (data.segmentDefinition !== undefined) body.segmentDefinition = data.segmentDefinition
    if (data.sourceType !== undefined) body.sourceType = data.sourceType?.trim() || null
    if (data.sourceId !== undefined) body.sourceId = data.sourceId?.trim() || null
    if (data.scheduledAt !== undefined) body.scheduledAt = data.scheduledAt
    if (data.expiresAt !== undefined) body.expiresAt = data.expiresAt
    if (data.status !== undefined) body.status = data.status

    return authFetch<NotificationDoc>(`/notifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    })
}

export async function deleteNotification(id: number): Promise<void> {
    await authFetch<{ id: number }>(`/notifications/${id}`, {
        method: 'DELETE',
    })
}

export interface NotificationTemplateDoc {
    id: number
    name: string
    code: string
    category: 'learning' | 'account' | 'system-update' | 'other'
    titleTemplate: string
    bodyTemplate?: string | null
    defaultLink?: string | null
    channels?: ('in-app' | 'email' | 'push')[] | null
    automatic?: boolean | null
    manual?: boolean | null
    metadataSchema?: any
    createdAt: string
    updatedAt: string
}

export interface TemplateListResult {
    docs: NotificationTemplateDoc[]
    totalDocs: number
    page: number
    limit: number
    totalPages: number
}

export async function getTemplates(params: {
    search?: string
    page?: number
    limit?: number
    sort?: string
}): Promise<TemplateListResult> {
    const queryParts: string[] = ['depth=1']

    if (params.search) {
        queryParts.push(`where[or][0][name][like]=${encodeURIComponent(params.search)}`)
        queryParts.push(`where[or][1][code][like]=${encodeURIComponent(params.search)}`)
    }
    if (params.page) queryParts.push(`page=${params.page}`)
    if (params.limit) queryParts.push(`limit=${params.limit}`)
    queryParts.push(`sort=${params.sort || 'name'}`)

    return authFetch<TemplateListResult>(`/notification-templates?${queryParts.join('&')}`)
}

export async function getTemplate(id: number): Promise<NotificationTemplateDoc> {
    return authFetch<NotificationTemplateDoc>(`/notification-templates/${id}?depth=1`)
}

export interface CreateTemplateData {
    name: string
    code: string
    category: 'learning' | 'account' | 'system-update' | 'other'
    titleTemplate: string
    bodyTemplate?: string
    defaultLink?: string
    channels?: ('in-app' | 'email' | 'push')[]
    automatic?: boolean
    manual?: boolean
    metadataSchema?: any
}

export async function createTemplate(data: CreateTemplateData): Promise<NotificationTemplateDoc> {
    const body: Record<string, unknown> = {
        name: data.name,
        code: data.code,
        category: data.category,
        titleTemplate: data.titleTemplate,
    }

    if (data.bodyTemplate?.trim()) body.bodyTemplate = data.bodyTemplate.trim()
    if (data.defaultLink?.trim()) body.defaultLink = data.defaultLink.trim()
    if (data.channels && data.channels.length > 0) body.channels = data.channels
    if (data.automatic !== undefined) body.automatic = data.automatic
    body.manual = data.manual !== undefined ? data.manual : true
    if (data.metadataSchema) body.metadataSchema = data.metadataSchema

    return authFetch<NotificationTemplateDoc>('/notification-templates', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

export interface UpdateTemplateData {
    name?: string
    code?: string
    category?: 'learning' | 'account' | 'system-update' | 'other'
    titleTemplate?: string
    bodyTemplate?: string | null
    defaultLink?: string | null
    channels?: ('in-app' | 'email' | 'push')[] | null
    automatic?: boolean
    manual?: boolean
    metadataSchema?: any
}

export async function updateTemplate(id: number, data: UpdateTemplateData): Promise<NotificationTemplateDoc> {
    const body: Record<string, unknown> = {}

    if (data.name !== undefined) body.name = data.name
    if (data.code !== undefined) body.code = data.code
    if (data.category !== undefined) body.category = data.category
    if (data.titleTemplate !== undefined) body.titleTemplate = data.titleTemplate
    if (data.bodyTemplate !== undefined) body.bodyTemplate = data.bodyTemplate?.trim() || null
    if (data.defaultLink !== undefined) body.defaultLink = data.defaultLink?.trim() || null
    if (data.channels !== undefined) body.channels = data.channels && data.channels.length > 0 ? data.channels : null
    if (data.automatic !== undefined) body.automatic = data.automatic
    if (data.manual !== undefined) body.manual = data.manual
    if (data.metadataSchema !== undefined) body.metadataSchema = data.metadataSchema

    return authFetch<NotificationTemplateDoc>(`/notification-templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
    })
}

export async function deleteTemplate(id: number): Promise<void> {
    await authFetch<{ id: number }>(`/notification-templates/${id}`, {
        method: 'DELETE',
    })
}

export interface UserOption {
    id: number
    email: string
    firstName?: string
    lastName?: string
}

export async function getUserOptions(search?: string): Promise<UserOption[]> {
    const queryParts: string[] = ['depth=0', 'limit=50']
    if (search) {
        queryParts.push(`where[or][0][email][like]=${encodeURIComponent(search)}`)
        queryParts.push(`where[or][1][firstName][like]=${encodeURIComponent(search)}`)
        queryParts.push(`where[or][2][lastName][like]=${encodeURIComponent(search)}`)
    }
    queryParts.push('sort=email')

    const data = await authFetch<{ docs: any[] }>(`/users?${queryParts.join('&')}`)
    return (data.docs || []).map((u: any) => ({
        id: u.id,
        email: u.email || '',
        firstName: u.firstName || '',
        lastName: u.lastName || '',
    }))
}

export async function getTemplateOptions(): Promise<{ id: number; name: string; code: string }[]> {
    const data = await authFetch<{ docs: any[] }>('/notification-templates?depth=0&limit=200&sort=name')
    return (data.docs || []).map((t: any) => ({
        id: t.id,
        name: t.name || `Template #${t.id}`,
        code: t.code || '',
    }))
}
