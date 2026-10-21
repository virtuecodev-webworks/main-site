import 'server-only'

import { AGENCY, GOOGLE_MEET_MAILTO } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'
import type { Inquiry } from '@/lib/supabase/types'
import type { AppLocale } from '@/i18n/routing'
import { localeMeta } from '@/i18n/routing'

const GOLD = '#DCAA28'
const GOLD_LIGHT = '#F59E0B'
const EMERALD = '#14A06C'
const OBSIDIAN_BG = '#08090C'
const CARD_BG = '#0F1219'
const WELL_BG = '#141824'
const BORDER = '#1E2534'
const BORDER_INNER = '#242C3D'
const TEXT_PRIMARY = '#FFFFFF'
const TEXT_SECONDARY = '#CBD5E1'
const TEXT_MUTED = '#94A3B8'
const TEXT_DIM = '#64748B'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

/* -------------------------------------------------------------------------- */
/*  Shell — Responsive 600px Luxury Dark React-Email Standard Architecture    */
/* -------------------------------------------------------------------------- */

function shell({
  preheader,
  body,
  badge = 'STUDIO OFFICIAL',
}: {
  preheader: string
  body: string
  badge?: string
}) {
  const logoUrl = 'https://virtuecowebworks.solutions/brand/logo-mark.png'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${AGENCY.name}</title>
  </head>
  <body style="margin:0;padding:0;background:${OBSIDIAN_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:${TEXT_SECONDARY};">
    <div style="display:none;font-size:1px;color:${OBSIDIAN_BG};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${escapeHtml(preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${OBSIDIAN_BG};padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${CARD_BG};border:1px solid ${BORDER};border-radius:20px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,0.65);">
            <!-- Branded Header -->
            <tr>
              <td style="background:#0B0E15;padding:28px 36px;border-bottom:1px solid ${BORDER};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width:44px;vertical-align:middle;">
                            <img src="${logoUrl}" width="44" height="44" alt="Virtue &amp; Co." style="display:block;border-radius:10px;border:1px solid rgba(255,255,255,0.12);" />
                          </td>
                          <td style="padding-left:14px;vertical-align:middle;">
                            <div style="font-size:17px;font-weight:800;letter-spacing:-0.01em;color:${TEXT_PRIMARY};line-height:1.15;">
                              VIRTUE <span style="color:${GOLD};font-weight:800;">&amp;</span> CO.
                            </div>
                            <div style="font-size:9.5px;font-weight:700;letter-spacing:0.24em;color:${TEXT_MUTED};margin-top:3px;text-transform:uppercase;">
                              WEBWORKS STUDIO
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="display:inline-block;padding:5px 12px;background:rgba(20,160,108,0.12);border:1px solid rgba(20,160,108,0.28);border-radius:999px;font-size:10.5px;font-weight:700;color:${EMERALD};letter-spacing:0.06em;text-transform:uppercase;">
                        ● ${escapeHtml(badge)}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- 2px Architectural Gold & Emerald Gradient Line -->
            <tr>
              <td style="height:2px;background:linear-gradient(90deg,${GOLD} 0%,${GOLD_LIGHT} 35%,${EMERALD} 100%);"></td>
            </tr>
            <!-- Main Content Area -->
            <tr>
              <td style="padding:40px 36px 32px;color:${TEXT_SECONDARY};">
                ${body}
              </td>
            </tr>
            <!-- Studio Proof Points -->
            <tr>
              <td style="padding:0 36px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${WELL_BG};border:1px solid ${BORDER_INNER};border-radius:14px;overflow:hidden;">
                  <tr>
                    <td style="padding:16px 12px;width:33.3%;border-right:1px solid ${BORDER_INNER};text-align:center;">
                      <div style="font-size:16px;font-weight:800;color:${TEXT_PRIMARY};margin-bottom:2px;">95–100</div>
                      <div style="font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Core Web Vitals</div>
                    </td>
                    <td style="padding:16px 12px;width:33.3%;border-right:1px solid ${BORDER_INNER};text-align:center;">
                      <div style="font-size:16px;font-weight:800;color:${GOLD};margin-bottom:2px;">Fixed Scope</div>
                      <div style="font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Guaranteed Price</div>
                    </td>
                    <td style="padding:16px 12px;width:33.3%;text-align:center;">
                      <div style="font-size:16px;font-weight:800;color:${EMERALD};margin-bottom:2px;">100% Owned</div>
                      <div style="font-size:10px;color:${TEXT_MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Direct Codebase</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Branded Footer -->
            <tr>
              <td style="padding:28px 36px;background:#090C12;border-top:1px solid ${BORDER};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <div style="font-size:13px;font-weight:700;color:${TEXT_PRIMARY};">${AGENCY.name}</div>
                      <div style="font-size:12px;color:${TEXT_DIM};margin-top:6px;line-height:1.6;">
                        Ultra-sleek web engineering &amp; digital experiences.<br />
                        <a href="https://${AGENCY.domain}" style="color:${GOLD};text-decoration:none;font-weight:600;">${AGENCY.domain}</a> · 
                        <a href="mailto:${AGENCY.email}" style="color:${TEXT_MUTED};text-decoration:none;">${AGENCY.email}</a>
                      </div>
                      <div style="font-size:11px;color:#475569;margin-top:12px;">
                        © ${new Date().getFullYear()} Virtue &amp; Co. Webworks. All rights reserved.
                      </div>
                    </td>
                    <td align="right" style="vertical-align:top;">
                      <a href="https://${AGENCY.domain}/portal" style="display:inline-block;padding:8px 16px;background:#151A26;border:1px solid #283248;border-radius:8px;font-size:12px;font-weight:600;color:${TEXT_PRIMARY};text-decoration:none;white-space:nowrap;">
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
  return `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:800;color:${TEXT_PRIMARY};letter-spacing:-0.02em;">${escapeHtml(text)}</h1>`
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${TEXT_MUTED};">${text}</p>`
}

