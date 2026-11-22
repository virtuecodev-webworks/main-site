import { describe, expect, it, vi } from 'vitest'
import {
  calculateSessionTarget,
  DRY_RUN_MAX_DISPATCHES,
  runDailyOutreach,
} from '@/lib/outreach/runner'
import { getUtcDayBounds } from '@/lib/outreach/repository'
import {
  DEFAULT_OUTREACH_SETTINGS,
  type AddOptOutOptions,
  type CompleteRunInput,
  type CreateRunInput,
  type DiscoveredBusiness,
  type GeneratedPitch,
  type ListDispatchesOptions,
  type LogDispatchInput,
  type OutreachDispatch,
  type OutreachOptOut,
  type OutreachProspect,
  type OutreachRepository,
  type OutreachRun,
  type OutreachSettings,
  type OutreachSettingsPatch,
  type ProspectListFilters,
  type ProspectUpdatePatch,
  type SiteEvaluationResult,
  type UpsertProspectInput,
} from '@/lib/outreach/types'

function createInMemoryRepository(
  initialSettings: Partial<OutreachSettings> = {},
): OutreachRepository & {
  prospects: Map<string, OutreachProspect>
  runs: OutreachRun[]
  dispatches: OutreachDispatch[]
  optOuts: Set<string>
} {
  let settings: OutreachSettings = {
    ...DEFAULT_OUTREACH_SETTINGS,
    industries: ['bakery'],
    locations: ['Austin, TX'],
    ...initialSettings,
  }
  const prospects = new Map<string, OutreachProspect>()
  const runs: OutreachRun[] = []
  const dispatches: OutreachDispatch[] = []
  const optOuts = new Set<string>()
  let seq = 1

  const nextId = (prefix: string) => `${prefix}-${seq++}`

  const findProspectByDedupOrDomain = async (
    dedupKey: string,
    normalizedDomain: string | null,
  ): Promise<OutreachProspect | null> => {
    const cleanKey = dedupKey.trim().toLowerCase()
    for (const p of prospects.values()) {
      if (p.dedup_key === cleanKey) return p
    }
    if (normalizedDomain) {
      const cleanDom = normalizedDomain.trim().toLowerCase()
      for (const p of prospects.values()) {
        if (p.normalized_domain === cleanDom) return p
      }
    }
    return null
  }

  const upsertProspect = async (input: UpsertProspectInput): Promise<OutreachProspect> => {
    const existing = await findProspectByDedupOrDomain(
      input.dedup_key,
      input.normalized_domain ?? null,
    )
    const now = new Date().toISOString()

    if (existing) {
      const updated: OutreachProspect = {
        ...existing,
        business_name: input.business_name,
        normalized_domain:
          input.normalized_domain !== undefined
            ? (input.normalized_domain?.trim().toLowerCase() ?? null)
            : existing.normalized_domain,
        website_url: input.website_url !== undefined ? input.website_url : existing.website_url,
        industry: input.industry !== undefined ? input.industry : existing.industry,
        location: input.location !== undefined ? input.location : existing.location,
        contact_email:
          input.contact_email !== undefined
            ? (input.contact_email?.trim().toLowerCase() ?? null)
            : existing.contact_email,
        phone: input.phone !== undefined ? input.phone : existing.phone,
        evaluation_status: input.evaluation_status ?? existing.evaluation_status,
        has_website: input.has_website ?? existing.has_website,
        issue_score: input.issue_score ?? existing.issue_score,
        issues: input.issues ?? existing.issues,
        http_status: input.http_status !== undefined ? input.http_status : existing.http_status,
        ttfb_ms: input.ttfb_ms !== undefined ? input.ttfb_ms : existing.ttfb_ms,
        site_title: input.site_title !== undefined ? input.site_title : existing.site_title,
        evaluation_notes:
          input.evaluation_notes !== undefined ? input.evaluation_notes : existing.evaluation_notes,
        status: input.status ?? existing.status,
        last_evaluated_at:
          input.last_evaluated_at !== undefined
            ? input.last_evaluated_at
            : existing.last_evaluated_at,
        last_error: input.last_error !== undefined ? input.last_error : existing.last_error,
        updated_at: now,
      }
      prospects.set(existing.id, updated)
      return updated
    }

    const created: OutreachProspect = {
      id: nextId('prospect'),
      business_name: input.business_name,
      normalized_domain: input.normalized_domain?.trim().toLowerCase() ?? null,
      website_url: input.website_url ?? null,
      industry: input.industry ?? null,
      location: input.location ?? null,
      contact_email: input.contact_email?.trim().toLowerCase() ?? null,
      phone: input.phone ?? null,
      source_provider: input.source_provider ?? 'seed',
      source_external_id: input.source_external_id ?? null,
      dedup_key: input.dedup_key.trim().toLowerCase(),
      evaluation_status: input.evaluation_status ?? 'pending',
      has_website: input.has_website ?? false,
      issue_score: input.issue_score ?? 0,
      issues: input.issues ?? [],
      http_status: input.http_status ?? null,
      ttfb_ms: input.ttfb_ms ?? null,
      site_title: input.site_title ?? null,
      evaluation_notes: input.evaluation_notes ?? null,
      pitch_subject: input.pitch_subject ?? null,
      pitch_preview: input.pitch_preview ?? null,
      status: input.status ?? 'discovered',
      last_evaluated_at: input.last_evaluated_at ?? null,
      last_pitched_at: input.last_pitched_at ?? null,
      last_error: input.last_error ?? null,
      raw_metadata: input.raw_metadata ?? null,
      created_at: now,
      updated_at: now,
    }
    prospects.set(created.id, created)
    return created
  }

  return {
    prospects,
    runs,
    dispatches,
    optOuts,
    async getSettings() {
      return settings
    },
    async getSettingsOrDefault() {
      return settings
    },
    async upsertSettings(patch: OutreachSettingsPatch) {
      settings = { ...settings, ...patch, updated_at: new Date().toISOString() }
      return settings
    },
    findProspectByDedupOrDomain,
    upsertProspect,
    async updateProspect(id: string, patch: ProspectUpdatePatch) {
      const existing = prospects.get(id)
      if (!existing) throw new Error(`Prospect ${id} not found`)
      const updated = { ...existing, ...patch, updated_at: new Date().toISOString() }
      prospects.set(id, updated)
      return updated
    },
    async listProspects(_filters?: ProspectListFilters) {
      return Array.from(prospects.values())
    },
    async createRun(input: CreateRunInput) {
      const now = new Date().toISOString()
      const run: OutreachRun = {
        id: nextId('run'),
        run_date: now.slice(0, 10),
        mode: input.mode,
        status: input.status ?? 'running',
        triggered_by: input.triggered_by ?? null,
        scouted_count: 0,
        qualified_count: 0,
        sent_count: 0,
        skipped_count: 0,
        failed_count: 0,
        daily_cap_snapshot: input.daily_cap_snapshot,
        sent_today_before_run: input.sent_today_before_run,
        error_summary: null,
        details: input.details ?? {},
        started_at: now,
        completed_at: null,
        created_at: now,
        updated_at: now,
      }
      runs.push(run)
      return run
    },
    async completeRun(runId: string, summary: CompleteRunInput) {
      const run = runs.find((r) => r.id === runId)
      if (!run) throw new Error(`Run ${runId} not found`)
      Object.assign(run, summary, {
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      return run
    },
    async listRuns() {
      return runs
    },
    async logDispatch(input: LogDispatchInput) {
      const now = new Date().toISOString()
      const dispatch: OutreachDispatch = {
        id: nextId('dispatch'),
        run_id: input.run_id ?? null,
        prospect_id: input.prospect_id ?? null,
        business_name: input.business_name,
        recipient_email: input.recipient_email.trim().toLowerCase(),
        is_dry_run: input.is_dry_run,
        subject: input.subject,
        body_preview: input.body_preview ?? null,
        status: input.status,
        message_id: input.message_id ?? null,
        error: input.error ?? null,
        sent_at: input.sent_at ?? now,
        created_at: now,
      }
      dispatches.push(dispatch)
      return dispatch
    },
    async listDispatches(_options?: ListDispatchesOptions) {
      return dispatches
    },
    async getSentCountToday(referenceDate = new Date()) {
      const { start, end } = getUtcDayBounds(referenceDate)
      return dispatches.filter(
        (d) =>
          !d.is_dry_run &&
          d.status === 'sent' &&
          d.sent_at >= start &&
          d.sent_at < end,
      ).length
    },
    async isOptedOut(email: string) {
      return optOuts.has(email.trim().toLowerCase())
    },
    async addOptOut(email: string, options?: AddOptOutOptions): Promise<OutreachOptOut> {
      const clean = email.trim().toLowerCase()
      optOuts.add(clean)
      return {
        email: clean,
        reason: options?.reason ?? null,
        source: options?.source ?? 'unsubscribe',
        prospect_id: options?.prospect_id ?? null,
        created_at: new Date().toISOString(),
      }
    },
  }
}

function makeCandidate(idx: number, overrides: Partial<DiscoveredBusiness> = {}): DiscoveredBusiness {
  return {
    businessName: `Business ${idx}`,
    industry: 'bakery',
    location: 'Austin, TX',
    websiteUrl: `https://biz${idx}.example`,
    contactEmail: `owner${idx}@biz${idx}.example`,
    sourceProvider: 'seed',
    ...overrides,
  }
}

const qualifiedEval: SiteEvaluationResult = {
  hasWebsite: true,
  qualified: true,
  issueScore: 60,
  issues: [{ code: 'missing_viewport', label: 'Missing mobile viewport meta tag', severity: 'high', points: 25 }],
  extractedEmail: null,
  httpStatus: 200,
  ttfbMs: 250,
  finalUrl: 'https://example.com',
  title: 'Example',
}

function fakePitch(business: DiscoveredBusiness): GeneratedPitch {
  return {
    subject: `Website audit for ${business.businessName}`,
    headline: `Upgrade ${business.businessName}`,
    greeting: `Hi ${business.businessName} team,`,
    opening: 'We spotted mobile and SEO gaps on your site that we can fix quickly.',
    auditBullets: ['Missing mobile viewport configuration'],
    recommendedPackage: 'Corporate Site ($260)',
    ctaText: 'Book a Call',
    closing: 'Best regards,\nVirtue & Co. Webworks',
    model: 'test-model',
  }
}

describe('runDailyOutreach', () => {
  it('enforces pause invariant for cron and manual modes, while allowing dry_run', async () => {
    const repo = createInMemoryRepository({ is_paused: true, test_recipient_email: 'qa@virtue.test' })
    const discoverMock = vi.fn()
    const sendMock = vi.fn().mockResolvedValue({ messageId: 'm1' })

    const cronSummary = await runDailyOutreach({
      mode: 'cron',
      deps: {
        repository: repo,
        discoverBusinesses: discoverMock,
        sendPitchEmail: sendMock,
      },
    })
    expect(cronSummary.status).toBe('paused')
    expect(cronSummary.sentCount).toBe(0)
    expect(discoverMock).not.toHaveBeenCalled()
    expect(sendMock).not.toHaveBeenCalled()

    const manualSummary = await runDailyOutreach({
      mode: 'manual',
      deps: {
        repository: repo,
        discoverBusinesses: discoverMock,
        sendPitchEmail: sendMock,
      },
    })
    expect(manualSummary.status).toBe('paused')
    expect(manualSummary.sentCount).toBe(0)

    const dryRunSummary = await runDailyOutreach({
      mode: 'dry_run',
      seedCandidates: [makeCandidate(1)],
      deps: {
        repository: repo,
        evaluateWebsite: async () => qualifiedEval,
        generatePitch: async (b) => fakePitch(b),
        sendPitchEmail: sendMock,
      },
    })
    expect(dryRunSummary.status).toBe('completed')
    expect(dryRunSummary.sentCount).toBe(1)
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'qa@virtue.test', isDryRun: true }))
  })

  it('enforces daily send cap before and during a live run without pitching beyond cap', async () => {
    const repo = createInMemoryRepository({ daily_send_cap: 5 })
    for (let i = 1; i <= 3; i++) {
      await repo.logDispatch({
        business_name: `Prior ${i}`,
        recipient_email: `prior${i}@test.example`,
        is_dry_run: false,
        subject: 'Prior',
        status: 'sent',
      })
    }

    const sendMock = vi.fn().mockResolvedValue({ messageId: 'msg' })
    const summary = await runDailyOutreach({
      mode: 'manual',
      seedCandidates: [makeCandidate(1), makeCandidate(2), makeCandidate(3), makeCandidate(4)],
      deps: {
        repository: repo,
        evaluateWebsite: async () => qualifiedEval,
        generatePitch: async (b) => fakePitch(b),
        sendPitchEmail: sendMock,
      },
    })

    expect(summary.sentTodayBeforeRun).toBe(3)
    expect(summary.sentCount).toBe(2)
    expect(summary.skippedCount).toBe(2)
    expect(summary.status).toBe('cap_reached')
    expect(sendMock).toHaveBeenCalledTimes(2)

    const remainingProspects = Array.from(repo.prospects.values()).filter(
      (p) => p.status === 'qualified',
    )
    expect(remainingProspects).toHaveLength(2)

    // Subsequent run immediately returns cap_reached with 0 emails
    const secondRun = await runDailyOutreach({
      mode: 'cron',
      seedCandidates: [makeCandidate(5)],
      deps: {
        repository: repo,
        sendPitchEmail: sendMock,
      },
    })
    expect(secondRun.status).toBe('cap_reached')
    expect(secondRun.sentCount).toBe(0)
    expect(sendMock).toHaveBeenCalledTimes(2)
  })

  it('prevents in-run and cross-run duplicate pitches and respects opt-outs', async () => {
    const repo = createInMemoryRepository({ daily_send_cap: 15 })
    await repo.upsertProspect({
      business_name: 'Already Pitched Co',
      normalized_domain: 'alreadypitched.example',
      dedup_key: 'domain:alreadypitched.example',
      status: 'pitched',
    })
    await repo.addOptOut('optout@nope.example')

    const sendMock = vi.fn().mockResolvedValue({ messageId: 'msg' })
    const summary = await runDailyOutreach({
      mode: 'manual',
      seedCandidates: [
        makeCandidate(1, { websiteUrl: 'https://www.acme.example', contactEmail: 'a@acme.example' }),
        makeCandidate(2, { businessName: 'Acme Alias', websiteUrl: 'http://acme.example/about', contactEmail: 'b@acme.example' }),
        makeCandidate(3, { websiteUrl: 'https://alreadypitched.example', contactEmail: 'x@alreadypitched.example' }),
        makeCandidate(4, { websiteUrl: 'https://nope.example', contactEmail: 'optout@nope.example' }),
      ],
      deps: {
        repository: repo,
        evaluateWebsite: async () => qualifiedEval,
        generatePitch: async (b) => fakePitch(b),
        sendPitchEmail: sendMock,
      },
    })

    expect(summary.sentCount).toBe(1)
    expect(summary.skippedCount).toBe(3)
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'a@acme.example' }))
  })

  it('persists qualified prospects without email as qualified_no_email without pitching', async () => {
    const repo = createInMemoryRepository()
    const generateMock = vi.fn()
    const sendMock = vi.fn()

    const summary = await runDailyOutreach({
      mode: 'manual',
      seedCandidates: [makeCandidate(1, { contactEmail: null })],
      deps: {
        repository: repo,
        evaluateWebsite: async () => ({ ...qualifiedEval, extractedEmail: null }),
        generatePitch: generateMock,
        sendPitchEmail: sendMock,
      },
    })

    expect(summary.qualifiedCount).toBe(1)
    expect(summary.sentCount).toBe(0)
    expect(summary.skippedCount).toBe(1)
    expect(generateMock).not.toHaveBeenCalled()
    expect(sendMock).not.toHaveBeenCalled()

    const saved = Array.from(repo.prospects.values())[0]
    expect(saved.status).toBe('qualified_no_email')
  })

  it('isolates dry_run dispatches to testRecipientEmail, caps at 3, keeps prospects qualified, and never increments live cap', async () => {
    const repo = createInMemoryRepository({ daily_send_cap: 10 })
    const sendMock = vi.fn().mockResolvedValue({ messageId: 'dry-msg' })

    const candidates = [1, 2, 3, 4, 5].map((i) => makeCandidate(i))
    const summary = await runDailyOutreach({
      mode: 'dry_run',
      testRecipientEmail: 'qa-inbox@virtue.test',
      seedCandidates: candidates,
      deps: {
        repository: repo,
        evaluateWebsite: async () => qualifiedEval,
        generatePitch: async (b) => fakePitch(b),
        sendPitchEmail: sendMock,
      },
    })

    expect(summary.status).toBe('completed')
    expect(summary.sentCount).toBe(DRY_RUN_MAX_DISPATCHES)
    expect(summary.skippedCount).toBe(2)
    expect(sendMock).toHaveBeenCalledTimes(DRY_RUN_MAX_DISPATCHES)

    for (const call of sendMock.mock.calls) {
      expect(call[0].to).toBe('qa-inbox@virtue.test')
      expect(call[0].isDryRun).toBe(true)
      expect(call[0].subject.startsWith('[DRY RUN] ')).toBe(true)
    }

    // Never marks prospects as 'pitched' and never counts against live daily cap
    for (const prospect of repo.prospects.values()) {
      expect(prospect.status).toBe('qualified')
      expect(prospect.last_pitched_at).toBeNull()
    }
    expect(await repo.getSentCountToday()).toBe(0)

    // Without testRecipientEmail, dry_run sends 0 emails and never touches real contact_email
    const sendNoTargetMock = vi.fn()
    const noTargetSummary = await runDailyOutreach({
      mode: 'dry_run',
      seedCandidates: [makeCandidate(99)],
      deps: {
        repository: repo,
        evaluateWebsite: async () => qualifiedEval,
        generatePitch: async (b) => fakePitch(b),
        sendPitchEmail: sendNoTargetMock,
      },
    })
    expect(noTargetSummary.sentCount).toBe(0)
    expect(sendNoTargetMock).not.toHaveBeenCalled()
  })

  it('isolates per-candidate send/eval failures and never marks failed sends as pitched', async () => {
    const repo = createInMemoryRepository()
    const sendMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('SMTP 550 mailbox unavailable'))
      .mockResolvedValueOnce({ messageId: 'ok-msg' })

    const summary = await runDailyOutreach({
      mode: 'manual',
      seedCandidates: [makeCandidate(1), makeCandidate(2)],
      deps: {
        repository: repo,
        evaluateWebsite: async () => qualifiedEval,
        generatePitch: async (b) => fakePitch(b),
        sendPitchEmail: sendMock,
      },
    })

    expect(summary.status).toBe('completed')
    expect(summary.failedCount).toBe(1)
    expect(summary.sentCount).toBe(1)

    const allProspects = Array.from(repo.prospects.values())
    expect(allProspects.find((p) => p.business_name === 'Business 1')?.status).toBe('failed')
    expect(allProspects.find((p) => p.business_name === 'Business 2')?.status).toBe('pitched')

    // Also guard against injected sendPitchEmail returning { ok: false } without throwing
    const nonThrowingFailMock = vi.fn().mockResolvedValue({ ok: false, error: 'smtp-down' })
    const summary2 = await runDailyOutreach({
      mode: 'manual',
      seedCandidates: [makeCandidate(3)],
      deps: {
        repository: repo,
        evaluateWebsite: async () => qualifiedEval,
        generatePitch: async (b) => fakePitch(b),
        sendPitchEmail: nonThrowingFailMock as unknown as NonNullable<
          Parameters<typeof runDailyOutreach>[0]['deps']
        >['sendPitchEmail'],
      },
    })
    expect(summary2.failedCount).toBe(1)
    expect(summary2.sentCount).toBe(0)
    expect(
      Array.from(repo.prospects.values()).find((p) => p.business_name === 'Business 3')?.status,
    ).toBe('failed')
  })

  it('merges overrideCriteria over settings when calling discoverBusinesses', async () => {
    const repo = createInMemoryRepository({
      industries: ['bakery'],
      locations: ['Austin, TX'],
      discovery_provider: 'osm',
      min_issue_score: 30,
    })
    const discoverMock = vi.fn().mockResolvedValue([])

    await runDailyOutreach({
      mode: 'manual',
      overrideCriteria: {
        industries: ['dentist'],
        min_issue_score: 50,
      },
      deps: {
        repository: repo,
        discoverBusinesses: discoverMock,
      },
    })

    expect(discoverMock).toHaveBeenCalledWith({
      industries: ['dentist'],
      locations: ['Austin, TX'],
      keywords: [],
      discovery_provider: 'osm',
      min_issue_score: 50,
    })
  })

  it('respects explicit targetCount option in manual run', async () => {
    const repo = createInMemoryRepository({
      daily_send_cap: 30,
    })
    const candidates: DiscoveredBusiness[] = [
      {
        businessName: 'Firm 1',
        websiteUrl: 'https://firm1.com',
        contactEmail: 'contact@firm1.com',
        sourceProvider: 'serper',
      },
      {
        businessName: 'Firm 2',
        websiteUrl: 'https://firm2.com',
        contactEmail: 'contact@firm2.com',
        sourceProvider: 'serper',
      },
      {
        businessName: 'Firm 3',
        websiteUrl: 'https://firm3.com',
        contactEmail: 'contact@firm3.com',
        sourceProvider: 'serper',
      },
      {
        businessName: 'Firm 4',
        websiteUrl: 'https://firm4.com',
        contactEmail: 'contact@firm4.com',
        sourceProvider: 'serper',
      },
    ]

    const evaluateMock = vi.fn().mockResolvedValue(qualifiedEval)
    const pitchMock = vi.fn().mockImplementation((b) => Promise.resolve(fakePitch(b)))
    const sendMock = vi.fn().mockResolvedValue({ messageId: 'msg-target' })

    const summary = await runDailyOutreach({
      mode: 'manual',
      targetCount: 2, // Explicitly request only 2
      seedCandidates: candidates,
      deps: {
        repository: repo,
        evaluateWebsite: evaluateMock,
        generatePitch: pitchMock,
        sendPitchEmail: sendMock,
      },
    })

    expect(summary.sentCount).toBe(2)
    expect(sendMock).toHaveBeenCalledTimes(2)
  })
})

