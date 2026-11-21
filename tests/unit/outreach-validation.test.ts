import { describe, expect, it } from 'vitest'
import {
  outreachSettingsUpdateSchema,
  outreachTriggerSchema,
  prospectCreateSchema,
  prospectQuerySchema,
  prospectUpdateSchema,
  runsQuerySchema,
  unsubscribeSchema,
} from '@/lib/outreach/validation'

describe('outreachSettingsUpdateSchema', () => {
  it('accepts valid partial settings updates and normalizes email', () => {
    const parsed = outreachSettingsUpdateSchema.safeParse({
      is_paused: true,
      daily_send_cap: 25,
      industries: ['Restaurants', 'Dental Clinics'],
      locations: ['Austin, TX'],
      keywords: ['menu', 'booking'],
      discovery_provider: 'osm',
      min_issue_score: 45,
      dry_run_default: true,
      test_recipient_email: '  Admin@VirtueCo.dev ',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.is_paused).toBe(true)
      expect(parsed.data.daily_send_cap).toBe(25)
      expect(parsed.data.test_recipient_email).toBe('admin@virtueco.dev')
    }
  })

  it('accepts boundary values for daily_send_cap and min_issue_score', () => {
    expect(
      outreachSettingsUpdateSchema.safeParse({ daily_send_cap: 1, min_issue_score: 0 }).success,
    ).toBe(true)
    expect(
      outreachSettingsUpdateSchema.safeParse({ daily_send_cap: 200, min_issue_score: 100 }).success,
    ).toBe(true)
  })

  it('converts empty test_recipient_email string to null and allows explicit null', () => {
    const emptyStr = outreachSettingsUpdateSchema.safeParse({ test_recipient_email: '   ' })
    expect(emptyStr.success).toBe(true)
    if (emptyStr.success) {
      expect(emptyStr.data.test_recipient_email).toBeNull()
    }

    const explicitNull = outreachSettingsUpdateSchema.safeParse({ test_recipient_email: null })
    expect(explicitNull.success).toBe(true)
    if (explicitNull.success) {
      expect(explicitNull.data.test_recipient_email).toBeNull()
    }
  })

  it('rejects empty payload and unknown keys', () => {
    expect(outreachSettingsUpdateSchema.safeParse({}).success).toBe(false)
    expect(
      outreachSettingsUpdateSchema.safeParse({ is_paused: false, unknown_key: 123 }).success,
    ).toBe(false)
  })

  it('rejects out-of-range numbers, floats, booleans, and nulls on numeric fields', () => {
    expect(outreachSettingsUpdateSchema.safeParse({ daily_send_cap: 0 }).success).toBe(false)
    expect(outreachSettingsUpdateSchema.safeParse({ daily_send_cap: 201 }).success).toBe(false)
    expect(outreachSettingsUpdateSchema.safeParse({ daily_send_cap: 10.5 }).success).toBe(false)
    expect(outreachSettingsUpdateSchema.safeParse({ daily_send_cap: true }).success).toBe(false)
    expect(outreachSettingsUpdateSchema.safeParse({ daily_send_cap: null }).success).toBe(false)

    expect(outreachSettingsUpdateSchema.safeParse({ min_issue_score: -1 }).success).toBe(false)
    expect(outreachSettingsUpdateSchema.safeParse({ min_issue_score: 101 }).success).toBe(false)
    expect(outreachSettingsUpdateSchema.safeParse({ min_issue_score: false }).success).toBe(false)
    expect(outreachSettingsUpdateSchema.safeParse({ min_issue_score: null }).success).toBe(false)
  })

  it('rejects invalid provider or malformed email', () => {
    expect(
      outreachSettingsUpdateSchema.safeParse({ discovery_provider: 'yelp' }).success,
    ).toBe(false)
    expect(
      outreachSettingsUpdateSchema.safeParse({ test_recipient_email: 'not-an-email' }).success,
    ).toBe(false)
  })
})

describe('prospectCreateSchema', () => {
  it('applies defaults and normalizes blank optional fields to null', () => {
    const parsed = prospectCreateSchema.safeParse({
      business_name: '  Harbor Bakery  ',
      website_url: '',
      industry: '  ',
      location: 'Seattle, WA',
      contact_email: 'HELLO@HarborBakery.com',
      phone: '',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.business_name).toBe('Harbor Bakery')
      expect(parsed.data.website_url).toBeNull()
      expect(parsed.data.industry).toBeNull()
      expect(parsed.data.location).toBe('Seattle, WA')
      expect(parsed.data.contact_email).toBe('hello@harborbakery.com')
      expect(parsed.data.phone).toBeNull()
      expect(parsed.data.status).toBe('discovered')
      expect(parsed.data.issue_score).toBe(0)
      expect(parsed.data.issues).toEqual([])
      expect(parsed.data.source_provider).toBe('manual')
    }
  })

  it('rejects short business names and invalid URLs or emails', () => {
    expect(prospectCreateSchema.safeParse({ business_name: 'A' }).success).toBe(false)
    expect(
      prospectCreateSchema.safeParse({
        business_name: 'Harbor Bakery',
        website_url: 'ftp://harborbakery.com',
      }).success,
    ).toBe(false)
    expect(
      prospectCreateSchema.safeParse({
        business_name: 'Harbor Bakery',
        contact_email: 'invalid-email',
      }).success,
    ).toBe(false)
  })
})

