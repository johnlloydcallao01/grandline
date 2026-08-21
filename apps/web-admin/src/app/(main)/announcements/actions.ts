'use server'

import { getServerUser } from '@/app/actions/auth'
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
  scope: 'admin',
})

// The backend admin endpoint takes over all fetching, scoping, and domain
// transforms. We only resolve the signed-in admin's user id so newly created
// announcements are attributed to the real admin (the local API route sees no
// req.user, so it relies on an explicit userId).
async function getAdminUserId(): Promise<string | undefined> {
  const user = await getServerUser()
  return user?.id != null ? String(user.id) : undefined
}

export async function getAnnouncements(params: AnnouncementsListFilters): Promise<AnnouncementsListResult> {
  return service.getAnnouncements(params)
}

export async function getAnnouncement(id: number): Promise<AnnouncementDoc> {
  return service.getAnnouncement(id)
}

export async function createAnnouncement(data: CreateAnnouncementData): Promise<AnnouncementDoc> {
  return service.createAnnouncement(data, await getAdminUserId())
}

export async function updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<AnnouncementDoc> {
  return service.updateAnnouncement(id, data)
}

export async function deleteAnnouncement(id: number): Promise<void> {
  return service.deleteAnnouncement(id)
}

export async function getCourseOptions(): Promise<AnnouncementCourseOption[]> {
  return service.getCourseOptions()
}