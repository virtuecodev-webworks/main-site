import 'server-only'

import * as React from 'react'
import { render } from '@react-email/render'
import { AGENCY, GOOGLE_MEET_MAILTO } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'
import type { Inquiry } from '@/lib/supabase/types'
import type { AppLocale } from '@/i18n/routing'
import { localeMeta } from '@/i18n/routing'

// ── React Email TSX components ──
import { SignupOtpEmail } from '@/emails/signup-otp'
import { WelcomeEmail } from '@/emails/welcome'
import { NewsletterConfirmEmail } from '@/emails/newsletter-confirm'
import { ResetOtpEmail } from '@/emails/reset-otp'
import { PaymentReceiptEmail } from '@/emails/payment-receipt'
import { EnquiryClientEmail } from '@/emails/enquiry-client'
import { EnquiryAdminEmail } from '@/emails/enquiry-admin'
import { NewsletterDispatchEmail, type NewsletterDispatchProps } from '@/emails/newsletter'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

// Re-export newsletter type for consumers
export type { NewsletterDispatchProps as NewsletterIssue }

/* ------------------------------------------------------------------ */
/*  Utility: plaintext fallback                                        */
/* ------------------------------------------------------------------ */
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/* ------------------------------------------------------------------ */
/*  1.  Confirm Email — 6-digit OTP                                   */
/* ------------------------------------------------------------------ */
export async function signupOtpEmail({ code, name }: { code: string; name?: string }): Promise<RenderedEmail> {
  const html = await render(React.createElement(SignupOtpEmail, { code, name }))
  return {
    subject: `${code} is your ${AGENCY.name} verification code`,
    html,
    text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, you can safely ignore it.\n\n${AGENCY.name} · https://${AGENCY.domain}`,
  }
}

/* ------------------------------------------------------------------ */
/*  2.  Welcome Email                                                  */
/* ------------------------------------------------------------------ */
export async function welcomeEmail({ name }: { name?: string } = {}): Promise<RenderedEmail> {
  const html = await render(React.createElement(WelcomeEmail, { name }))
  const first = name?.split(' ')[0] ?? 'there'
  return {
    subject: `Welcome to ${AGENCY.name}, ${first} 👋`,
    html,
    text: `Welcome to ${AGENCY.name}!\n\nYour client workspace is now active. Log in at https://${AGENCY.domain}/portal to get started.\n\n${AGENCY.name} · ${AGENCY.email}`,
  }
}

/* ------------------------------------------------------------------ */
/*  3.  Newsletter Subscription Confirmed                              */
/* ------------------------------------------------------------------ */
export async function newsletterConfirmEmail({ email }: { email: string }): Promise<RenderedEmail> {
  const html = await render(React.createElement(NewsletterConfirmEmail, { email }))
  return {
    subject: `You're subscribed to ${AGENCY.name} Studio Insights ✓`,
    html,
    text: `You're now subscribed to the ${AGENCY.name} Studio Dispatch.\n\nExpect weekly editorial insights on web engineering, design systems, and digital business.\n\nUnsubscribe at any time: https://${AGENCY.domain}/unsubscribe`,
  }
}

/* ------------------------------------------------------------------ */
/*  4.  Reset Password — 6-digit OTP                                  */
/* ------------------------------------------------------------------ */
export async function resetOtpEmail({ code, name }: { code: string; name?: string }): Promise<RenderedEmail> {
  const html = await render(React.createElement(ResetOtpEmail, { code, name }))
  return {
    subject: `${code} is your ${AGENCY.name} password reset code`,
    html,
    text: `Your password reset code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email.\n\n${AGENCY.name} · https://${AGENCY.domain}`,
  }
}