describe('prospectUpdateSchema', () => {
  const validId = '11111111-1111-4111-8111-111111111111'

  it('accepts valid partial prospect updates', () => {
    const parsed = prospectUpdateSchema.safeParse({
      id: validId,
      status: 'replied',
      contact_email: 'Owner@Business.co',
      evaluation_notes: '',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.contact_email).toBe('owner@business.co')
      expect(parsed.data.evaluation_notes).toBeNull()
    }
  })

  it('rejects invalid UUID, empty updates, or unknown fields', () => {
    expect(
      prospectUpdateSchema.safeParse({ id: 'not-a-uuid', status: 'replied' }).success,
    ).toBe(false)
    expect(prospectUpdateSchema.safeParse({ id: validId }).success).toBe(false)
    expect(
      prospectUpdateSchema.safeParse({ id: validId, status: 'replied', extra: true }).success,
    ).toBe(false)
  })
})

describe('outreachTriggerSchema', () => {
  it('defaults mode to dry_run and validates overrideCriteria and seedCandidates', () => {
    const parsed = outreachTriggerSchema.safeParse({
      testRecipientEmail: 'Test@Agency.io',
      overrideCriteria: {
        industries: ['Law Firms'],
        min_issue_score: 40,
      },
      seedCandidates: [
        {
          businessName: 'Apex Legal',
          location: 'Chicago, IL',
          websiteUrl: 'http://apexlegal.example',
          contactEmail: 'intake@apexlegal.example',
        },
      ],
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.mode).toBe('dry_run')
      expect(parsed.data.testRecipientEmail).toBe('test@agency.io')
      expect(parsed.data.seedCandidates?.[0].sourceProvider).toBe('seed')
    }
  })

  it('rejects cron mode via trigger API and rejects unknown keys', () => {
    expect(outreachTriggerSchema.safeParse({ mode: 'cron' }).success).toBe(false)
    expect(outreachTriggerSchema.safeParse({ mode: 'manual', bogus: 1 }).success).toBe(false)
  })
})

describe('unsubscribeSchema', () => {
  it('normalizes email and treats blank token as undefined', () => {
    const parsed = unsubscribeSchema.safeParse({
      email: ' Prospect@Example.COM ',
      token: '',
      reason: '  No longer interested  ',
    })

    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.email).toBe('prospect@example.com')
      expect(parsed.data.token).toBeUndefined()
      expect(parsed.data.reason).toBe('No longer interested')
    }
  })

  it('rejects malformed email', () => {
    expect(unsubscribeSchema.safeParse({ email: 'bad-email' }).success).toBe(false)
  })
})

describe('prospectQuerySchema and runsQuerySchema', () => {
  it('handles empty query parameters cleanly with defaults', () => {
    const prospects = prospectQuerySchema.safeParse({
      status: '',
      q: '',
      limit: '',
      offset: '',
    })
    expect(prospects.success).toBe(true)
    if (prospects.success) {
      expect(prospects.data).toEqual({
        status: undefined,
        q: undefined,
        limit: 50,
        offset: 0,
      })
    }

    const runs = runsQuerySchema.safeParse({
      limit: '',
      offset: '',
      mode: '',
      status: '',
    })
    expect(runs.success).toBe(true)
    if (runs.success) {
      expect(runs.data).toEqual({
        limit: 20,
        offset: 0,
        mode: undefined,
        status: undefined,
      })
    }
  })

  it('parses valid query params and rejects invalid limits or statuses', () => {
    const parsed = prospectQuerySchema.safeParse({
      status: 'qualified',
      q: 'bakery',
      limit: '25',
      offset: '10',
    })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data).toEqual({
        status: 'qualified',
        q: 'bakery',
        limit: 25,
        offset: 10,
      })
    }

    expect(prospectQuerySchema.safeParse({ status: 'unknown' }).success).toBe(false)
    expect(prospectQuerySchema.safeParse({ limit: '0' }).success).toBe(false)
    expect(prospectQuerySchema.safeParse({ limit: '201' }).success).toBe(false)
    expect(runsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
  })
})
