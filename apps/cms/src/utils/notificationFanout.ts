import { broadcastNotification } from './supabaseNotifications'
import { sendWebPushToUser } from './webPush'

type NotificationFanoutArgs = {
  payload: any
  userId: number | string
  templateCode?: string
  category: 'learning' | 'account' | 'system-update' | 'other'
  title: string
  body: string
  link?: string
  metadata?: Record<string, unknown>
  sourceType: 'course' | 'lesson' | 'assessment' | 'announcement' | 'enrollment' | 'certificate' | 'system' | 'other'
  sourceId?: string
  audienceType?: 'all-users' | 'specific-users' | 'role-based' | 'segment'
  push?: {
    title: string
    body: string
    url?: string
    data?: Record<string, unknown>
  }
}

export async function createNotificationFanout({
  payload,
  userId,
  templateCode,
  category,
  title,
  body,
  link,
  metadata,
  sourceType,
  sourceId,
  audienceType = 'specific-users',
  push,
}: NotificationFanoutArgs) {
  let templateId: number | string | undefined

  if (templateCode) {
    const templateResult = await payload.find({
      collection: 'notification-templates',
      where: {
        code: {
          equals: templateCode,
        },
      },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    templateId = templateResult.docs[0]?.id
  }

  const deliveredAt = new Date().toISOString()

  const notification = await payload.create({
    collection: 'notifications',
    data: {
      ...(templateId ? { template: templateId } : {}),
      category,
      title,
      body,
      metadata,
      sourceType,
      sourceId,
      origin: 'automatic',
      audienceType,
      status: 'sent',
    },
    depth: 0,
    overrideAccess: true,
  })

  const userNotification = await payload.create({
    collection: 'user-notifications',
    data: {
      user: userId,
      notification: notification.id,
      category,
      title,
      body,
      link,
      metadata,
      channel: 'in-app',
      deliveredAt,
    },
    depth: 0,
    overrideAccess: true,
  })

  await broadcastNotification(userId, {
    id: userNotification.id,
    title,
    body,
    category,
    link,
    metadata,
    deliveredAt,
  })

  if (push) {
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
      overrideAccess: true,
    })

    if (user?.pushNotificationsEnabled !== false) {
      await sendWebPushToUser({
        payload,
        userId,
        notificationId: userNotification.id,
        push: {
          title: push.title,
          body: push.body,
          url: push.url || link,
          data: {
            category,
            ...(metadata || {}),
            ...(push.data || {}),
          },
        },
      })
    }
  }

  return {
    notification,
    userNotification,
  }
}
