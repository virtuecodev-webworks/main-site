import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { resolveAdminSession } from '@/lib/supabase/auth'
import { crawlSiteContent } from '@/lib/newsletter/site-crawler'
import { synthesizeNewsletter } from '@/lib/newsletter/ai-synthesizer'
import { newsletterEmail } from '@/lib/email/templates'
import { sendMany } from '@/lib/email'

async function isAuthorizedDispatch(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && cronSecret.length > 0 && authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  const adminSession = await resolveAdminSession()
  return adminSession !== null
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorizedDispatch(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unreachable' }, { status: 503 })
  }

  const { data: subscribers, error: subError } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('status', 'active')

  if (subError) {
    console.error('[auto-dispatch] Failed to fetch subscribers:', subError.message)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ ok: true, message: 'No active subscribers', sent: 0 })
  }

  const { count: issueCount } = await supabase
    .from('newsletter_dispatches')
    .select('id', { count: 'exact', head: true })

  const pages = await crawlSiteContent()
  const issue = await synthesizeNewsletter(pages, issueCount ?? 0)

  const rendered = await newsletterEmail({
    ...issue,
    issueNumber: (issueCount ?? 0) + 1,
  })

  const emails = subscribers.map((s) => ({
    to: s.email,
    email: rendered,
  }))

  const results = await sendMany(emails)
  const sent = results.filter((r) => r.status === 'fulfilled' && r.value.ok).length
  const failed = results.length - sent

  await supabase.from('newsletter_dispatches').insert({
    title: issue.title,
    subject: rendered.subject,
    content_html: rendered.html,
    content_text: rendered.text,
    recipients_total: subscribers.length,
    recipients_sent: sent,
    recipients_failed: failed,
    triggered_by: 'cron',
  })

  return NextResponse.json({
    ok: true,
    title: issue.title,
    recipients: subscribers.length,
    sent,
    failed,
  })
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorizedDispatch(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const supabase = createSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Database unreachable' }, { status: 503 })
  }

  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('status', 'active')

  if (!subscribers?.length) {
    return NextResponse.json({ ok: true, message: 'No active subscribers', sent: 0 })
  }

  const { count: issueCount } = await supabase
    .from('newsletter_dispatches')
    .select('id', { count: 'exact', head: true })

  let issue
  if (body.title && body.contentHtml) {
    issue = {
      ...body,
      date: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      readTime: body.readTime ?? '3 min read',
    }
  } else {
    const pages = await crawlSiteContent()
    issue = await synthesizeNewsletter(pages, issueCount ?? 0)
  }

  const rendered = await newsletterEmail({
    ...issue,
    issueNumber: (issueCount ?? 0) + 1,
  })

  const emails = subscribers.map((s: { email: string }) => ({
    to: s.email,
    email: rendered,
  }))

  const results = await sendMany(emails)
  const sent = results.filter((r) => r.status === 'fulfilled' && r.value.ok).length
  const failed = results.length - sent

  await supabase.from('newsletter_dispatches').insert({
    title: issue.title,
    subject: rendered.subject,
    content_html: rendered.html,
    content_text: rendered.text,
    recipients_total: subscribers.length,
    recipients_sent: sent,
    recipients_failed: failed,
    triggered_by: body.triggeredBy ?? 'admin',
  })

  return NextResponse.json({ ok: true, title: issue.title, sent, failed })
}
