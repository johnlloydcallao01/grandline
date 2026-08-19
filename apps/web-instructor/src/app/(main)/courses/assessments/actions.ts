'use server'

import { cookies } from 'next/headers'
import { createAssessmentService } from '@encreasl/course-actions'
import type {
  AssessmentDoc,
  AssessmentEditData,
  AssessmentListFilters,
  AssessmentListResult,
  AssessmentQuestionOption,
  CreateAssessmentInput,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createAssessmentService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'instructor',
})

// Resolves the signed-in user from the app's own session cookie. The backend
// endpoint resolves the instructor context and ownership from this userId.
async function getUserId(): Promise<string> {
  const cookieStore = await cookies()
  const token = cookieStore.get('grandline-instructor-token')?.value
  if (!token) throw new Error('Not authenticated')

  const meRes = await fetch(`${CMS_API}/users/me`, {
    headers: { Authorization: `JWT ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!meRes.ok) throw new Error('Failed to get current user')
  const meData = await meRes.json()
  const userId = meData?.user?.id || meData?.id
  if (!userId) throw new Error('Could not determine user ID')

  return String(userId)
}

export async function getAssessments(params: AssessmentListFilters): Promise<AssessmentListResult> {
  const userId = await getUserId()
  return service.getAssessments(params, userId)
}

export async function getAssessmentById(id: string): Promise<AssessmentEditData> {
  const userId = await getUserId()
  return service.getAssessmentEditData(id, userId)
}

export async function getQuestions(params?: {
  search?: string
  limit?: number
}): Promise<AssessmentQuestionOption[]> {
  const userId = await getUserId()
  return service.getQuestions(params, userId)
}

export async function createAssessment(data: CreateAssessmentInput): Promise<AssessmentDoc> {
  const userId = await getUserId()
  return service.createAssessment(data, userId)
}

export async function updateAssessment(id: string, data: Record<string, unknown>): Promise<AssessmentDoc> {
  const userId = await getUserId()
  return service.updateAssessment(id, data, userId)
}

export async function deleteAssessment(id: string): Promise<void> {
  const userId = await getUserId()
  return service.deleteAssessment(id, userId)
}
