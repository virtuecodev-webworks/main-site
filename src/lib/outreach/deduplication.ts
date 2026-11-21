import 'server-only'

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { AGENCY } from '@/lib/constants'
import type {
  DiscoveredBusiness,
  OutreachProspect,
  OutreachRepository,
  ProspectStatus,
} from './types'

const EMAIL_VALIDATION_REGEX = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/
const DOMAIN_VALIDATION_REGEX =
  /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/
const IPV4_REGEX = /^\d{1,3}(?:\.\d{1,3}){3}$/

export const NON_PITCHABLE_PROSPECT_STATUSES: ReadonlySet<ProspectStatus> = new Set([
  'pitched',
  'replied',
  'converted',
  'opted_out',
  'skipped',
])

export function normalizeDomain(rawUrl: string | null | undefined): string | null {
  if (typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  if (/^(mailto|tel|sms|javascript|data|about|file):/i.test(trimmed)) {
    return null
  }

  let candidate: string
  if (trimmed.startsWith('//')) {
    candidate = `https:${trimmed}`
  } else if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    if (!/^https?:\/\//i.test(trimmed)) return null
    candidate = trimmed
  } else if (/^https?:\/\//i.test(trimmed)) {
    candidate = trimmed
  } else {
    candidate = `https://${trimmed}`
  }

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return null
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null
  }

  const host = parsed.hostname.toLowerCase().replace(/\.+$/, '').replace(/^www\./, '')
  if (!host || host === 'localhost' || IPV4_REGEX.test(host) || host.includes(':') || host.startsWith('[')) {
    return null
  }

  if (!DOMAIN_VALIDATION_REGEX.test(host)) {
    return null
  }

  return host
}

