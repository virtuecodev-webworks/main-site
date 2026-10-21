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
import { TEXT_DARK, TEXT_MUTED_DARK, SITE, UNSUBSCRIBE, PRIVACY } from './base/tokens'
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
    <Shell preheader={subtitle}>
      {/* Issue Pill */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: '#B45309', textTransform: 'uppercase', marginBottom: 8 }}>
        {issueLabel} · {date.toUpperCase()}
      </div>

      <CardHeadline>{title}</CardHeadline>
      <CardSubtext>{subtitle}</CardSubtext>

      {readTime && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 999, fontSize: 11, fontWeight: 600, color: '#92400E' }}>
            ⏱ {readTime}
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
        <div style={{ borderLeft: '3px solid #DCAA28', padding: '12px 18px', background: '#FEF9EE', borderRadius: '0 10px 10px 0', margin: '22px 0', textAlign: 'left' }}>
          <div style={{ fontSize: 14.5, fontStyle: 'italic', color: TEXT_DARK, fontWeight: 600, lineHeight: 1.5 }}>
            &ldquo;{pullQuote}&rdquo;
          </div>
          {pullQuoteAuthor && (
            <div style={{ marginTop: 6, fontSize: 11.5, color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>
              — {pullQuoteAuthor}
            </div>
          )}
        </div>
      )}

      <PrimaryButton href={ctaUrl ?? `${SITE}/contact`}>
        {ctaText ?? 'Start Your Project'}
      </PrimaryButton>

      <Divider />

      <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6 }}>
        You received this editorial dispatch because you subscribed at{' '}
        <a href={SITE} style={{ color: '#4B5563', textDecoration: 'none' }}>
          {AGENCY.domain}
        </a>.<br />
        <a href={UNSUBSCRIBE} style={{ color: '#6B7280', textDecoration: 'underline' }}>
          Unsubscribe
        </a>{' '}
        ·{' '}
        <a href={PRIVACY} style={{ color: '#6B7280', textDecoration: 'underline' }}>
          Privacy Policy
        </a>
      </div>
    </Shell>
  )
}

export default NewsletterDispatchEmail
