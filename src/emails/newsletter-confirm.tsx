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
  SITE,
  UNSUBSCRIBE,
  IMAGE_BRAND_BANNER,
  CARD_WELL,
  BORDER_DIVIDER,
  MONO_STACK,
} from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface NewsletterConfirmProps {
  email: string
}

export function NewsletterConfirmEmail({ email }: NewsletterConfirmProps) {
  const unsubUrl = `${UNSUBSCRIBE}?email=${encodeURIComponent(email)}`

  return (
    <Shell
      preheader={`You're subscribed to ${AGENCY.name} Dispatch ✓`}
      eyebrow="Newsletter"
      heroImageUrl={IMAGE_BRAND_BANNER}
      heroImageAlt="Virtue & Co. Webworks"
    >
      <CardHeadline>Subscription confirmed.</CardHeadline>
      <CardSubtext>
        Thank you for subscribing. You will receive occasional notes on modern web engineering, digital architecture, and shipping on schedule.
      </CardSubtext>

      <div
        style={{
          background: CARD_WELL,
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 14,
          padding: '20px 22px',
          textAlign: 'left',
          margin: '22px 0 24px',
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
            marginBottom: 8,
          }}
        >
          ( What to expect )
        </div>
        <p style={{ margin: 0, fontSize: 14, color: TEXT_MUTED_DARK, lineHeight: 1.65 }}>
          Roughly one email a month. Practical insights on website redesigns, high-converting online stores, and digital craft for ambitious businesses. No promotional noise.
        </p>
      </div>

      <PrimaryButton href={`${SITE}/portfolio`}>Explore Our Work</PrimaryButton>

      <Divider />

      <div style={{ fontSize: 12, color: TEXT_MUTED_DARK, textAlign: 'center', lineHeight: 1.6 }}>
        Subscribed with <strong>{email}</strong>. You can{' '}
        <a href={unsubUrl} style={{ color: TEXT_DARK, textDecoration: 'underline' }}>
          unsubscribe
        </a>{' '}
        at any time.
      </div>
    </Shell>
  )
}

export default NewsletterConfirmEmail
