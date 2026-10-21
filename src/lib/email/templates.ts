import 'server-only'

import { AGENCY, GOOGLE_MEET_MAILTO } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'
import type { Inquiry } from '@/lib/supabase/types'
import type { AppLocale } from '@/i18n/routing'
import { localeMeta } from '@/i18n/routing'

const GOLD = '#C5A059'
const EMERALD = '#10B981'
const INK = '#16161A'
const SURFACE = '#FFFFFF'
const BG = '#F4F4F5'
const MUTED = '#71717A'
const BORDER = '#E4E4E7'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

/* -------------------------------------------------------------------------- */
/*  Shell                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Table-based, inline-styled, 600px shell. Deliberately plain CSS so it renders
 * consistently in Gmail, Apple Mail, Outlook and mobile webviews.
 */
function shell({ preheader, body }: { preheader: string; body: string }) {
  const logoUrl = 'https://virtuecowebworks.solutions/brand/logo-mark.png'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${AGENCY.name}</title>
  </head>
  <body style="margin:0;padding:0;background:#090D14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <div style="display:none;font-size:1px;color:#090D14;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#090D14;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111622;border:1px solid #1E2638;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.5);">
            <!-- Branded Luxury Dark Header with Logo -->
            <tr>
              <td style="background:#0B0F17;padding:30px 36px;border-bottom:1px solid rgba(255,255,255,0.08);">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:52px;vertical-align:middle;">
                      <img src="${logoUrl}" width="48" height="48" alt="Virtue &amp; Co." style="display:block;border-radius:12px;border:1px solid rgba(255,255,255,0.2);box-shadow:0 4px 12px rgba(0,0,0,0.4);" />
                    </td>
                    <td style="padding-left:16px;vertical-align:middle;">
                      <div style="font-size:20px;font-weight:800;letter-spacing:-0.01em;color:#FFFFFF;line-height:1.1;">
                        VIRTUE <span style="color:${GOLD};font-weight:800;">&amp;</span> CO.
                      </div>
                      <div style="font-size:10px;font-weight:700;letter-spacing:0.28em;color:#94A3B8;margin-top:4px;text-transform:uppercase;">
                        WEBWORKS STUDIO
                      </div>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;padding:5px 12px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);border-radius:999px;font-size:11px;font-weight:700;color:${EMERALD};letter-spacing:0.06em;text-transform:uppercase;">
                        ● OFFICIAL
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Architectural Accent Border Line -->
            <tr>
              <td style="height:3px;background:linear-gradient(90deg,${GOLD} 0%,#E6C875 40%,${EMERALD} 100%);"></td>
            </tr>
            <!-- Content Area -->
            <tr>
              <td style="padding:38px 36px 32px;color:#E2E8F0;">
                ${body}
              </td>
            </tr>
            <!-- Interesting Studio Highlights Grid -->
            <tr>
              <td style="padding:0 36px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0D121D;border:1px solid #1E2638;border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="padding:16px;width:33.3%;border-right:1px solid #1E2638;text-align:center;">
                      <div style="font-size:15px;font-weight:800;color:#FFFFFF;margin-bottom:2px;">95–100</div>
                      <div style="font-size:10.5px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">PageSpeed Score</div>
                    </td>
                    <td style="padding:16px;width:33.3%;border-right:1px solid #1E2638;text-align:center;">
                      <div style="font-size:15px;font-weight:800;color:${GOLD};margin-bottom:2px;">Fixed Price</div>
                      <div style="font-size:10.5px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">No Hidden Fees</div>
                    </td>
                    <td style="padding:16px;width:33.3%;text-align:center;">
                      <div style="font-size:15px;font-weight:800;color:${EMERALD};margin-bottom:2px;">100% Owned</div>
                      <div style="font-size:10.5px;color:#94A3B8;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Clean Next.js Code</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Branded Luxury Footer -->
            <tr>
              <td style="padding:28px 36px;background:#090D14;border-top:1px solid #1E2638;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <div style="font-size:13px;font-weight:700;color:#FFFFFF;">${AGENCY.name}</div>
                      <div style="font-size:12px;color:#64748B;margin-top:5px;line-height:1.6;">
                        High-Performance Web Engineering &amp; Architecture.<br />
                        <a href="https://${AGENCY.domain}" style="color:${GOLD};text-decoration:none;font-weight:600;">${AGENCY.domain}</a> · 
                        <a href="mailto:${AGENCY.email}" style="color:#94A3B8;text-decoration:none;">${AGENCY.email}</a>
                      </div>
                      <div style="font-size:11px;color:#475569;margin-top:10px;">
                        © ${new Date().getFullYear()} Virtue &amp; Co. Webworks. All rights reserved.
                      </div>
                    </td>
                    <td align="right" style="vertical-align:top;">
                      <a href="https://${AGENCY.domain}/portal" style="display:inline-block;padding:8px 16px;background:#161D2B;border:1px solid #2B354C;border-radius:10px;font-size:12px;font-weight:600;color:#FFFFFF;text-decoration:none;white-space:nowrap;">
                        Client Portal →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function heading(text: string) {
  return `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">${escapeHtml(text)}</h1>`
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#94A3B8;">${text}</p>`
}

