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
  .min(5)
  .max(180)
  .regex(/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/)

const urlLike = z
  .string()
  .trim()
  .max(500)
  .regex(/^https?:\/\/[^\s]+$/i)

/** Postgres `uuid` text form. Regex keeps this independent of Zod's format APIs. */
const uuidLike = z
  .string()
  .trim()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)

/** Empty form fields arrive as `''`; treat them as absent, not invalid. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullable()

/* -------------------------------------------------------------------------- */
/*  Contact / lead capture                                                     */
/* -------------------------------------------------------------------------- */

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailLike,
  password: z.string().min(8).max(120).optional().nullable(),
  phone: optionalText(40).optional(),
  company: optionalText(140).optional(),
  service: optionalText(60).optional(),
  budget: z.enum(BUDGET_BANDS).nullable().optional(),
  timeline: z.enum(TIMELINES).nullable().optional(),
  message: z.string().trim().min(20).max(4000),
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

/** Flattens Zod issues into `{ field: [messages] }` for form display. */
export function issuesToFieldErrors(
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>,
): Record<string, string[]> {
  return issues.reduce<Record<string, string[]>>((acc, issue) => {
    const key = String(issue.path[0] ?? '_form')
    acc[key] = [...(acc[key] ?? []), issue.message]
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
