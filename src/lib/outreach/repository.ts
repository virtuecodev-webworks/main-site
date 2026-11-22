import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  DEFAULT_OUTREACH_SETTINGS,
  type AddOptOutOptions,
  type CompleteRunInput,
  type CreateRunInput,
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
  type UpsertProspectInput,
} from './types'

export class OutreachDatabaseUnavailableError extends Error {
  constructor(message = 'Supabase admin client is not configured for outreach persistence') {
    super(message)
    this.name = 'OutreachDatabaseUnavailableError'
  }
}

export class OutreachRepositoryError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'OutreachRepositoryError'
    this.code = code
  }
}

function normalizeNullableLower(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  const trimmed = value.trim().toLowerCase()
  return trimmed.length > 0 ? trimmed : null
}

function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}

export function getUtcDayBounds(referenceDate = new Date()): { start: string; end: string } {
  const year = referenceDate.getUTCFullYear()
  const month = referenceDate.getUTCMonth()
  const day = referenceDate.getUTCDate()

  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0)).toISOString()
  const end = new Date(Date.UTC(year, month, day + 1, 0, 0, 0, 0)).toISOString()
  return { start, end }
}

export function createOutreachRepository(
  injectedClient?: SupabaseClient | null,
): OutreachRepository {
  const getClient = (): SupabaseClient => {
    const client = injectedClient === undefined ? createSupabaseAdminClient() : injectedClient
    if (!client) {
      throw new OutreachDatabaseUnavailableError()
    }
    return client
  }

  const upsertSettings = async (patch: OutreachSettingsPatch): Promise<OutreachSettings> => {
    const client = getClient()
    const payload: Record<string, unknown> = {
      id: true,
      updated_at: new Date().toISOString(),
    }

    if (patch.is_paused !== undefined) payload.is_paused = patch.is_paused
    if (patch.daily_send_cap !== undefined) payload.daily_send_cap = patch.daily_send_cap
    if (patch.industries !== undefined) payload.industries = patch.industries
    if (patch.locations !== undefined) payload.locations = patch.locations
    if (patch.keywords !== undefined) payload.keywords = patch.keywords
    if (patch.discovery_provider !== undefined) {
      payload.discovery_provider = patch.discovery_provider
    }
    if (patch.min_issue_score !== undefined) payload.min_issue_score = patch.min_issue_score
    if (patch.dry_run_default !== undefined) payload.dry_run_default = patch.dry_run_default
    if (patch.test_recipient_email !== undefined) {
      payload.test_recipient_email = normalizeNullableLower(patch.test_recipient_email) ?? null
    }
    if (patch.serper_api_key !== undefined) {
      payload.serper_api_key = patch.serper_api_key?.trim() || null
    }
    if (patch.gemini_api_key !== undefined) {
      payload.gemini_api_key = patch.gemini_api_key?.trim() || null
    }
    if (patch.brevo_smtp_login !== undefined) {
      payload.brevo_smtp_login = patch.brevo_smtp_login?.trim() || null
    }
    if (patch.brevo_smtp_key !== undefined) {
      payload.brevo_smtp_key = patch.brevo_smtp_key?.trim() || null
    }
    if (patch.brevo_from_email !== undefined) {
      payload.brevo_from_email = patch.brevo_from_email?.trim() || null
    }

    const { data, error } = await client
      .from('outreach_settings')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single<OutreachSettings>()

    if (error || !data) {
      throw new OutreachRepositoryError(
        error?.message ?? 'Failed to upsert outreach settings',
        error?.code,
      )
    }

    return data
  }

  const getSettings = async (): Promise<OutreachSettings> => {
    const client = getClient()
    const { data, error } = await client
      .from('outreach_settings')
      .select('*')
      .eq('id', true)
      .maybeSingle<OutreachSettings>()

    if (error) {
      throw new OutreachRepositoryError(error.message, error.code)
    }

    if (!data) {
      return upsertSettings({})
    }

    return data
  }

  const getSettingsOrDefault = async (): Promise<OutreachSettings> => {
    try {
      return await getSettings()
    } catch (error) {
      if (error instanceof OutreachDatabaseUnavailableError) {
        return { ...DEFAULT_OUTREACH_SETTINGS }
      }
      throw error
    }
  }

  const findProspectByDedupOrDomain = async (
    dedupKey: string,
    normalizedDomain: string | null,
  ): Promise<OutreachProspect | null> => {
    const client = getClient()
    const cleanDedupKey = dedupKey.trim().toLowerCase()
    const cleanDomain = normalizeNullableLower(normalizedDomain) ?? null

    if (cleanDedupKey.length > 0) {
      const { data: byDedup, error: dedupError } = await client
        .from('outreach_prospects')
        .select('*')
        .eq('dedup_key', cleanDedupKey)
        .maybeSingle<OutreachProspect>()

      if (dedupError) {
        throw new OutreachRepositoryError(dedupError.message, dedupError.code)
      }

      if (byDedup) {
        return byDedup
      }
    }

    if (cleanDomain) {
      const { data: byDomain, error: domainError } = await client
        .from('outreach_prospects')
        .select('*')
        .eq('normalized_domain', cleanDomain)
        .limit(1)
        .maybeSingle<OutreachProspect>()

      if (domainError) {
        throw new OutreachRepositoryError(domainError.message, domainError.code)
      }

      if (byDomain) {
        return byDomain
      }
    }

    return null
  }

  const upsertProspect = async (input: UpsertProspectInput): Promise<OutreachProspect> => {
    const client = getClient()
    const cleanDedupKey = input.dedup_key.trim().toLowerCase()
    if (!cleanDedupKey) {
      throw new OutreachRepositoryError('dedup_key must not be empty')
    }

    const cleanDomain = normalizeNullableLower(input.normalized_domain)
    const cleanEmail = normalizeNullableLower(input.contact_email)
    const now = new Date().toISOString()

    const normalizedPayload: Record<string, unknown> = {
      business_name: input.business_name.trim(),
      dedup_key: cleanDedupKey,
      updated_at: now,
    }

    if (cleanDomain !== undefined) normalizedPayload.normalized_domain = cleanDomain
    if (input.website_url !== undefined) normalizedPayload.website_url = input.website_url
    if (input.industry !== undefined) normalizedPayload.industry = input.industry
    if (input.location !== undefined) normalizedPayload.location = input.location
    if (cleanEmail !== undefined) normalizedPayload.contact_email = cleanEmail
    if (input.phone !== undefined) normalizedPayload.phone = input.phone
    if (input.source_provider !== undefined) normalizedPayload.source_provider = input.source_provider
    if (input.source_external_id !== undefined) {
      normalizedPayload.source_external_id = input.source_external_id
    }
    if (input.evaluation_status !== undefined) {
      normalizedPayload.evaluation_status = input.evaluation_status
    }
    if (input.has_website !== undefined) normalizedPayload.has_website = input.has_website
    if (input.issue_score !== undefined) normalizedPayload.issue_score = input.issue_score
    if (input.issues !== undefined) normalizedPayload.issues = input.issues
    if (input.http_status !== undefined) normalizedPayload.http_status = input.http_status
    if (input.ttfb_ms !== undefined) normalizedPayload.ttfb_ms = input.ttfb_ms
    if (input.site_title !== undefined) normalizedPayload.site_title = input.site_title
    if (input.evaluation_notes !== undefined) {
      normalizedPayload.evaluation_notes = input.evaluation_notes
    }
    if (input.pitch_subject !== undefined) normalizedPayload.pitch_subject = input.pitch_subject
    if (input.pitch_preview !== undefined) normalizedPayload.pitch_preview = input.pitch_preview
    if (input.status !== undefined) normalizedPayload.status = input.status
    if (input.last_evaluated_at !== undefined) {
      normalizedPayload.last_evaluated_at = input.last_evaluated_at
    }
    if (input.last_pitched_at !== undefined) normalizedPayload.last_pitched_at = input.last_pitched_at
    if (input.last_error !== undefined) normalizedPayload.last_error = input.last_error
    if (input.raw_metadata !== undefined) normalizedPayload.raw_metadata = input.raw_metadata

    const existing = await findProspectByDedupOrDomain(cleanDedupKey, cleanDomain ?? null)

    if (
      existing &&
      (existing.dedup_key !== cleanDedupKey ||
        (cleanDomain !== undefined &&
          cleanDomain !== null &&
          existing.normalized_domain !== cleanDomain))
    ) {
      const updatePayload = { ...normalizedPayload }
      // Preserve the existing dedup_key if matched by normalized_domain so PK/dedup history remains stable
      if (existing.dedup_key !== cleanDedupKey) {
        updatePayload.dedup_key = existing.dedup_key
      }

      const { data, error } = await client
        .from('outreach_prospects')
        .update(updatePayload)
        .eq('id', existing.id)
        .select('*')
        .single<OutreachProspect>()

      if (error || !data) {
        throw new OutreachRepositoryError(
          error?.message ?? 'Failed to update matched outreach prospect',
          error?.code,
        )
      }

      return data
    }

    const { data, error } = await client
      .from('outreach_prospects')
      .upsert(normalizedPayload, { onConflict: 'dedup_key' })
      .select('*')
      .single<OutreachProspect>()

    if (error || !data) {
      throw new OutreachRepositoryError(
        error?.message ?? 'Failed to upsert outreach prospect',
        error?.code,
      )
    }

    return data
  }

  const updateProspect = async (
    id: string,
    patch: ProspectUpdatePatch,
  ): Promise<OutreachProspect> => {
    const client = getClient()
    const payload: Record<string, unknown> = {
      ...patch,
      updated_at: new Date().toISOString(),
    }

    if (patch.normalized_domain !== undefined) {
      payload.normalized_domain = normalizeNullableLower(patch.normalized_domain) ?? null
    }
    if (patch.contact_email !== undefined) {
      payload.contact_email = normalizeNullableLower(patch.contact_email) ?? null
    }

    const { data, error } = await client
      .from('outreach_prospects')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single<OutreachProspect>()

    if (error || !data) {
      throw new OutreachRepositoryError(
        error?.message ?? 'Failed to update outreach prospect',
        error?.code,
      )
    }

    return data
  }

  const listProspects = async (filters: ProspectListFilters = {}): Promise<OutreachProspect[]> => {
    const client = getClient()
    const limit = filters.limit ?? 50
    const offset = filters.offset ?? 0

    let query = client.from('outreach_prospects').select('*')

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.q && filters.q.trim().length > 0) {
      query = query.ilike('business_name', `%${escapeIlikePattern(filters.q.trim())}%`)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
      .returns<OutreachProspect[]>()

    if (error) {
      throw new OutreachRepositoryError(error.message, error.code)
    }

    return data ?? []
  }

  const createRun = async (input: CreateRunInput): Promise<OutreachRun> => {
    const client = getClient()
    const now = new Date().toISOString()
    const payload = {
      mode: input.mode,
      status: input.status ?? 'running',
      triggered_by: input.triggered_by ?? null,
      daily_cap_snapshot: input.daily_cap_snapshot,
      sent_today_before_run: input.sent_today_before_run,
      details: input.details ?? {},
      started_at: now,
    }

    const { data, error } = await client
      .from('outreach_runs')
      .insert(payload)
      .select('*')
      .single<OutreachRun>()

    if (error || !data) {
      throw new OutreachRepositoryError(
        error?.message ?? 'Failed to create outreach run',
        error?.code,
      )
    }

    return data
  }

  const completeRun = async (runId: string, summary: CompleteRunInput): Promise<OutreachRun> => {
    const client = getClient()
    const now = new Date().toISOString()
    const payload: Record<string, unknown> = {
      status: summary.status,
      scouted_count: summary.scouted_count,
      qualified_count: summary.qualified_count,
      sent_count: summary.sent_count,
      skipped_count: summary.skipped_count,
      failed_count: summary.failed_count,
      error_summary: summary.error_summary ?? null,
      completed_at: now,
      updated_at: now,
    }

    if (summary.details !== undefined) {
      payload.details = summary.details
    }

    const { data, error } = await client
      .from('outreach_runs')
      .update(payload)
      .eq('id', runId)
      .select('*')
      .single<OutreachRun>()

    if (error || !data) {
      throw new OutreachRepositoryError(
        error?.message ?? 'Failed to complete outreach run',
        error?.code,
      )
    }

    return data
  }

  const listRuns = async (limit = 20): Promise<OutreachRun[]> => {
    const client = getClient()
    const { data, error } = await client
      .from('outreach_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit)
      .returns<OutreachRun[]>()

    if (error) {
      throw new OutreachRepositoryError(error.message, error.code)
    }

    const runs = data ?? []

    // Auto-heal any runs that were abandoned in 'running' state (> 2 minutes ago)
    const staleThreshold = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const staleRuns = runs.filter(
      (r) => r.status === 'running' && r.started_at && r.started_at < staleThreshold,
    )
    if (staleRuns.length > 0) {
      for (const stale of staleRuns) {
        try {
          const updateQuery = client.from('outreach_runs').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            error_summary: 'Batch ended at execution window limit',
          })
          if (typeof updateQuery?.eq === 'function') {
            // Supabase builders are lazy — attach handlers so the update actually executes.
            updateQuery.eq('id', stale.id).then(
              () => {},
              () => {},
            )
          }
        } catch {
          // best-effort auto-heal
        }
        stale.status = 'completed'
        stale.error_summary = 'Batch ended at execution window limit'
      }
    }

    return runs
  }

  const logDispatch = async (input: LogDispatchInput): Promise<OutreachDispatch> => {
    const client = getClient()
    const payload = {
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
      sent_at: input.sent_at ?? new Date().toISOString(),
    }

    const { data, error } = await client
      .from('outreach_dispatches')
      .insert(payload)
      .select('*')
      .single<OutreachDispatch>()

    if (error || !data) {
      throw new OutreachRepositoryError(
        error?.message ?? 'Failed to log outreach dispatch',
        error?.code,
      )
    }

    return data
  }

  const listDispatches = async (
    options: ListDispatchesOptions = {},
  ): Promise<OutreachDispatch[]> => {
    const client = getClient()
    const limit = options.limit ?? 50
    const offset = options.offset ?? 0

    let query = client.from('outreach_dispatches').select('*')

    if (options.runId) {
      query = query.eq('run_id', options.runId)
    }
    if (options.prospectId) {
      query = query.eq('prospect_id', options.prospectId)
    }

    const { data, error } = await query
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1)
      .returns<OutreachDispatch[]>()

    if (error) {
      throw new OutreachRepositoryError(error.message, error.code)
    }

    return data ?? []
  }

  const getSentCountToday = async (referenceDate = new Date()): Promise<number> => {
    const client = getClient()
    const { start, end } = getUtcDayBounds(referenceDate)

    const { count, error } = await client
      .from('outreach_dispatches')
      .select('id', { count: 'exact', head: true })
      .eq('is_dry_run', false)
      .eq('status', 'sent')
      .gte('sent_at', start)
      .lt('sent_at', end)

    if (error) {
      throw new OutreachRepositoryError(error.message, error.code)
    }

    return count ?? 0
  }

  const isOptedOut = async (email: string): Promise<boolean> => {
    const client = getClient()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      return false
    }

    const { data, error } = await client
      .from('outreach_opt_outs')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle<{ email: string }>()

    if (error) {
      throw new OutreachRepositoryError(error.message, error.code)
    }

    return data !== null
  }

  const addOptOut = async (
    email: string,
    options: AddOptOutOptions = {},
  ): Promise<OutreachOptOut> => {
    const client = getClient()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new OutreachRepositoryError('Valid email address is required for opt-out')
    }

    const payload = {
      email: normalizedEmail,
      reason: options.reason ?? null,
      source: options.source ?? 'unsubscribe',
      prospect_id: options.prospect_id ?? null,
    }

    const { data, error } = await client
      .from('outreach_opt_outs')
      .upsert(payload, { onConflict: 'email' })
      .select('*')
      .single<OutreachOptOut>()

    if (error || !data) {
      throw new OutreachRepositoryError(
        error?.message ?? 'Failed to record outreach opt-out',
        error?.code,
      )
    }

    const { error: prospectUpdateError } = await client
      .from('outreach_prospects')
      .update({
        status: 'opted_out',
        updated_at: new Date().toISOString(),
      })
      .eq('contact_email', normalizedEmail)

    if (prospectUpdateError) {
      throw new OutreachRepositoryError(prospectUpdateError.message, prospectUpdateError.code)
    }

    return data
  }

  return {
    getSettings,
    getSettingsOrDefault,
    upsertSettings,
    findProspectByDedupOrDomain,
    upsertProspect,
    updateProspect,
    listProspects,
    createRun,
    completeRun,
    listRuns,
    logDispatch,
    listDispatches,
    getSentCountToday,
    isOptedOut,
    addOptOut,
  }
}
