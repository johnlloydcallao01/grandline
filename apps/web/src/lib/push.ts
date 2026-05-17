type PushState = {
  supported: boolean
  permission: NotificationPermission | 'unsupported'
  subscribed: boolean
}

function base64UrlToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const normalized = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(normalized)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

function getPublicVapidKey() {
  const key = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY')
  }
  return key
}

export function isWebPushSupported() {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

async function ensureNotificationPermission() {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    throw new Error('Browser notifications are not available in this environment')
  }

  if (Notification.permission === 'granted') {
    return 'granted' as const
  }

  if (Notification.permission === 'denied') {
    throw new Error('Browser notification permission is blocked. Please re-enable notifications for this site in your browser settings, then try again.')
  }

  const permission = await Notification.requestPermission()

  if (permission === 'granted') {
    return permission
  }

  if (permission === 'denied') {
    throw new Error('Browser notification permission was denied. Please enable notifications for this site in your browser settings to use web push.')
  }

  throw new Error('Browser notification permission prompt was dismissed. Please click Enable again and allow notifications.')
}

export async function registerPushServiceWorker() {
  if (!isWebPushSupported()) {
    throw new Error('Web push is not supported in this browser')
  }

  return navigator.serviceWorker.register('/push-sw.js', {
    scope: '/',
  })
}

export async function getWebPushState(): Promise<PushState> {
  if (!isWebPushSupported()) {
    return {
      supported: false,
      permission: 'unsupported',
      subscribed: false,
    }
  }

  const registration = await registerPushServiceWorker()
  const subscription = await registration.pushManager.getSubscription()

  return {
    supported: true,
    permission: Notification.permission,
    subscribed: !!subscription,
  }
}

export async function enableWebPush() {
  if (!isWebPushSupported()) {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      throw new Error('Web push requires a secure context. Use HTTPS or localhost to enable browser notifications.')
    }

    throw new Error('Web push is not supported in this browser')
  }

  await ensureNotificationPermission()

  const registration = await registerPushServiceWorker()
  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(getPublicVapidKey()),
    })
  }

  const response = await fetch('/api/push/subscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      permissionState: Notification.permission,
    }),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(result?.error || 'Failed to save push subscription')
  }

  return subscription
}

export async function disableWebPush() {
  if (!isWebPushSupported()) return

  const registration = await registerPushServiceWorker()
  const subscription = await registration.pushManager.getSubscription()

  if (subscription) {
    await fetch('/api/push/subscription', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    })

    await subscription.unsubscribe()
  }
}
