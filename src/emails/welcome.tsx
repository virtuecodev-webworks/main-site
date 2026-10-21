/**
 * Template 2 — Welcome to the Client Portal
 * Clean high-contrast white card design matching user reference.
 */
import * as React from 'react'
import {
  Shell,
  CardHeadline,
  CardSubtext,
  PrimaryButton,
  Divider,
} from './base/shell'
import { TEXT_DARK, TEXT_MUTED_DARK, PORTAL, GOLD } from './base/tokens'
import { AGENCY } from '@/lib/constants'

interface WelcomeEmailProps {
  name?: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const first = name?.split(' ')[0] ?? 'there'

  return (
    <Shell preheader={`Welcome to ${AGENCY.name}, ${first}. Your workspace is active.`}>
      <CardHeadline>Welcome to {AGENCY.name}</CardHeadline>
      <CardSubtext>Hi {first}, your client workspace is now fully activated.</CardSubtext>

      <div
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          padding: '20px 22px',
          textAlign: 'left',
          margin: '20px 0 24px',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, marginBottom: 12 }}>
          Your Studio Advantages:
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: TEXT_MUTED_DARK, fontSize: 13, lineHeight: 1.7 }}>
          <li>Direct collaboration with senior engineers</li>
          <li>Guaranteed fixed-price scoping and delivery deadlines</li>
          <li>Live milestone tracking in your Client Portal</li>
        </ul>
      </div>

      <PrimaryButton href={PORTAL}>Open Your Client Portal</PrimaryButton>

      <Divider />

      <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6 }}>
        Need assistance or a custom project quote? Simply reply to this email or book an advisory call.
      </div>
    </Shell>
  )
}

export default WelcomeEmail
