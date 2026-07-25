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

export interface TraineeRef {
    id: number
    srn?: string
    user?: { id: number; firstName?: string; lastName?: string; email?: string }
}

export interface FormRef {
    id: number
    title?: string
    description?: string
    fields?: any[]
}

export interface CourseRef {
    id: number
    title?: string
}

export interface FeedbackSubmissionDoc {
    id: number
    form?: FormRef | number
    course?: CourseRef | number
    trainee?: TraineeRef | number
    responses: Record<string, any>
    createdAt: string
    updatedAt: string
}

export interface FeedbackListResult {
    docs: FeedbackSubmissionDoc[]
    totalDocs: number
    page: number
    limit: number
    totalPages: number
}

export async function getFeedbackSubmissions(params: {
    search?: string
    formId?: string
    page?: number
    limit?: number
    sort?: string
}): Promise<FeedbackListResult> {
    const queryParts: string[] = ['depth=2']

    if (params.search) {
        queryParts.push(`where[or][0][trainee.user.firstName][like]=${encodeURIComponent(params.search)}`)
        queryParts.push(`where[or][1][trainee.user.lastName][like]=${encodeURIComponent(params.search)}`)
        queryParts.push(`where[or][2][form.title][like]=${encodeURIComponent(params.search)}`)
        queryParts.push(`where[or][3][course.title][like]=${encodeURIComponent(params.search)}`)
    }
    if (params.formId) {
        queryParts.push(`where[and][form][equals]=${encodeURIComponent(params.formId)}`)
    }
    if (params.page) queryParts.push(`page=${params.page}`)
    if (params.limit) queryParts.push(`limit=${params.limit}`)
    queryParts.push(`sort=${params.sort || '-createdAt'}`)

    return authFetch<FeedbackListResult>(`/feedback-submissions?${queryParts.join('&')}`)
}

export async function getFeedbackSubmission(id: number): Promise<FeedbackSubmissionDoc> {
    return authFetch<FeedbackSubmissionDoc>(`/feedback-submissions/${id}?depth=2`)
}

export async function deleteFeedbackSubmission(id: number): Promise<void> {
    await authFetch<{ id: number }>(`/feedback-submissions/${id}`, {
        method: 'DELETE',
    })
}

export interface FeedbackFormOption {
    id: number
    title: string
}

export async function getFeedbackFormOptions(): Promise<FeedbackFormOption[]> {
    const data = await authFetch<{ docs: any[] }>('/feedback-forms?depth=0&limit=200&sort=title')
    return (data.docs || []).map((f: any) => ({
        id: f.id,
        title: f.title || `Form #${f.id}`,
    }))
}
