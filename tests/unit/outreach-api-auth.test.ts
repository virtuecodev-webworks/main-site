import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  mockResolveSession,
  mockGetAdminAllowlist,
  mockRepository,
  mockRunDailyOutreach,
} = vi.hoisted(() => {
  const settingsState = {
    id: true,
    is_paused: false,
    daily_send_cap: 15,
    industries: ['dental'],
    locations: ['Austin, TX'],
    keywords: ['clinic'],
    discovery_provider: 'auto' as const,
    min_issue_score: 30,
    dry_run_default: false,
    test_recipient_email: 'qa@virtueco.dev',
    updated_at: '2026-11-21T10:00:00.000Z',
  }

  return {
    mockResolveSession: vi.fn(),
    mockGetAdminAllowlist: vi.fn(() => ['founder@virtueco.dev']),
    mockRepository: {
      getSettings: vi.fn(async () => ({ ...settingsState })),
      getSettingsOrDefault: vi.fn(async () => ({ ...settingsState })),
      upsertSettings: vi.fn(async (patch: Record<string, unknown>) => ({
        ...settingsState,
        ...patch,
      })),
      getSentCountToday: vi.fn(async () => 3),
      listProspects: vi.fn(async () => [
        {
          id: '11111111-1111-4111-8111-111111111111',
          business_name: 'Bright Dental',
          normalized_domain: 'brightdental.com',
          website_url: 'https://brightdental.com',
          industry: 'dental',
          location: 'Austin, TX',
          contact_email: 'hello@brightdental.com',
          phone: null,
          source_provider: 'manual',
          source_external_id: null,
          dedup_key: 'domain:brightdental.com',
          evaluation_status: 'evaluated',
          has_website: true,
          issue_score: 65,
          issues: [],
          http_status: 200,
          ttfb_ms: 420,
          site_title: 'Bright Dental',
          evaluation_notes: null,
          pitch_subject: null,
          pitch_preview: null,
          status: 'qualified',
          last_evaluated_at: null,
          last_pitched_at: null,
          last_error: null,
          raw_metadata: null,
          created_at: '2026-11-21T10:00:00.000Z',
          updated_at: '2026-11-21T10:00:00.000Z',
        },
      ]),
      upsertProspect: vi.fn(async (input: Record<string, unknown>) => ({
        id: '22222222-2222-4222-8222-222222222222',
        ...input,
        created_at: '2026-11-21T10:00:00.000Z',
        updated_at: '2026-11-21T10:00:00.000Z',
      })),
      updateProspect: vi.fn(async (id: string, patch: Record<string, unknown>) => ({
        id,
        business_name: 'Bright Dental',
        dedup_key: 'domain:brightdental.com',
        status: 'qualified',
        ...patch,
      })),
      listRuns: vi.fn(async () => [
        {
          id: '33333333-3333-4333-8333-333333333333',
          run_date: '2026-11-21',
          mode: 'cron',
          status: 'completed',
          triggered_by: 'cron',
          scouted_count: 5,
          qualified_count: 2,
          sent_count: 2,
          skipped_count: 3,
          failed_count: 0,
          daily_cap_snapshot: 15,
          sent_today_before_run: 1,
          error_summary: null,
          details: {},
          started_at: '2026-11-21T09:00:00.000Z',
          completed_at: '2026-11-21T09:00:12.000Z',
          created_at: '2026-11-21T09:00:00.000Z',
          updated_at: '2026-11-21T09:00:12.000Z',
        },
      ]),
      listDispatches: vi.fn(async () => []),
      addOptOut: vi.fn(async (email: string, opts?: Record<string, unknown>) => ({
        email: email.toLowerCase(),
        reason: (opts?.reason as string | null) ?? null,
        source: 'unsubscribe',
        prospect_id: null,
        created_at: '2026-11-21T10:00:00.000Z',
      })),
    },
    mockRunDailyOutreach: vi.fn(async (options: Record<string, unknown>) => ({
      runId: '44444444-4444-4444-8444-444444444444',
      mode: options.mode ?? 'dry_run',
      status: 'completed',
      scoutedCount: 2,
      qualifiedCount: 1,
      sentCount: 1,
      skippedCount: 1,
      failedCount: 0,
      dailyCap: 15,
      sentTodayBeforeRun: 3,
      dispatches: [],
    })),
  }
})