/* ------------------------------------------------------------------ */
/*  5.  Payment Receipt                                                */
/* ------------------------------------------------------------------ */
export async function paymentReceiptEmail(input: {
  reference: string
  providerTxId: string | null
  amount: number
  currency: string
  customerName: string | null
  customerEmail: string
  purpose: string | null
  paidAt: string
}): Promise<RenderedEmail> {
  const amountStr = formatMoney(input.amount, input.currency)
  const html = await render(React.createElement(PaymentReceiptEmail, {
    reference: input.reference,
    transactionId: input.providerTxId,
    amount: amountStr,
    purpose: input.purpose,
    paidAt: input.paidAt,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
  }))
  return {
    subject: `Payment confirmed — ${amountStr} (Ref: ${input.reference})`,
    html,
    text: `PAYMENT RECEIPT\n\nAmount: ${amountStr}\nReference: ${input.reference}\n${input.providerTxId ? `Transaction ID: ${input.providerTxId}\n` : ''}${input.purpose ? `Purpose: ${input.purpose}\n` : ''}Paid at: ${input.paidAt}\n\nThis is your official receipt. ${AGENCY.name} · ${AGENCY.email}`,
  }
}

/* ------------------------------------------------------------------ */
/*  6.  Client Enquiry Auto-Reply                                      */
/* ------------------------------------------------------------------ */
export async function enquiryClientEmail(inquiry: Inquiry): Promise<RenderedEmail> {
  const html = await render(React.createElement(EnquiryClientEmail, {
    name: inquiry.name,
    service: inquiry.service,
    budget: inquiry.budget,
    timeline: inquiry.timeline,
    message: inquiry.message,
    locale: inquiry.locale,
  }))
  return {
    subject: `We've received your enquiry — ${AGENCY.name}`,
    html,
    text: `Hi ${inquiry.name},\n\nYour project enquiry has landed with the ${AGENCY.name} studio. We'll reply with a full scoped proposal within 2 business days.\n\nService: ${inquiry.service ?? 'N/A'}\nBudget: ${inquiry.budget ?? 'N/A'}\nTimeline: ${inquiry.timeline ?? 'N/A'}\n\nTalk soon,\n${AGENCY.name}`,
  }
}

