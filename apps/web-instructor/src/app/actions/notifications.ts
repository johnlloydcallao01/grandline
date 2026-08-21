'use server'

import { createNotificationsService } from '@encreasl/course-actions'
import { getCurrentUserId } from '@/lib/notifications'
import type {
  UserNotificationBulkResult,
  UserNotificationDoc,
  UserNotificationsResult,
  UserNotificationUpdateData,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createNotificationsService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'instructor',
})

// The backend /lms/notifications endpoint owns the user-scoped inbox query.
// These actions only resolve the signed-in instructor's user id from their
// cookie and forward the request.
export async function getMyNotifications(): Promise<UserNotificationsResult | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null
  return service.getMyNotifications(userId)
}

export async function markNotification(
  id: number | string,
  data: UserNotificationUpdateData,
): Promise<UserNotificationDoc | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null
  return service.markNotification(id, userId, data)
}

export async function markAllAsRead(): Promise<UserNotificationBulkResult | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null
  return service.markAllRead(userId)
}

export async function markAllAsSeen(): Promise<UserNotificationBulkResult | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null
  return service.markAllSeen(userId)
}

export async function deleteMyNotification(id: number | string): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) return false
  await service.deleteMyNotification(id, userId)
  return true
}