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

export type PayoutStatus = 'draft' | 'calculated' | 'approved' | 'paid' | 'voided'

export interface InstructorUser {
    id: number
    firstName?: string
    lastName?: string
    email?: string
}

export interface InstructorRef {
    id: number
    user?: InstructorUser | number
    specialization?: string
}

export interface CourseRef {
    id: number
    title?: string
    courseCode?: string
}

export interface PayoutDoc {
    id: number
    instructor?: InstructorRef | number | null
    course?: CourseRef | number | null
    periodStart: string
    periodEnd: string
    sourceType: string
    sourceReference: string
    calculatedAmount: number
    approvedAmount?: number | null
    status: PayoutStatus
    notes?: string | null
    createdBy?: { id: number } | null
    updatedBy?: { id: number } | null
    createdAt: string
    updatedAt: string
}

export interface PayoutListResult {
    docs: PayoutDoc[]
    totalDocs: number
    page: number
    limit: number
    totalPages: number
}

const STATUS_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
    draft: ['calculated'],
    calculated: ['approved'],
    approved: ['paid', 'voided'],
    paid: [],
    voided: [],
}

const ACTION_TARGET: Record<string, PayoutStatus> = {
    calculate: 'calculated',
    approve: 'approved',
    pay: 'paid',
    void: 'voided',
}

function canTransition(status: PayoutStatus, action: string): boolean {
    const target = ACTION_TARGET[action]
    if (!target) return false
    return STATUS_TRANSITIONS[status]?.includes(target) ?? false
}

export async function getPayouts(params: {
    search?: string
    status?: string
    page?: number
    limit?: number
    sort?: string
}): Promise<PayoutListResult> {
    const queryParts: string[] = ['depth=2']

    if (params.search) {
        queryParts.push(`where[or][0][sourceReference][like]=${encodeURIComponent(params.search)}`)
    }

    if (params.status && params.status !== 'all') {
        queryParts.push(`where[status][equals]=${encodeURIComponent(params.status)}`)
    }

    if (params.page) queryParts.push(`page=${params.page}`)
    if (params.limit) queryParts.push(`limit=${params.limit}`)
    queryParts.push(`sort=${params.sort || '-createdAt'}`)

    return authFetch<PayoutListResult>(`/accounting-instructor-payouts?${queryParts.join('&')}`)
}

export async function getPayout(id: number): Promise<PayoutDoc> {
    return authFetch<PayoutDoc>(`/accounting-instructor-payouts/${id}?depth=2`)
}

export interface CreatePayoutData {
    instructor: number
    course: number
    periodStart: string
    periodEnd: string
    sourceType?: string
    sourceReference?: string
    calculatedAmount?: number
    approvedAmount?: number
    notes?: string
}

export async function createPayout(data: CreatePayoutData): Promise<PayoutDoc> {
    return authFetch<PayoutDoc>('/accounting-instructor-payouts', {
        method: 'POST',
        body: JSON.stringify({
            ...data,
            sourceType: data.sourceType || 'course_activity',
            status: 'draft',
        }),
    })
}

export interface UpdatePayoutData {
    instructor?: number
    course?: number
    periodStart?: string
    periodEnd?: string
    sourceType?: string
    sourceReference?: string
    calculatedAmount?: number
    approvedAmount?: number | null
    status?: PayoutStatus
    notes?: string | null
}

export async function updatePayout(id: number, data: UpdatePayoutData): Promise<PayoutDoc> {
    return authFetch<PayoutDoc>(`/accounting-instructor-payouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
}

export async function deletePayout(id: number): Promise<void> {
    await authFetch<{ id: number }>(`/accounting-instructor-payouts/${id}`, {
        method: 'DELETE',
    })
}

export async function transitionPayoutStatus(id: number, action: string): Promise<PayoutDoc> {
    const current = await getPayout(id)
    const targetStatus = ACTION_TARGET[action]

    if (!targetStatus) {
        throw new Error(`Invalid action: ${action}`)
    }

    if (!canTransition(current.status, action)) {
        throw new Error(`Cannot transition from "${current.status}" to "${targetStatus}"`)
    }

    const updateData: UpdatePayoutData = { status: targetStatus }

    if (action === 'approve') {
        updateData.approvedAmount = current.calculatedAmount
    }

    return updatePayout(id, updateData)
}

export interface InstructorOption {
    id: number
    name: string
    email: string
    specialization: string
}

export async function getInstructorOptions(): Promise<InstructorOption[]> {
    const data = await authFetch<{ docs: any[] }>('/instructors?depth=1&limit=200&sort=id')
    return (data.docs || []).map((i: any) => {
        const user = typeof i.user === 'object' && i.user ? i.user : null
        return {
            id: i.id,
            name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || `Instructor #${i.id}` : `Instructor #${i.id}`,
            email: user?.email || '',
            specialization: i.specialization || '',
        }
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
