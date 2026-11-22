import * as React from 'react'
import {
  Shell,
  CardHeadline,
  CardSubtext,
  PrimaryButton,
  Divider,
} from './base/shell'
import {
  TEXT_DARK,
  TEXT_MUTED_DARK,
  TEXT_FAINT_DARK,
  CARD_WELL,
  BORDER_DIVIDER,
  GOLD,
  MONO_STACK,
  CONTACT,
  CHARCOAL,
  TEXT_LIGHT,
} from './base/tokens'
import { AGENCY } from '@/lib/constants'
import type { GeneratedPitch } from '@/lib/outreach/types'

export interface OutreachPitchEmailProps {
  pitch: GeneratedPitch
  businessName: string
  websiteUrl?: string | null
  unsubscribeUrl: string
  ctaUrl?: string
  isDryRun?: boolean
}

export function OutreachPitchEmail({
  pitch,
  businessName,
  websiteUrl,
  unsubscribeUrl,
  ctaUrl,
  isDryRun = false,
}: OutreachPitchEmailProps) {
  return (
    <Shell
      preheader={pitch.headline}
      eyebrow={isDryRun ? 'Dry Run · Site Audit' : 'Site Audit'}
    >
      {isDryRun && (
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              display: 'inline-block',
              background: CHARCOAL,
              color: TEXT_LIGHT,
              fontFamily: MONO_STACK,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            <span style={{ color: GOLD }}>●</span> &nbsp;Dry-Run Test Preview
          </span>
        </div>
      )}

      <CardHeadline>{pitch.headline}</CardHeadline>

      <CardSubtext>{pitch.greeting}</CardSubtext>
      <CardSubtext>{pitch.opening}</CardSubtext>

      <div
        style={{
          background: CARD_WELL,
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 14,
          padding: '20px 22px',
          textAlign: 'left',
          margin: '20px 0 18px',
        }}
      >
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: TEXT_DARK,
            marginBottom: 12,
          }}
        >
          ( What we spotted{websiteUrl ? ` · ${websiteUrl}` : ''} )
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            color: TEXT_MUTED_DARK,
            fontSize: 14,
            lineHeight: 1.75,
          }}
        >
          {pitch.auditBullets.map((bullet, idx) => (
            <li key={idx} style={{ marginBottom: idx < pitch.auditBullets.length - 1 ? 6 : 0 }}>
              {bullet}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          background: CHARCOAL,
          borderRadius: 14,
          padding: '18px 22px',
          textAlign: 'left',
          margin: '0 0 22px',
        }}
      >
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: GOLD,
            marginBottom: 6,
          }}
        >
          ( Recommended Solution )
        </div>
        <div
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: TEXT_LIGHT,
            lineHeight: 1.5,
          }}
        >
          {pitch.recommendedPackage}
        </div>
      </div>

      <PrimaryButton href={ctaUrl ?? CONTACT}>{pitch.ctaText}</PrimaryButton>

      <div
        style={{
          marginTop: 14,
          marginBottom: 16,
          padding: '12px 16px',
          background: CARD_WELL,
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 10,
          textAlign: 'center',
          fontSize: 13,
          color: TEXT_DARK,
          lineHeight: 1.5,
        }}
      >
        Prefer email over a form? <strong>You can simply reply directly to this message</strong> — our lead engineering team reads and responds to every email.
      </div>

      <div
        style={{
          fontSize: 14.5,
          color: TEXT_MUTED_DARK,
          lineHeight: 1.65,
          whiteSpace: 'pre-line',
          marginTop: 8,
        }}
      >
        {pitch.closing}
      </div>

      <Divider />

      <div
        style={{
          fontSize: 12,
          color: TEXT_FAINT_DARK,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        Sent to {businessName} by {AGENCY.name} ({AGENCY.domain}). Prefer not to hear from us?{' '}
        <a
          href={unsubscribeUrl}
          style={{ color: TEXT_MUTED_DARK, textDecoration: 'underline', fontWeight: 500 }}
        >
          Unsubscribe
        </a>
        .
      </div>
    </Shell>
  )
}

export default OutreachPitchEmail
