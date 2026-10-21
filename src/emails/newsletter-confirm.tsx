/**
 * Template 3 — Newsletter Subscription Confirmed
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
import { TEXT_DARK, TEXT_MUTED_DARK, SITE, UNSUBSCRIBE } from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface NewsletterConfirmProps {
  email: string
}

export function NewsletterConfirmEmail({ email }: NewsletterConfirmProps) {
  return (
    <Shell preheader={`You're subscribed to ${AGENCY.name} Studio Dispatch ✓`}>
      <CardHeadline>Subscription Confirmed</CardHeadline>
      <CardSubtext>You are now subscribed to the {AGENCY.name} Studio Dispatch.</CardSubtext>

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
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, marginBottom: 8 }}>
          What to expect:
        </div>
        <p style={{ margin: 0, fontSize: 13, color: TEXT_MUTED_DARK, lineHeight: 1.65 }}>
          Weekly Monday editorial dispatches on high-performance web engineering, Next.js architecture, and digital growth strategies for business founders.
        </p>
      </div>

      <PrimaryButton href={SITE}>Explore Studio Case Studies</PrimaryButton>

      <Divider />

      <div style={{ fontSize: 11.5, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6 }}>
        Subscribed with <strong>{email}</strong>. You can{' '}
        <a href={UNSUBSCRIBE} style={{ color: '#6B7280', textDecoration: 'underline' }}>
          unsubscribe
        </a>{' '}
        at any time.
      </div>
    </Shell>
  )
}

export default NewsletterConfirmEmail
