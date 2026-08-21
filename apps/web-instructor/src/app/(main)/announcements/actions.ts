'use server'

import { cookies } from 'next/headers'
import { createAnnouncementsService } from '@encreasl/course-actions'
import type {
  AnnouncementCourseOption,
  AnnouncementDoc,
  AnnouncementsListFilters,
  AnnouncementsListResult,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createAnnouncementsService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'instructor',
})

// Resolves the signed-in user from the app's own session cookie. The backend
// endpoint takes over instructor context resolution, course ownership scoping,
// attribution, and all domain transforms.
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

export async function getAnnouncements(params: AnnouncementsListFilters): Promise<AnnouncementsListResult> {
  const userId = await getUserId()
  return service.getAnnouncements(params, userId)
}

export async function getAnnouncement(id: number): Promise<AnnouncementDoc> {
  const userId = await getUserId()
  return service.getAnnouncement(id, userId)
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<AnnouncementDoc> {
  const userId = await getUserId()
  return service.createAnnouncement(data, userId)
}

export async function updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<AnnouncementDoc> {
  const userId = await getUserId()
  return service.updateAnnouncement(id, data, userId)
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const userId = await getUserId()
  return service.deleteAnnouncement(id, userId)
}

export async function getCourseOptions(): Promise<AnnouncementCourseOption[]> {
  const userId = await getUserId()
  return service.getCourseOptions(userId)
}