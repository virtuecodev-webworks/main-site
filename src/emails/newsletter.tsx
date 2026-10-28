/**
 * Template 8 — Weekly Editorial Newsletter ("Studio Dispatch")
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
import { TEXT_DARK, TEXT_MUTED_DARK, SITE, UNSUBSCRIBE, PRIVACY, GOLD, CARD_WELL, BORDER_DIVIDER, MONO_STACK } from './base/tokens'
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
}

export function NewsletterDispatchEmail({
  title,
  subtitle,
  date,
  readTime,
  issueNumber,
  contentHtml,
  pullQuote,
  pullQuoteAuthor,
  ctaText,
  ctaUrl,
}: NewsletterDispatchProps) {
  const issueLabel = issueNumber ? `ISSUE #${String(issueNumber).padStart(3, '0')}` : 'STUDIO DISPATCH'

  return (
    <Shell preheader={subtitle} eyebrow={issueLabel}>
      {/* Issue Pill */}
      <div
        style={{
          fontFamily: MONO_STACK,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.18em',
          color: TEXT_MUTED_DARK,
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
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: '0.12em',
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
        style={{ fontSize: 14.5, lineHeight: 1.8, color: TEXT_MUTED_DARK, textAlign: 'left', margin: '20px 0' }}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Pull Quote */}
      {pullQuote && (
        <div
          style={{
            borderLeft: `3px solid ${GOLD}`,
            padding: '14px 18px',
            background: CARD_WELL,
            borderRadius: '0 12px 12px 0',
            margin: '22px 0',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 14.5, color: TEXT_DARK, fontWeight: 500, lineHeight: 1.55 }}>
            &ldquo;{pullQuote}&rdquo;
          </div>
          {pullQuoteAuthor && (
            <div
              style={{
                marginTop: 6,
                fontFamily: MONO_STACK,
                fontSize: 10.5,
                letterSpacing: '0.14em',
                color: TEXT_MUTED_DARK,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              — {pullQuoteAuthor}
            </div>
          )}
        </div>
      )}

      <PrimaryButton href={ctaUrl ?? `${SITE}/contact`}>
        {ctaText ?? 'Start Your Project'}
      </PrimaryButton>

      <Divider />

      <div style={{ fontSize: 11, color: TEXT_MUTED_DARK, textAlign: 'center', lineHeight: 1.6 }}>
        You received this editorial dispatch because you subscribed at{' '}
        <a href={SITE} style={{ color: TEXT_DARK, textDecoration: 'none' }}>
          {AGENCY.domain}
        </a>.<br />
        <a href={UNSUBSCRIBE} style={{ color: TEXT_DARK, textDecoration: 'underline' }}>
          Unsubscribe
        </a>{' '}
        ·{' '}
        <a href={PRIVACY} style={{ color: TEXT_DARK, textDecoration: 'underline' }}>
          Privacy Policy
        </a>
      </div>
    </Shell>
  )
}

export default NewsletterDispatchEmail
