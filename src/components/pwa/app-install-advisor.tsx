'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Download,
  Bell,
  Check,
  Smartphone,
  X,
  Share,
  PlusSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

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

export function AppInstallAdvisor({
  className = '',
}: {
  className?: string
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showIosInstructions, setShowIosInstructions] = useState(false)

  useEffect(() => {
    // 1. Detect if already running in standalone PWA mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standaloneMode)

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    setIsIos(iosDevice)

    // 3. Check session dismissal (resets on every new login / session)
    const sessionDismissed = sessionStorage.getItem('vcw-app-install-dismissed')
    if (sessionDismissed === 'true') {
      setDismissed(true)
    }

    // 4. Register service worker for Web Push across all devices
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker ready for push:', reg.scope)
        })
        .catch((err) => console.warn('[PWA] SW registration notice:', err))
    }

    // 5. Check Notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    // 6. Capture Android/Chromium install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsStandalone(true)
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
    if (isIos) {
      setShowIosInstructions(true)
      return
    }

    if (!deferredPrompt) {
      // If browser doesn't expose prompt, offer notification activation
      return
    }

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setIsStandalone(true)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt, isIos])

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

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('vcw-app-install-dismissed', 'true')
  }

  // If user is already running as an installed standalone app, no need to advise installing
  if (isStandalone) return null
  if (dismissed) return null

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-gold-500/30 bg-[#0a0a0a] p-5 sm:p-6 text-[#f5f4f0] shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* Glow gradient highlight */}
      <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-gold-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Header Row with Recommendation Badge and Close Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/15 px-3 py-1 text-[11px] font-semibold text-gold-300">
            <Sparkles className="size-3 text-gold-300" />
            <span>Recommended: Install Native App</span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss app suggestion"
            className="flex size-7 items-center justify-center rounded-lg text-[#f5f4f0]/60 hover:bg-white/10 hover:text-[#f5f4f0] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Headline & Body */}
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary shadow-inner">
            <Smartphone className="size-6 text-primary" />
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-display text-base font-bold tracking-tight text-[#f5f4f0] sm:text-lg">
              Operating on Web — Switch to App Mode
            </h3>
            <p className="text-xs sm:text-[13px] leading-relaxed text-[#f5f4f0]/70">
              For instant delivery alerts, full-screen mobile workspace, and sound notifications whenever messages or milestones are posted, install Virtue &amp; Co. directly to your device.
            </p>
          </div>
        </div>

        {/* iOS Step-by-Step Instructions when requested */}
        {showIosInstructions && (
          <div className="rounded-xl border border-white/15 bg-white/[0.04] p-4 text-xs text-[#f5f4f0]/90 space-y-2.5">
            <p className="font-semibold text-primary">How to install on iPhone &amp; iPad:</p>
            <div className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-xs">1</span>
              <span>Tap the <strong className="text-white">Share</strong> button <Share className="inline size-3.5 mx-1 text-primary" /> at the bottom of Safari.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-xs">2</span>
              <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="inline size-3.5 mx-1 text-primary" />.</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/10">
          {/* Install / Add Button */}
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-[#0a0a0a] shadow-md transition-all hover:bg-gold-400 active:scale-95"
          >
            <Download className="size-4" />
            <span>{isIos ? 'Add to Home Screen (iOS)' : 'Install App on Phone'}</span>
          </button>

          {/* Enable Notifications Button */}
          {notificationPermission !== 'granted' ? (
            <button
              type="button"
              onClick={handleNotificationRequest}
              disabled={isSubscribing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-[#f5f4f0] hover:bg-white/15 transition-all active:scale-95 disabled:opacity-50"
            >
              <Bell className="size-4 text-primary" />
              <span>{isSubscribing ? 'Activating…' : 'Enable Mobile Push Alerts'}</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
              <Check className="size-3.5" />
              <span>Push Alerts Active</span>
            </div>
          )}

          {/* Dismiss / Continue in Browser */}
          <button
            type="button"
            onClick={handleDismiss}
            className="ml-auto text-xs font-medium text-[#f5f4f0]/50 hover:text-[#f5f4f0] transition-colors py-2 px-1"
          >
            Continue in Browser
          </button>
        </div>
      </div>
    </div>
  )
}