describe('calculateSessionTarget', () => {
  it('enforces 15 morning and 15 evening session quotas for cron', () => {
    const morningDate = new Date('2026-11-22T08:00:00Z') // 08:00 UTC
    const eveningDate = new Date('2026-11-22T18:00:00Z') // 18:00 UTC

    // Morning run: sent 0 so far -> target 15
    expect(calculateSessionTarget('cron', 30, 0, morningDate)).toBe(15)

    // Morning run: sent 5 earlier today -> target 10 to hit morning goal of 15
    expect(calculateSessionTarget('cron', 30, 5, morningDate)).toBe(10)

    // Morning run: already reached 15 today -> target 0 for morning
    expect(calculateSessionTarget('cron', 30, 15, morningDate)).toBe(0)

    // Evening run: sent 15 in morning -> target remaining 15
    expect(calculateSessionTarget('cron', 30, 15, eveningDate)).toBe(15)

    // Evening run: morning only sent 10 -> evening recovers up to daily cap (20)
    expect(calculateSessionTarget('cron', 30, 10, eveningDate)).toBe(20)

    // Cap reached -> target 0
    expect(calculateSessionTarget('cron', 30, 30, eveningDate)).toBe(0)

    // Manual run: batches up to 15 or remaining
    expect(calculateSessionTarget('manual', 30, 0, morningDate)).toBe(15)
    expect(calculateSessionTarget('manual', 30, 20, morningDate)).toBe(10)
    expect(calculateSessionTarget('manual', 30, 30, morningDate)).toBe(0)
  })
})
