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
  SITE,
  UNSUBSCRIBE,
  GOLD,
  CARD_WELL,
  BORDER_DIVIDER,
  MONO_STACK,
  IMAGE_WORK_BAND,
} from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface NewsletterDispatchProps {
  title: string
  subtitle: string
  date: string
  readTime?: string
  issueNumber?: number
  coverImageUrl?: string
  contentHtml: string
  contentText?: string
  pullQuote?: string
  pullQuoteAuthor?: string
  ctaText?: string
  ctaUrl?: string
  secondaryTitle?: string
  secondaryExcerpt?: string
  secondaryUrl?: string
  subscriberEmail?: string
}

export function NewsletterDispatchEmail({
  title,
  subtitle,
  date,
  readTime,
  issueNumber,
  coverImageUrl,
  contentHtml,
  pullQuote,
  pullQuoteAuthor,
  ctaText,
  ctaUrl,
  subscriberEmail,
}: NewsletterDispatchProps) {
  const issueLabel = issueNumber
    ? `ISSUE #${String(issueNumber).padStart(3, '0')}`
    : 'DISPATCH'
  const heroImage = coverImageUrl || IMAGE_WORK_BAND
  const unsubUrl = subscriberEmail
    ? `${UNSUBSCRIBE}?email=${encodeURIComponent(subscriberEmail)}`
    : UNSUBSCRIBE

  return (
    <Shell
      preheader={subtitle}
      eyebrow={issueLabel}
      heroImageUrl={heroImage}
      heroImageAlt={title}
    >
      {/* Issue Pill */}
      <div
        style={{
          fontFamily: MONO_STACK,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: TEXT_FAINT_DARK,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        ( {issueLabel} · {date.toUpperCase()} )
      </div>

      <CardHeadline>{title}</CardHeadline>
      <CardSubtext>{subtitle}</CardSubtext>

      {readTime && (
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: CARD_WELL,
              border: `1px solid ${BORDER_DIVIDER}`,
              borderRadius: 999,
              fontFamily: MONO_STACK,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: TEXT_DARK,
            }}
          >
            {readTime}
          </span>
        </div>
      )}

      <Divider />

      {/* Article Content */}
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: TEXT_MUTED_DARK,
          textAlign: 'left',
          margin: '22px 0',
        }}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Pull Quote */}
      {pullQuote && (
        <div
          style={{
            borderLeft: `3px solid ${GOLD}`,
            paddingLeft: 18,
            margin: '28px 0',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 500,
              color: TEXT_DARK,
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            &ldquo;{pullQuote}&rdquo;
          </div>
          {pullQuoteAuthor && (
            <div
              style={{
                fontSize: 12,
                color: TEXT_FAINT_DARK,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              — {pullQuoteAuthor}
            </div>
          )}
        </div>
      )}

      {/* Action CTA */}
      {ctaText && ctaUrl && (
        <PrimaryButton href={ctaUrl}>{ctaText}</PrimaryButton>
      )}

      <Divider />

      {/* Unsubscribe Footer */}
      <div
        style={{
          fontSize: 12,
          color: TEXT_FAINT_DARK,
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        You received this email because you subscribed to {AGENCY.name}.{' '}
        <a href={unsubUrl} style={{ color: TEXT_DARK, textDecoration: 'underline' }}>
          Unsubscribe
        </a>{' '}
        at any time.
      </div>
    </Shell>
  )
}

export default NewsletterDispatchEmail
