import 'server-only'

import { Resend } from 'resend'
import { AGENCY } from '@/lib/constants'
import type { RenderedEmail } from './templates'

let client: Resend | null = null

export function isEmailConfigured() {
  const key = process.env.RESEND_API_KEY
  return Boolean(key && !key.startsWith('re_xxxx'))
}

function resend() {
  if (client) return client
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  client = new Resend(key)
  return client
}

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL ?? `${AGENCY.name} <onboarding@resend.dev>`
}

export function leadRecipient() {
  return process.env.LEAD_NOTIFICATION_EMAIL ?? AGENCY.fallbackEmail ?? AGENCY.email
}

export interface SendResult {
  ok: boolean
  id?: string
  skipped?: boolean
  error?: string
}

/**
 * Sends one transactional email. Never throws — email failures must not break
 * a contact submission or a payment webhook, so callers get a result object.
 */
export async function sendEmail({
  to,
  email,
  replyTo,
  bcc,
}: {
  to: string | string[]
  email: RenderedEmail
  replyTo?: string
  bcc?: string | string[]
}): Promise<SendResult> {
  if (!isEmailConfigured()) {
    console.warn('[email] RESEND_API_KEY missing - skipping:', email.subject)
    return { ok: false, skipped: true, error: 'resend-not-configured' }
  }

  try {
    const { data, error } = await resend().emails.send({
      from: fromAddress(),
      to: Array.isArray(to) ? to : [to],
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    if (error) {
      console.error('[email] Resend rejected the message:', error.message)
      return { ok: false, error: error.message }
    }

    return { ok: true, id: data?.id }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown email error'
    console.error('[email] send failed:', message)
    return { ok: false, error: message }
  }
}

/** Sends both sides of a lead: internal notification + client confirmation. */
export async function sendMany(messages: Array<Parameters<typeof sendEmail>[0]>) {
  return Promise.allSettled(messages.map((message) => sendEmail(message)))
}
