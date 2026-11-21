import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  createOutreachRepository,
  getUtcDayBounds,
  OutreachDatabaseUnavailableError,
  OutreachRepositoryError,
} from '@/lib/outreach/repository'
import {
  DEFAULT_OUTREACH_SETTINGS,
  type OutreachDispatch,
  type OutreachOptOut,
  type OutreachProspect,
  type OutreachRun,
  type OutreachSettings,
} from '@/lib/outreach/types'

interface RecordedCall {
  table: string
  operation: 'select' | 'insert' | 'update' | 'upsert'
  payload?: unknown
  upsertOptions?: unknown
  filters: Array<{ method: string; args: unknown[] }>
  selectArgs?: unknown[]
}

interface MockResponse {
  data?: unknown
  error?: { message: string; code?: string } | null
  count?: number | null
}

function createMockSupabaseClient(
  handler: (call: RecordedCall) => MockResponse | Promise<MockResponse>,
): { client: SupabaseClient; calls: RecordedCall[] } {
  const calls: RecordedCall[] = []

  const client = {
    from(table: string) {
      const state: RecordedCall = {
        table,
        operation: 'select',
        filters: [],
      }

      const execute = async (): Promise<MockResponse> => {
        calls.push({ ...state, filters: [...state.filters] })
        return handler(state)
      }

      const builder = {
        select(...args: unknown[]) {
          state.selectArgs = args
          return builder
        },
        insert(payload: unknown) {
          state.operation = 'insert'
          state.payload = payload
          return builder
        },
        update(payload: unknown) {
          state.operation = 'update'
          state.payload = payload
          return builder
        },
        upsert(payload: unknown, options?: unknown) {
          state.operation = 'upsert'
          state.payload = payload
          state.upsertOptions = options
          return builder
        },
        eq(column: string, value: unknown) {
          state.filters.push({ method: 'eq', args: [column, value] })
          return builder
        },
        ilike(column: string, value: unknown) {
          state.filters.push({ method: 'ilike', args: [column, value] })
          return builder
        },
        gte(column: string, value: unknown) {
          state.filters.push({ method: 'gte', args: [column, value] })
          return builder
        },
        lt(column: string, value: unknown) {
          state.filters.push({ method: 'lt', args: [column, value] })
          return builder
        },
        order(column: string, options?: unknown) {
          state.filters.push({ method: 'order', args: [column, options] })
          return builder
        },
        limit(count: number) {
          state.filters.push({ method: 'limit', args: [count] })
          return builder
        },
        range(from: number, to: number) {
          state.filters.push({ method: 'range', args: [from, to] })
          return builder
        },
        single() {
          state.filters.push({ method: 'single', args: [] })
          return execute()
        },
        maybeSingle() {
          state.filters.push({ method: 'maybeSingle', args: [] })
          return execute()
        },
        returns() {
          return builder
        },
        then(
          onfulfilled?: (value: MockResponse) => unknown,
          onrejected?: (reason: unknown) => unknown,
        ) {
          return execute().then(onfulfilled, onrejected)
        },
      }

      return builder
    },
  } as unknown as SupabaseClient

  return { client, calls }
}

const sampleProspect: OutreachProspect = {
  id: '11111111-1111-4111-8111-111111111111',
  business_name: 'Harbor Bakery',
  normalized_domain: 'harborbakery.com',
  website_url: 'http://harborbakery.com',
  industry: 'Bakery',
  location: 'Seattle, WA',
  contact_email: 'hello@harborbakery.com',
  phone: null,
  source_provider: 'osm',
  source_external_id: 'node/123',
  dedup_key: 'domain:harborbakery.com',
  evaluation_status: 'evaluated',
  has_website: true,
  issue_score: 55,
  issues: [],
  http_status: 200,
  ttfb_ms: 420,
  site_title: 'Harbor Bakery',
  evaluation_notes: null,
  pitch_subject: null,
  pitch_preview: null,
  status: 'qualified',
  last_evaluated_at: '2026-11-21T10:00:00.000Z',
  last_pitched_at: null,
  last_error: null,
  raw_metadata: null,
  created_at: '2026-11-21T10:00:00.000Z',
  updated_at: '2026-11-21T10:00:00.000Z',
}

