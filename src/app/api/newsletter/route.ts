import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { newsletterSchema } from '@/lib/validation'
import { sendEmail } from '@/lib/email'
import { newsletterConfirmEmail } from '@/lib/email/templates'

/**
 * Newsletter subscribe endpoint.
 *
 *   POST /api/newsletter { email, locale, source }
 *
 * Duplicate addresses are treated as success (idempotent subscribe) so a
 * returning reader never sees an error.
 */
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers, 'newsletter'), {
    limit: 10,
    windowMs: 60_000,
  })

  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, code: 'rate-limited' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, code: 'error' }, { status: 400 })
  }

  const parsed = newsletterSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, code: 'validation' }, { status: 422 })
  }

  // Honeypot tripped: pretend it worked so the bot does not retry.
  if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 201 })

  const email = parsed.data.email.toLowerCase().trim()
  const source = parsed.data.source || 'website'
  const locale = parsed.data.locale || 'en'

  const supabase = createSupabaseAdminClient()

  if (supabase) {
    // 1. Upsert into newsletter_subscribers (primary table for admin dispatch)
    try {
      await supabase.from('newsletter_subscribers').upsert(
        {
          email,
          status: 'active',
          source,
          confirmed_at: new Date().toISOString(),
        },
        { onConflict: 'email', ignoreDuplicates: true },
      )
    } catch (err) {
      console.warn('[newsletter] newsletter_subscribers upsert warning:', err)
    }

    // 2. Also keep subscribers table in sync
    try {
      await supabase.from('subscribers').upsert(
        {
          email,
          locale,
          source,
        },
        { onConflict: 'email', ignoreDuplicates: true },
      )
    } catch (err) {
      console.warn('[newsletter] subscribers upsert warning:', err)
    }
  }

  // 3. Send the branded luxury subscription confirmation email asynchronously
  try {
    const rendered = await newsletterConfirmEmail({ email })
    await sendEmail({
      to: email,
      email: rendered,
    })
  } catch (emailErr) {
    console.warn('[newsletter] confirmation email dispatch warning:', emailErr)
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
