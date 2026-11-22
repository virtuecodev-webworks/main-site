'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  Download,
  Bell,
  Check,
  Smartphone,
  Monitor,
  X,
  Share,
  PlusSquare,
  Sparkles,
  Info,
  ExternalLink,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __pwaPrompt?: BeforeInstallPromptEvent | null
  }
}

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BDJPQeyyxXQ4jLCBXVNXIhJovM6JtzfIMWHTOSpxMhEbrfXnsUM02nD5jmSAk9FnkNw7hkBRmj6-EJ__bS1P6G4'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const clean = base64String.trim().replace(/\s+/g, '')
  const padding = '='.repeat((4 - (clean.length % 4)) % 4)
  const base64 = (clean + padding).replace(/-/g, '+').replace(/_/g, '/')
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
  const [isMobile, setIsMobile] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showManualGuide, setShowManualGuide] = useState(false)

  // Auto-sync push subscription to database whenever permission is granted
  const syncPushSubscription = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return false
    }
    if (Notification.permission !== 'granted') {
      return false
    }

    try {
      const reg = await navigator.serviceWorker.register('/sw.js').catch(() => null)
      const activeReg = reg || (await navigator.serviceWorker.ready.catch(() => null))
      if (!activeReg) return false

      let sub = await activeReg.pushManager.getSubscription()
      if (!sub) {
        sub = await activeReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
        })
      }

      if (sub) {
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON ? sub.toJSON() : sub }),
        })
        return res.ok
      }
    } catch (err) {
      console.warn('[PWA] Push subscription sync notice:', err)
    }
    return false
  }, [])

  useEffect(() => {
    // 1. Detect if running in standalone PWA mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://')
    setIsStandalone(standaloneMode)

    // 2. Detect device type & OS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    const mobileDevice = /android|iphone|ipad|ipod|mobile|phone/i.test(userAgent)
    setIsIos(iosDevice)
    setIsMobile(mobileDevice)

    // 3. Check session dismissal
    const sessionDismissed = sessionStorage.getItem('vcw-app-install-dismissed')
    if (sessionDismissed === 'true') {
      setDismissed(true)
    }

    // 4. Ensure service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker active:', reg.scope)
        })
        .catch((err) => console.warn('[PWA] SW notice:', err))
    }

    // 5. Check Notification permission & auto-sync if granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
      if (Notification.permission === 'granted') {
        syncPushSubscription()
      }
    }

    // 6. Capture early or pending beforeinstallprompt event
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt)
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      window.__pwaPrompt = promptEvent
      setDeferredPrompt(promptEvent)
    }

    const handleAppInstalled = () => {
      setIsStandalone(true)
      setDeferredPrompt(null)
      window.__pwaPrompt = null
      setShowManualGuide(false)
      toast.success('Virtue & Co. installed successfully!')
    }

    const handlePwaReady = () => {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('pwa-ready', handlePwaReady)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('pwa-ready', handlePwaReady)
    }
  }, [])

  // 1-Click Install Handler
  const handleInstallClick = useCallback(async () => {
    // If on iOS Safari, show the standard iOS 2-step guide
    if (isIos) {
      setShowManualGuide(true)
      return
    }

    // Retrieve active prompt (from state or global window cache)
    const promptEvent = deferredPrompt || window.__pwaPrompt

    if (promptEvent) {
      try {
        await promptEvent.prompt()
        const choice = await promptEvent.userChoice
        if (choice.outcome === 'accepted') {
          setIsStandalone(true)
          toast.success('Virtue & Co. app is being installed to your device.')
        } else {
          toast.info('Installation dismissed. You can install anytime from this banner.')
        }
        setDeferredPrompt(null)
        window.__pwaPrompt = null
      } catch (err) {
        console.warn('[PWA] Prompt error:', err)
        setShowManualGuide(true)
      }
    } else {
      // Browser didn't expose native prompt (or already installed / requires manual action)
      setShowManualGuide(true)
      if (isMobile) {
        toast.info('Tap Chrome menu (⋮) then "Install app" or "Add to Home screen"')
      } else {
        toast.info('Click the Install icon (💻) in your browser address bar')
      }
    }
  }, [deferredPrompt, isIos, isMobile])

  // 1-Click Push Notification Handler (Stage 2: Only after installation)
  const handleNotificationRequest = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser.')
      return
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications are blocked in your browser settings. Please enable notifications for this site.')
      return
    }

    setIsSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === 'denied') {
        toast.error('Notification permission was declined. You can enable it in your browser settings.')
        return
      }

      if (permission === 'granted') {
        const synced = await syncPushSubscription()
        if (synced) {
          toast.success('Push notifications active! Instant alerts enabled.')
        } else {
          toast.success('Push notification permission granted.')
        }
      }
    } catch (e) {
      console.warn('[PWA] Push subscription notice:', e)
      toast.error('Could not complete push registration. Please check browser settings.')
    } finally {
      setIsSubscribing(false)
    }
  }, [syncPushSubscription])

  const handleSendTestPush = useCallback(async () => {
    setIsSendingTest(true)
    try {
      await syncPushSubscription()

      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Virtue & Co. Test Alert 🔔',
          body: 'Push alerts are working perfectly across your devices!',
          url: '/en/admin',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        if (data.sent > 0) {
          toast.success(`Test push delivered to ${data.sent} device(s)!`)
        } else {
          toast.warning('Push dispatched. Tap "Enable" above if not yet active.')
        }
      } else {
        toast.error(data.error || 'Failed to dispatch test notification.')
      }
    } catch (err) {
      toast.error('Network error dispatching test push.')
    } finally {
      setIsSendingTest(false)
    }
  }, [syncPushSubscription])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('vcw-app-install-dismissed', 'true')
  }

  // If already dismissed, hide
  if (dismissed) return null

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 2: App IS Installed (Standalone mode)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isStandalone) {
    return (
      <div
        className={`relative overflow-hidden rounded-[24px] border border-amber-500/30 bg-[#0a0a0a] p-5 sm:p-6 text-[#f5f4f0] shadow-2xl backdrop-blur-xl ${className}`}
      >
        <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-300">
              <Sparkles className="size-3 text-amber-300" />
              <span>{notificationPermission === 'granted' ? 'Native App Mode Active' : 'Recommended: Enable Push Alerts'}</span>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss notification suggestion"
              className="flex size-7 items-center justify-center rounded-lg text-[#f5f4f0]/60 hover:bg-white/10 hover:text-[#f5f4f0] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-400 shadow-inner">
              <Bell className="size-6 text-amber-300" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-display text-base font-bold tracking-tight text-[#f5f4f0] sm:text-lg">
                {notificationPermission === 'granted'
                  ? 'App Installed — Push Alerts Active'
                  : 'App Installed — Activate Instant Push Alerts'}
              </h3>
              <p className="text-xs sm:text-[13px] leading-relaxed text-[#f5f4f0]/70">
                {notificationPermission === 'granted'
                  ? 'Instant notifications are enabled on this device. Tap "Send Test Alert" below to test lock screen push delivery.'
                  : 'Receive instant sound notifications for new order inquiries, project delivery updates, and direct client messages directly on your device.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/10">
            {notificationPermission === 'granted' ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-400">
                  <Check className="size-4" />
                  <span>Push Alerts Active</span>
                </span>
                <button
                  type="button"
                  onClick={handleSendTestPush}
                  disabled={isSendingTest}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-[#0a0a0a] shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  <Send className="size-4" />
                  <span>{isSendingTest ? 'Sending Test…' : 'Send Test Alert'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleNotificationRequest}
                disabled={isSubscribing}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-[#0a0a0a] shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Bell className="size-4 fill-current" />
                <span>{isSubscribing ? 'Activating Alerts…' : 'Enable Mobile Push Alerts'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDismiss}
              className="ml-auto text-xs font-medium text-[#f5f4f0]/50 hover:text-[#f5f4f0] transition-colors py-2 px-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STAGE 1: Running on Web -> Suggest Installing App First
  // (Notifications are intentionally NOT shown until the app is installed)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-amber-500/30 bg-[#0a0a0a] p-5 sm:p-6 text-[#f5f4f0] shadow-2xl backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header Badge & Close */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-300">
            <Sparkles className="size-3 text-amber-300" />
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
            {isMobile ? <Smartphone className="size-6 text-primary" /> : <Monitor className="size-6 text-primary" />}
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-display text-base font-bold tracking-tight text-[#f5f4f0] sm:text-lg">
              Operating on Web — Switch to App Mode
            </h3>
            <p className="text-xs sm:text-[13px] leading-relaxed text-[#f5f4f0]/70">
              For instant delivery alerts, full-screen {isMobile ? 'mobile' : 'desktop'} workspace, and sound notifications whenever messages or milestones are posted, install Virtue &amp; Co. directly to your device.
            </p>
          </div>
        </div>

        {/* 1-Click Browser-Specific Install Guidance (if native prompt is bypassed or on iOS) */}
        {showManualGuide && (
          <div className="rounded-xl border border-white/15 bg-white/[0.04] p-4 text-xs text-[#f5f4f0]/90 space-y-2.5">
            <p className="font-semibold text-primary flex items-center gap-1.5">
              <Info className="size-3.5" />
              <span>Easy 1-Click Install Instructions:</span>
            </p>

            {isIos ? (
              <div className="space-y-2 text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px]">1</span>
                  <span>Tap the <strong className="text-white">Share</strong> icon <Share className="inline size-3.5 mx-0.5 text-primary" /> at the bottom of Safari.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px]">2</span>
                  <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="inline size-3.5 mx-0.5 text-primary" />.</span>
                </div>
              </div>
            ) : isMobile ? (
              <div className="space-y-2 text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px]">1</span>
                  <span>Tap the <strong className="text-white">three dots (⋮)</strong> in Chrome’s top-right corner.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px]">2</span>
                  <span>Tap <strong className="text-white">Install app</strong> or <strong className="text-white">Add to Home screen</strong>.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-neutral-300">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px]">1</span>
                  <span>Click the <strong className="text-white">Install icon</strong> (💻 or ⊕) on the right side of the address bar.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-[11px]">2</span>
                  <span>Or open browser menu <strong className="text-white">(⋮)</strong> → <strong className="text-white">Install Virtue &amp; Co.</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/10">
          {/* Primary Install Button */}
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-[#0a0a0a] shadow-md transition-all hover:brightness-110 active:scale-95"
          >
            <Download className="size-4" />
            <span>
              {isIos
                ? 'Add to Home Screen (iOS)'
                : isMobile
                  ? 'Install App on Phone'
                  : 'Install App on Desktop'}
            </span>
          </button>

          {/* If push notifications are active, expose the 1-click Test Alert button right here! */}
          {notificationPermission === 'granted' && (
            <button
              type="button"
              onClick={handleSendTestPush}
              disabled={isSendingTest}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/15 px-4 py-2.5 text-xs font-semibold text-primary shadow-sm hover:bg-primary/25 active:scale-95 transition-all disabled:opacity-50"
            >
              <Send className="size-4" />
              <span>{isSendingTest ? 'Sending Test…' : 'Send Test Alert'}</span>
            </button>
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
