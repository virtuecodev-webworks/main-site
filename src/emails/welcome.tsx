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
  PORTAL,
  CARD_WELL,
  BORDER_DIVIDER,
  MONO_STACK,
  IMAGE_AURUM,
} from './base/tokens'
import { AGENCY } from '@/lib/constants'

interface WelcomeEmailProps {
  name?: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const first = name?.split(' ')[0] ?? 'there'

  return (
    <Shell
      preheader={`Welcome to ${AGENCY.name}, ${first}. Your client workspace is ready.`}
      eyebrow="Client Portal"
      heroImageUrl={IMAGE_AURUM}
      heroImageAlt="Aurum Private Treasury — Client Portal"
    >
      <CardHeadline>Welcome, {first}.</CardHeadline>
      <CardSubtext>Your personal client workspace is now active and ready to use.</CardSubtext>

      <div
        style={{
          background: CARD_WELL,
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 14,
          padding: '20px 22px',
          textAlign: 'left',
          margin: '20px 0 24px',
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
          ( What you can do )
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
          <li>Track active design &amp; engineering milestones in real time</li>
          <li>Review project proposals, deliverables, and invoices</li>
          <li>Communicate directly with our lead engineers with zero handoffs</li>
        </ul>
      </div>

      <PrimaryButton href={PORTAL}>Open Your Workspace</PrimaryButton>

      <Divider />

      <div style={{ fontSize: 12, color: TEXT_MUTED_DARK, textAlign: 'center', lineHeight: 1.6 }}>
        Need assistance with your project? Simply reply to this email or book an advisory call.
      </div>
    </Shell>
  )
}

export default WelcomeEmail
