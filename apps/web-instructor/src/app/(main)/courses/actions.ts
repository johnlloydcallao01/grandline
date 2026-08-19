'use server'

import { cookies } from 'next/headers'
import { createCourseService } from '@encreasl/course-actions'
import type {
  Course,
  CourseEditData,
  CourseListFilters,
  CourseListResult,
  CreateCourseInput,
  SimpleDocRef,
  TagOption,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createCourseService({
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

export async function getCourses(params: CourseListFilters): Promise<CourseListResult> {
  const userId = await getUserId()
  return service.getCourses(params, userId)
}

export async function getCourseEditData(id: string): Promise<CourseEditData> {
  const userId = await getUserId()
  return service.getCourseEditData(id, userId)
}

export async function createCourse(data: CreateCourseInput): Promise<Course> {
  const userId = await getUserId()
  return service.createCourse(data, userId)
}

export async function updateCourse(id: string, data: Record<string, unknown>): Promise<Course> {
  const userId = await getUserId()
  return service.updateCourse(id, data, userId)
}

export async function searchCollection(
  collection: string,
  search: string,
  labelField = 'title',
): Promise<SimpleDocRef[]> {
  return service.searchCollection(collection, search, labelField)
}

export async function getTags(): Promise<TagOption[]> {
  return service.getTags()
}