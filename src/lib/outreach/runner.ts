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
export const DEFAULT_OUTREACH_REPORT_EMAIL = 'adeniranglory129@gmail.com'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function sendDailyOutreachReportEmail(
  summary: RunOutreachSummary,
  criteria: OutreachCriteriaSnapshot,
  reportRecipientOverride?: string | null,
): Promise<void> {
  const reportEmail =
    normalizeEmail(reportRecipientOverride) ??
    normalizeEmail(process.env.OUTREACH_REPORT_EMAIL) ??
    DEFAULT_OUTREACH_REPORT_EMAIL

  const dateLabel = new Date().toUTCString()
  const subject = `[Virtue & Co. Outreach Report] ${summary.mode.toUpperCase()} (${summary.status}) — ${summary.sentCount} Pitched / ${summary.qualifiedCount} Qualified / ${summary.scoutedCount} Scouted`

  const dispatchRowsHtml =
    summary.dispatches.length > 0
      ? summary.dispatches
          .map(
            (d, idx) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #262626;">${idx + 1}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #262626;font-weight:600;">${escapeHtml(d.businessName)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #262626;">${escapeHtml(d.recipientEmail)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #262626;">${escapeHtml(d.subject || '—')}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #262626;">${escapeHtml(d.status.toUpperCase())}${d.error ? ` — ${escapeHtml(d.error)}` : ''}</td>
        </tr>`,
          )
          .join('')
      : `<tr><td colspan="5" style="padding:12px;text-align:center;color:#a3a3a3;">No email dispatches in this run.</td></tr>`

  const html = `
  <div style="font-family:Inter,system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#f5f4f0;padding:28px;border-radius:16px;max-width:720px;margin:0 auto;">
    <p style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#d4af37;margin:0 0 6px;">Virtue &amp; Co. Webworks · Autonomous Client Acquisition</p>
    <h1 style="font-size:20px;margin:0 0 12px;color:#ffffff;">Daily AI Scouting &amp; Pitching Report</h1>
    <p style="font-size:13px;color:#a3a3a3;margin:0 0 20px;">Completed at ${escapeHtml(dateLabel)} · Run ID: <code>${escapeHtml(summary.runId)}</code></p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:#141414;border-radius:12px;overflow:hidden;font-size:13px;">
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #262626;color:#a3a3a3;">Mode / Status</td>
        <td style="padding:10px 14px;border-bottom:1px solid #262626;font-weight:600;">${escapeHtml(summary.mode.toUpperCase())} · ${escapeHtml(summary.status.toUpperCase())}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #262626;color:#a3a3a3;">Daily Quota</td>
        <td style="padding:10px 14px;border-bottom:1px solid #262626;font-weight:600;">${summary.sentTodayBeforeRun + (summary.mode === 'dry_run' ? 0 : summary.sentCount)} / ${summary.dailyCap}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #262626;color:#a3a3a3;">Scouted / Qualified</td>
        <td style="padding:10px 14px;border-bottom:1px solid #262626;font-weight:600;">${summary.scoutedCount} scouted · ${summary.qualifiedCount} qualified</td>
        <td style="padding:10px 14px;border-bottom:1px solid #262626;color:#a3a3a3;">Pitched / Skipped / Failed</td>
        <td style="padding:10px 14px;border-bottom:1px solid #262626;font-weight:600;">${summary.sentCount} sent · ${summary.skippedCount} skipped · ${summary.failedCount} failed</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;color:#a3a3a3;">Targeting Criteria</td>
        <td colspan="3" style="padding:10px 14px;">
          Industries: ${escapeHtml(criteria.industries.join(', ') || 'Default')} ·
          Locations: ${escapeHtml(criteria.locations.join(', ') || 'Default')} ·
          Provider: ${escapeHtml(criteria.discovery_provider.toUpperCase())} ·
          Min Score: ${criteria.min_issue_score}/100
        </td>
      </tr>
    </table>

    <h2 style="font-size:15px;margin:20px 0 10px;color:#d4af37;">Pitching Details (${summary.dispatches.length})</h2>
    <table style="width:100%;border-collapse:collapse;background:#141414;border-radius:12px;overflow:hidden;font-size:12px;text-align:left;">
      <thead>
        <tr style="background:#1f1f1f;color:#d4af37;">
          <th style="padding:8px 10px;">#</th>
          <th style="padding:8px 10px;">Business</th>
          <th style="padding:8px 10px;">Recipient</th>
          <th style="padding:8px 10px;">Pitch Subject</th>
          <th style="padding:8px 10px;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${dispatchRowsHtml}
      </tbody>
    </table>

    <p style="margin:22px 0 0;font-size:12px;color:#a3a3a3;">
      Manage outreach settings, pause/resume, or inspect prospects at
      <a href="https://virtuecowebworks.solutions/en/admin/outreach" style="color:#d4af37;">https://virtuecowebworks.solutions/en/admin/outreach</a>
    </p>
  </div>`.trim()

  const textLines = [
    'Virtue & Co. Webworks — Daily AI Scouting & Pitching Report',
    `Completed: ${dateLabel}`,
    `Run ID: ${summary.runId}`,
    `Mode: ${summary.mode.toUpperCase()} | Status: ${summary.status.toUpperCase()}`,
    `Scouted: ${summary.scoutedCount} | Qualified: ${summary.qualifiedCount} | Sent: ${summary.sentCount} | Skipped: ${summary.skippedCount} | Failed: ${summary.failedCount}`,
    `Industries: ${criteria.industries.join(', ') || 'Default'} | Locations: ${criteria.locations.join(', ') || 'Default'}`,
    '',
    'Pitching Details:',
    ...(summary.dispatches.length > 0
      ? summary.dispatches.map(
          (d, idx) =>
            `${idx + 1}. ${d.businessName} <${d.recipientEmail}> — [${d.status.toUpperCase()}] ${d.subject}${d.error ? ` (Error: ${d.error})` : ''}`,
        )
      : ['No email dispatches in this run.']),
    '',
    'Admin Console: https://virtuecowebworks.solutions/en/admin/outreach',
  ]

  await sendEmail({
    to: reportEmail,
    email: {
      subject,
      html,
      text: textLines.join('\n'),
    },
  })
}

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

      const fullEmailPreview = [
        pitch.greeting,
        '',
        pitch.opening,
        '',
        'Key Website Audit Findings:',
        ...pitch.auditBullets.map((b) => `• ${b}`),
        '',
        `Recommended Package: ${pitch.recommendedPackage}`,
        `Next Step: ${pitch.ctaText} (https://virtuecowebworks.solutions/contact)`,
        '',
        pitch.closing,
      ].join('\n')

      const dispatchStatus = isDryRun ? 'dry_run' : 'sent'
      await repository.logDispatch({
        run_id: run.id,
        prospect_id: prospect.id,
        business_name: candidate.businessName,
        recipient_email: recipientEmail,
        is_dry_run: isDryRun,
        subject: attemptedSubject,
        body_preview: fullEmailPreview,
        status: dispatchStatus,
        message_id: sendResult?.messageId ?? null,
      })

      if (!isDryRun) {
        await repository.updateProspect(prospect.id, {
          status: 'pitched',
          pitch_subject: attemptedSubject,
          pitch_preview: fullEmailPreview,
          last_pitched_at: new Date().toISOString(),
          last_error: null,
        })
      } else {
        await repository.updateProspect(prospect.id, {
          pitch_subject: attemptedSubject,
          pitch_preview: fullEmailPreview,
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

  const summary: RunOutreachSummary = {
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

  const shouldSendAdminReport =
    options.deps?.sendPitchEmail === undefined &&
    !process.env.VITEST &&
    !process.env.E2E_SMTP_PORT

  if (shouldSendAdminReport) {
    try {
      await sendDailyOutreachReportEmail(summary, criteria)
    } catch (err) {
      console.warn(
        '[outreach/runner] Failed to send daily outreach report email:',
        err instanceof Error ? err.message : err,
      )
    }
  }

  return summary
}
