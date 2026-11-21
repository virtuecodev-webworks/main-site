import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildDedupKey,
  buildUnsubscribeUrl,
  checkCrossRunEligibility,
  createUnsubscribeToken,
  InRunDedupTracker,
  isProspectPitchBlocked,
  normalizeBusinessKey,
  normalizeDomain,
  normalizeEmail,
  resolveProspectIdentity,
  verifyUnsubscribeToken,
} from '@/lib/outreach/deduplication'
import type { OutreachProspect, ProspectStatus } from '@/lib/outreach/types'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('normalizeDomain', () => {
  it('normalizes scheme, www, uppercase, ports, trailing dots, and paths', () => {
    expect(normalizeDomain('HTTPS://WWW.HarborBakery.COM:8443/Menu?a=1#top')).toBe(
      'harborbakery.com',
    )
    expect(normalizeDomain('www.acme.io/about')).toBe('acme.io')
    expect(normalizeDomain('//Example.org.')).toBe('example.org')
  })

  it('preserves non-www subdomains so hosted builders do not collide', () => {
    expect(normalizeDomain('https://shop.acme.com')).toBe('shop.acme.com')
    expect(normalizeDomain('https://mybiz.wixsite.com/home')).toBe('mybiz.wixsite.com')
  })

  it('returns null for empty, invalid, non-HTTP schemes, localhost, and IP literals', () => {
    expect(normalizeDomain(null)).toBeNull()
    expect(normalizeDomain(undefined)).toBeNull()
    expect(normalizeDomain('')).toBeNull()
    expect(normalizeDomain('   ')).toBeNull()
    expect(normalizeDomain('not a domain')).toBeNull()
    expect(normalizeDomain('http://intranet')).toBeNull()
    expect(normalizeDomain('mailto:hello@example.com')).toBeNull()
    expect(normalizeDomain('ftp://files.example.com')).toBeNull()
    expect(normalizeDomain('javascript:alert(1)')).toBeNull()
    expect(normalizeDomain('http://localhost:3000')).toBeNull()
    expect(normalizeDomain('http://127.0.0.1:4000')).toBeNull()
    expect(normalizeDomain('http://[::1]:3000')).toBeNull()
  })
})

describe('normalizeBusinessKey & buildDedupKey', () => {
  it('normalizes accents, ampersands, and punctuation deterministically', () => {
    expect(normalizeBusinessKey('Café & Co., LLC', 'Austin, TX')).toBe(
      'cafe-and-co-llc|austin-tx',
    )
    expect(normalizeBusinessKey('!!!')).toMatch(/^biz-[a-f0-9]{12}$/)
  })

  it('prefers domain key when valid domain resolves, otherwise falls back to business key', () => {
    expect(
      buildDedupKey({
        businessName: 'Harbor Bakery',
        location: 'Austin, TX',
        websiteUrl: 'https://www.harborbakery.com/contact',
      }),
    ).toBe('domain:harborbakery.com')

    expect(
      buildDedupKey({
        businessName: 'Harbor Bakery',
        location: 'Austin, TX',
        websiteUrl: null,
      }),
    ).toBe('name:harbor-bakery|austin-tx')
  })
})

describe('normalizeEmail', () => {
  it('trims and lowercases valid emails and rejects malformed ones', () => {
    expect(normalizeEmail('  Hello@HarborBakery.COM ')).toBe('hello@harborbakery.com')
    expect(normalizeEmail('')).toBeNull()
    expect(normalizeEmail('missing-at.com')).toBeNull()
    expect(normalizeEmail('bad\0@example.com')).toBeNull()
    expect(normalizeEmail(`${'a'.repeat(175)}@b.com`)).toBeNull()
  })
})

describe('HMAC unsubscribe tokens & URL builder', () => {
  it('creates and verifies tokens timing-safely across case/whitespace differences', () => {
    vi.stubEnv('CRON_SECRET', 'super-secret-cron-value-123')

    const token = createUnsubscribeToken('User@Example.COM')
    expect(verifyUnsubscribeToken('  user@example.com ', token)).toBe(true)
    expect(verifyUnsubscribeToken('other@example.com', token)).toBe(false)
    expect(verifyUnsubscribeToken('user@example.com', `${token}tamper`)).toBe(false)
    expect(verifyUnsubscribeToken('user@example.com', '')).toBe(false)
    expect(verifyUnsubscribeToken('user@example.com', null)).toBe(false)
  })

  it('builds unsubscribe URL safely even when NEXT_PUBLIC_SITE_URL is empty string', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '')
    vi.stubEnv('CRON_SECRET', 'cron-secret-1')

    const url = buildUnsubscribeUrl('Lead@Acme.com')
    expect(url.startsWith('https://virtuecowebworks.solutions/api/outreach/unsubscribe?')).toBe(true)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('email')).toBe('lead@acme.com')
    expect(verifyUnsubscribeToken('lead@acme.com', parsed.searchParams.get('token'))).toBe(true)
  })
})

describe('Cross-run & in-run deduplication guards', () => {
  it('blocks non-pitchable statuses and allows retryable statuses', () => {
    const blocked: ProspectStatus[] = ['pitched', 'replied', 'converted', 'opted_out', 'skipped']
    const allowed: ProspectStatus[] = ['discovered', 'qualified', 'qualified_no_email', 'failed']

    for (const status of blocked) {
      expect(isProspectPitchBlocked({ status })).toBe(true)
    }
    for (const status of allowed) {
      expect(isProspectPitchBlocked({ status })).toBe(false)
    }
    expect(isProspectPitchBlocked(null)).toBe(false)
  })

  it('blocks opted-out emails in checkCrossRunEligibility even if prospect was discovered', async () => {
    const repo = {
      findProspectByDedupOrDomain: vi.fn().mockResolvedValue({
        id: 'p1',
        status: 'discovered',
        contact_email: 'owner@acme.com',
      } as Partial<OutreachProspect> as OutreachProspect),
      isOptedOut: vi.fn().mockResolvedValue(true),
    }

    const res = await checkCrossRunEligibility(repo, {
      dedupKey: 'domain:acme.com',
      normalizedDomain: 'acme.com',
      contactEmail: null,
    })

    expect(res.eligible).toBe(false)
    if (!res.eligible) {
      expect(res.reason).toBe('opted_out')
    }
  })

  it('tracks seen dedup keys, domains, and emails within a single run', () => {
    const tracker = new InRunDedupTracker()
    const id1 = resolveProspectIdentity({
      businessName: 'Acme Corp',
      location: 'NYC',
      websiteUrl: 'https://www.acme.com',
      contactEmail: 'hello@acme.com',
    })
    const id2 = resolveProspectIdentity({
      businessName: 'Acme Corporation',
      location: 'Brooklyn, NY',
      websiteUrl: 'http://acme.com/contact',
      contactEmail: null,
    })

    expect(tracker.hasSeen(id1)).toBe(false)
    tracker.markSeen(id1)
    expect(tracker.hasSeen(id2)).toBe(true)
    expect(tracker.hasSeenEmail('HELLO@acme.com')).toBe(true)
  })
})