function normalizeSegment(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeBusinessKey(name: string, location?: string | null): string {
  const namePart = normalizeSegment(name)
  const locPart = location ? normalizeSegment(location) : ''
  const resolvedName =
    namePart ||
    `biz-${createHash('sha256').update(name.trim().toLowerCase()).digest('hex').slice(0, 12)}`

  return locPart ? `${resolvedName}|${locPart}` : resolvedName
}

export function buildDedupKey(input: {
  businessName: string
  location?: string | null
  websiteUrl?: string | null
  normalizedDomain?: string | null
}): string {
  const domain = input.normalizedDomain
    ? normalizeDomain(input.normalizedDomain)
    : normalizeDomain(input.websiteUrl)

  if (domain) {
    return `domain:${domain}`
  }

  return `name:${normalizeBusinessKey(input.businessName, input.location)}`
}

export function normalizeEmail(email: string | null | undefined): string | null {
  if (typeof email !== 'string') return null
  const cleaned = email.trim().toLowerCase()
  if (!cleaned || cleaned.length > 180 || cleaned.includes('\0')) {
    return null
  }
  if (!EMAIL_VALIDATION_REGEX.test(cleaned)) {
    return null
  }
  return cleaned
}

function getUnsubscribeSecret(): string {
  const explicit = process.env.OUTREACH_UNSUBSCRIBE_SECRET?.trim()
  if (explicit) return explicit

  const cronSecret = process.env.CRON_SECRET?.trim()
  if (cronSecret) return cronSecret

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (serviceRoleKey && serviceRoleKey !== '<service-role-key>') {
    return serviceRoleKey
  }

  return 'virtue-outreach-dev-unsubscribe-secret'
}

export function createUnsubscribeToken(email: string): string {
  const normalized = normalizeEmail(email)
  if (!normalized) {
    throw new Error('Valid email required for unsubscribe token')
  }
  return createHmac('sha256', getUnsubscribeSecret()).update(normalized).digest('base64url')
}

export function verifyUnsubscribeToken(email: string, token: string | null | undefined): boolean {
  const normalized = normalizeEmail(email)
  if (!normalized || typeof token !== 'string' || token.trim().length === 0) {
    return false
  }

  const expected = createUnsubscribeToken(normalized)
  const providedBuf = Buffer.from(token.trim(), 'utf8')
  const expectedBuf = Buffer.from(expected, 'utf8')

  if (providedBuf.length !== expectedBuf.length) {
    return false
  }

  return timingSafeEqual(providedBuf, expectedBuf)
}

export function buildUnsubscribeUrl(email: string, baseUrl?: string): string {
  const normalized = normalizeEmail(email)
  if (!normalized) {
    throw new Error('Valid email required for unsubscribe URL')
  }

  const token = createUnsubscribeToken(normalized)
  const rawBase = baseUrl?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const resolvedBase = (rawBase ? rawBase : `https://${AGENCY.domain}`).replace(/\/+$/, '')

  return `${resolvedBase}/api/outreach/unsubscribe?email=${encodeURIComponent(normalized)}&token=${encodeURIComponent(token)}`
}

export function isProspectPitchBlocked(
  prospect: Pick<OutreachProspect, 'status'> | null | undefined,
): boolean {
  return Boolean(prospect && NON_PITCHABLE_PROSPECT_STATUSES.has(prospect.status))
}

export interface ProspectIdentity {
  normalizedDomain: string | null
  businessKey: string
  dedupKey: string
  normalizedEmail: string | null
}

export function resolveProspectIdentity(
  business: Pick<DiscoveredBusiness, 'businessName' | 'location' | 'websiteUrl' | 'contactEmail'>,
): ProspectIdentity {
  const normalizedDomain = normalizeDomain(business.websiteUrl)
  const businessKey = normalizeBusinessKey(business.businessName, business.location)
  const dedupKey = buildDedupKey({
    businessName: business.businessName,
    location: business.location,
    websiteUrl: business.websiteUrl,
    normalizedDomain,
  })
  const normalizedEmail = normalizeEmail(business.contactEmail)

  return {
    normalizedDomain,
    businessKey,
    dedupKey,
    normalizedEmail,
  }
}

export type CrossRunEligibilityResult =
  | { eligible: true; existingProspect: OutreachProspect | null }
  | {
      eligible: false
      reason: 'opted_out' | 'already_handled'
      existingProspect: OutreachProspect | null
    }

export async function checkCrossRunEligibility(
  repository: Pick<OutreachRepository, 'findProspectByDedupOrDomain' | 'isOptedOut'>,
  params: {
    dedupKey: string
    normalizedDomain: string | null
    contactEmail?: string | null
  },
): Promise<CrossRunEligibilityResult> {
  const existingProspect = await repository.findProspectByDedupOrDomain(
    params.dedupKey,
    params.normalizedDomain,
  )

  if (isProspectPitchBlocked(existingProspect)) {
    return {
      eligible: false,
      reason: existingProspect!.status === 'opted_out' ? 'opted_out' : 'already_handled',
      existingProspect,
    }
  }

  const email = normalizeEmail(params.contactEmail) ?? normalizeEmail(existingProspect?.contact_email)
  if (email && (await repository.isOptedOut(email))) {
    return {
      eligible: false,
      reason: 'opted_out',
      existingProspect,
    }
  }

  return {
    eligible: true,
    existingProspect,
  }
}

export class InRunDedupTracker {
  private readonly seenDedupKeys = new Set<string>()
  private readonly seenDomains = new Set<string>()
  private readonly seenEmails = new Set<string>()

  hasSeen(identity: Pick<ProspectIdentity, 'dedupKey' | 'normalizedDomain' | 'normalizedEmail'>): boolean {
    if (this.seenDedupKeys.has(identity.dedupKey)) return true
    if (identity.normalizedDomain && this.seenDomains.has(identity.normalizedDomain)) return true
    if (identity.normalizedEmail && this.seenEmails.has(identity.normalizedEmail)) return true
    return false
  }

  hasSeenEmail(email: string | null | undefined): boolean {
    const normalized = normalizeEmail(email)
    return normalized ? this.seenEmails.has(normalized) : false
  }

  markSeen(identity: Pick<ProspectIdentity, 'dedupKey' | 'normalizedDomain' | 'normalizedEmail'>): void {
    this.seenDedupKeys.add(identity.dedupKey)
    if (identity.normalizedDomain) {
      this.seenDomains.add(identity.normalizedDomain)
    }
    if (identity.normalizedEmail) {
      this.seenEmails.add(identity.normalizedEmail)
    }
  }

  markEmail(email: string | null | undefined): void {
    const normalized = normalizeEmail(email)
    if (normalized) {
      this.seenEmails.add(normalized)
    }
  }
}
