import 'server-only'

import nodemailer from 'nodemailer'
import { AGENCY } from '@/lib/constants'
import type { RenderedEmail } from './templates'

// ---------------------------------------------------------------------------
// Transport (Brevo SMTP)
// ---------------------------------------------------------------------------

let transport: ReturnType<typeof nodemailer.createTransport> | null = null

export function isEmailConfigured(): boolean {
  const host = process.env.BREVO_SMTP_HOST ?? process.env.SMTP_HOST
  const user = process.env.BREVO_SMTP_LOGIN ?? process.env.SMTP_LOGIN
  const pass = process.env.BREVO_SMTP_KEY ?? process.env.SMTP_KEY
  return Boolean(host && user && pass)
}

function getTransport() {
  if (transport) return transport

  const host = process.env.BREVO_SMTP_HOST ?? process.env.SMTP_HOST ?? 'smtp-relay.brevo.com'
  const port = Number(process.env.BREVO_SMTP_PORT ?? process.env.SMTP_PORT ?? 587)
  const user = process.env.BREVO_SMTP_LOGIN ?? process.env.SMTP_LOGIN
  const pass = process.env.BREVO_SMTP_KEY ?? process.env.SMTP_KEY

  if (!user || !pass) throw new Error('Brevo SMTP credentials not set (BREVO_SMTP_LOGIN / BREVO_SMTP_KEY)')

  transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  return transport
}

function fromAddress(): string {
  return (
    process.env.BREVO_FROM_EMAIL ??
    process.env.SMTP_FROM_EMAIL ??
    `${AGENCY.name} <hello@virtuecowebworks.solutions>`
  )
}

export function leadRecipient(): string {
  return process.env.LEAD_NOTIFICATION_EMAIL ?? AGENCY.fallbackEmail ?? AGENCY.email
}

// ---------------------------------------------------------------------------
// Send helpers
// ---------------------------------------------------------------------------

export interface SendResult {
  ok: boolean
  id?: string
  skipped?: boolean
  error?: string
}

/**
 * Sends one transactional email via Brevo SMTP.
 * Never throws — email failures must not break contact submissions or webhooks.
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
    console.warn('[email] Brevo SMTP not configured — skipping:', email.subject)
    return { ok: false, skipped: true, error: 'brevo-not-configured' }
  }

  try {
    const mailer = getTransport()
    const info = await mailer.sendMail({
      from: fromAddress(),
      to: Array.isArray(to) ? to.join(', ') : to,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
      replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    return { ok: true, id: info.messageId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown email error'
    console.error('[email] Brevo send failed:', message)
    return { ok: false, error: message }
  }
}

/** Sends multiple emails in parallel. Failures are isolated per-message. */
export async function sendMany(messages: Array<Parameters<typeof sendEmail>[0]>) {
  return Promise.allSettled(messages.map((msg) => sendEmail(msg)))
}
