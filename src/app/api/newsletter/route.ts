import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { newsletterSchema } from '@/lib/validation'

/**
 * Newsletter subscribe endpoint.
 *
 *   POST /api/newsletter { email, locale, source }
 *
 * Duplicate addresses are treated as success (idempotent subscribe) so a
 * returning reader never sees an error. The admin client is used because the
 * `subscribers` table has RLS enabled with no public policies — the mailing list
 * is never readable with the anon key.
 */
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers, 'newsletter'), {
    limit: 5,
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

  const supabase = createSupabaseAdminClient()

  if (supabase) {
    const { error } = await supabase.from('subscribers').upsert(
      {
        email: parsed.data.email,
        locale: parsed.data.locale,
        source: parsed.data.source,
      },
      { onConflict: 'email', ignoreDuplicates: true },
    )

    if (error) {
      console.warn('[newsletter] subscribe failed:', error.message)
      return NextResponse.json({ ok: false, code: 'error' }, { status: 500 })
    }
  } else {
    // No database configured (local preview): accept the address so the flow is
    // testable end to end, and leave a breadcrumb in the logs.
    console.info('[newsletter] captured without Supabase:', parsed.data.email)
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
