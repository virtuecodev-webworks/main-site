'use client'

import React, { useEffect, useState } from 'react'
import { Download, Bell, BellRing, Check, Smartphone, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
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
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true)
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

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
      setIsInstallable(false)
    }
    setDeferredPrompt(null)
  }

  const handleNotificationRequest = async () => {
    if (!('Notification' in window)) {
      alert('Push notifications are not supported in this browser.')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === 'granted') {
        new Notification('Virtue & Co. Webworks', {
          body: 'Notifications enabled! You will receive live project updates and delivery milestones.',
          icon: '/brand/logo.svg',
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (dismissed) return null
  if (isInstalled && notificationPermission === 'granted') return null

  return (
    <div
      className={`rounded-2xl border border-primary/20 bg-card/95 p-4 sm:p-5 shadow-lg backdrop-blur-md font-sans text-foreground ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Install App &amp; Real-Time Alerts
            </h4>
            <p className="text-xs text-muted-foreground">
              Add Virtue &amp; Co. to your home screen/desktop and receive instant delivery tracker updates.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-1">
        {/* PWA Install Button */}
        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            disabled={!isInstallable && !deferredPrompt}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install Web App</span>
          </button>
        )}

        {/* Notifications Button */}
        {notificationPermission !== 'granted' ? (
          <button
            type="button"
            onClick={handleNotificationRequest}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Bell className="h-3.5 w-3.5 text-primary" />
            <span>Enable Push Notifications</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            <span>Notifications Active</span>
          </div>
        )}
      </div>
    </div>
  )
}
