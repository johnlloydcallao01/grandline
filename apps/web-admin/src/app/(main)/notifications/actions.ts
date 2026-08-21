'use server'

import { getServerUser } from '@/app/actions/auth'
import { createNotificationsService } from '@encreasl/course-actions'
import type {
  CreateNotificationData,
  CreateTemplateData,
  NotificationDoc,
  NotificationTemplateDoc,
  NotificationTemplateOption,
  NotificationUserOption,
  NotificationsListFilters,
  NotificationsListResult,
  TemplateListFilters,
  TemplateListResult,
  UpdateNotificationData,
  UpdateTemplateData,
} from '@encreasl/cms-types'

const CMS_API = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.PAYLOAD_API_KEY

const service = createNotificationsService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
})

// The backend admin endpoint takes over all fetching, scoping, filtering, and
// stats. We only resolve the signed-in admin's user id so newly created
// notifications are attributed to the real admin (the local API route sees no
// req.user, so it relies on an explicit userId).
async function getAdminUserId(): Promise<string | undefined> {
  const user = await getServerUser()
  return user?.id != null ? String(user.id) : undefined
}

export async function getNotifications(params: NotificationsListFilters): Promise<NotificationsListResult> {
  return service.getNotifications(params)
}

export async function getNotification(id: number): Promise<NotificationDoc> {
  return service.getNotification(id)
}

export async function createNotification(data: CreateNotificationData): Promise<NotificationDoc> {
  return service.createNotification(data, await getAdminUserId())
}

export async function updateNotification(id: number, data: UpdateNotificationData): Promise<NotificationDoc> {
  return service.updateNotification(id, data)
}

export async function deleteNotification(id: number): Promise<void> {
  return service.deleteNotification(id)
}

export async function getUserOptions(search?: string): Promise<NotificationUserOption[]> {
  return service.getUserOptions(search)
}

export async function getTemplates(params: TemplateListFilters): Promise<TemplateListResult> {
  return service.getTemplates(params)
}

export async function getTemplate(id: number): Promise<NotificationTemplateDoc> {
  return service.getTemplate(id)
}

export async function createTemplate(data: CreateTemplateData): Promise<NotificationTemplateDoc> {
  return service.createTemplate(data)
}

export async function updateTemplate(id: number, data: UpdateTemplateData): Promise<NotificationTemplateDoc> {
  return service.updateTemplate(id, data)
}

export async function deleteTemplate(id: number): Promise<void> {
  return service.deleteTemplate(id)
}

export async function getTemplateOptions(): Promise<NotificationTemplateOption[]> {
  return service.getTemplateOptions()
}