vi.mock('@/lib/supabase/auth', () => ({
  resolveSession: mockResolveSession,
}))

vi.mock('@/lib/supabase/env', () => ({
  getAdminAllowlist: mockGetAdminAllowlist,
}))

vi.mock('@/lib/outreach/repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/outreach/repository')>()
  return {
    ...actual,
    createOutreachRepository: vi.fn(() => mockRepository),
  }
})

vi.mock('@/lib/outreach/runner', () => ({
  runDailyOutreach: mockRunDailyOutreach,
}))

import { requireAdminApi, requireCronOrAdminApi } from '@/lib/outreach/auth'
import { GET as getSettings, PATCH as patchSettings } from '@/app/api/admin/outreach/settings/route'
import {
  GET as getProspects,
  POST as postProspects,
  PATCH as patchProspects,
} from '@/app/api/admin/outreach/prospects/route'
import { GET as getRuns } from '@/app/api/admin/outreach/runs/route'
import { POST as postRun } from '@/app/api/admin/outreach/run/route'
import { GET as getCronDailyOutreach } from '@/app/api/cron/daily-outreach/route'
import {
  GET as getUnsubscribe,
  POST as postUnsubscribe,
} from '@/app/api/outreach/unsubscribe/route'

describe('Outreach Auth Guards & API Route Handlers (M3)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-cron-secret-value'
  })

  describe('requireAdminApi & requireCronOrAdminApi', () => {
    it('rejects unauthenticated requests with 401', async () => {
      mockResolveSession.mockResolvedValueOnce(null)
      const res = await requireAdminApi()
      expect(res).toEqual({
        ok: false,
        status: 401,
        error: 'Authentication required',
      })
    })

    it('rejects authenticated non-admin (client and agent) requests with 403', async () => {
      mockResolveSession.mockResolvedValueOnce({
        userId: 'client-1',
        email: 'client@example.com',
        name: 'Client User',
        role: 'client',
        isStaff: false,
        isAdmin: false,
      })
      const clientRes = await requireAdminApi()
      expect(clientRes).toEqual({
        ok: false,
        status: 403,
        error: 'Admin access required',
      })

      mockResolveSession.mockResolvedValueOnce({
        userId: 'agent-1',
        email: 'agent@virtueco.dev',
        name: 'Studio Agent',
        role: 'agent',
        isStaff: true,
        isAdmin: false,
      })
      const agentRes = await requireAdminApi()
      expect(agentRes).toEqual({
        ok: false,
        status: 403,
        error: 'Admin access required',
      })
    })

    it('allows authenticated admin requests (profile and allowlist)', async () => {
      mockResolveSession.mockResolvedValueOnce({
        userId: 'admin-1',
        email: 'admin@virtueco.dev',
        name: 'Studio Admin',
        role: 'admin',
        isStaff: true,
        isAdmin: true,
      })
      const profileRes = await requireAdminApi()
      expect(profileRes).toEqual({
        ok: true,
        session: {
          userId: 'admin-1',
          email: 'admin@virtueco.dev',
          name: 'Studio Admin',
          source: 'profile',
        },
      })

      mockResolveSession.mockResolvedValueOnce({
        userId: 'founder-1',
        email: 'founder@virtueco.dev',
        name: 'Founder',
        role: 'admin',
        isStaff: true,
        isAdmin: true,
      })
      const allowlistRes = await requireAdminApi()
      expect(allowlistRes).toEqual({
        ok: true,
        session: {
          userId: 'founder-1',
          email: 'founder@virtueco.dev',
          name: 'Founder',
          source: 'allowlist',
        },
      })
    })

    it('validates CRON_SECRET Bearer token with timing-safe comparison and rejects empty/wrong tokens', async () => {
      const validReq = new Request('http://localhost/api/cron/daily-outreach', {
        headers: { authorization: 'Bearer test-cron-secret-value' },
      })
      const cronAuth = await requireCronOrAdminApi(validReq)
      expect(cronAuth).toEqual({
        ok: true,
        session: { source: 'cron' },
      })

      // Wrong secret without session -> 401
      mockResolveSession.mockResolvedValueOnce(null)
      const badReq = new Request('http://localhost/api/cron/daily-outreach', {
        headers: { authorization: 'Bearer wrong-secret' },
      })
      const badAuth = await requireCronOrAdminApi(badReq)
      expect(badAuth).toEqual({
        ok: false,
        status: 401,
        error: 'Authentication required',
      })

      // Empty CRON_SECRET must never match 'Bearer '
      process.env.CRON_SECRET = ''
      mockResolveSession.mockResolvedValueOnce(null)
      const emptySecretReq = new Request('http://localhost/api/cron/daily-outreach', {
        headers: { authorization: 'Bearer ' },
      })
      const emptyAuth = await requireCronOrAdminApi(emptySecretReq)
      expect(emptyAuth.ok).toBe(false)
    })
  })

  describe('/api/admin/outreach/settings', () => {
    it('enforces 401/403 and returns settings + sentToday on GET and PATCH', async () => {
      mockResolveSession.mockResolvedValueOnce(null)
      const unauthGet = await getSettings()
      expect(unauthGet.status).toBe(401)

      mockResolveSession.mockResolvedValueOnce({
        userId: 'agent-1',
        email: 'agent@virtueco.dev',
        name: 'Agent',
        role: 'agent',
        isStaff: true,
        isAdmin: false,
      })
      const forbiddenGet = await getSettings()
      expect(forbiddenGet.status).toBe(403)

      mockResolveSession.mockResolvedValue({
        userId: 'admin-1',
        email: 'admin@virtueco.dev',
        name: 'Admin',
        role: 'admin',
        isStaff: true,
        isAdmin: true,
      })

      const okGet = await getSettings()
      expect(okGet.status).toBe(200)
      const getBody = await okGet.json()
      expect(getBody.ok).toBe(true)
      expect(getBody.sentToday).toBe(3)
      expect(getBody.settings.daily_send_cap).toBe(15)

      const invalidPatch = await patchSettings(
        new NextRequest('http://localhost/api/admin/outreach/settings', {
          method: 'PATCH',
          body: JSON.stringify({ daily_send_cap: 500 }),
        }),
      )
      expect(invalidPatch.status).toBe(400)

      const validPatch = await patchSettings(
        new NextRequest('http://localhost/api/admin/outreach/settings', {
          method: 'PATCH',
          body: JSON.stringify({ is_paused: true, daily_send_cap: 25 }),
        }),
      )
      expect(validPatch.status).toBe(200)
      const patchBody = await validPatch.json()
      expect(patchBody.settings.is_paused).toBe(true)
      expect(patchBody.settings.daily_send_cap).toBe(25)
    })
  })

  describe('/api/admin/outreach/prospects', () => {
    it('lists, creates (201), and updates prospects while enforcing auth and validation', async () => {
      mockResolveSession.mockResolvedValue({
        userId: 'admin-1',
        email: 'admin@virtueco.dev',
        name: 'Admin',
        role: 'admin',
        isStaff: true,
        isAdmin: true,
      })

      const listRes = await getProspects(
        new NextRequest('http://localhost/api/admin/outreach/prospects?status=qualified&limit=10'),
      )
      expect(listRes.status).toBe(200)
      const listBody = await listRes.json()
      expect(listBody.prospects).toHaveLength(1)

      const createRes = await postProspects(
        new NextRequest('http://localhost/api/admin/outreach/prospects', {
          method: 'POST',
          body: JSON.stringify({
            business_name: 'Apex Roofing',
            website_url: 'https://www.apexroofing.com',
            industry: 'roofing',
            location: 'Dallas, TX',
            contact_email: 'info@apexroofing.com',
          }),
        }),
      )
      expect(createRes.status).toBe(201)
      const createBody = await createRes.json()
      expect(createBody.prospect.normalized_domain).toBe('apexroofing.com')
      expect(createBody.prospect.dedup_key).toBe('domain:apexroofing.com')

      const updateRes = await patchProspects(
        new NextRequest('http://localhost/api/admin/outreach/prospects', {
          method: 'PATCH',
          body: JSON.stringify({
            id: '11111111-1111-4111-8111-111111111111',
            status: 'skipped',
          }),
        }),
      )
      expect(updateRes.status).toBe(200)
      const updateBody = await updateRes.json()
      expect(updateBody.prospect.status).toBe('skipped')
    })
  })

  describe('/api/admin/outreach/runs, /api/admin/outreach/run & /api/cron/daily-outreach', () => {
    it('lists runs, triggers dry-run/manual outreach, and executes cron outreach', async () => {
      mockResolveSession.mockResolvedValue({
        userId: 'admin-1',
        email: 'admin@virtueco.dev',
        name: 'Admin',
        role: 'admin',
        isStaff: true,
        isAdmin: true,
      })

      const runsRes = await getRuns(
        new NextRequest('http://localhost/api/admin/outreach/runs?limit=5&mode=cron'),
      )
      expect(runsRes.status).toBe(200)
      const runsBody = await runsRes.json()
      expect(runsBody.runs).toHaveLength(1)

      const triggerRes = await postRun(
        new NextRequest('http://localhost/api/admin/outreach/run', {
          method: 'POST',
          body: JSON.stringify({
            mode: 'dry_run',
            testRecipientEmail: 'qa@virtueco.dev',
          }),
        }),
      )
      expect(triggerRes.status).toBe(200)
      const triggerBody = await triggerRes.json()
      expect(triggerBody.summary.mode).toBe('dry_run')
      expect(mockRunDailyOutreach).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'dry_run',
          testRecipientEmail: 'qa@virtueco.dev',
        }),
      )

      mockResolveSession.mockResolvedValueOnce(null)
      const cronRes = await getCronDailyOutreach(
        new NextRequest('http://localhost/api/cron/daily-outreach', {
          headers: { authorization: 'Bearer test-cron-secret-value' },
        }),
      )
      expect(cronRes.status).toBe(200)
      const cronBody = await cronRes.json()
      expect(cronBody.ok).toBe(true)
      expect(mockRunDailyOutreach).toHaveBeenCalledWith({
        mode: 'cron',
        triggeredBy: 'cron',
      })
    })
  })

  describe('/api/outreach/unsubscribe', () => {
    it('records opt-out via GET and POST and rejects invalid email with 400', async () => {
      const badGet = await getUnsubscribe(
        new NextRequest('http://localhost/api/outreach/unsubscribe?email=not-an-email'),
      )
      expect(badGet.status).toBe(400)

      const okGet = await getUnsubscribe(
        new NextRequest(
          'http://localhost/api/outreach/unsubscribe?email=Owner@Biz.com&token=sample-token',
        ),
      )
      expect(okGet.status).toBe(200)
      const getBody = await okGet.json()
      expect(getBody.ok).toBe(true)
      expect(getBody.email).toBe('owner@biz.com')

      const okPost = await postUnsubscribe(
        new NextRequest('http://localhost/api/outreach/unsubscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            email: 'Founder@Acme.com',
            reason: 'No longer needed',
          }),
        }),
      )
      expect(okPost.status).toBe(200)
      const postBody = await okPost.json()
      expect(postBody.email).toBe('founder@acme.com')
      expect(mockRepository.addOptOut).toHaveBeenCalledWith('founder@acme.com', {
        reason: 'No longer needed',
        source: 'unsubscribe',
      })
    })
  })
})
