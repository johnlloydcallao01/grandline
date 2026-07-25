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

export interface AssessmentRef {
    id: number
    title?: string
    assessmentType?: string
}

export interface CourseRef {
    id: number
    title?: string
}

export interface AssessmentSubmissionDoc {
    id: number
    trainee?: TraineeRef | number
    enrollment?: any
    assessment?: AssessmentRef | number
    course?: CourseRef | number
    status: 'in_progress' | 'submitted' | 'graded'
    attemptNumber: number
    score?: number
    pointsTotal?: number
    pointsPossible?: number
    passingScoreSnapshot?: number
    startedAt: string
    completedAt?: string
    isLatest?: boolean
    createdAt: string
    updatedAt: string
}

export interface SubmissionListResult {
    docs: AssessmentSubmissionDoc[]
    totalDocs: number
    page: number
    limit: number
    totalPages: number
}

export async function getAssessmentSubmissions(params: {
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
        queryParts.push(`where[or][2][assessment.title][like]=${encodeURIComponent(params.search)}`)
        queryParts.push(`where[or][3][course.title][like]=${encodeURIComponent(params.search)}`)
    }
    if (params.status) {
        queryParts.push(`where[and][status][equals]=${encodeURIComponent(params.status)}`)
    }
    if (params.page) queryParts.push(`page=${params.page}`)
    if (params.limit) queryParts.push(`limit=${params.limit}`)
    queryParts.push(`sort=${params.sort || '-createdAt'}`)

    return authFetch<SubmissionListResult>(`/assessment-submissions?${queryParts.join('&')}`)
}

export interface AnswerDoc {
    id: number
    submission: number
    question: { id: number; prompt?: string; type?: string }
    questionType: string
    response: any
    isCorrect: boolean
    pointsEarned: number
    feedback?: string | null
}

export interface AnswerListResult {
    docs: AnswerDoc[]
}

export async function getSubmissionAnswers(submissionId: number): Promise<AnswerDoc[]> {
    const data = await authFetch<AnswerListResult>(
        `/submission-answers?where[submission][equals]=${submissionId}&depth=2`
    )
    return data.docs || []
}

export async function getAssessmentSubmission(id: number): Promise<AssessmentSubmissionDoc> {
    return authFetch<AssessmentSubmissionDoc>(`/assessment-submissions/${id}?depth=2`)
}

export async function deleteAssessmentSubmission(id: number): Promise<void> {
    await authFetch<{ id: number }>(`/assessment-submissions/${id}`, {
        method: 'DELETE',
    })
}
