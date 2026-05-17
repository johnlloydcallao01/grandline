import webpush from 'web-push'

type WebPushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
  data?: Record<string, unknown>
}

type WebPushSubscriptionDoc = {
  id: number | string
  endpoint: string
  p256dh: string
  auth: string
}

let vapidConfigured = false
let missingConfigLogged = false

function ensureVapidConfiguration() {
  if (vapidConfigured) return true

  const subject = process.env.WEB_PUSH_VAPID_SUBJECT
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY

  if (!subject || !publicKey || !privateKey) {
    if (!missingConfigLogged) {
      missingConfigLogged = true
      console.warn('[webPush] VAPID configuration is incomplete. Push delivery is disabled until WEB_PUSH_VAPID_SUBJECT, WEB_PUSH_VAPID_PUBLIC_KEY, and WEB_PUSH_VAPID_PRIVATE_KEY are set.')
    }
    return false
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
  return true
}

function toPushSubscription(doc: WebPushSubscriptionDoc) {
  return {
    endpoint: doc.endpoint,
    keys: {
      p256dh: doc.p256dh,
      auth: doc.auth,
    },
  }
}

async function markSubscriptionStatus(
  payload: any,
  subscriptionId: number | string,
  data: Record<string, unknown>,
) {
  await payload.update({
    collection: 'web-push-subscriptions',
    id: subscriptionId,
    data,
    depth: 0,
    overrideAccess: true,
  })
}

export async function sendWebPushToUser({
  payload,
  userId,
  notificationId,
  push,
}: {
  payload: any
  userId: number | string
  notificationId?: number | string
  push: WebPushPayload
}) {
  if (!ensureVapidConfiguration()) return

  const activeSubscriptions = await payload.find({
    collection: 'web-push-subscriptions',
    where: {
      and: [
        {
          user: {
            equals: userId,
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
      ],
    },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  if (!activeSubscriptions.docs.length) return

  const now = new Date().toISOString()
  const serializedPayload = JSON.stringify({
    title: push.title,
    body: push.body,
    url: push.url,
    tag: push.tag || `notification-${notificationId ?? 'general'}`,
    data: {
      notificationId,
      ...(push.data || {}),
    },
  })

  for (const subscription of activeSubscriptions.docs) {
    try {
      await webpush.sendNotification(
        toPushSubscription(subscription as WebPushSubscriptionDoc),
        serializedPayload,
      )

      await markSubscriptionStatus(payload, subscription.id, {
        lastSuccessAt: now,
        lastSeenAt: now,
        failureReason: null,
      })
    } catch (error: any) {
      const statusCode = error?.statusCode
      const failureReason =
        error?.body ||
        error?.message ||
        'Unknown push delivery failure'

      const subscriptionUpdate: Record<string, unknown> = {
        lastFailureAt: now,
        failureReason: String(failureReason).slice(0, 1000),
      }

      if (statusCode === 404 || statusCode === 410) {
        subscriptionUpdate.isActive = false
      }

      try {
        await markSubscriptionStatus(payload, subscription.id, subscriptionUpdate)
      } catch (updateError) {
        console.error('[webPush] Failed to update subscription status:', updateError)
      }

      console.error('[webPush] Failed to send push notification:', {
        userId,
        notificationId,
        subscriptionId: subscription.id,
        statusCode,
        failureReason,
      })
    }
  }
}