function divider() {
  return `<div style="height:1px;background:${BORDER};margin:24px 0;"></div>`
}

function detailRows(rows: Array<[string, string | null | undefined]>) {
  const filled = rows.filter(([, value]) => value !== null && value !== undefined && value !== '')
  if (!filled.length) return ''

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;background:${WELL_BG};border:1px solid ${BORDER_INNER};border-radius:12px;overflow:hidden;">
    ${filled
      .map(
        ([label, value], idx) => `<tr>
      <td style="padding:11px 16px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${TEXT_DIM};width:34%;vertical-align:middle;${idx > 0 ? `border-top:1px solid ${BORDER_INNER};` : ''}">${escapeHtml(label)}</td>
      <td style="padding:11px 16px;font-size:13.5px;color:${TEXT_PRIMARY};font-weight:600;vertical-align:middle;${idx > 0 ? `border-top:1px solid ${BORDER_INNER};` : ''}">${escapeHtml(String(value))}</td>
    </tr>`,
      )
      .join('')}
  </table>`
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 10px;">
    <tr>
      <td style="background:${GOLD};border-radius:10px;box-shadow:0 4px 18px rgba(220,170,40,0.35);">
        <a href="${href}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#0B0E15;text-decoration:none;letter-spacing:0.02em;">${escapeHtml(label)} →</a>
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
    badge: 'NEW LEAD',
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
      `<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${TEXT_DIM};margin-bottom:8px;font-weight:700;">Client Message</div>
       <div style="font-size:14.5px;line-height:1.7;color:${TEXT_SECONDARY};white-space:pre-wrap;background:${WELL_BG};border:1px solid ${BORDER_INNER};border-radius:12px;padding:16px;">${escapeHtml(inquiry.message)}</div>`,
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
    badge: 'CONFIRMED',
    body: [
      heading(copy.heading),
      paragraph(`Hi ${escapeHtml(inquiry.name.split(' ')[0] ?? inquiry.name)},`),
      paragraph(escapeHtml(copy.intro)),
      divider(),
      `<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:${TEXT_DIM};margin-bottom:10px;font-weight:700;">Your Submission Summary</div>`,
      detailRows([
        ['Service', inquiry.service],
        ['Budget', inquiry.budget],
        ['Timeline', inquiry.timeline],
      ]),
      `<div style="margin-top:14px;font-size:14.5px;line-height:1.7;color:${TEXT_SECONDARY};white-space:pre-wrap;background:${WELL_BG};border:1px solid ${BORDER_INNER};border-radius:12px;padding:16px;">${escapeHtml(inquiry.message)}</div>`,
      divider(),
      paragraph(escapeHtml(copy.nextSteps)),
      paragraph(escapeHtml(copy.signoff)),
      button(`mailto:${AGENCY.email}`, 'Email the Studio'),
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
  const subject = `Payment confirmation - ${amount} (${input.reference})`

  const html = shell({
    preheader: `Receipt ${input.reference} for ${amount}`,
    badge: 'RECEIPT',
    body: [
      heading('Payment confirmed'),
      paragraph(
        `We have received your payment of <strong style="color:${TEXT_PRIMARY};">${escapeHtml(amount)}</strong>. This email is your official receipt.`,
      ),
      detailRows([
        ['Reference', input.reference],
        ['Transaction ID', input.providerTxId],
        ['Amount Paid', amount],
        ['Purpose', input.purpose],
        ['Timestamp', input.paidAt],
        ['Payer', input.customerName ?? input.customerEmail],
      ]),
      divider(),
      paragraph(
        `Retain this receipt for your accounting records. If you require a custom invoice PDF with corporate tax details, reply directly to this email.`,
      ),
      button(`https://${AGENCY.domain}/portal`, 'Open Client Portal'),
    ].join(''),
  })

  const text = [
    'PAYMENT CONFIRMATION',
    '',
    `Amount: ${amount}`,
    `Reference: ${input.reference}`,
    input.providerTxId ? `Transaction ID: ${input.providerTxId}` : null,
    input.purpose ? `Purpose: ${input.purpose}` : null,
    `Paid at: ${input.paidAt}`,
    '',
    'This email is your official receipt.',
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
      'Your project enquiry has landed safely with the Virtue & Co. Webworks studio and a senior engineer is reviewing it now.',
    nextSteps:
      'Within two business days you will receive a scoped proposal: deliverables, timeline and a guaranteed fixed price.',
    signoff: 'Best regards,\nThe Virtue & Co. Webworks studio',
  },
  fr: {
    heading: 'Merci - votre demande nous est bien parvenue',
    intro:
      'Votre demande de projet est bien arrivée au studio Virtue & Co. Webworks et un ingénieur senior l’examine dès maintenant.',
    nextSteps:
      'Sous deux jours ouvrés, vous recevrez une proposition cadrée : livrables, calendrier et prix fixe garanti.',
    signoff: 'À très vite,\nLe studio Virtue & Co. Webworks',
  },
  es: {
    heading: 'Gracias - tu consulta ya está con nosotros',
    intro:
      'Tu consulta de proyecto ha llegado correctamente al estudio Virtue & Co. Webworks y un ingeniero senior la está revisando ahora mismo.',
    nextSteps:
      'En dos días hábiles recibirás una propuesta detallada: entregables, calendario y precio fijo garantizado.',
    signoff: 'Hasta pronto,\nEl estudio Virtue & Co. Webworks',
  },
  de: {
    heading: 'Danke - Ihre Anfrage liegt bei uns',
    intro:
      'Ihre Projektanfrage ist sicher im Studio von Virtue & Co. Webworks eingegangen und wird gerade von einem Senior Engineer geprüft.',
    nextSteps:
      'Innerhalb von zwei Werktagen erhalten Sie ein detailliertes Angebot: Leistungen, Zeitplan und Festpreis.',
    signoff: 'Bis bald,\nDas Studio von Virtue & Co. Webworks',
  },
  ar: {
    heading: 'شكرًا لك - استفسارك وصل إلينا',
    intro:
      'وصل استفسار مشروعك بأمان إلى استوديو فيرتو آند كو ويب ووركس، ويقوم مهندس متمرس بمراجعته الآن.',
    nextSteps:
      'خلال يومي عمل ستستلم عرضًا محددًا يشمل المخرجات والجدول الزمني وسعرًا ثابتًا مضمونًا.',
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
/*  4. Branded 6-Digit OTP Verification Email (React Email / Linear Standard)  */
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
  const isRecovery = purpose === 'recovery'
  const subject = `${code} is your ${AGENCY.name} verification code`
  const firstName = name?.split(' ')[0] ?? ''

  const html = shell({
    preheader: `Your ${isRecovery ? 'password reset' : 'verification'} code is ${code}. Valid for 10 minutes.`,
    badge: 'SECURITY',
    body: [
      `<div style="margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.22em;color:${GOLD};text-transform:uppercase;margin-bottom:10px;">
          AUTHENTICATION GATEWAY
        </div>
        <h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;font-weight:800;color:${TEXT_PRIMARY};letter-spacing:-0.02em;">
          ${isRecovery ? 'Reset your password' : 'Confirm your account'}
        </h1>
        <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT_MUTED};">
          ${firstName ? `Hi <strong style="color:${TEXT_PRIMARY};">${escapeHtml(firstName)}</strong>, use` : 'Use'} the 6-digit one-time code below to ${isRecovery ? 'complete your password reset' : 'confirm your email address and activate your client portal'}.
        </p>
      </div>`,

      `<!-- Linear/Raycast-Inspired Minimalist Passcode Box -->
      <div style="background:${WELL_BG};border:1px solid ${BORDER_INNER};border-radius:16px;padding:32px 20px;text-align:center;margin:28px 0;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.2em;color:${GOLD};text-transform:uppercase;margin-bottom:14px;">
          ${isRecovery ? 'PASSWORD RESET CODE' : 'ONE-TIME VERIFICATION CODE'}
        </div>
        <div style="display:inline-block;background:#0B0E15;border:1.5px solid ${GOLD};border-radius:12px;padding:14px 28px;box-shadow:0 8px 24px rgba(0,0,0,0.45);">
          <span style="font-family:'SF Mono',Monaco,Consolas,'Roboto Mono',monospace;font-size:38px;font-weight:800;letter-spacing:10px;color:${TEXT_PRIMARY};padding-left:10px;display:inline-block;">
            ${escapeHtml(code)}
          </span>
        </div>
        <div style="margin-top:14px;font-size:12px;color:${TEXT_DIM};font-weight:500;">
          ⏱ Valid for 10 minutes · Single-use authorization code
        </div>
      </div>`,

      `<!-- Security Metadata Box -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0E15;border:1px solid ${BORDER};border-radius:12px;margin-bottom:24px;font-size:12.5px;">
        <tr>
          <td style="padding:12px 16px;color:${TEXT_DIM};width:38%;border-bottom:1px solid ${BORDER};">Security Protocol</td>
          <td style="padding:12px 16px;color:${TEXT_PRIMARY};font-weight:600;border-bottom:1px solid ${BORDER};">256-bit Encrypted OTP</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:${TEXT_DIM};border-bottom:1px solid ${BORDER};">Authorized Target</td>
          <td style="padding:12px 16px;color:${TEXT_PRIMARY};font-weight:600;border-bottom:1px solid ${BORDER};">Virtue &amp; Co. Client Workspace</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:${TEXT_DIM};">Account Protection</td>
          <td style="padding:12px 16px;color:${EMERALD};font-weight:600;">Verified Authentication</td>
        </tr>
      </table>`,

      `<p style="margin:0;font-size:12.5px;line-height:1.65;color:${TEXT_DIM};">
        🔒 This is an automated security transmission. If you did not initiate this request, no action is required and your account remains protected. Never share this code with anyone.
      </p>`,
    ].join(''),
  })

  const text = [
    `Your ${AGENCY.name} ${isRecovery ? 'password reset' : 'verification'} code is: ${code}`,
    '',
    'This single-use code expires in 10 minutes.',
    `${isRecovery ? 'Enter it on the Reset Password screen to update your credentials.' : 'Enter it on screen to verify your email and activate your workspace.'}`,
    '',
    'If you did not request this code, you can safely disregard this email.',
    '',
    `${AGENCY.name} · https://${AGENCY.domain}`,
  ].join('\n')

  return { subject, html, text }
}

/* -------------------------------------------------------------------------- */
/*  5. Editorial Newsletter Email ("Studio Dispatch")                         */
/* -------------------------------------------------------------------------- */

export interface NewsletterIssue {
  title: string
  subtitle: string
  date: string
  readTime?: string
  contentHtml: string
  contentText: string
  coverImageUrl?: string
  ctaText?: string
  ctaUrl?: string
}

export function newsletterEmail(issue: NewsletterIssue): RenderedEmail {
  const subject = `Virtue & Co. Dispatch · ${issue.title}`
  const coverUrl = issue.coverImageUrl ?? 'https://virtuecowebworks.solutions/media/photos/studio.jpg'

  const html = shell({
    preheader: issue.subtitle,
    badge: 'DISPATCH',
    body: [
      `<!-- Issue Pill Header -->
      <div style="font-size:11px;font-weight:700;letter-spacing:0.22em;color:${GOLD};text-transform:uppercase;margin-bottom:12px;">
        STUDIO EDITORIAL · ${escapeHtml(issue.date.toUpperCase())}
      </div>
      <h1 style="margin:0 0 14px;font-size:28px;line-height:1.2;font-weight:800;color:${TEXT_PRIMARY};letter-spacing:-0.02em;">
        ${escapeHtml(issue.title)}
      </h1>
      <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${TEXT_MUTED};">
        ${escapeHtml(issue.subtitle)}
      </p>
      ${issue.readTime ? `<div style="margin-bottom:24px;"><span style="display:inline-block;padding:4px 12px;background:rgba(220,170,40,0.1);border:1px solid rgba(220,170,40,0.25);border-radius:999px;font-size:11.5px;font-weight:600;color:${GOLD};">⏱ ${escapeHtml(issue.readTime)} read</span></div>` : ''}
      
      <!-- Editorial Photography Cover -->
      <div style="margin-bottom:28px;">
        <img src="${coverUrl}" width="100%" alt="${escapeHtml(issue.title)}" style="display:block;width:100%;max-width:100%;height:auto;border-radius:14px;border:1px solid ${BORDER};box-shadow:0 12px 32px rgba(0,0,0,0.4);" />
      </div>`,

      `<!-- Article Body -->
      <div style="font-size:15px;line-height:1.8;color:${TEXT_SECONDARY};">
        ${issue.contentHtml}
      </div>`,

      divider(),

      `<!-- Studio Insight Callout Card -->
      <div style="background:${WELL_BG};border:1px solid ${BORDER_INNER};border-radius:16px;padding:28px;margin:28px 0;text-align:center;">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:0.2em;color:${EMERALD};text-transform:uppercase;margin-bottom:8px;">
          HIGH-PERFORMANCE ARCHITECTURE
        </div>
        <h3 style="margin:0 0 10px;font-size:20px;font-weight:800;color:${TEXT_PRIMARY};letter-spacing:-0.01em;">
          Planning a redesign or new digital project?
        </h3>
        <p style="margin:0 0 20px;font-size:14px;color:${TEXT_MUTED};line-height:1.6;max-width:440px;margin-left:auto;margin-right:auto;">
          Get an itemised engineering scope, direct senior engineer review, and a guaranteed fixed deadline with zero hidden costs.
        </p>
        ${button(issue.ctaUrl ?? `https://${AGENCY.domain}/contact`, issue.ctaText ?? 'Start Your Project')}
      </div>`,

      `<!-- Unsubscribe & Preferences -->
      <p style="margin:20px 0 0;font-size:11.5px;color:${TEXT_DIM};text-align:center;line-height:1.7;">
        You are receiving this editorial dispatch because you subscribed at <a href="https://${AGENCY.domain}" style="color:${GOLD};text-decoration:none;">${AGENCY.domain}</a>.<br />
        <a href="https://${AGENCY.domain}/unsubscribe" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe</a> · 
        <a href="https://${AGENCY.domain}/privacy" style="color:${TEXT_MUTED};text-decoration:underline;">Privacy Policy</a> · 
        <a href="https://${AGENCY.domain}/portal" style="color:${TEXT_MUTED};text-decoration:underline;">Client Portal</a>
      </p>`,
    ].join(''),
  })

  const text = [
    `VIRTUE & CO. DISPATCH · ${issue.date}`,
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