/* ------------------------------------------------------------------ */
/*  7.  Admin Lead Notification                                        */
/* ------------------------------------------------------------------ */
export async function enquiryAdminEmail(inquiry: Inquiry, localeLabel: string): Promise<RenderedEmail> {
  const html = await render(React.createElement(EnquiryAdminEmail, {
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    company: inquiry.company,
    service: inquiry.service,
    budget: inquiry.budget,
    timeline: inquiry.timeline,
    message: inquiry.message,
    locale: localeLabel,
    source: inquiry.source,
    submittedAt: inquiry.created_at ? new Date(inquiry.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : undefined,
  }))
  return {
    subject: `🔔 New lead: ${inquiry.name}${inquiry.company ? ` — ${inquiry.company}` : ''} · ${inquiry.service ?? 'General enquiry'}`,
    html,
    text: `NEW LEAD\n\nName: ${inquiry.name}\nEmail: ${inquiry.email}\n${inquiry.phone ? `Phone: ${inquiry.phone}\n` : ''}${inquiry.company ? `Company: ${inquiry.company}\n` : ''}Service: ${inquiry.service ?? 'N/A'}\nBudget: ${inquiry.budget ?? 'N/A'}\nTimeline: ${inquiry.timeline ?? 'N/A'}\n\nMessage:\n${inquiry.message}`,
  }
}

/* ------------------------------------------------------------------ */
/*  8.  Weekly Newsletter Dispatch                                     */
/* ------------------------------------------------------------------ */
export async function newsletterEmail(issue: NewsletterDispatchProps): Promise<RenderedEmail> {
  const html = await render(React.createElement(NewsletterDispatchEmail, issue))
  return {
    subject: `${AGENCY.name} Studio Dispatch · ${issue.title}`,
    html,
    text: `${AGENCY.name} Studio Dispatch\n${'='.repeat(50)}\n${issue.title}\n${issue.subtitle}\n\n${stripHtml(issue.contentHtml)}\n\n${issue.ctaText ?? 'Start your project'}: ${issue.ctaUrl ?? `https://${AGENCY.domain}/contact`}\n\nUnsubscribe: https://${AGENCY.domain}/unsubscribe`,
  }
}

/* ------------------------------------------------------------------ */
/*  Locale helpers (backward compat)                                   */
/* ------------------------------------------------------------------ */

export interface ConfirmationCopy {
  heading: string
  intro: string
  nextSteps: string
  signoff: string
}

const CONFIRMATION_COPY: Record<AppLocale, ConfirmationCopy> = {
  en: {
    heading: 'Thanks - your enquiry is with us',
    intro: 'Your project enquiry has landed safely with the Virtue & Co. Webworks studio and a senior engineer is reviewing it now.',
    nextSteps: 'Within two business days you will receive a scoped proposal: deliverables, timeline and a guaranteed fixed price.',
    signoff: 'Best regards,\nThe Virtue & Co. Webworks studio',
  },
  fr: {
    heading: 'Merci - votre demande nous est bien parvenue',
    intro: "Votre demande de projet est bien arrivée au studio Virtue & Co. Webworks et un ingénieur senior l'examine dès maintenant.",
    nextSteps: 'Sous deux jours ouvrés, vous recevrez une proposition cadrée : livrables, calendrier et prix fixe garanti.',
    signoff: 'À très vite,\nLe studio Virtue & Co. Webworks',
  },
  es: {
    heading: 'Gracias - tu consulta ya está con nosotros',
    intro: 'Tu consulta de proyecto ha llegado correctamente al estudio Virtue & Co. Webworks y un ingeniero senior la está revisando ahora mismo.',
    nextSteps: 'En dos días hábiles recibirás una propuesta detallada: entregables, calendario y precio fijo garantizado.',
    signoff: 'Hasta pronto,\nEl estudio Virtue & Co. Webworks',
  },
  de: {
    heading: 'Danke - Ihre Anfrage liegt bei uns',
    intro: 'Ihre Projektanfrage ist sicher im Studio von Virtue & Co. Webworks eingegangen und wird gerade von einem Senior Engineer geprüft.',
    nextSteps: 'Innerhalb von zwei Werktagen erhalten Sie ein detailliertes Angebot: Leistungen, Zeitplan und Festpreis.',
    signoff: 'Bis bald,\nDas Studio von Virtue & Co. Webworks',
  },
  ar: {
    heading: 'شكرًا لك - استفسارك وصل إلينا',
    intro: 'وصل استفسار مشروعك بأمان إلى استوديو فيرتو آند كو ويب ووركس، ويقوم مهندس متمرس بمراجعته الآن.',
    nextSteps: 'خلال يومي عمل ستستلم عرضًا محددًا يشمل المخرجات والجدول الزمني وسعرًا ثابتًا مضمونًا.',
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

// ─── Backward-compat shims (old callers used non-async HTML string templates) ──

export function verificationCodeEmail(opts: { code: string; name?: string; purpose?: string }): { subject: string; html: string; text: string } {
  // Synchronous stub — call async signupOtpEmail / resetOtpEmail in new code
  return {
    subject: `${opts.code} is your ${AGENCY.name} ${opts.purpose === 'recovery' ? 'password reset' : 'verification'} code`,
    html: `<p>Your code is: <strong>${opts.code}</strong>. Valid for 10 minutes.</p>`,
    text: `Your code is: ${opts.code}. Valid for 10 minutes.`,
  }
}

export function leadNotificationEmail(inquiry: Inquiry, label: string): { subject: string; html: string; text: string } {
  return {
    subject: `New lead: ${inquiry.name}`,
    html: `<p>New enquiry from ${inquiry.name}.</p>`,
    text: `New enquiry from ${inquiry.name}.`,
  }
}

export function leadConfirmationEmail(inquiry: Inquiry, copy: ConfirmationCopy): { subject: string; html: string; text: string } {
  return {
    subject: `We've received your enquiry`,
    html: `<p>${copy.intro}</p>`,
    text: copy.intro,
  }
}

export function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
