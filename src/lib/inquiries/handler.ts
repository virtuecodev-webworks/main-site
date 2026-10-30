import 'server-only'

import { after } from 'next/server'
import { headers, cookies } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isEmailConfigured, leadRecipient, sendMany } from '@/lib/email'
import {
  enquiryAdminEmail,
  enquiryClientEmail,
  localeLabel,
} from '@/lib/email/templates'
import { sendPushToAdmins } from '@/app/api/push/send/route'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import type { Inquiry } from '@/lib/supabase/types'
import { inquirySchema, issuesToFieldErrors } from '@/lib/validation'
import { COUNTRY_COOKIE, GEO_COOKIE } from '@/lib/geo/countries'

export interface InquiryResult {
  ok: boolean
  /** 'ok' | 'validation' | 'rate-limited' | 'error' */
  code: 'ok' | 'validation' | 'rate-limited' | 'error'
  fieldErrors?: Record<string, string[]>
  retryAfterSeconds?: number
  redirectUrl?: string
  orderReference?: string
}

/**
 * Shared inquiry pipeline used by BOTH the `submitInquiry` Server Action and
 * the `/api/contact` route handler, so behaviour can never drift between them.
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
  let supabaseAdmin: any = createSupabaseAdminClient()
  if (!supabaseAdmin) {
    try {
      supabaseAdmin = await createSupabaseServerClient()
    } catch {
      supabaseAdmin = null
    }
  }
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
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

  // Handle optional portal account creation or existing signed-in client session
  let redirectUrl: string | undefined
  let clientUserId: string | null = null

  try {
    const serverClient = await createSupabaseServerClient()
    if (serverClient) {
      const {
        data: { user: existingSessionUser },
      } = await serverClient.auth.getUser()

      if (existingSessionUser) {
        clientUserId = existingSessionUser.id
      } else if (input.password && input.password.length >= 8) {
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
        if (authData.user) {
          clientUserId = authData.user.id
        } else {
          const { data: signInData } = await serverClient.auth.signInWithPassword({
            email: input.email.toLowerCase().trim(),
            password: input.password,
          })
          if (signInData.user) {
            clientUserId = signInData.user.id
          }
        }
        redirectUrl = `/${input.locale}/portal`
      }
    } else if (input.password && input.password.length >= 8 && process.env.NODE_ENV !== 'production') {
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
      redirectUrl = `/${input.locale}/portal`
    }

    // Also look up if a client profile already exists with this email even without password
    if (!clientUserId && supabaseAdmin) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', input.email.toLowerCase().trim())
        .maybeSingle()
      if ((existingProfile as { id: string } | null)?.id) {
        clientUserId = (existingProfile as { id: string }).id
      }
    }
  } catch (authErr) {
    console.warn('[inquiries] client account resolution skipped:', authErr)
  }

  // Create a synced Order in `public.orders` whenever we have a clientUserId
  let orderReference: string | undefined
  if (clientUserId && supabaseAdmin) {
    try {
      const jar = await cookies()
      const country = jar.get(COUNTRY_COOKIE)?.value ?? jar.get(GEO_COOKIE)?.value ?? null
      const titleParts = [
        input.company || input.name,
        input.service ? input.service.toUpperCase() : 'Project Brief',
      ]
      const orderTitle = titleParts.join(' — ').slice(0, 140)

      const { data: createdOrder, error: orderErr } = await supabaseAdmin
        .from('orders')
        .insert({
          client_id: clientUserId,
          title: orderTitle,
          brief: input.message,
          service: input.service ?? 'custom',
          scope: input.budget ?? null,
          status: 'inquiry',
          currency: country === 'NG' ? 'NGN' : 'USD',
          locale: input.locale || 'en',
          country,
          inquiry_id: storedId,
        })
        .select('id, reference')
        .single()

      const typedCreatedOrder = createdOrder as { id: string; reference: string } | null
      if (!orderErr && typedCreatedOrder) {
        orderReference = typedCreatedOrder.reference
        await supabaseAdmin.from('order_messages').insert({
          order_id: typedCreatedOrder.id,
          author_id: clientUserId,
          author_role: 'client',
          body: input.message,
          internal: false,
        })
        if (redirectUrl) {
          redirectUrl = `/${input.locale}/portal/orders/${typedCreatedOrder.reference}`
        }
      }
    } catch (orderSyncErr) {
      console.warn('[inquiries] order auto-sync failed:', orderSyncErr)
    }
  }

  const label = localeLabel(input.locale)

  // Dispatch emails and push notifications asynchronously after the response
  after(async () => {
    try {
      if (isEmailConfigured()) {
        const [adminEmailRendered, clientEmailRendered] = await Promise.all([
          enquiryAdminEmail(record, label),
          enquiryClientEmail(record),
        ])

        await sendMany([
          {
            to: leadRecipient(),
            replyTo: input.email,
            email: adminEmailRendered,
          },
          {
            to: input.email,
            email: clientEmailRendered,
          },
        ])
      } else {
        console.warn('[inquiries] SMTP not configured - lead recorded in DB.')
      }

      // Push notification to installed admin devices (PWA / Mobile)
      try {
        await sendPushToAdmins({
          title: `🔔 New Enquiry: ${record.name}`,
          body: `${record.service ?? 'General Enquiry'}${record.company ? ` · ${record.company}` : ''} (${record.budget ?? 'Flexible'})`,
          url: `/${input.locale}/admin/inquiries`,
          tag: `lead-${record.id}`,
        })
      } catch (pushErr) {
        console.warn('[inquiries] push notification dispatch failed:', pushErr)
      }
    } catch (err) {
      console.error('[inquiries] email/push dispatch error:', err)
    }

    if (storedId && supabaseAdmin) {
      await supabaseAdmin
        .from('inquiries')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', storedId)
    }
  })

  return { ok: true, code: 'ok', redirectUrl, orderReference }
}
