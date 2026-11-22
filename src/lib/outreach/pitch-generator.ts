import 'server-only'

import { z } from 'zod'
import { AGENCY } from '@/lib/constants'
import { AGENCY_SERVICES, getServiceByCategory } from '@/lib/packages'
import type {
  DiscoveredBusiness,
  GeneratedPitch,
  SiteEvaluationResult,
  SiteIssue,
} from './types'

export interface GeneratePitchOptions {
  apiKey?: string
  model?: string
  timeoutMs?: number
  fetchImpl?: typeof fetch
}

const DEFAULT_MODEL = 'gemini-3.8-flash'
const DEFAULT_TIMEOUT_MS = 12_000

const geminiPitchSchema = z.object({
  subject: z.string().trim().min(5).max(160),
  headline: z.string().trim().min(5).max(200),
  greeting: z.string().trim().min(2).max(120),
  opening: z.string().trim().min(15).max(1000),
  auditBullets: z.array(z.string().trim().min(5).max(300)).min(1).max(6),
  recommendedPackage: z.string().trim().min(3).max(160),
  ctaText: z.string().trim().min(3).max(100),
  closing: z.string().trim().min(3).max(300),
})

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

function selectRecommendedPackage(
  business: DiscoveredBusiness,
  evaluation: SiteEvaluationResult,
): string {
  const contextText = [business.businessName, business.industry ?? ''].join(' ').toLowerCase()
  const hasLegacy = evaluation.issues.some((issue) => issue.code === 'legacy_builder')

  if (/\b(shop|store|retail|boutique|ecommerce|commerce|mart)\b/.test(contextText)) {
    const service = getServiceByCategory('ecommerce') ?? AGENCY_SERVICES[1]
    const pkg = service.packages.starter
    return `${service.title} — ${pkg.name} ($${pkg.priceUsd}, ${pkg.deliveryDays}-day delivery)`
  }

  if (hasLegacy || /\b(blog|media|hospitality|hotel|restaurant|cafe|bakery)\b/.test(contextText)) {
    const service = getServiceByCategory('wordpress') ?? AGENCY_SERVICES[2]
    const pkg = service.packages.business
    return `${service.title} — ${pkg.name} ($${pkg.priceUsd}, ${pkg.deliveryDays}-day delivery)`
  }

  if (!evaluation.hasWebsite) {
    const service = getServiceByCategory('wix') ?? AGENCY_SERVICES[3]
    const pkg = service.packages.starter
    return `${service.title} — ${pkg.name} ($${pkg.priceUsd}, ${pkg.deliveryDays}-day delivery)`
  }

  const service = getServiceByCategory('custom') ?? AGENCY_SERVICES[0]
  const pkg = service.packages.business
  return `${service.title} — ${pkg.name} ($${pkg.priceUsd}, ${pkg.deliveryDays}-day delivery)`
}

function formatIssueBullet(issue: SiteIssue, business: DiscoveredBusiness): string {
  switch (issue.code) {
    case 'no_website':
      return `${business.businessName} currently has no dedicated website listed, making it harder for local customers searching online to discover and book with you.`
    case 'unreachable':
      return `Your current web address timed out or failed to respond during our automated check${issue.detail ? ` (${issue.detail})` : ''}, which blocks prospective visitors.`
    case 'http_error':
      return `Your website returned an error status (${issue.detail ?? 'HTTP error'}), leaving visitors with a broken first impression.`
    case 'no_https':
      return 'The site is served without HTTPS encryption, which triggers browser "Not Secure" warnings and reduces customer trust.'
    case 'slow_ttfb':
      return `Initial server response took ${issue.detail ?? 'over 2.5 seconds'}, which increases bounce rates on mobile connections.`
    case 'missing_title':
      return 'Pages are missing a clear <title> tag, hurting search visibility and browser tab clarity.'
    case 'missing_meta_description':
      return 'There is no SEO meta description configured to control how your business appears in Google search results.'
    case 'missing_viewport':
      return 'The site lacks a mobile viewport configuration, causing cramped or zoomed-out layouts on phones.'
    case 'legacy_builder':
      return `Your web presence shows an outdated footprint${issue.detail ? ` (${issue.detail})` : ''}, limiting speed, branding, and conversion rates.`
    case 'thin_content':
      return 'The landing page has minimal visible content, giving potential customers too little context on your services or how to contact you.'
    default:
      return `${issue.label}${issue.detail ? ` (${issue.detail})` : ''}`
  }
}

export function buildFallbackPitch(
  business: DiscoveredBusiness,
  evaluation: SiteEvaluationResult,
): GeneratedPitch {
  const recommendedPackage = selectRecommendedPackage(business, evaluation)
  const locationSuffix = business.location ? ` in ${business.location}` : ''
  const industryPhrase = business.industry ? `${business.industry} ` : ''

  const auditBullets =
    evaluation.issues.length > 0
      ? evaluation.issues.slice(0, 4).map((issue) => formatIssueBullet(issue, business))
      : [
          `Opportunity to modernize ${business.businessName}'s online positioning and conversion flow for local search traffic.`,
          'Fast, mobile-first architecture with clear calls-to-action to capture more inbound leads.',
        ]

  const subject = !evaluation.hasWebsite
    ? `A fast, modern website for ${business.businessName}${locationSuffix}`
    : `Quick website audit & redesign ideas for ${business.businessName}`

  const headline = !evaluation.hasWebsite
    ? `Bring ${business.businessName} online with a conversion-ready site`
    : `A few quick wins we spotted on ${business.businessName}'s website`

  const opening = !evaluation.hasWebsite
    ? `We came across ${business.businessName}${locationSuffix} while researching ${industryPhrase}businesses and noticed you do not have an active website yet. At ${AGENCY.name}, we build fast, transparent fixed-price websites designed to turn local searches into booked clients.`
    : `We recently ran a quick technical check on ${business.websiteUrl ?? business.businessName}${locationSuffix} and spotted a few straightforward fixes that could help ${business.businessName} capture more inbound enquiries.`

  return {
    subject,
    headline,
    greeting: `Hi ${business.businessName} team,`,
    opening,
    auditBullets,
    recommendedPackage,
    ctaText: 'Book a Free 15-Min Walkthrough',
    closing: `Prefer email over a form? Simply reply directly to this message and our engineering team will get right back to you.\n\nBest regards,\n${AGENCY.name}`,
    model: 'deterministic-fallback',
  }
}

