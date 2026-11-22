import 'server-only'

import { z } from 'zod'
import { AGENCY } from '@/lib/constants'
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
  recommendedPackage: z.string().trim().min(3).max(160).default('Bespoke Web Engineering & Conversion Architecture'),
  ctaText: z.string().trim().min(3).max(100),
  closing: z.string().trim().min(3).max(600),
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
    return 'Bespoke E-Commerce Architecture & Conversion Optimization'
  }

  if (hasLegacy || /\b(blog|media|hospitality|hotel|restaurant|cafe|bakery)\b/.test(contextText)) {
    return 'Content Experience & High-Performance Headless Web Architecture'
  }

  if (!evaluation.hasWebsite) {
    return 'Custom Brand Web Presence & Inbound Acquisition Funnel'
  }

  return 'Bespoke Web Engineering & Mobile Experience Overhaul'
}

function formatIssueBullet(issue: SiteIssue, business: DiscoveredBusiness): string {
  switch (issue.code) {
    case 'no_website':
      return `${business.businessName} currently has no dedicated web presence listed, making it difficult for local clients searching on mobile to discover, trust, and book with you.`
    case 'unreachable':
      return `Prospective clients trying to open your website encounter connection drops or loading failures, causing them to leave for competing alternatives.`
    case 'http_error':
      return `Visitors navigating to your website encounter service interruption screens, leading to an immediate loss of inbound customer confidence.`
    case 'no_https':
      return `Security warnings appear when visitors land on your site, which creates hesitation for clients looking to contact or transact with you.`
    case 'slow_ttfb':
      return `Mobile visitors experience noticeable loading friction before content appears, leading to elevated drop-off rates during first-time visits.`
    case 'missing_title':
    case 'missing_meta_description':
      return `Your business listing in search results lacks clear branding and service context, causing prospective clients to click on competing listings.`
    case 'missing_viewport':
      return `The viewing experience on modern mobile devices requires zooming or horizontal scrolling, creating friction for visitors trying to get in touch.`
    case 'legacy_builder':
      return `The current layout and interface show styling patterns that feel disconnected from modern customer expectations, impacting overall brand trust.`
    case 'thin_content':
      return `Key service details and clear contact pathways are sparse, leaving potential customers uncertain about how to take the next step.`
    default:
      return `Potential clients on mobile devices experience friction in your booking and enquiry journey.`
  }
}

export function buildFallbackPitch(
  business: DiscoveredBusiness,
  evaluation: SiteEvaluationResult,
): GeneratedPitch {
  const recommendedPackage = selectRecommendedPackage(business, evaluation)
  const locationSuffix = business.location ? ` in ${business.location}` : ''

  const auditBullets =
    evaluation.issues.length > 0
      ? evaluation.issues.slice(0, 3).map((issue) => formatIssueBullet(issue, business))
      : [
          `Potential clients searching for ${business.businessName}${locationSuffix} on mobile devices encounter subtle friction before reaching your contact points.`,
          `High-intent visitors are dropping off before submitting an enquiry due to navigation hurdles on phone screens.`,
          `Opportunity to capture more inbound client enquiries with a modern, high-converting digital experience.`,
        ]

  const subject = !evaluation.hasWebsite
    ? `quick question regarding ${business.businessName}'s online presence`
    : `quick question regarding ${business.businessName}'s client inquiries`

  const headline = !evaluation.hasWebsite
    ? `Helping ${business.businessName} capture inbound mobile clients`
    : `Optimizing ${business.businessName}'s mobile inquiry flow`

  const opening = !evaluation.hasWebsite
    ? `I was recently looking into ${business.businessName}${locationSuffix} and noticed your business doesn't have an active website yet. We work with growing businesses to help them capture high-value clients who search on mobile devices.`
    : `I was recently reviewing ${business.businessName}'s online presence and noticed a few friction points where potential clients are likely dropping off before submitting an enquiry.`

  const closing = `Warm regards,\nGlory Adeniran · Lead Client Strategist\n${AGENCY.name}`

  return {
    subject,
    headline,
    greeting: `Hi ${business.businessName} team,`,
    opening,
    auditBullets,
    recommendedPackage,
    ctaText: 'Reply "Yes" or Schedule a Walkthrough',
    closing,
    model: 'deterministic-fallback',
  }
}

function buildPitchPrompt(
  business: DiscoveredBusiness,
  evaluation: SiteEvaluationResult,
): string {
  const issuesSummary =
    evaluation.issues.length > 0
      ? evaluation.issues
          .map((i) => `- Strategic Area: ${i.label} (Severity: ${i.severity})`)
          .join('\n')
      : '- General conversion flow and mobile user experience review'

  return [
    `You are Glory Adeniran, Lead Client Strategist at ${AGENCY.name} (${AGENCY.domain}).`,
    'Write a concise, warm, authentic 1-on-1 consultative cold outreach email to the business leadership below.',
    '',
    'CRITICAL STRATEGY & COMPLIANCE RULES:',
    '1. DO NOT mention technical bug jargon or specific technical fixes (NO server response times in ms, NO missing HTML/meta tags, NO copyright dates, NO mention of SSL certificates). We must NOT give away the exact technical fixes so they do not simply hand them to their existing developer.',
    '2. DO NOT mention package names, tiers, prices, dollar amounts ($), or delivery days anywhere in the email.',
    '3. Focus the conversation on mobile user experience, client drop-off, and lost inbound enquiries/bookings.',
    '4. Subject line MUST be lowercase and conversational, e.g. "quick question regarding [Business Name]\'s client inquiries".',
    '5. In the closing, provide strictly a warm, executive sign-off: "Warm regards,\nGlory Adeniran · Lead Client Strategist\nVirtue & Co. Webworks" (do NOT repeat the partnership question in the closing, as it is already displayed in the email body).',
    '',
    'Prospect Details:',
    `Business Name: ${business.businessName}`,
    `Industry: ${business.industry ?? 'General local business'}`,
    `Location: ${business.location ?? 'Not specified'}`,
    `Website: ${business.websiteUrl ?? 'None'}`,
    `Has Website: ${evaluation.hasWebsite ? 'Yes' : 'No'}`,
    'High-Level Observation Areas:',
    issuesSummary,
    '',
    'Return ONLY a single raw JSON object (no markdown fences, no commentary) with these exact keys:',
    '{',
    '  "subject": "lowercase conversational subject line e.g. quick question regarding [Business Name]\'s client inquiries (5-120 chars)",',
    '  "headline": "concise consultative headline focusing on mobile client capture (5-140 chars)",',
    '  "greeting": "short greeting e.g. Hi <Business> team,",',
    '  "opening": "2-3 authentic, thoughtful sentences explaining you reviewed their presence and noticed friction points where prospective clients drop off before reaching out",',
    '  "auditBullets": ["2 to 3 high-level strategic observations about lost conversions or mobile friction, WITHOUT mentioning specific code or server ms"],',
    '  "recommendedPackage": "high-level strategic focus WITHOUT any price or dollar sign (e.g. Bespoke Web Engineering & Conversion Architecture)",',
    '  "ctaText": "short action text e.g. Reply \'Yes\' for Custom Breakdown",',
    '  "closing": "strictly the sign-off: Warm regards,\\nGlory Adeniran · Lead Client Strategist\\nVirtue & Co. Webworks"',
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
