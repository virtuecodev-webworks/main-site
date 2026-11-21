export const DISCOVERY_PROVIDERS = ['osm', 'google_places', 'serper', 'auto'] as const
export type DiscoveryProvider = (typeof DISCOVERY_PROVIDERS)[number]

export const PROSPECT_SOURCE_PROVIDERS = [
  'osm',
  'google_places',
  'serper',
  'auto',
  'manual',
  'seed',
] as const
export type ProspectSourceProvider = (typeof PROSPECT_SOURCE_PROVIDERS)[number]

export const PROSPECT_STATUSES = [
  'discovered',
  'qualified',
  'qualified_no_email',
  'pitched',
  'replied',
  'converted',
  'opted_out',
  'skipped',
  'failed',
] as const
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number]

export const OUTREACH_RUN_MODES = ['cron', 'manual', 'dry_run'] as const
export type OutreachRunMode = (typeof OUTREACH_RUN_MODES)[number]

export const OUTREACH_RUN_STATUSES = [
  'running',
  'completed',
  'paused',
  'cap_reached',
  'failed',
] as const
export type OutreachRunStatus = (typeof OUTREACH_RUN_STATUSES)[number]

export const OUTREACH_DISPATCH_STATUSES = ['sent', 'dry_run', 'failed', 'skipped'] as const
export type OutreachDispatchStatus = (typeof OUTREACH_DISPATCH_STATUSES)[number]

export const SITE_ISSUE_CODES = [
  'no_website',
  'unreachable',
  'http_error',
  'no_https',
  'slow_ttfb',
  'missing_title',
  'missing_meta_description',
  'missing_viewport',
  'legacy_builder',
  'thin_content',
] as const
export type SiteIssueCode = (typeof SITE_ISSUE_CODES)[number]

export const SITE_ISSUE_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export type SiteIssueSeverity = (typeof SITE_ISSUE_SEVERITIES)[number]

export interface SiteIssue {
  code: SiteIssueCode
  label: string
  severity: SiteIssueSeverity
  points: number
  detail?: string
}

export interface SiteEvaluationResult {
  hasWebsite: boolean
  qualified: boolean
  issueScore: number
  issues: SiteIssue[]
  extractedEmail: string | null
  httpStatus: number | null
  ttfbMs: number | null
  finalUrl: string | null
  title: string | null
}

export interface OutreachSettings {
  id: boolean
  is_paused: boolean
  daily_send_cap: number
  industries: string[]
  locations: string[]
  keywords: string[]
  discovery_provider: DiscoveryProvider
  min_issue_score: number
  dry_run_default: boolean
  test_recipient_email: string | null
  updated_at: string
}

export const DEFAULT_OUTREACH_SETTINGS: OutreachSettings = {
  id: true,
  is_paused: false,
  daily_send_cap: 15,
  industries: [],
  locations: [],
  keywords: [],
  discovery_provider: 'auto',
  min_issue_score: 30,
  dry_run_default: false,
  test_recipient_email: null,
  updated_at: new Date(0).toISOString(),
}