describe('vitest server-only stub & admin client smoke check', () => {
  it('imports server-only modules in Vitest without throwing', () => {
    expect(typeof createSupabaseAdminClient).toBe('function')
  })
})

describe('outreach repository fail-closed behavior when DB client is null', () => {
  it('throws OutreachDatabaseUnavailableError across all critical operations', async () => {
    const repo = createOutreachRepository(null)

    await expect(repo.getSettings()).rejects.toBeInstanceOf(OutreachDatabaseUnavailableError)
    await expect(repo.upsertSettings({ is_paused: true })).rejects.toBeInstanceOf(
      OutreachDatabaseUnavailableError,
    )
    await expect(repo.findProspectByDedupOrDomain('k', 'd.com')).rejects.toBeInstanceOf(
      OutreachDatabaseUnavailableError,
    )
    await expect(
      repo.upsertProspect({ business_name: 'Test', dedup_key: 'k' }),
    ).rejects.toBeInstanceOf(OutreachDatabaseUnavailableError)
    await expect(repo.updateProspect('id', { status: 'skipped' })).rejects.toBeInstanceOf(
      OutreachDatabaseUnavailableError,
    )
    await expect(repo.listProspects()).rejects.toBeInstanceOf(OutreachDatabaseUnavailableError)
    await expect(
      repo.createRun({
        mode: 'manual',
        daily_cap_snapshot: 15,
        sent_today_before_run: 0,
      }),
    ).rejects.toBeInstanceOf(OutreachDatabaseUnavailableError)
    await expect(
      repo.completeRun('run-1', {
        status: 'completed',
        scouted_count: 0,
        qualified_count: 0,
        sent_count: 0,
        skipped_count: 0,
        failed_count: 0,
      }),
    ).rejects.toBeInstanceOf(OutreachDatabaseUnavailableError)
    await expect(repo.listRuns()).rejects.toBeInstanceOf(OutreachDatabaseUnavailableError)
    await expect(
      repo.logDispatch({
        business_name: 'Test',
        recipient_email: 'a@b.com',
        is_dry_run: true,
        subject: 'Hi',
        status: 'dry_run',
      }),
    ).rejects.toBeInstanceOf(OutreachDatabaseUnavailableError)
    await expect(repo.listDispatches()).rejects.toBeInstanceOf(OutreachDatabaseUnavailableError)
    await expect(repo.getSentCountToday()).rejects.toBeInstanceOf(
      OutreachDatabaseUnavailableError,
    )
    await expect(repo.isOptedOut('a@b.com')).rejects.toBeInstanceOf(
      OutreachDatabaseUnavailableError,
    )
    await expect(repo.addOptOut('a@b.com')).rejects.toBeInstanceOf(
      OutreachDatabaseUnavailableError,
    )
  })

  it('returns DEFAULT_OUTREACH_SETTINGS from getSettingsOrDefault when DB is unavailable', async () => {
    const repo = createOutreachRepository(null)
    const settings = await repo.getSettingsOrDefault()
    expect(settings).toEqual(DEFAULT_OUTREACH_SETTINGS)
    expect(settings.dry_run_default).toBe(false)
  })
})