function buildServiceCatalogSummary(): string {
  return AGENCY_SERVICES.map((service) => {
    const starter = service.packages.starter
    const business = service.packages.business
    return `- ${service.title}: ${starter.name} ($${starter.priceUsd}, ${starter.deliveryDays}d) | ${business.name} ($${business.priceUsd}, ${business.deliveryDays}d)`
  }).join('\n')
}

function buildPitchPrompt(
  business: DiscoveredBusiness,
  evaluation: SiteEvaluationResult,
): string {
  const issuesText =
    evaluation.issues.length > 0
      ? evaluation.issues
          .map(
            (issue) =>
              `- [${issue.severity.toUpperCase()}] ${issue.code}: ${issue.label}${issue.detail ? ` (${issue.detail})` : ''}`,
          )
          .join('\n')
      : '- None detected (general conversion & modernization review)'

  return [
    `You are a senior web engineering strategist at ${AGENCY.name} (${AGENCY.domain}, ${AGENCY.email}).`,
    'Write a concise, genuine, non-spammy B2B cold outreach email pitch tailored to the prospect below.',
    '',
    'Agency Service Catalog:',
    buildServiceCatalogSummary(),
    '',
    'Prospect Details:',
    `Business Name: ${business.businessName}`,
    `Industry: ${business.industry ?? 'General local business'}`,
    `Location: ${business.location ?? 'Not specified'}`,
    `Website: ${business.websiteUrl ?? 'None'}`,
    `Has Website: ${evaluation.hasWebsite ? 'Yes' : 'No'}`,
    `Site Issue Score: ${evaluation.issueScore}/100`,
    'Detected Issues:',
    issuesText,
    '',
    'Return ONLY a single raw JSON object (no markdown fences, no commentary) with these exact keys:',
    '{',
    '  "subject": "concise email subject line (5-120 chars)",',
    '  "headline": "punchy card headline (5-140 chars)",',
    '  "greeting": "short greeting e.g. Hi <Business> team,",',
    '  "opening": "2-3 personalized sentences referencing their business and findings",',
    '  "auditBullets": ["2 to 4 concrete, specific bullet points grounded in the detected issues"],',
    '  "recommendedPackage": "one matching package from the catalog above with USD price and delivery days",',
    '  "ctaText": "short action button text e.g. Book a Free 15-Min Walkthrough",',
    '  "closing": "short sign-off mentioning they can also simply reply directly to this email, from Virtue & Co. Webworks"',
    '}',
  ].join('\n')
}

function stripJsonFences(raw: string): string {
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  if (!cleaned.startsWith('{')) {
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1)
    }
  }

  return cleaned
}

function isApiKeyUsable(apiKey: string | undefined): apiKey is string {
  if (!apiKey) return false
  if (apiKey.startsWith('AIzaSy_fake')) return false
  if (apiKey === 'your-gemini-api-key') return false
  return apiKey.length >= 20
}

export async function generatePitch(
  business: DiscoveredBusiness,
  evaluation: SiteEvaluationResult,
  options?: GeneratePitchOptions,
): Promise<GeneratedPitch> {
  const apiKey = (options?.apiKey ?? process.env.GEMINI_API_KEY)?.trim()
  const model = options?.model?.trim() || process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const fetchFn = options?.fetchImpl ?? globalThis.fetch

  if (!isApiKeyUsable(apiKey)) {
    return buildFallbackPitch(business, evaluation)
  }

  const prompt = buildPitchPrompt(business, evaluation)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`

  try {
    const response = await fetchFn(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!response.ok) {
      console.warn(`[outreach/pitch-generator] Gemini returned HTTP ${response.status} — using fallback`)
      return buildFallbackPitch(business, evaluation)
    }

    const data = (await response.json()) as GeminiApiResponse
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText || typeof rawText !== 'string') {
      console.warn('[outreach/pitch-generator] Gemini returned empty candidates — using fallback')
      return buildFallbackPitch(business, evaluation)
    }

    const parsedJson: unknown = JSON.parse(stripJsonFences(rawText))
    const validated = geminiPitchSchema.safeParse(parsedJson)

    if (!validated.success) {
      console.warn('[outreach/pitch-generator] Gemini JSON failed schema validation — using fallback')
      return buildFallbackPitch(business, evaluation)
    }

    return {
      ...validated.data,
      model,
    }
  } catch (err) {
    console.warn(
      '[outreach/pitch-generator] Gemini call failed — using fallback:',
      err instanceof Error ? err.message : err,
    )
    return buildFallbackPitch(business, evaluation)
  }
}
