import 'server-only'
import { NextResponse, type NextRequest } from 'next/server'
import webpush from 'web-push'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveSession } from '@/lib/supabase/auth'

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.ADMIN_EMAIL ?? 'admin@virtuecowebworks.solutions'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function POST(request: NextRequest) {
  const session = await resolveSession()
  if (!session || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscription, userAgent } = await request.json()

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unreachable' }, { status: 503 })
  }

  // Upsert subscription
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: session.userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        user_agent: userAgent ?? request.headers.get('user-agent'),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    )

  if (error) {
    console.error('[push/subscribe] DB error:', error.message)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Subscription saved' })
}

export async function DELETE(request: NextRequest) {
  const session = await resolveSession()
  if (!session || !session.isStaff) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { endpoint } = await request.json()
  if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })

  const supabase = createSupabaseAdminClient()
  if (supabase) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
  }

  return NextResponse.json({ ok: true })
}
