import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveAdminSession } from '@/lib/supabase/auth'

export async function GET() {
  const adminSession = await resolveAdminSession()
  if (!adminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const { data: subscribers, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const activeCount = subscribers?.filter((s) => s.status === 'active').length ?? 0

  return NextResponse.json({
    ok: true,
    subscribers: subscribers ?? [],
    activeCount,
    totalCount: subscribers?.length ?? 0,
  })
}

export async function POST(request: NextRequest) {
  const adminSession = await resolveAdminSession()
  if (!adminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const { action, email, source } = body

  if (action === 'sync_users') {
    // 1. Collect all emails from profiles and auth.users
    const { data: profiles } = await supabase.from('profiles').select('email')
    const { data: users } = await supabase.auth.admin.listUsers()

    const emailsToSync = new Set<string>()
    if (profiles) {
      for (const p of profiles) {
        if (p.email) emailsToSync.add(p.email.toLowerCase().trim())
      }
    }
    if (users?.users) {
      for (const u of users.users) {
        if (u.email) emailsToSync.add(u.email.toLowerCase().trim())
      }
    }

    // Include primary administrator & known client addresses
    emailsToSync.add('virtueco.dev@gmail.com')
    emailsToSync.add('globalgraphics129@gmail.com')
    emailsToSync.add('adeniranglory129@gmail.com')

    let added = 0
    for (const targetEmail of emailsToSync) {
      const { error: subErr } = await supabase.from('newsletter_subscribers').upsert(
        {
          email: targetEmail,
          status: 'active',
          source: 'user_sync',
          confirmed_at: new Date().toISOString(),
        },
        { onConflict: 'email' },
      )
      if (!subErr) {
        await supabase.from('subscribers').upsert(
          { email: targetEmail, locale: 'en', source: 'user_sync' },
          { onConflict: 'email' },
        )
        added++
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully synced ${added} user accounts to newsletter subscribers`,
      syncedCount: added,
    })
  }

  if (action === 'clean_test') {
    // Clean dummy @example.com test emails
    const { data: removed, error: delErr } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .ilike('email', '%@example.com')
      .select('email')

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: `Cleaned ${removed?.length ?? 0} dummy test emails`,
      cleanedCount: removed?.length ?? 0,
    })
  }

  if (action === 'add') {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const { error: insertErr } = await supabase.from('newsletter_subscribers').upsert(
      {
        email: cleanEmail,
        status: 'active',
        source: source || 'admin_manual',
        confirmed_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    )

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    await supabase.from('subscribers').upsert(
      { email: cleanEmail, locale: 'en', source: source || 'admin_manual' },
      { onConflict: 'email' },
    )

    return NextResponse.json({ ok: true, message: `Added ${cleanEmail} as active subscriber` })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function PATCH(request: NextRequest) {
  const adminSession = await resolveAdminSession()
  if (!adminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const { email, status } = await request.json().catch(() => ({}))
  if (!email || !status || (status !== 'active' && status !== 'unsubscribed')) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const updateData =
    status === 'unsubscribed'
      ? { status, unsubscribed_at: new Date().toISOString() }
      : { status, confirmed_at: new Date().toISOString(), unsubscribed_at: null }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .update(updateData)
    .eq('email', email.toLowerCase().trim())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, email, status })
}

export async function DELETE(request: NextRequest) {
  const adminSession = await resolveAdminSession()
  if (!adminSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
  }

  const { email } = await request.json().catch(() => ({}))
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('email', email.toLowerCase().trim())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: `Removed ${email}` })
}
