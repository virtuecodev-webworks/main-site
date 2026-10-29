'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Download, Bell, Check, Smartphone, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PwaInstallPrompt({
  autoShow = false,
  className = '',
}: {
  autoShow?: boolean
  className?: string
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone) {
      setIsInstalled(true)
    }

    // Register service worker across portal & app
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered:', reg.scope)
        })
        .catch((err) => console.warn('[PWA] SW registration notice:', err))
    }

    // Check notification status
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
      setIsInstallable(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  const handleNotificationRequest = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported in this browser.')
      return
    }

    setIsSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === 'granted' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

        let sub = await reg.pushManager.getSubscription()
        if (!sub && vapidPublicKey) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
          })
        }

        if (sub) {
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub }),
          })
        }
      }
    } catch (e) {
      console.warn('[PWA] Push subscription notice:', e)
    } finally {
      setIsSubscribing(false)
    }
  }, [])

  if (dismissed) return null
  if (isInstalled && notificationPermission === 'granted') return null

  return (
    <div
      className={`rounded-2xl border border-primary/25 bg-card/95 p-4 sm:p-5 shadow-lg backdrop-blur-md font-sans text-foreground transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 border border-primary/20">
            <Smartphone className="size-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-[-0.01em]">
              Install Mobile App &amp; Real-Time Alerts
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add Virtue &amp; Co. to your home screen and get instant project message &amp; delivery notifications.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5 pt-1">
        {/* PWA Install Button */}
        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={!isInstallable && !deferredPrompt}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Download className="size-3.5" />
            <span>Install App on Phone</span>
          </button>
        )}

        {/* Notifications Button */}
        {notificationPermission !== 'granted' ? (
          <button
            type="button"
            onClick={handleNotificationRequest}
            disabled={isSubscribing}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-muted/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Bell className="size-3.5 text-primary" />
            <span>{isSubscribing ? 'Enabling…' : 'Enable Mobile Push Alerts'}</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="size-3.5" />
            <span>Push Notifications Active</span>
          </div>
        )}
      </div>
    </div>
  )
}