describe('settings persistence', () => {
  it('seeds singleton row when getSettings finds no row', async () => {
    const seededRow: OutreachSettings = { ...DEFAULT_OUTREACH_SETTINGS }
    const { client, calls } = createMockSupabaseClient((call) => {
      if (call.operation === 'select') {
        return { data: null, error: null }
      }
      return { data: seededRow, error: null }
    })

    const repo = createOutreachRepository(client)
    const settings = await repo.getSettings()

    expect(settings).toEqual(seededRow)
    expect(calls).toHaveLength(2)
    expect(calls[0].operation).toBe('select')
    expect(calls[1].operation).toBe('upsert')
    expect(calls[1].upsertOptions).toEqual({ onConflict: 'id' })
    expect(calls[1].payload).toMatchObject({ id: true })
  })

  it('upsertSettings normalizes test_recipient_email and preserves unpatched fields', async () => {
    const updatedRow: OutreachSettings = {
      ...DEFAULT_OUTREACH_SETTINGS,
      is_paused: true,
      test_recipient_email: 'qa@virtueco.dev',
    }
    const { client, calls } = createMockSupabaseClient(() => ({ data: updatedRow, error: null }))

    const repo = createOutreachRepository(client)
    const result = await repo.upsertSettings({
      is_paused: true,
      test_recipient_email: '  QA@VirtueCo.dev ',
    })

    expect(result.is_paused).toBe(true)
    expect(calls).toHaveLength(1)
    expect(calls[0].upsertOptions).toEqual({ onConflict: 'id' })
    expect(calls[0].payload).toMatchObject({
      id: true,
      is_paused: true,
      test_recipient_email: 'qa@virtueco.dev',
    })
    expect(calls[0].payload).not.toHaveProperty('daily_send_cap')
  })
})

describe('prospect deduplication and updates', () => {
  it('queries dedup_key first and skips normalized_domain on hit', async () => {
    const { client, calls } = createMockSupabaseClient(() => ({
      data: sampleProspect,
      error: null,
    }))

    const repo = createOutreachRepository(client)
    const found = await repo.findProspectByDedupOrDomain(
      '  DOMAIN:HarborBakery.com ',
      'HarborBakery.com',
    )

    expect(found).toEqual(sampleProspect)
    expect(calls).toHaveLength(1)
    expect(calls[0].filters[0]).toEqual({
      method: 'eq',
      args: ['dedup_key', 'domain:harborbakery.com'],
    })
  })

  it('falls back to normalized_domain only when dedup_key misses', async () => {
    const { client, calls } = createMockSupabaseClient((call) => {
      const firstFilter = call.filters[0]
      if (firstFilter?.args[0] === 'dedup_key') {
        return { data: null, error: null }
      }
      return { data: sampleProspect, error: null }
    })

    const repo = createOutreachRepository(client)
    const found = await repo.findProspectByDedupOrDomain('name:harbor', '  HarborBakery.com ')

    expect(found).toEqual(sampleProspect)
    expect(calls).toHaveLength(2)
    expect(calls[1].filters).toContainEqual({
      method: 'eq',
      args: ['normalized_domain', 'harborbakery.com'],
    })
  })

  it('updates by id when normalized_domain matches a row with a different dedup_key', async () => {
    const { client, calls } = createMockSupabaseClient((call) => {
      if (call.operation === 'select') {
        if (call.filters[0]?.args[0] === 'dedup_key') {
          return { data: null, error: null }
        }
        return { data: sampleProspect, error: null }
      }
      return {
        data: { ...sampleProspect, issue_score: 70 },
        error: null,
      }
    })

    const repo = createOutreachRepository(client)
    const saved = await repo.upsertProspect({
      business_name: 'Harbor Bakery',
      dedup_key: 'name:harbor-bakery-seattle',
      normalized_domain: 'HARBORBAKERY.COM',
      contact_email: 'OWNER@HarborBakery.com',
      issue_score: 70,
    })

    expect(saved.issue_score).toBe(70)
    const updateCall = calls.find((c) => c.operation === 'update')
    expect(updateCall).toBeDefined()
    expect(updateCall?.filters).toContainEqual({ method: 'eq', args: ['id', sampleProspect.id] })
    expect(updateCall?.payload).toMatchObject({
      dedup_key: sampleProspect.dedup_key,
      normalized_domain: 'harborbakery.com',
      contact_email: 'owner@harborbakery.com',
      issue_score: 70,
    })
  })

  it('upserts on dedup_key when no domain collision exists', async () => {
    const { client, calls } = createMockSupabaseClient((call) => {
      if (call.operation === 'select') {
        return { data: null, error: null }
      }
      return { data: sampleProspect, error: null }
    })

    const repo = createOutreachRepository(client)
    await repo.upsertProspect({
      business_name: 'Harbor Bakery',
      dedup_key: 'DOMAIN:HARBORBAKERY.COM',
      normalized_domain: 'HARBORBAKERY.COM',
      contact_email: 'HELLO@HarborBakery.com',
    })

    const upsertCall = calls.find((c) => c.operation === 'upsert')
    expect(upsertCall).toBeDefined()
    expect(upsertCall?.upsertOptions).toEqual({ onConflict: 'dedup_key' })
    expect(upsertCall?.payload).toMatchObject({
      dedup_key: 'domain:harborbakery.com',
      normalized_domain: 'harborbakery.com',
      contact_email: 'hello@harborbakery.com',
    })
  })

  it('escapes ilike wildcards in listProspects search', async () => {
    const { client, calls } = createMockSupabaseClient(() => ({
      data: [sampleProspect],
      error: null,
    }))

    const repo = createOutreachRepository(client)
    const rows = await repo.listProspects({ status: 'qualified', q: '100%_real\\co', limit: 10, offset: 5 })

    expect(rows).toHaveLength(1)
    expect(calls[0].filters).toContainEqual({ method: 'eq', args: ['status', 'qualified'] })
    expect(calls[0].filters).toContainEqual({
      method: 'ilike',
      args: ['business_name', '%100\\%\\_real\\\\co%'],
    })
    expect(calls[0].filters).toContainEqual({ method: 'range', args: [5, 14] })
  })
})

