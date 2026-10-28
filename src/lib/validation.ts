/**
 * Server-side input validation.
 *
 * Deliberately built with version-stable Zod primitives (regex-based formats
 * instead of deprecated `.email()` / `.url()` helpers) so upgrading Zod never
 * breaks a build. The authoritative pass always happens on the server — the
 * browser is never trusted.
 */

import { z } from 'zod'
import {
  BUDGET_BANDS,
  CURRENCIES,
  INQUIRY_STATUSES,
  PROJECT_CATEGORIES,
  TIMELINES,
} from '@/lib/constants'

const currencyCodes = CURRENCIES.map((entry) => entry.code)

/** Pragmatic email check: rejects obvious junk without rejecting valid oddities. */
const emailLike = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Please enter your email address')
  .max(180, 'Email address is too long')
  .regex(/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/, 'Please enter a valid email address (e.g. name@company.com)')

const urlLike = z
  .string()
  .trim()
  .max(500, 'Link is too long')
  .regex(/^https?:\/\/[^\s]+$/i, 'Please enter a full link starting with https://')

/** Postgres `uuid` text form. Regex keeps this independent of Zod's format APIs. */
const uuidLike = z
  .string()
  .trim()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid reference format')

/** Empty form fields arrive as `''`; treat them as absent, not invalid. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximum ${max} characters allowed`)
    .transform((value) => (value === '' ? null : value))
    .nullable()

/* -------------------------------------------------------------------------- */
/*  Contact / lead capture                                                     */
/* -------------------------------------------------------------------------- */

export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Please enter your full name')
    .min(2, 'Please enter your name (at least 2 characters)')
    .max(120, 'Name is too long'),
  email: emailLike,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(120, 'Password is too long')
    .optional()
    .nullable(),
  phone: optionalText(40).optional(),
  company: optionalText(140).optional(),
  service: optionalText(60).optional(),
  budget: z.enum(BUDGET_BANDS).nullable().optional(),
  timeline: z.enum(TIMELINES).nullable().optional(),
  message: z
    .string()
    .trim()
    .min(1, 'Please tell us a little about your project')
    .min(10, 'Please tell us a little about your project (at least 10 characters)')
    .max(4000, 'Message is too long (maximum 4000 characters)'),
  locale: z.string().trim().min(2).max(8).default('en'),
  /** Honeypot — real users never fill this, bots usually do. */
  website: z.string().max(0).optional().or(z.literal('')).or(z.null()),
})

export type InquiryInput = z.infer<typeof inquirySchema>

/* -------------------------------------------------------------------------- */
/*  Payments                                                                   */
/* -------------------------------------------------------------------------- */

export const paymentSchema = z.object({
  amount: z.coerce.number().positive().max(50_000_000),
  currency: z.enum(currencyCodes),
  customerName: z.string().trim().min(2).max(140),
  customerEmail: emailLike,
  customerPhone: optionalText(40).optional(),
  purpose: optionalText(200).optional(),
  reference: optionalText(80).optional(),
  milestoneId: uuidLike.optional().or(z.literal('')).nullable(),
  orderReference: optionalText(80).optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

/* -------------------------------------------------------------------------- */
/*  Portfolio CMS                                                              */
/* -------------------------------------------------------------------------- */

export const projectSchema = z.object({
  id: uuidLike.optional().or(z.literal('')),
  title: z.string().trim().min(3).max(160),
  slug: z
    .string()
    .trim()
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .or(z.literal('')),
  client: optionalText(140).optional(),
  summary: optionalText(320).optional(),
  description: optionalText(6000).optional(),
  category: z.enum(PROJECT_CATEGORIES),
  techTags: z.array(z.string().trim().min(1).max(40)).max(24).default([]),
  liveUrl: urlLike.optional().or(z.literal('')),
  repoUrl: urlLike.optional().or(z.literal('')),
  coverImagePath: optionalText(400).optional(),
  galleryPaths: z.array(z.string().trim().max(400)).max(12).default([]),
  /** Real booleans — the action coerces checkbox/`FormData` values first. */
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
})

export type ProjectInput = z.infer<typeof projectSchema>

export const inquiryStatusUpdateSchema = z.object({
  id: uuidLike,
  status: z.enum(INQUIRY_STATUSES),
})

/* -------------------------------------------------------------------------- */
/*  Newsletter                                                                 */
/* -------------------------------------------------------------------------- */

export const newsletterSchema = z.object({
  email: emailLike,
  locale: z.string().trim().min(2).max(8).default('en'),
  source: z.string().trim().max(40).default('footer'),
  /**
   * Honeypot — real users never fill this. The field is intentionally *loose*
   * so a bot that fills it still passes validation and receives a plain 201;
   * a strict `max(0)` would reject the request with a 422 and tell the bot it
   * was caught. The route decides what to do with a non-empty value.
   */
  website: z.string().trim().max(200).optional().or(z.literal('')).or(z.null()),
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Flattens Zod issues into clean, client-friendly `{ field: [messages] }`. */
export function issuesToFieldErrors(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string[]> {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = String(issue.path[0] ?? '_form')
    let msg = issue.message

    // Clean up any remaining technical Zod language
    if (msg.includes('pattern') || msg.includes('regex') || msg.includes('Invalid string')) {
      if (key === 'email' || key === 'customerEmail') {
        msg = 'Please enter a valid email address (e.g. name@company.com)'
      } else if (key === 'name' || key === 'customerName') {
        msg = 'Please enter your full name'
      } else {
        msg = 'Please check this field and enter a valid value'
      }
    } else if (msg.toLowerCase().includes('too small') || msg.toLowerCase().includes('expected string to have >=')) {
      if (key === 'name' || key === 'customerName') {
        msg = 'Please enter your name (at least 2 characters)'
      } else if (key === 'email' || key === 'customerEmail') {
        msg = 'Please enter your email address'
      } else if (key === 'message') {
        msg = 'Please tell us a little about your project'
      } else if (key === 'password') {
        msg = 'Password must be at least 8 characters'
      } else {
        msg = 'Please fill out this field'
      }
    }

    acc[key] = [...(acc[key] ?? []), msg]
    return acc
  }, {})
}

/** URL-safe slug with sensible fallbacks, used by the CMS. */
export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140)
}
