import 'server-only'

import { after } from 'next/server'
import { headers, cookies } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isEmailConfigured, leadRecipient, sendMany } from '@/lib/email'
import { confirmationCopyFor, leadConfirmationEmail, leadNotificationEmail, localeLabel } from '@/lib/email/templates'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import type { Inquiry } from '@/lib/supabase/types'
import { inquirySchema, issuesToFieldErrors } from '@/lib/validation'

export interface InquiryResult {
  ok: boolean
  /** 'ok' | 'validation' | 'rate-limited' | 'error' */
  code: 'ok' | 'validation' | 'rate-limited' | 'error'
  fieldErrors?: Record<string, string[]>
  retryAfterSeconds?: number
  redirectUrl?: string
}

/**
 * Shared inquiry pipeline used by BOTH the `submitInquiry` Server Action and
 * the `/api/contact` route handler, so behaviour can never drift between them.
 *
 * Order of operations matters:
 *   1. rate limit          — cheapest rejection, stops spam before any I/O
 *   2. validate            — never trust the browser
 *   3. honeypot            — silently accept, but discard
 *   4. persist to Supabase — the record of truth for the admin hub
 *   5. notify + confirm    — email is the fallback if the DB is unreachable
 */
export async function handleInquiry(payload: unknown): Promise<InquiryResult> {
  const requestHeaders = await headers()

  const limited = rateLimit(clientKey(requestHeaders, 'inquiry'), {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.allowed) {
    return {
      ok: false,
      code: 'rate-limited',
      retryAfterSeconds: limited.retryAfterSeconds,
    }
  }

  const parsed = inquirySchema.safeParse(payload)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'validation',
      fieldErrors: issuesToFieldErrors(parsed.error.issues),
    }
  }

  const input = parsed.data

  // Honeypot tripped: behave exactly like success so bots don't learn anything.
  if (input.website) return { ok: true, code: 'ok' }

  const now = new Date().toISOString()
  const record: Inquiry = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    company: input.company ?? null,
    service: input.service ?? null,
    budget: input.budget ?? null,
    timeline: input.timeline ?? null,
    message: input.message,
    locale: input.locale,
    status: 'new',
    source: 'website',
    notified_at: null,
    created_at: now,
  }

  let storedId: string | null = null
  const supabase = createSupabaseAdminClient()
  if (supabase) {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        name: record.name,
        email: record.email,
        phone: record.phone,
        company: record.company,
        service: record.service,
        budget: record.budget,
        timeline: record.timeline,
        message: record.message,
        locale: record.locale,
        status: 'new',
        source: 'website',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[inquiries] insert failed:', error.message)
    } else {
      storedId = (data as { id: string }).id
    }
  }

  if (!isEmailConfigured()) {
    console.warn('[inquiries] Resend not configured - lead received but not emailed.')
    // Still a success for the visitor; the failure is ours to fix, not theirs.
    return { ok: true, code: 'ok' }
  }

  const label = localeLabel(input.locale)

  // Dispatch after the response so the form never waits on Resend.
  after(async () => {
    await sendMany([
      {
        to: leadRecipient(),
        replyTo: input.email,
        email: leadNotificationEmail(record, label),
      },
      {
        to: input.email,
        email: leadConfirmationEmail(record, confirmationCopyFor(input.locale)),
      },
    ])

    if (storedId && supabase) {
      await supabase
        .from('inquiries')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', storedId)
    }
  })

  let redirectUrl: string | undefined

  if (input.password && input.password.length >= 8) {
    try {
      const serverClient = await createSupabaseServerClient()
      if (serverClient) {
        const { data: authData } = await serverClient.auth.signUp({
          email: input.email.toLowerCase().trim(),
          password: input.password,
          options: {
            data: {
              full_name: input.name,
              phone: input.phone ?? undefined,
              company: input.company ?? undefined,
            },
          },
        })
        if (!authData.user) {
          await serverClient.auth.signInWithPassword({
            email: input.email.toLowerCase().trim(),
            password: input.password,
          })
        }
      } else {
        const jar = await cookies()
        jar.set(
          'vcw:demo_session',
          JSON.stringify({
            userId: 'client-' + Date.now(),
            email: input.email,
            name: input.name,
            role: 'client',
          }),
          { path: '/', httpOnly: true, sameSite: 'lax' },
        )
      }
      redirectUrl = `/${input.locale}/portal`
    } catch (authErr) {
      console.warn('[inquiries] client account creation skipped:', authErr)
    }
  }

  return { ok: true, code: 'ok', redirectUrl }
}