describe('runs, dispatches, and UTC daily send cap counting', () => {
  it('computes exact UTC day bounds for getSentCountToday and throws on DB error', async () => {
    const refDate = new Date('2026-11-21T23:59:59.000Z')
    expect(getUtcDayBounds(refDate)).toEqual({
      start: '2026-11-21T00:00:00.000Z',
      end: '2026-11-22T00:00:00.000Z',
    })

    const { client, calls } = createMockSupabaseClient(() => ({
      count: 7,
      error: null,
    }))
    const repo = createOutreachRepository(client)
    const sentToday = await repo.getSentCountToday(refDate)

    expect(sentToday).toBe(7)
    expect(calls[0].selectArgs).toEqual(['id', { count: 'exact', head: true }])
    expect(calls[0].filters).toContainEqual({ method: 'eq', args: ['is_dry_run', false] })
    expect(calls[0].filters).toContainEqual({ method: 'eq', args: ['status', 'sent'] })
    expect(calls[0].filters).toContainEqual({
      method: 'gte',
      args: ['sent_at', '2026-11-21T00:00:00.000Z'],
    })
    expect(calls[0].filters).toContainEqual({
      method: 'lt',
      args: ['sent_at', '2026-11-22T00:00:00.000Z'],
    })

    const { client: errorClient } = createMockSupabaseClient(() => ({
      count: null,
      error: { message: 'connection lost', code: '08006' },
    }))
    await expect(createOutreachRepository(errorClient).getSentCountToday(refDate)).rejects.toBeInstanceOf(
      OutreachRepositoryError,
    )
  })

  it('creates, completes, and lists runs and logs dispatches', async () => {
    const mockRun: OutreachRun = {
      id: '22222222-2222-4222-8222-222222222222',
      run_date: '2026-11-21',
      mode: 'dry_run',
      status: 'running',
      triggered_by: null,
      scouted_count: 0,
      qualified_count: 0,
      sent_count: 0,
      skipped_count: 0,
      failed_count: 0,
      daily_cap_snapshot: 15,
      sent_today_before_run: 2,
      error_summary: null,
      details: {},
      started_at: '2026-11-21T12:00:00.000Z',
      completed_at: null,
      created_at: '2026-11-21T12:00:00.000Z',
      updated_at: '2026-11-21T12:00:00.000Z',
    }
    const mockDispatch: OutreachDispatch = {
      id: '33333333-3333-4333-8333-333333333333',
      run_id: mockRun.id,
      prospect_id: sampleProspect.id,
      business_name: 'Harbor Bakery',
      recipient_email: 'test@virtueco.dev',
      is_dry_run: true,
      subject: '[DRY RUN] Website refresh',
      body_preview: 'Hello...',
      status: 'dry_run',
      message_id: 'msg-1',
      error: null,
      sent_at: '2026-11-21T12:01:00.000Z',
      created_at: '2026-11-21T12:01:00.000Z',
    }

    const { client, calls } = createMockSupabaseClient((call) => {
      if (call.table === 'outreach_runs') {
        if (call.operation === 'select') return { data: [mockRun], error: null }
        if (call.operation === 'update') return { data: { ...mockRun, status: 'completed' }, error: null }
        return { data: mockRun, error: null }
      }
      if (call.operation === 'select') return { data: [mockDispatch], error: null }
      return { data: mockDispatch, error: null }
    })

    const repo = createOutreachRepository(client)
    const created = await repo.createRun({
      mode: 'dry_run',
      daily_cap_snapshot: 15,
      sent_today_before_run: 2,
    })
    expect(created.id).toBe(mockRun.id)

    const completed = await repo.completeRun(mockRun.id, {
      status: 'completed',
      scouted_count: 3,
      qualified_count: 2,
      sent_count: 1,
      skipped_count: 1,
      failed_count: 0,
    })
    expect(completed.status).toBe('completed')

    const logged = await repo.logDispatch({
      run_id: mockRun.id,
      prospect_id: sampleProspect.id,
      business_name: 'Harbor Bakery',
      recipient_email: 'Test@VirtueCo.dev',
      is_dry_run: true,
      subject: '[DRY RUN] Website refresh',
      status: 'dry_run',
    })
    expect(logged.recipient_email).toBe('test@virtueco.dev')
    expect(calls.find((c) => c.table === 'outreach_dispatches')?.payload).toMatchObject({
      recipient_email: 'test@virtueco.dev',
    })

    expect(await repo.listRuns(10)).toHaveLength(1)
    expect(await repo.listDispatches({ runId: mockRun.id })).toHaveLength(1)
  })
})

