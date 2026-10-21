import 'server-only'
import { NextResponse, type NextRequest } from 'next/server'
import webpush from 'web-push'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.ADMIN_EMAIL ?? 'virtueco.dev@gmail.com'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
  badge?: string
  data?: Record<string, unknown>
}

/**
 * Internal server function — send push to all subscribed admin devices.
 * Call this from contact, order, and newsletter APIs.
 */
export async function sendPushToAdmins(payload: PushPayload) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return { sent: 0, failed: 0 }
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) return { sent: 0, failed: 0 }

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth_key')

  if (error || !subscriptions?.length) return { sent: 0, failed: 0 }

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key },
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon ?? '/brand/logo-mark.png',
          badge: payload.badge ?? '/brand/logo-mark.png',
          url: payload.url ?? '/en/admin',
          tag: payload.tag ?? 'vcw-notification',
          data: payload.data ?? {},
        })
      )
    )
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.length - sent

  // Clean up expired subscriptions (410 Gone)
  const expired = subscriptions.filter((_, i) => {
    const r = results[i]
    return r.status === 'rejected' && (r as PromiseRejectedResult).reason?.statusCode === 410
  })

  if (expired.length > 0) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expired.map((s) => s.endpoint))
  }

  return { sent, failed }
}

/**
 * POST /api/push/send — HTTP trigger (for testing or external webhooks)
 * Requires CRON_SECRET header for security
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload: PushPayload = await request.json()
  const result = await sendPushToAdmins(payload)

  return NextResponse.json({ ok: true, ...result })
}
