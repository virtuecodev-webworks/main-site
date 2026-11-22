'use client'

import * as React from 'react'
import { Bell, Check, Send, Smartphone, Volume2, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

export interface NotificationItem {
  id: string
  title: string
  body: string
  timestamp: string
  href?: string
  read?: boolean
}

export function NotificationBellSheet({
  unreadCount = 0,
  notifications = [],
}: {
  unreadCount?: number
  notifications?: NotificationItem[]
}) {
  const [open, setOpen] = React.useState(false)
  const [permission, setPermission] = React.useState<NotificationPermission>('default')
  const [isSubscribing, setIsSubscribing] = React.useState(false)
  const [isSendingTest, setIsSendingTest] = React.useState(false)

  React.useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleSubscribe = async () => {
    if (!('Notification' in window)) {
      toast.error('Push notifications are not supported in this browser.')
      return
    }

    setIsSubscribing(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm === 'granted' && 'serviceWorker' in navigator) {
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
          const res = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub.toJSON ? sub.toJSON() : sub }),
          })
          if (res.ok) {
            toast.success('Push notifications active for this device!')
          } else {
            const data = await res.json().catch(() => ({}))
            toast.error(data.error || 'Failed to register subscription with server.')
          }
        } else {
          toast.info('Notification permission granted.')
        }
      } else if (perm === 'denied') {
        toast.error('Notifications blocked in browser settings.')
      }
    } catch (err) {
      console.warn('[Notifications] push subscribe notice:', err)
      toast.error('Could not activate push notifications.')
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleSendTestPush = async () => {
    setIsSendingTest(true)
    try {
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
          toast.warning('No active subscriptions found in database yet. Tap "Enable" above first.')
        }
      } else {
        toast.error(data.error || 'Failed to dispatch test notification.')
      }
    } catch (err) {
      toast.error('Network error dispatching test push.')
    } finally {
      setIsSendingTest(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="View notifications and push alerts"
        className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:border-primary active:scale-95"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div className="fixed right-4 top-16 z-50 w-[92vw] max-w-sm rounded-[24px] border border-border bg-card p-5 shadow-2xl backdrop-blur-xl sm:w-96">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">Alerts &amp; Notifications</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Push Notification Device Status */}
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Phone &amp; Push Alerts</span>
                </div>
                {permission === 'granted' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="size-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubscribing ? 'Activating…' : 'Enable'}
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Receive instant notifications on your lock screen when messages or milestones are updated.
              </p>

              <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">Push test:</span>
                <button
                  type="button"
                  onClick={handleSendTestPush}
                  disabled={isSendingTest}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="size-3" />
                  <span>{isSendingTest ? 'Sending…' : 'Send Test Alert'}</span>
                </button>
              </div>
            </div>

            {/* Notification items */}
            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <a
                    key={item.id}
                    href={item.href ?? '#'}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{item.title}</span>
                      <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.body}</p>
                  </a>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  <Check className="size-6 text-primary mx-auto mb-1 opacity-70" />
                  <p>All clear. No unread messages.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
