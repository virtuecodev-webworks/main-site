import 'server-only'

import { AGENCY } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'
import type { Inquiry } from '@/lib/supabase/types'
import type { AppLocale } from '@/i18n/routing'
import { localeMeta } from '@/i18n/routing'

const GOLD = '#D4AF37'
const GOLD_DEEP = '#A2823C'
const INK = '#1A1A1A'
const MUTED = '#6B6B74'
const BORDER = '#E6E6EA'

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
 * consistently in Gmail, Outlook and Apple Mail.
 */
function shell({ preheader, body }: { preheader: string; body: string }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${AGENCY.name}</title>
  </head>
  <body style="margin:0;padding:0;background:#F8F9FA;">
    <div style="display:none;font-size:1px;color:#F8F9FA;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;font-family:'Poppins',Helvetica,Arial,sans-serif;">
            <tr>
              <td style="background:${INK};padding:26px 32px;">
                <div style="font-size:19px;font-weight:700;letter-spacing:0.06em;color:${GOLD};">
                  VIRTUE &amp; CO.
                </div>
                <div style="font-size:10px;font-weight:400;letter-spacing:0.42em;color:#C9C9D1;margin-top:5px;">
                  WEBWORKS
                </div>
              </td>
            </tr>
            <tr>
              <td style="height:3px;background:linear-gradient(90deg,${GOLD_DEEP},${GOLD},#F3E3A6,${GOLD},${GOLD_DEEP});"></td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#F8F9FA;border-top:1px solid ${BORDER};font-size:12px;line-height:1.7;color:${MUTED};">
                ${AGENCY.name}<br />
                <a href="mailto:${AGENCY.email}" style="color:${GOLD_DEEP};text-decoration:none;">${AGENCY.email}</a>
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
  return `<h1 style="margin:0 0 14px;font-size:23px;line-height:1.3;font-weight:700;color:${INK};">${escapeHtml(text)}</h1>`
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3A3A3F;">${text}</p>`
}

function divider() {
  return `<div style="height:1px;background:${BORDER};margin:26px 0;"></div>`
}

function detailRows(rows: Array<[string, string | null | undefined]>) {
  const filled = rows.filter(([, value]) => value !== null && value !== undefined && value !== '')
  if (!filled.length) return ''

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    ${filled
      .map(
        ([label, value]) => `<tr>
      <td style="padding:9px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:${MUTED};width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:9px 0;font-size:15px;color:${INK};font-weight:500;">${escapeHtml(String(value))}</td>
    </tr>`,
      )
      .join('')}
  </table>`
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
    <tr>
      <td style="background:${GOLD};border-radius:10px;">
        <a href="${href}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#1A1508;text-decoration:none;">${escapeHtml(label)}</a>
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
