/* global self, URL */

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  const payload = event.data.json()
  const title = payload.title || 'Grandline Maritime'
  const body = payload.body || 'You have a new notification.'
  const url = payload.url || '/portal/account'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/grandline-logo.png',
      badge: '/notification-badge-96.png',
      tag: payload.tag || 'grandline-web-push',
      data: {
        url,
        ...(payload.data || {}),
      },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/portal/account'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        const absoluteUrl = targetUrl.startsWith('http')
          ? targetUrl
          : new URL(targetUrl, self.location.origin).toString()

        return self.clients.openWindow(absoluteUrl)
      }

      return undefined
    }),
  )
})
