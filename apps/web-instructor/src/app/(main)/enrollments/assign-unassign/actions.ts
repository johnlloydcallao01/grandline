'use server'

import { unstable_noStore as noStore } from 'next/cache'
import { cookies } from 'next/headers'
import { createEnrollmentService } from '@encreasl/course-actions'
import type {
  CourseOption,
  CreateEnrollmentInput,
  EnrollmentDoc,
  EnrollmentFilters,
  EnrollmentListResult,
  TraineeOption,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createEnrollmentService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'instructor',
})

// Resolves the signed-in user from the app's own session cookie. The backend
// endpoint resolves the instructor context from this userId server-side.
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

export async function getEnrollments(params: EnrollmentFilters): Promise<EnrollmentListResult> {
  noStore()
  const userId = await getUserId()
  return service.getEnrollments({ ...params, userId })
}

export async function getEnrollment(id: string): Promise<EnrollmentDoc> {
  noStore()
  const userId = await getUserId()
  return service.getEnrollment(id, userId)
}

export async function searchCourses(search: string, limit?: number): Promise<CourseOption[]> {
  const userId = await getUserId()
  return service.searchCourses(search, limit, userId)
}

export async function searchTrainees(search: string): Promise<TraineeOption[]> {
  return service.searchTrainees(search)
}

export async function createEnrollment(data: CreateEnrollmentInput): Promise<EnrollmentDoc> {
  const userId = await getUserId()
  return service.createEnrollment({ ...data, userId })
}

export async function updateEnrollment(id: string, data: Partial<CreateEnrollmentInput>): Promise<void> {
  const userId = await getUserId()
  return service.updateEnrollment(id, data, userId)
}

export async function updateEnrollmentStatus(id: string, status: string): Promise<void> {
  const userId = await getUserId()
  return service.updateEnrollmentStatus(id, status, userId)
}

export async function unassignEnrollment(id: string): Promise<void> {
  const userId = await getUserId()
  return service.unassignEnrollment(id, userId)
}