export interface OutreachProspect {
  id: string
  business_name: string
  normalized_domain: string | null
  website_url: string | null
  industry: string | null
  location: string | null
  contact_email: string | null
  phone: string | null
  source_provider: string
  source_external_id: string | null
  dedup_key: string
  evaluation_status: string
  has_website: boolean
  issue_score: number
  issues: SiteIssue[]
  http_status: number | null
  ttfb_ms: number | null
  site_title: string | null
  evaluation_notes: string | null
  pitch_subject: string | null
  pitch_preview: string | null
  status: ProspectStatus
  last_evaluated_at: string | null
  last_pitched_at: string | null
  last_error: string | null
  raw_metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface OutreachRun {
  id: string
  run_date: string
  mode: OutreachRunMode
  status: OutreachRunStatus
  triggered_by: string | null
  scouted_count: number
  qualified_count: number
  sent_count: number
  skipped_count: number
  failed_count: number
  daily_cap_snapshot: number
  sent_today_before_run: number
  error_summary: string | null
  details: Record<string, unknown>
  started_at: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface OutreachDispatch {
  id: string
  run_id: string | null
  prospect_id: string | null
  business_name: string
  recipient_email: string
  is_dry_run: boolean
  subject: string
  body_preview: string | null
  status: OutreachDispatchStatus
  message_id: string | null
  error: string | null
  sent_at: string
  created_at: string
}

export interface OutreachOptOut {
  email: string
  reason: string | null
  source: string
  prospect_id: string | null
  created_at: string
}

export interface DiscoveredBusiness {
  businessName: string
  industry?: string | null
  location?: string | null
  websiteUrl?: string | null
  contactEmail?: string | null
  phone?: string | null
  sourceProvider: ProspectSourceProvider
  sourceExternalId?: string | null
  rawMetadata?: Record<string, unknown> | null
}

export interface GeneratedPitch {
  subject: string
  headline: string
  greeting: string
  opening: string
  auditBullets: string[]
  recommendedPackage: string
  ctaText: string
  closing: string
  model: string
}

export interface OutreachCriteriaSnapshot {
  industries: string[]
  locations: string[]
  keywords: string[]
  discovery_provider: DiscoveryProvider
  min_issue_score: number
}

export type OutreachSettingsPatch = Partial<
  Pick<
    OutreachSettings,
    | 'is_paused'
    | 'daily_send_cap'
    | 'industries'
    | 'locations'
    | 'keywords'
    | 'discovery_provider'
    | 'min_issue_score'
    | 'dry_run_default'
    | 'test_recipient_email'
  >
>

export interface UpsertProspectInput {
  business_name: string
  normalized_domain?: string | null
  website_url?: string | null
  industry?: string | null
  location?: string | null
  contact_email?: string | null
  phone?: string | null
  source_provider?: string
  source_external_id?: string | null
  dedup_key: string
  evaluation_status?: string
  has_website?: boolean
  issue_score?: number
  issues?: SiteIssue[]
  http_status?: number | null
  ttfb_ms?: number | null
  site_title?: string | null
  evaluation_notes?: string | null
  pitch_subject?: string | null
  pitch_preview?: string | null
  status?: ProspectStatus
  last_evaluated_at?: string | null
  last_pitched_at?: string | null
  last_error?: string | null
  raw_metadata?: Record<string, unknown> | null
}

export type ProspectUpdatePatch = Partial<
  Pick<
    OutreachProspect,
    | 'business_name'
    | 'normalized_domain'
    | 'website_url'
    | 'industry'
    | 'location'
    | 'contact_email'
    | 'phone'
    | 'evaluation_status'
    | 'has_website'
    | 'issue_score'
    | 'issues'
    | 'http_status'
    | 'ttfb_ms'
    | 'site_title'
    | 'evaluation_notes'
    | 'pitch_subject'
    | 'pitch_preview'
    | 'status'
    | 'last_evaluated_at'
    | 'last_pitched_at'
    | 'last_error'
    | 'raw_metadata'
  >
>

export interface ProspectListFilters {
  status?: ProspectStatus
  q?: string
  limit?: number
  offset?: number
}

export interface CreateRunInput {
  mode: OutreachRunMode
  status?: OutreachRunStatus
  triggered_by?: string | null
  daily_cap_snapshot: number
  sent_today_before_run: number
  details?: Record<string, unknown>
}

export interface CompleteRunInput {
  status: Exclude<OutreachRunStatus, 'running'>
  scouted_count: number
  qualified_count: number
  sent_count: number
  skipped_count: number
  failed_count: number
  error_summary?: string | null
  details?: Record<string, unknown>
}

export interface LogDispatchInput {
  run_id?: string | null
  prospect_id?: string | null
  business_name: string
  recipient_email: string
  is_dry_run: boolean
  subject: string
  body_preview?: string | null
  status: OutreachDispatchStatus
  message_id?: string | null
  error?: string | null
  sent_at?: string
}

export interface ListDispatchesOptions {
  runId?: string
  prospectId?: string
  limit?: number
  offset?: number
}

export interface AddOptOutOptions {
  reason?: string | null
  source?: string
  prospect_id?: string | null
}

export interface OutreachRepository {
  getSettings(): Promise<OutreachSettings>
  getSettingsOrDefault(): Promise<OutreachSettings>
  upsertSettings(patch: OutreachSettingsPatch): Promise<OutreachSettings>
  findProspectByDedupOrDomain(
    dedupKey: string,
    normalizedDomain: string | null,
  ): Promise<OutreachProspect | null>
  upsertProspect(input: UpsertProspectInput): Promise<OutreachProspect>
  updateProspect(id: string, patch: ProspectUpdatePatch): Promise<OutreachProspect>
  listProspects(filters?: ProspectListFilters): Promise<OutreachProspect[]>
  createRun(input: CreateRunInput): Promise<OutreachRun>
  completeRun(runId: string, summary: CompleteRunInput): Promise<OutreachRun>
  listRuns(limit?: number): Promise<OutreachRun[]>
  logDispatch(input: LogDispatchInput): Promise<OutreachDispatch>
  listDispatches(options?: ListDispatchesOptions): Promise<OutreachDispatch[]>
  getSentCountToday(referenceDate?: Date): Promise<number>
  isOptedOut(email: string): Promise<boolean>
  addOptOut(email: string, options?: AddOptOutOptions): Promise<OutreachOptOut>
}

export interface OutreachRunnerDeps {
  repository: OutreachRepository
  discoverBusinesses: (criteria: OutreachCriteriaSnapshot) => Promise<DiscoveredBusiness[]>
  evaluateWebsite: (
    business: DiscoveredBusiness,
    minIssueScore: number,
  ) => Promise<SiteEvaluationResult>
  generatePitch: (
    business: DiscoveredBusiness,
    evaluation: SiteEvaluationResult,
  ) => Promise<GeneratedPitch>
  sendPitchEmail: (params: {
    to: string
    subject: string
    pitch: GeneratedPitch
    business: DiscoveredBusiness
    isDryRun: boolean
    unsubscribeUrl: string
  }) => Promise<{ messageId?: string | null }>
}

export interface RunOutreachOptions {
  mode: OutreachRunMode
  triggeredBy?: string | null
  testRecipientEmail?: string
  overrideCriteria?: Partial<
    Pick<
      OutreachSettings,
      'industries' | 'locations' | 'keywords' | 'discovery_provider' | 'min_issue_score'
    >
  >
  seedCandidates?: DiscoveredBusiness[]
  deps?: Partial<OutreachRunnerDeps>
}

export interface RunOutreachSummary {
  runId: string
  mode: OutreachRunMode
  status: Exclude<OutreachRunStatus, 'running'>
  scoutedCount: number
  qualifiedCount: number
  sentCount: number
  skippedCount: number
  failedCount: number
  dailyCap: number
  sentTodayBeforeRun: number
  dispatches: Array<{
    businessName: string
    recipientEmail: string
    status: string
    subject: string
    isDryRun: boolean
    error?: string
  }>
}
