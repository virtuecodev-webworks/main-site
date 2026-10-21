/**
 * Virtue & Co. Webworks — Service Worker
 * Handles: Push Notifications, Offline Caching, Install event
 */

const CACHE_NAME = 'vcw-admin-v1'
const OFFLINE_URL = '/offline.html'

// ── Assets to pre-cache for offline admin access ────────────────────────────
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/brand/logo.svg',
  '/brand/logo-mark.png',
]

// ── Install: pre-cache shell assets ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

// ── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: Network-first strategy for admin pages ───────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests; skip cross-origin + API routes
  if (request.method !== 'GET') return
  if (request.url.includes('/api/')) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache successful HTML/JS/CSS responses
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
  )
})

// ── Push: Show native notification ──────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Virtue & Co.', body: event.data.text() }
  }

  const {
    title = 'Virtue & Co. Webworks',
    body = 'You have a new notification.',
    icon = '/brand/logo-mark.png',
    badge = '/brand/logo-mark.png',
    url = '/en/admin',
    tag = 'vcw-notification',
    data = {},
  } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: { url, ...data },
      actions: [
        { action: 'open', title: 'Open Dashboard' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  )
})

// ── Notification Click: open or focus the correct URL ───────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/en/admin'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing tab if already open
        for (const client of windowClients) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus()
          }
        }
        // Otherwise open new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})

// ── Push Subscription Change ─────────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.__VAPID_PUBLIC_KEY__,
      })
      .then((subscription) =>
        fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        })
      )
  )
})
