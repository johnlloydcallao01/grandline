'use server'

import { cookies } from 'next/headers'
import { createLessonService } from '@encreasl/course-actions'
import type {
  CreateLessonInput,
  LessonDoc,
  LessonEditData,
  LessonListFilters,
  LessonListResult,
  LessonModuleOption,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createLessonService({
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

export async function getLessons(params: LessonListFilters): Promise<LessonListResult> {
  const userId = await getUserId()
  return service.getLessons(params, userId)
}

export async function getLessonById(id: string): Promise<LessonEditData> {
  const userId = await getUserId()
  return service.getLessonEditData(id, userId)
}

export async function createLesson(data: CreateLessonInput): Promise<LessonDoc> {
  const userId = await getUserId()
  return service.createLesson(data, userId)
}

export async function updateLesson(id: string, data: Record<string, unknown>): Promise<LessonDoc> {
  const userId = await getUserId()
  return service.updateLesson(id, data, userId)
}

export async function deleteLesson(id: string): Promise<void> {
  const userId = await getUserId()
  return service.deleteLesson(id, userId)
}

export async function getModuleOptions(): Promise<LessonModuleOption[]> {
  const userId = await getUserId()
  return service.getModuleOptions(userId)
}