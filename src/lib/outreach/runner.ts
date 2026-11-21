import 'server-only'

import { sendEmail } from '@/lib/email'
import { renderOutreachPitchEmail } from '@/lib/email/templates'
import {
  buildUnsubscribeUrl,
  checkCrossRunEligibility,
  InRunDedupTracker,
  normalizeEmail,
  resolveProspectIdentity,
} from './deduplication'
import { discoverBusinesses } from './discovery'
import { generatePitch } from './pitch-generator'
import { createOutreachRepository } from './repository'
import { evaluateWebsite } from './site-evaluator'
import type {
  DiscoveredBusiness,
  OutreachCriteriaSnapshot,
  OutreachProspect,
  OutreachRunnerDeps,
  OutreachRunStatus,
  RunOutreachOptions,
  RunOutreachSummary,
  SiteEvaluationResult,
} from './types'

export const DRY_RUN_MAX_DISPATCHES = 3

async function defaultSendPitchEmail(
  params: Parameters<OutreachRunnerDeps['sendPitchEmail']>[0],
): Promise<{ messageId?: string | null }> {
  const rendered = await renderOutreachPitchEmail({
    pitch: {
      ...params.pitch,
      subject: params.subject,
    },
    businessName: params.business.businessName,
    websiteUrl: params.business.websiteUrl,
    unsubscribeUrl: params.unsubscribeUrl,
    isDryRun: params.isDryRun,
  })

  const result = await sendEmail({
    to: params.to,
    email: rendered,
    headers: {
      'List-Unsubscribe': `<${params.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })

  if (!result.ok) {
    throw new Error(result.error ?? 'Failed to send outreach email')
  }

  return { messageId: result.id ?? null }
}

function buildEvaluationNotes(evaluation: SiteEvaluationResult): string | null {
  if (evaluation.issues.length === 0) return null
  return evaluation.issues
    .map((issue) => `${issue.label}${issue.detail ? ` (${issue.detail})` : ''}`)
    .join('; ')
    .slice(0, 1000)
}

function buildBaseProspectPayload(
  candidate: DiscoveredBusiness,
  identity: ReturnType<typeof resolveProspectIdentity>,
  evaluation: SiteEvaluationResult,
) {
  return {
    business_name: candidate.businessName,
    normalized_domain: identity.normalizedDomain,
    website_url: evaluation.finalUrl ?? candidate.websiteUrl ?? null,
    industry: candidate.industry ?? null,
    location: candidate.location ?? null,
    phone: candidate.phone ?? null,
    source_provider: candidate.sourceProvider,
    source_external_id: candidate.sourceExternalId ?? null,
    dedup_key: identity.dedupKey,
    has_website: evaluation.hasWebsite,
    issue_score: evaluation.issueScore,
    issues: evaluation.issues,
    http_status: evaluation.httpStatus,
    ttfb_ms: evaluation.ttfbMs,
    site_title: evaluation.title,
    evaluation_notes: buildEvaluationNotes(evaluation),
    raw_metadata: candidate.rawMetadata ?? null,
  }
}

export async function runDailyOutreach(options: RunOutreachOptions): Promise<RunOutreachSummary> {
  const repository = options.deps?.repository ?? createOutreachRepository()
  const discover = options.deps?.discoverBusinesses ?? discoverBusinesses
  const evaluate = options.deps?.evaluateWebsite ?? evaluateWebsite
  const generate = options.deps?.generatePitch ?? generatePitch
  const sendPitch = options.deps?.sendPitchEmail ?? defaultSendPitchEmail

  const settings = await repository.getSettings()
  const sentTodayBeforeRun = await repository.getSentCountToday()
  const isDryRun = options.mode === 'dry_run'

  const criteria: OutreachCriteriaSnapshot = {
    industries: options.overrideCriteria?.industries ?? settings.industries,
    locations: options.overrideCriteria?.locations ?? settings.locations,
    keywords: options.overrideCriteria?.keywords ?? settings.keywords,
    discovery_provider: options.overrideCriteria?.discovery_provider ?? settings.discovery_provider,
    min_issue_score: options.overrideCriteria?.min_issue_score ?? settings.min_issue_score,
  }

  const testRecipient =
    normalizeEmail(options.testRecipientEmail) ?? normalizeEmail(settings.test_recipient_email)

  const run = await repository.createRun({
    mode: options.mode,
    status: 'running',
    triggered_by: options.triggeredBy ?? null,
    daily_cap_snapshot: settings.daily_send_cap,
    sent_today_before_run: sentTodayBeforeRun,
    details: {
      criteria,
      isDryRun,
      testRecipientEmail: testRecipient,
    },
  })

  if (!isDryRun && settings.is_paused) {
    await repository.completeRun(run.id, {
      status: 'paused',
      scouted_count: 0,
      qualified_count: 0,
      sent_count: 0,
      skipped_count: 0,
      failed_count: 0,
      details: { criteria, isDryRun, reason: 'Outreach is paused' },
    })

    return {
      runId: run.id,
      mode: options.mode,
      status: 'paused',
      scoutedCount: 0,
      qualifiedCount: 0,
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
      dailyCap: settings.daily_send_cap,
      sentTodayBeforeRun,
      dispatches: [],
    }
  }

  const remainingLiveCap = Math.max(0, settings.daily_send_cap - sentTodayBeforeRun)
  if (!isDryRun && remainingLiveCap === 0) {
    await repository.completeRun(run.id, {
      status: 'cap_reached',
      scouted_count: 0,
      qualified_count: 0,
      sent_count: 0,
      skipped_count: 0,
      failed_count: 0,
      details: { criteria, isDryRun, reason: 'Daily send cap reached before run' },
    })

    return {
      runId: run.id,
      mode: options.mode,
      status: 'cap_reached',
      scoutedCount: 0,
      qualifiedCount: 0,
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
      dailyCap: settings.daily_send_cap,
      sentTodayBeforeRun,
      dispatches: [],
    }
  }

  const maxSendsThisRun = isDryRun
    ? testRecipient
      ? DRY_RUN_MAX_DISPATCHES
      : 0
    : remainingLiveCap

  let candidates: DiscoveredBusiness[]
  try {
    candidates =
      options.seedCandidates !== undefined ? options.seedCandidates : await discover(criteria)
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Discovery failed'
    await repository.completeRun(run.id, {
      status: 'failed',
      scouted_count: 0,
      qualified_count: 0,
      sent_count: 0,
      skipped_count: 0,
      failed_count: 0,
      error_summary: errMsg,
      details: { criteria, isDryRun },
    })

    return {
      runId: run.id,
      mode: options.mode,
      status: 'failed',
      scoutedCount: 0,
      qualifiedCount: 0,
      sentCount: 0,
      skippedCount: 0,
      failedCount: 0,
      dailyCap: settings.daily_send_cap,
      sentTodayBeforeRun,
      dispatches: [],
    }
  }

  const scoutedCount = candidates.length
  let qualifiedCount = 0
  let sentCount = 0
  let skippedCount = 0
  let failedCount = 0
  let hitCap = false
  const dispatches: RunOutreachSummary['dispatches'] = []
  const inRunTracker = new InRunDedupTracker()

  for (const candidate of candidates) {
    const identity = resolveProspectIdentity(candidate)

    if (inRunTracker.hasSeen(identity)) {
      skippedCount++
      continue
    }
    inRunTracker.markSeen({
      dedupKey: identity.dedupKey,
      normalizedDomain: identity.normalizedDomain,
      normalizedEmail: null,
    })

    let existing: OutreachProspect | null = null
    try {
      const crossCheck = await checkCrossRunEligibility(repository, {
        dedupKey: identity.dedupKey,
        normalizedDomain: identity.normalizedDomain,
        contactEmail: identity.normalizedEmail,
      })

      if (!crossCheck.eligible) {
        skippedCount++
        continue
      }
      existing = crossCheck.existingProspect
    } catch (err) {
      failedCount++
      const errMsg = err instanceof Error ? err.message : 'Eligibility check failed'
      dispatches.push({
        businessName: candidate.businessName,
        recipientEmail: isDryRun ? (testRecipient ?? '') : (identity.normalizedEmail ?? ''),
        status: 'failed',
        subject: '',
        isDryRun,
        error: errMsg,
      })
      continue
    }

    let evaluation: SiteEvaluationResult
    const evalTimestamp = new Date().toISOString()

    try {
      evaluation = await evaluate(candidate, criteria.min_issue_score)
    } catch (err) {
      failedCount++
      const errMsg = err instanceof Error ? err.message : 'Website evaluation failed'
      try {
        await repository.upsertProspect({
          business_name: candidate.businessName,
          normalized_domain: identity.normalizedDomain,
          website_url: candidate.websiteUrl ?? null,
          industry: candidate.industry ?? null,
          location: candidate.location ?? null,
          contact_email: identity.normalizedEmail ?? normalizeEmail(existing?.contact_email),
          phone: candidate.phone ?? null,
          source_provider: candidate.sourceProvider,
          source_external_id: candidate.sourceExternalId ?? null,
          dedup_key: identity.dedupKey,
          evaluation_status: 'failed',
          status: isDryRun ? (existing?.status ?? 'discovered') : 'failed',
          last_evaluated_at: evalTimestamp,
          last_error: errMsg,
          raw_metadata: candidate.rawMetadata ?? null,
        })
      } catch {
        // best-effort persistence
      }
      continue
    }

    const contactEmail =
      identity.normalizedEmail ??
      normalizeEmail(evaluation.extractedEmail) ??
      normalizeEmail(existing?.contact_email)

    const basePayload = buildBaseProspectPayload(candidate, identity, evaluation)

    if (contactEmail) {
      if (inRunTracker.hasSeenEmail(contactEmail)) {
        skippedCount++
        continue
      }
      inRunTracker.markEmail(contactEmail)

      const optedOut = await repository.isOptedOut(contactEmail)
      if (optedOut) {
        await repository.upsertProspect({
          ...basePayload,
          contact_email: contactEmail,
          evaluation_status: 'evaluated',
          status: 'opted_out',
          last_evaluated_at: evalTimestamp,
        })
        skippedCount++
        continue
      }
    }

    if (!evaluation.qualified) {
      await repository.upsertProspect({
        ...basePayload,
        contact_email: contactEmail,
        evaluation_status: 'evaluated',
        status: existing?.status === 'qualified_no_email' || !existing ? 'discovered' : existing.status,
        last_evaluated_at: evalTimestamp,
      })
      skippedCount++
      continue
    }

    qualifiedCount++

    if (!contactEmail) {
      await repository.upsertProspect({
        ...basePayload,
        contact_email: null,
        evaluation_status: 'evaluated',
        status: 'qualified_no_email',
        last_evaluated_at: evalTimestamp,
      })
      skippedCount++
      continue
    }

    if (isDryRun && !testRecipient) {
      await repository.upsertProspect({
        ...basePayload,
        contact_email: contactEmail,
        evaluation_status: 'evaluated',
        status: existing?.status ?? 'qualified',
        last_evaluated_at: evalTimestamp,
      })
      skippedCount++
      continue
    }

    if (sentCount >= maxSendsThisRun) {
      await repository.upsertProspect({
        ...basePayload,
        contact_email: contactEmail,
        evaluation_status: 'evaluated',
        status: existing?.status ?? 'qualified',
        last_evaluated_at: evalTimestamp,
      })
      skippedCount++
      if (!isDryRun) {
        hitCap = true
      }
      continue
    }

    inRunTracker.markEmail(contactEmail)

    const prospect = await repository.upsertProspect({
      ...basePayload,
      contact_email: contactEmail,
      evaluation_status: 'evaluated',
      status: existing?.status ?? 'qualified',
      last_evaluated_at: evalTimestamp,
    })

    const recipientEmail = isDryRun ? testRecipient! : contactEmail
    let attemptedSubject = ''

    try {
      const pitch = await generate(candidate, evaluation)
      const rawSubject = pitch.subject.trim()
      attemptedSubject = isDryRun
        ? rawSubject.startsWith('[DRY RUN]')
          ? rawSubject
          : `[DRY RUN] ${rawSubject}`
        : rawSubject

      const unsubscribeUrl = buildUnsubscribeUrl(recipientEmail)
      const sendResult = await sendPitch({
        to: recipientEmail,
        subject: attemptedSubject,
        pitch,
        business: candidate,
        isDryRun,
        unsubscribeUrl,
      })

      if (
        sendResult &&
        typeof sendResult === 'object' &&
        'ok' in sendResult &&
        (sendResult as { ok?: unknown }).ok === false
      ) {
        const failureReason = (sendResult as { error?: unknown }).error
        throw new Error(
          typeof failureReason === 'string' && failureReason.trim().length > 0
            ? failureReason
            : 'Outreach email dispatch returned ok: false',
        )
      }

      sentCount++

      const dispatchStatus = isDryRun ? 'dry_run' : 'sent'
      await repository.logDispatch({
        run_id: run.id,
        prospect_id: prospect.id,
        business_name: candidate.businessName,
        recipient_email: recipientEmail,
        is_dry_run: isDryRun,
        subject: attemptedSubject,
        body_preview: pitch.opening.slice(0, 240),
        status: dispatchStatus,
        message_id: sendResult?.messageId ?? null,
      })

      if (!isDryRun) {
        await repository.updateProspect(prospect.id, {
          status: 'pitched',
          pitch_subject: attemptedSubject,
          pitch_preview: pitch.opening.slice(0, 300),
          last_pitched_at: new Date().toISOString(),
          last_error: null,
        })
      } else {
        await repository.updateProspect(prospect.id, {
          pitch_subject: attemptedSubject,
          pitch_preview: pitch.opening.slice(0, 300),
          last_error: null,
        })
      }

      dispatches.push({
        businessName: candidate.businessName,
        recipientEmail,
        status: dispatchStatus,
        subject: attemptedSubject,
        isDryRun,
      })
    } catch (err) {
      failedCount++
      const errMsg = err instanceof Error ? err.message : 'Outreach dispatch failed'

      try {
        await repository.logDispatch({
          run_id: run.id,
          prospect_id: prospect.id,
          business_name: candidate.businessName,
          recipient_email: recipientEmail,
          is_dry_run: isDryRun,
          subject: attemptedSubject || `Outreach pitch for ${candidate.businessName}`,
          status: 'failed',
          error: errMsg,
        })
      } catch {
        // best-effort logging
      }

      try {
        await repository.updateProspect(prospect.id, {
          status: isDryRun ? prospect.status : 'failed',
          last_error: errMsg,
        })
      } catch {
        // best-effort status update
      }

      dispatches.push({
        businessName: candidate.businessName,
        recipientEmail,
        status: 'failed',
        subject: attemptedSubject,
        isDryRun,
        error: errMsg,
      })
    }
  }

  const finalStatus: Exclude<OutreachRunStatus, 'running'> =
    !isDryRun && hitCap ? 'cap_reached' : 'completed'

  await repository.completeRun(run.id, {
    status: finalStatus,
    scouted_count: scoutedCount,
    qualified_count: qualifiedCount,
    sent_count: sentCount,
    skipped_count: skippedCount,
    failed_count: failedCount,
    details: {
      criteria,
      isDryRun,
      testRecipientEmail: testRecipient,
    },
  })

  return {
    runId: run.id,
    mode: options.mode,
    status: finalStatus,
    scoutedCount,
    qualifiedCount,
    sentCount,
    skippedCount,
    failedCount,
    dailyCap: settings.daily_send_cap,
    sentTodayBeforeRun,
    dispatches,
  }
}
