import { z } from 'zod'
import { issuesToFieldErrors } from '@/lib/validation'
import {
  DISCOVERY_PROVIDERS,
  OUTREACH_RUN_MODES,
  OUTREACH_RUN_STATUSES,
  PROSPECT_SOURCE_PROVIDERS,
  PROSPECT_STATUSES,
  SITE_ISSUE_CODES,
  SITE_ISSUE_SEVERITIES,
} from './types'

export { issuesToFieldErrors }

const emailLike = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Please enter an email address')
  .max(180, 'Email address is too long')
  .regex(/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/, 'Please enter a valid email address (e.g. name@company.com)')

const nullableEmail = z.union([
  emailLike,
  z.string().trim().max(0).transform(() => null),
  z.null(),
])

const urlLike = z
  .string()
  .trim()
  .max(500, 'Link is too long')
  .regex(/^https?:\/\/[^\s]+$/i, 'Please enter a full link starting with https://')

const nullableUrl = z.union([
  urlLike,
  z.string().trim().max(0).transform(() => null),
  z.null(),
])

const uuidLike = z
  .string()
  .trim()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid reference format')

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximum ${max} characters allowed`)
    .transform((value) => (value === '' ? null : value))
    .nullable()

function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => (value === '' || value === null ? undefined : value), schema)
}

export const siteIssueSchema = z.object({
  code: z.enum(SITE_ISSUE_CODES),
  label: z.string().trim().min(1).max(160),
  severity: z.enum(SITE_ISSUE_SEVERITIES),
  points: z.number().int().min(0).max(100),
  detail: z.string().trim().max(500).optional(),
})

export const outreachSettingsUpdateSchema = z
  .object({
    is_paused: z.boolean().optional(),
    daily_send_cap: z.number().int().min(1).max(200).optional(),
    industries: z.array(z.string().trim().min(1).max(80)).max(25).optional(),
    locations: z.array(z.string().trim().min(1).max(120)).max(25).optional(),
    keywords: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
    discovery_provider: z.enum(DISCOVERY_PROVIDERS).optional(),
    min_issue_score: z.number().int().min(0).max(100).optional(),
    dry_run_default: z.boolean().optional(),
    test_recipient_email: nullableEmail.optional(),
    serper_api_key: z.string().trim().max(200).nullable().optional(),
    gemini_api_key: z.string().trim().max(200).nullable().optional(),
    brevo_smtp_login: z.string().trim().max(200).nullable().optional(),
    brevo_smtp_key: z.string().trim().max(200).nullable().optional(),
    brevo_from_email: z.string().trim().max(200).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one settings field must be provided',
  })

export type OutreachSettingsUpdateInput = z.infer<typeof outreachSettingsUpdateSchema>

export const prospectCreateSchema = z.object({
  business_name: z.string().trim().min(2, 'Business name must be at least 2 characters').max(160),
  website_url: nullableUrl.optional(),
  industry: optionalText(80).optional(),
  location: optionalText(120).optional(),
  contact_email: nullableEmail.optional(),
  phone: optionalText(40).optional(),
  source_provider: z.enum(PROSPECT_SOURCE_PROVIDERS).default('manual'),
  source_external_id: optionalText(160).optional(),
  evaluation_notes: optionalText(1000).optional(),
  status: z.enum(PROSPECT_STATUSES).default('discovered'),
  issue_score: z.number().int().min(0).max(100).default(0),
  has_website: z.boolean().optional(),
  issues: z.array(siteIssueSchema).max(20).default([]),
})

export type ProspectCreateInput = z.infer<typeof prospectCreateSchema>

export const prospectUpdateSchema = z
  .object({
    id: uuidLike,
    status: z.enum(PROSPECT_STATUSES).optional(),
    contact_email: nullableEmail.optional(),
    website_url: nullableUrl.optional(),
    evaluation_notes: optionalText(1000).optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.status !== undefined ||
      data.contact_email !== undefined ||
      data.website_url !== undefined ||
      data.evaluation_notes !== undefined,
    {
      message: 'At least one prospect field must be provided for update',
    },
  )

export type ProspectUpdateInput = z.infer<typeof prospectUpdateSchema>

const seedCandidateSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  industry: optionalText(80).optional(),
  location: optionalText(120).optional(),
  websiteUrl: nullableUrl.optional(),
  contactEmail: nullableEmail.optional(),
  phone: optionalText(40).optional(),
  sourceProvider: z.enum(PROSPECT_SOURCE_PROVIDERS).default('seed'),
  sourceExternalId: optionalText(160).optional(),
})

export const outreachTriggerSchema = z
  .object({
    mode: z.enum(['manual', 'dry_run']).default('dry_run'),
    testRecipientEmail: emptyToUndefined(emailLike.optional()),
    targetCount: z.number().int().min(1).max(50).optional(),
    overrideCriteria: z
      .object({
        industries: z.array(z.string().trim().min(1).max(80)).max(25).optional(),
        locations: z.array(z.string().trim().min(1).max(120)).max(25).optional(),
        keywords: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
        discovery_provider: z.enum(DISCOVERY_PROVIDERS).optional(),
        min_issue_score: z.number().int().min(0).max(100).optional(),
      })
      .strict()
      .optional(),
    seedCandidates: z.array(seedCandidateSchema).max(25).optional(),
  })
  .strict()

export type OutreachTriggerInput = z.infer<typeof outreachTriggerSchema>

export const unsubscribeSchema = z.object({
  email: emailLike,
  token: emptyToUndefined(z.string().trim().min(1).max(256).optional()),
  reason: optionalText(300).optional(),
})

export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>

export const prospectQuerySchema = z.object({
  status: emptyToUndefined(z.enum(PROSPECT_STATUSES).optional()),
  q: emptyToUndefined(z.string().trim().max(120).optional()),
  limit: emptyToUndefined(z.coerce.number().int().min(1).max(200).optional()).transform(
    (value) => value ?? 50,
  ),
  offset: emptyToUndefined(z.coerce.number().int().min(0).max(10000).optional()).transform(
    (value) => value ?? 0,
  ),
})

export type ProspectQueryInput = z.infer<typeof prospectQuerySchema>

export const runsQuerySchema = z.object({
  limit: emptyToUndefined(z.coerce.number().int().min(1).max(100).optional()).transform(
    (value) => value ?? 20,
  ),
  offset: emptyToUndefined(z.coerce.number().int().min(0).max(10000).optional()).transform(
    (value) => value ?? 0,
  ),
  mode: emptyToUndefined(z.enum(OUTREACH_RUN_MODES).optional()),
  status: emptyToUndefined(z.enum(OUTREACH_RUN_STATUSES).optional()),
})

export type RunsQueryInput = z.infer<typeof runsQuerySchema>
