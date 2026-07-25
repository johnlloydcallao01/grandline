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

export interface AssignmentRef {
    id: number
    title?: string
    maxScore?: number
    passingScore?: number
}

export interface CourseRef {
    id: number
    title?: string
}

export interface MediaRef {
    id: number
    filename?: string
    url?: string
    mimeType?: string
    filesize?: number
}

export interface AssignmentSubmissionDoc {
    id: number
    assignment?: AssignmentRef | number
    trainee?: TraineeRef | number
    enrollment?: { id: number; course?: CourseRef | number } | number
    status: 'draft' | 'submitted' | 'graded' | 'returned_for_revision'
    submittedText?: any
    uploadedFiles?: MediaRef[] | number[]
    score?: number
    feedback?: any
    submittedAt?: string
    gradedAt?: string
    gradedBy?: { id: number; firstName?: string; lastName?: string } | number
    createdAt: string
    updatedAt: string
}

export interface SubmissionListResult {
    docs: AssignmentSubmissionDoc[]
    totalDocs: number
    page: number
    limit: number
    totalPages: number
}

export async function getAssignmentSubmissions(params: {
    search?: string
    status?: string
    page?: number
    limit?: number
    sort?: string
}): Promise<SubmissionListResult> {
    const queryParts: string[] = ['depth=2']

    if (params.search) {
        queryParts.push(`where[or][0][trainee.user.firstName][like]=${encodeURIComponent(params.search)}`)
        queryParts.push(`where[or][1][trainee.user.lastName][like]=${encodeURIComponent(params.search)}`)
        queryParts.push(`where[or][2][assignment.title][like]=${encodeURIComponent(params.search)}`)
    }
    if (params.status) {
        queryParts.push(`where[and][status][equals]=${encodeURIComponent(params.status)}`)
    }
    if (params.page) queryParts.push(`page=${params.page}`)
    if (params.limit) queryParts.push(`limit=${params.limit}`)
    queryParts.push(`sort=${params.sort || '-createdAt'}`)

    return authFetch<SubmissionListResult>(`/assignment-submissions?${queryParts.join('&')}`)
}

export async function getAssignmentSubmission(id: number): Promise<AssignmentSubmissionDoc> {
    return authFetch<AssignmentSubmissionDoc>(`/assignment-submissions/${id}?depth=2`)
}

export async function deleteAssignmentSubmission(id: number): Promise<void> {
    await authFetch<{ id: number }>(`/assignment-submissions/${id}`, {
        method: 'DELETE',
    })
}
