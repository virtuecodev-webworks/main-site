'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type BannerState = 'idle' | 'installing' | 'requesting-permission' | 'done' | 'dismissed'

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [bannerState, setBannerState] = useState<BannerState>('idle')
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed or if running as installed PWA
    const dismissed = localStorage.getItem('vcw-pwa-dismissed')
    const isPwa = window.matchMedia('(display-mode: standalone)').matches
    if (dismissed || isPwa) {
      setIsInstalled(isPwa)
      return
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered:', reg.scope)
        })
        .catch((err) => console.error('[PWA] SW registration failed:', err))
    }

    // Capture install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Also check if notifications are pending (already installed but not subscribed)
    if ('Notification' in window && Notification.permission === 'default') {
      setIsVisible(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    setBannerState('installing')
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setBannerState('requesting-permission')
      setDeferredPrompt(null)
      await handleNotifications()
    } else {
      setBannerState('idle')
    }
  }, [deferredPrompt])

  const handleNotifications = useCallback(async () => {
    setBannerState('requesting-permission')

    if (!('Notification' in window)) {
      setBannerState('done')
      return
    }

    const permission = await Notification.requestPermission()

    if (permission === 'granted' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

        if (!vapidKey) {
          console.warn('[PWA] VAPID public key not set')
          setBannerState('done')
          return
        }

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
        })

        // Save subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            userAgent: navigator.userAgent,
          }),
        })
      } catch (err) {
        console.error('[PWA] Push subscription failed:', err)
      }
    }

    setBannerState('done')
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem('vcw-pwa-dismissed', 'done')
    }, 2000)
  }, [])

  const handleDismiss = () => {
    setBannerState('dismissed')
    setIsVisible(false)
    localStorage.setItem('vcw-pwa-dismissed', 'dismissed')
  }

  if (!isVisible || isInstalled || bannerState === 'dismissed') return null

  return (
    <div
      role="dialog"
      aria-label="Install Virtue & Co. Webworks App"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: 'linear-gradient(145deg, #0F1219 0%, #0A0D14 100%)' }}>
        
        {/* Gold top accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #DCAA28, #F59E0B, #14A06C)' }} />

        <div className="p-6 sm:p-8">
          {/* Logo + headline */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-lg"
              style={{ background: '#08090C' }}>
              <Image
                src="/brand/logo-mark.png"
                alt="Virtue & Co."
                width={56}
                height={56}
                className="object-contain p-1"
              />
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest uppercase mb-1"
                style={{ color: '#DCAA28' }}>
                Install App
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Virtue &amp; Co. Webworks
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">virtuecowebworks.solutions</p>
            </div>
          </div>

          {/* Features list */}
          <ul className="space-y-2.5 mb-7">
            {[
              { icon: '🔔', text: 'Instant notifications for new client enquiries' },
              { icon: '⚡', text: 'Lightning-fast offline access to the admin dashboard' },
              { icon: '📱', text: 'Native app experience on any device' },
              { icon: '🔒', text: 'Secure — no data stored on third-party servers' },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-base leading-none mt-0.5">{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {bannerState === 'done' ? (
            <div className="text-center py-3">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm font-semibold text-emerald-400">You&apos;re all set!</p>
              <p className="text-xs text-slate-400 mt-1">Notifications enabled. Check your home screen for the app.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Install button (shown if install prompt available) */}
              {deferredPrompt && (
                <button
                  onClick={handleInstall}
                  disabled={bannerState === 'installing'}
                  className="w-full rounded-xl py-3 px-6 text-sm font-bold text-obsidian transition-all disabled:opacity-70"
                  style={{
                    background: bannerState === 'installing'
                      ? '#8a6818'
                      : 'linear-gradient(135deg, #DCAA28 0%, #F59E0B 100%)',
                    color: '#08090C',
                  }}
                >
                  {bannerState === 'installing' ? 'Installing…' : '⬇  Add to Home Screen'}
                </button>
              )}

              {/* Enable notifications button */}
              {bannerState !== 'installing' && (
                <button
                  onClick={handleNotifications}
                  disabled={bannerState === 'requesting-permission'}
                  className="w-full rounded-xl py-3 px-6 text-sm font-bold border transition-all disabled:opacity-70"
                  style={{
                    borderColor: '#14A06C',
                    color: '#14A06C',
                    background: 'rgba(20,160,108,0.06)',
                  }}
                >
                  {bannerState === 'requesting-permission'
                    ? 'Requesting permission…'
                    : '🔔  Enable Push Notifications'}
                </button>
              )}

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                className="w-full text-xs text-slate-500 py-2 hover:text-slate-400 transition-colors"
              >
                Maybe later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── VAPID key conversion helper ──────────────────────────────────────────────
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