describe('opt-out normalization and prospect status update', () => {
  it('checks opt-out status with normalized lowercase email', async () => {
    const { client, calls } = createMockSupabaseClient(() => ({
      data: { email: 'blocked@example.com' },
      error: null,
    }))

    const repo = createOutreachRepository(client)
    const blocked = await repo.isOptedOut('  Blocked@Example.COM ')

    expect(blocked).toBe(true)
    expect(calls[0].filters).toContainEqual({
      method: 'eq',
      args: ['email', 'blocked@example.com'],
    })
  })

  it('addOptOut normalizes email, upserts opt-out, and updates matching prospects to opted_out', async () => {
    const optOutRow: OutreachOptOut = {
      email: 'hello@harborbakery.com',
      reason: 'Unsubscribed',
      source: 'unsubscribe',
      prospect_id: sampleProspect.id,
      created_at: '2026-11-21T12:00:00.000Z',
    }
    const { client, calls } = createMockSupabaseClient((call) => {
      if (call.table === 'outreach_opt_outs') {
        return { data: optOutRow, error: null }
      }
      return { data: null, error: null }
    })

    const repo = createOutreachRepository(client)
    const result = await repo.addOptOut('  HELLO@HarborBakery.COM ', {
      reason: 'Unsubscribed',
      prospect_id: sampleProspect.id,
    })

    expect(result.email).toBe('hello@harborbakery.com')
    expect(calls).toHaveLength(2)
    expect(calls[0].table).toBe('outreach_opt_outs')
    expect(calls[0].upsertOptions).toEqual({ onConflict: 'email' })
    expect(calls[0].payload).toMatchObject({ email: 'hello@harborbakery.com' })

    expect(calls[1].table).toBe('outreach_prospects')
    expect(calls[1].operation).toBe('update')
    expect(calls[1].payload).toMatchObject({ status: 'opted_out' })
    expect(calls[1].filters).toContainEqual({
      method: 'eq',
      args: ['contact_email', 'hello@harborbakery.com'],
    })
  })
})