function divider() {
  return `<div style="height:1px;background:#1E2638;margin:24px 0;"></div>`
}

function detailRows(rows: Array<[string, string | null | undefined]>) {
  const filled = rows.filter(([, value]) => value !== null && value !== undefined && value !== '')
  if (!filled.length) return ''

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:12px 0;background:#0D121D;border:1px solid #1E2638;border-radius:12px;overflow:hidden;">
    ${filled
      .map(
        ([label, value], idx) => `<tr>
      <td style="padding:10px 16px;font-size:11.5px;text-transform:uppercase;letter-spacing:0.08em;color:#64748B;width:34%;vertical-align:middle;${idx > 0 ? 'border-top:1px solid #1E2638;' : ''}">${escapeHtml(label)}</td>
      <td style="padding:10px 16px;font-size:14px;color:#E2E8F0;font-weight:600;vertical-align:middle;${idx > 0 ? 'border-top:1px solid #1E2638;' : ''}">${escapeHtml(String(value))}</td>
    </tr>`,
      )
      .join('')}
  </table>`
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 8px;">
    <tr>
      <td style="background:${GOLD};border-radius:12px;box-shadow:0 4px 16px rgba(197,160,89,0.4);">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#0B0F17;text-decoration:none;letter-spacing:0.01em;">${escapeHtml(label)} →</a>
      </td>
    </tr>
  </table>`
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/* -------------------------------------------------------------------------- */
/*  1. Internal lead notification                                              */
/* -------------------------------------------------------------------------- */

export function leadNotificationEmail(inquiry: Inquiry, localeLabel: string): RenderedEmail {
  const subject = `New ${inquiry.service ?? 'website'} enquiry - ${inquiry.name}${
    inquiry.company ? ` (${inquiry.company})` : ''
  }`

  const html = shell({
    preheader: `${inquiry.name} · ${inquiry.budget ?? 'budget TBC'}`,
    body: [
      heading('New project enquiry'),
      paragraph(
        `Submitted from the ${localeLabel} version of the site. Reply directly to this email to answer ${escapeHtml(inquiry.name)}.`,
      ),
      detailRows([
        ['Name', inquiry.name],
        ['Email', inquiry.email],
        ['Phone', inquiry.phone],
        ['Company', inquiry.company],
        ['Service', inquiry.service],
        ['Budget', inquiry.budget],
        ['Timeline', inquiry.timeline],
        ['Locale', localeLabel],
        ['Source', inquiry.source],
      ]),
      divider(),
      `<div style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};margin-bottom:8px;">Message</div>
       <div style="font-size:15px;line-height:1.7;color:${INK};white-space:pre-wrap;background:#F8F9FA;border:1px solid ${BORDER};border-radius:12px;padding:16px;">${escapeHtml(inquiry.message)}</div>`,
      divider(),
      button(`mailto:${inquiry.email}?subject=${encodeURIComponent('Re: your project enquiry')}`, `Reply to ${inquiry.name}`),
    ].join(''),
  })

  const text = [
    'NEW PROJECT ENQUIRY',
    '',
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone ? `Phone: ${inquiry.phone}` : null,
    inquiry.company ? `Company: ${inquiry.company}` : null,
    inquiry.service ? `Service: ${inquiry.service}` : null,
    inquiry.budget ? `Budget: ${inquiry.budget}` : null,
    inquiry.timeline ? `Timeline: ${inquiry.timeline}` : null,
    `Locale: ${localeLabel}`,
    '',
    'Message:',
    inquiry.message,
  ]
    .filter(Boolean)
    .join('\n')

  return { subject, html, text }
}

/* -------------------------------------------------------------------------- */
/*  2. Client auto-confirmation                                                */
/* -------------------------------------------------------------------------- */

export interface ConfirmationCopy {
  heading: string
  intro: string
  nextSteps: string
  signoff: string
}

export function leadConfirmationEmail(
  inquiry: Inquiry,
  copy: ConfirmationCopy,
): RenderedEmail {
  const subject = `We've received your enquiry - ${AGENCY.name}`

  const html = shell({
    preheader: copy.intro,
    body: [
      heading(copy.heading),
      paragraph(`Hi ${escapeHtml(inquiry.name.split(' ')[0] ?? inquiry.name)},`),
      paragraph(escapeHtml(copy.intro)),
      divider(),
      `<div style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};margin-bottom:10px;">Your submission</div>`,
      detailRows([
        ['Service', inquiry.service],
        ['Budget', inquiry.budget],
        ['Timeline', inquiry.timeline],
      ]),
      `<div style="margin-top:14px;font-size:15px;line-height:1.7;color:${INK};white-space:pre-wrap;background:#F8F9FA;border:1px solid ${BORDER};border-radius:12px;padding:16px;">${escapeHtml(inquiry.message)}</div>`,
      divider(),
      paragraph(escapeHtml(copy.nextSteps)),
      paragraph(escapeHtml(copy.signoff)),
      button(`mailto:${AGENCY.email}`, 'Email the studio'),
    ].join(''),
  })

  const text = [
    copy.heading,
    '',
    `Hi ${inquiry.name},`,
    '',
    copy.intro,
    '',
    copy.nextSteps,
    '',
    copy.signoff,
    '',
    `${AGENCY.name} · ${AGENCY.email}`,
  ].join('\n')

  return { subject, html, text }
}

/* -------------------------------------------------------------------------- */
/*  3. Payment receipt                                                         */
/* -------------------------------------------------------------------------- */

export interface ReceiptInput {
  reference: string
  providerTxId: string | null
  amount: number
  currency: string
  customerName: string | null
  customerEmail: string
  purpose: string | null
  paidAt: string
}

export function paymentReceiptEmail(input: ReceiptInput): RenderedEmail {
  const amount = formatMoney(input.amount, input.currency)
  const subject = `Payment received - ${amount} (${input.reference})`

  const html = shell({
    preheader: `Receipt ${input.reference} for ${amount}`,
    body: [
      heading('Payment received - thank you'),
      paragraph(
        `We've confirmed your payment of <strong>${escapeHtml(amount)}</strong>. This email is your receipt - no further action is needed.`,
      ),
      detailRows([
        ['Reference', input.reference],
        ['Flutterwave ID', input.providerTxId],
        ['Amount', amount],
        ['Purpose', input.purpose],
        ['Paid at', input.paidAt],
        ['Paid by', input.customerName ?? input.customerEmail],
      ]),
      divider(),
      paragraph(
        `Keep this reference for your records. If anything looks incorrect, reply to this email and we'll reconcile it the same day.`,
      ),
    ].join(''),
  })

  const text = [
    'PAYMENT RECEIVED',
    '',
    `Amount: ${amount}`,
    `Reference: ${input.reference}`,
    input.providerTxId ? `Flutterwave ID: ${input.providerTxId}` : null,
    input.purpose ? `Purpose: ${input.purpose}` : null,
    `Paid at: ${input.paidAt}`,
    '',
    'This email is your receipt.',
  ]
    .filter(Boolean)
    .join('\n')

  return { subject, html, text }
}

/* -------------------------------------------------------------------------- */
/*  Locale helpers                                                             */
/* -------------------------------------------------------------------------- */

const CONFIRMATION_COPY: Record<AppLocale, ConfirmationCopy> = {
  en: {
    heading: 'Thanks - your enquiry is with us',
    intro:
      'Your project enquiry has landed safely with the Virtue & Co. Webworks studio and a real human is reviewing it now.',
    nextSteps:
      'Within two business days you will receive a scoped proposal: deliverables, timeline and a fixed price. If your project is urgent, reply to this email and flag it.',
    signoff: 'Talk soon,\nThe Virtue & Co. Webworks studio',
  },
  fr: {
    heading: 'Merci - votre demande nous est bien parvenue',
    intro:
      'Votre demande de projet est bien arrivée au studio Virtue & Co. Webworks et une personne de l’équipe l’examine dès maintenant.',
    nextSteps:
      'Sous deux jours ouvrés, vous recevrez une proposition cadrée : livrables, calendrier et prix fixe. Si votre projet est urgent, répondez à cet e-mail pour le signaler.',
    signoff: 'À très vite,\nLe studio Virtue & Co. Webworks',
  },
  es: {
    heading: 'Gracias - tu consulta ya está con nosotros',
    intro:
      'Tu consulta de proyecto ha llegado correctamente al estudio Virtue & Co. Webworks y una persona del equipo la está revisando ahora mismo.',
    nextSteps:
      'En dos días hábiles recibirás una propuesta detallada: entregables, calendario y precio fijo. Si tu proyecto es urgente, responde a este correo para avisarnos.',
    signoff: 'Hasta pronto,\nEl estudio Virtue & Co. Webworks',
  },
  de: {
    heading: 'Danke - Ihre Anfrage liegt bei uns',
    intro:
      'Ihre Projektanfrage ist sicher im Studio von Virtue & Co. Webworks eingegangen und wird gerade von einem Menschen geprüft.',
    nextSteps:
      'Innerhalb von zwei Werktagen erhalten Sie ein detailliertes Angebot: Leistungen, Zeitplan und Festpreis. Wenn Ihr Projekt dringend ist, antworten Sie auf diese E-Mail.',
    signoff: 'Bis bald,\nDas Studio von Virtue & Co. Webworks',
  },
  ar: {
    heading: 'شكرًا لك - استفسارك وصل إلينا',
    intro:
      'وصل استفسار مشروعك بأمان إلى استوديو فيرتو آند كو ويب ووركس، ويقوم أحد أعضاء الفريق بمراجعته الآن.',
    nextSteps:
      'خلال يومي عمل ستستلم عرضًا محددًا يشمل المخرجات والجدول الزمني وسعرًا ثابتًا. إذا كان مشروعك عاجلًا، فردّ على هذا البريد لتنبيهنا.',
    signoff: 'إلى اللقاء قريبًا،\nاستوديو فيرتو آند كو ويب ووركس',
  },
}

export function confirmationCopyFor(locale: string): ConfirmationCopy {
  return CONFIRMATION_COPY[(locale as AppLocale) in CONFIRMATION_COPY ? (locale as AppLocale) : 'en']
}

export function localeLabel(locale: string) {
  const meta = (localeMeta as Record<string, { english: string; label: string }>)[locale]
  return meta ? `${meta.english} (${meta.label})` : locale
}

/* -------------------------------------------------------------------------- */
/*  4. Branded 6-Digit Verification Code Email (OTP)                          */
/* -------------------------------------------------------------------------- */

export function verificationCodeEmail({
  code,
  name,
  purpose = 'verification',
}: {
  code: string
  name?: string
  purpose?: string
}): RenderedEmail {
  const subject = `${code} — your ${AGENCY.name} verification code`
  const firstName = name?.split(' ')[0] ?? ''

  const html = shell({
    preheader: `Your ${purpose} code is ${code}. Valid for 10 minutes.`,
    body: [
      `<div style="margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;color:${GOLD};text-transform:uppercase;margin-bottom:10px;">ACCOUNT SECURITY</div>
        <h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">
          ${purpose === 'recovery' ? 'Reset your password' : 'Verify your account'}
        </h1>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#94A3B8;">
          ${firstName ? `Hi <strong style="color:#E2E8F0;">${escapeHtml(firstName)}</strong>, enter` : 'Enter'} the 6-digit code below to ${purpose === 'recovery' ? 'reset your password and regain access to your account' : 'confirm your email and access your private client portal'}.
        </p>
      </div>`,

      `<div style="margin:32px 0;text-align:center;">
        <div style="display:inline-block;background:#0D121D;border:1.5px solid ${GOLD};border-radius:20px;padding:28px 44px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:${GOLD};text-transform:uppercase;margin-bottom:12px;">
            ${purpose === 'recovery' ? 'Recovery Code' : 'Verification Code'}
          </div>
          <div style="font-family:'Courier New',Courier,monospace;font-size:42px;font-weight:900;letter-spacing:10px;color:#FFFFFF;text-shadow:0 0 30px rgba(197,160,89,0.35);padding-right:10px;">
            ${escapeHtml(code)}
          </div>
          <div style="margin-top:12px;font-size:12px;color:#64748B;font-weight:500;">
            ⏱ Expires in 10 minutes
          </div>
        </div>
      </div>`,

      `<div style="background:#0D121D;border:1px solid #1E2638;border-radius:14px;padding:18px 20px;margin-bottom:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:32px;vertical-align:top;padding-top:2px;">
              <div style="width:24px;height:24px;background:rgba(16,185,129,0.15);border-radius:6px;text-align:center;line-height:24px;font-size:14px;">✓</div>
            </td>
            <td style="padding-left:12px;">
              <div style="font-size:13px;font-weight:600;color:#E2E8F0;margin-bottom:4px;">How to use this code</div>
              <div style="font-size:13px;color:#64748B;line-height:1.6;">
                ${purpose === 'recovery'
                  ? `Go to the <strong style="color:#94A3B8;">Reset Password</strong> page on our site, enter your email, paste this code, and set your new password.`
                  : `Return to the <strong style="color:#94A3B8;">sign-up screen</strong> on our site and enter these 6 digits to activate your account.`
                }
              </div>
            </td>
          </tr>
        </table>
      </div>`,

      `<p style="margin:0 0 8px;font-size:12.5px;line-height:1.7;color:#475569;">
        🔒 This is an automated security message. If you did not request this code, your account is safe — simply ignore this email. Never share this code with anyone.
      </p>`,
    ].join(''),
  })

  const text = [
    `Your ${AGENCY.name} ${purpose} code is: ${code}`,
    '',
    'This code expires in 10 minutes.',
    `${purpose === 'recovery' ? 'Enter it on the Reset Password screen to set your new password.' : 'Enter it on screen to verify your email and access your dashboard.'}`,
    '',
    'If you did not request this code, you can safely ignore this email.',
    '',
    `${AGENCY.name} · ${AGENCY.domain}`,
  ].join('\n')

  return { subject, html, text }
}

/* -------------------------------------------------------------------------- */
/*  5. Automated AI Studio Newsletter Email                                   */
/* -------------------------------------------------------------------------- */

export interface NewsletterIssue {
  title: string
  subtitle: string
  date: string
  readTime?: string
  contentHtml: string
  contentText: string
  ctaText?: string
  ctaUrl?: string
}

export function newsletterEmail(issue: NewsletterIssue): RenderedEmail {
  const subject = `Virtue & Co. Insights · ${issue.title}`
  const issueNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 30)) % 100 + 1

  const html = shell({
    preheader: issue.subtitle,
    body: [
      // Hero banner area
      `<div style="margin:-38px -36px 32px;background:linear-gradient(135deg,#0D1220 0%,#0B1929 50%,#0D1220 100%);border-bottom:1px solid #1E2638;padding:36px 36px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size:10.5px;font-weight:700;letter-spacing:0.22em;color:${GOLD};text-transform:uppercase;margin-bottom:14px;">
                STUDIO INSIGHTS · ISSUE #${issueNum} · ${escapeHtml(issue.date)}
              </div>
              <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">
                ${escapeHtml(issue.title)}
              </h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#94A3B8;">
                ${escapeHtml(issue.subtitle)}
              </p>
              ${issue.readTime ? `<span style="display:inline-block;padding:4px 10px;background:rgba(197,160,89,0.12);border:1px solid rgba(197,160,89,0.25);border-radius:999px;font-size:11px;font-weight:600;color:${GOLD};">📖 ${escapeHtml(issue.readTime)}</span>` : ''}
            </td>
          </tr>
        </table>
      </div>`,

      divider(),

      // Article content
      `<div style="font-size:15px;line-height:1.8;color:#CBD5E1;">${issue.contentHtml}</div>`,

      divider(),

      // CTA card
      `<div style="background:linear-gradient(135deg,#0D1625 0%,#0B1929 100%);border:1px solid #1E2638;border-radius:18px;padding:28px;text-align:center;">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:0.2em;color:${EMERALD};text-transform:uppercase;margin-bottom:10px;">READY TO BUILD?</div>
        <h3 style="margin:0 0 10px;font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:-0.01em;">Planning a website or web app?</h3>
        <p style="margin:0 0 20px;font-size:14px;color:#64748B;line-height:1.6;">Get a fully itemised scope and guaranteed fixed price from our senior engineering team. No surprises. No hidden fees.</p>
        ${button(issue.ctaUrl ?? `https://${AGENCY.domain}/contact`, issue.ctaText ?? 'Start Your Project')}
      </div>`,

      // Why subscribe note
      `<p style="margin:24px 0 0;font-size:12px;color:#475569;text-align:center;line-height:1.6;">
        You're receiving this because you subscribed at <a href="https://${AGENCY.domain}" style="color:${GOLD};text-decoration:none;">${AGENCY.domain}</a>.<br/>
        <a href="https://${AGENCY.domain}/unsubscribe" style="color:#475569;text-decoration:underline;">Unsubscribe</a> · <a href="https://${AGENCY.domain}/portal" style="color:#475569;text-decoration:underline;">Client Portal</a>
      </p>`,
    ].join(''),
  })

  const text = [
    `VIRTUE & CO. INSIGHTS · Issue #${issueNum} · ${issue.date}`,
    '='.repeat(50),
    issue.title,
    issue.subtitle,
    '',
    issue.contentText,
    '',
    '-'.repeat(50),
    `${issue.ctaText ?? 'Start your project'}: ${issue.ctaUrl ?? `https://${AGENCY.domain}/contact`}`,
    '',
    `Unsubscribe: https://${AGENCY.domain}/unsubscribe`,
  ].join('\n')

  return { subject, html, text }
}
