/**
 * Template 8 — Weekly Editorial Newsletter ("Studio Dispatch")
 * Triggered: Auto-cron every Monday OR admin trigger from dashboard
 */
import * as React from 'react'
import { Shell, EyebrowLabel, Heading, BodyText, Divider, GoldButton } from './base/shell'
import { GOLD, EMERALD, WELL, BORDER_INNER, TEXT, TEXT_MUTED, TEXT_DIM, PHOTO_STUDIO, SITE, UNSUBSCRIBE } from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface NewsletterDispatchProps {
  title: string
  subtitle: string
  date: string
  readTime?: string
  issueNumber?: number
  coverImageUrl?: string
  /** HTML content body for the main article */
  contentHtml: string
  /** Pull-quote or key takeaway to highlight */
  pullQuote?: string
  pullQuoteAuthor?: string
  ctaText?: string
  ctaUrl?: string
  /** Plain-text fallback body (used by email clients that don't render HTML) */
  contentText?: string
  /** Optional 2nd featured article */
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
  coverImageUrl,
  contentHtml,
  pullQuote,
  pullQuoteAuthor,
  ctaText,
  ctaUrl,
  secondaryTitle,
  secondaryExcerpt,
  secondaryUrl,
}: NewsletterDispatchProps) {
  const cover = coverImageUrl ?? PHOTO_STUDIO
  const issueLabel = issueNumber ? `ISSUE #${String(issueNumber).padStart(3, '0')}` : 'WEEKLY DISPATCH'

  return (
    <Shell
      preheader={subtitle}
      badge="DISPATCH"
      badgeColor="gold"
      showStats={true}
    >
      {/* ── Issue Meta pill ── */}
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: GOLD, textTransform: 'uppercase', marginBottom: 10 }}>
        {issueLabel} · {date.toUpperCase()}
      </div>

      <Heading>{title}</Heading>

      <BodyText style={{ fontSize: 16 }}>{subtitle}</BodyText>

      {readTime && (
        <div style={{ marginBottom: 20 }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(220,170,40,0.1)', border: `1px solid rgba(220,170,40,0.25)`, borderRadius: 999, fontSize: 11.5, fontWeight: 600, color: GOLD }}>
            ⏱ {readTime} read
          </span>
        </div>
      )}

      {/* ── Cover Photography ── */}
      <div style={{ marginBottom: 28 }}>
        <img src={cover} width="100%" alt={title}
          style={{ display: 'block', width: '100%', maxWidth: '100%', height: 'auto', minHeight: 200, objectFit: 'cover', borderRadius: 14, border: `1px solid ${BORDER_INNER}`, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }} />
      </div>

      <Divider />

      {/* ── Article body ── */}
      <div style={{ fontSize: 15, lineHeight: 1.8, color: TEXT_MUTED }}
        dangerouslySetInnerHTML={{ __html: contentHtml }} />

      {/* ── Pull Quote ── */}
      {pullQuote && (
        <div style={{ borderLeft: `3px solid ${GOLD}`, paddingLeft: 18, margin: '24px 0', background: 'rgba(220,170,40,0.04)', borderRadius: '0 8px 8px 0', padding: '14px 18px' }}>
          <div style={{ fontSize: 16, lineHeight: 1.5, color: TEXT, fontStyle: 'italic', fontWeight: 600 }}>
            "{pullQuote}"
          </div>
          {pullQuoteAuthor && (
            <div style={{ marginTop: 8, fontSize: 12.5, color: TEXT_DIM, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              — {pullQuoteAuthor}
            </div>
          )}
        </div>
      )}

      <Divider />

      {/* ── CTA Card ── */}
      <div style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 16, padding: 28, marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.2em', color: EMERALD, textTransform: 'uppercase', marginBottom: 8 }}>
          HIGH-PERFORMANCE ENGINEERING
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: TEXT, letterSpacing: '-0.01em', marginBottom: 10 }}>
          Planning a redesign or new digital project?
        </div>
        <div style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 20px' }}>
          Senior engineer review, itemised scope, guaranteed fixed deadline — zero hidden costs.
        </div>
        <GoldButton href={ctaUrl ?? `${SITE}/contact`}>
          {ctaText ?? 'Start Your Project'}
        </GoldButton>
      </div>

      {/* ── Secondary article teaser ── */}
      {secondaryTitle && (
        <>
          <Divider />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: EMERALD, textTransform: 'uppercase', marginBottom: 10 }}>
            ALSO FROM THE STUDIO
          </div>
          <div style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{secondaryTitle}</div>
            {secondaryExcerpt && <div style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.6 }}>{secondaryExcerpt}</div>}
            {secondaryUrl && (
              <a href={secondaryUrl} style={{ display: 'inline-block', marginTop: 10, fontSize: 13, fontWeight: 700, color: GOLD, textDecoration: 'none' }}>
                Read more →
              </a>
            )}
          </div>
        </>
      )}

      {/* ── Unsubscribe / preferences ── */}
      <p style={{ margin: '20px 0 0', fontSize: 11.5, color: TEXT_DIM, textAlign: 'center', lineHeight: 1.7 }}>
        You're receiving this editorial dispatch because you subscribed at{' '}
        <a href={SITE} style={{ color: GOLD, textDecoration: 'none' }}>{AGENCY.domain}</a>.<br />
        <a href={UNSUBSCRIBE} style={{ color: TEXT_DIM, textDecoration: 'underline' }}>Unsubscribe</a>
        {' · '}
        <a href={`${SITE}/privacy`} style={{ color: TEXT_DIM, textDecoration: 'underline' }}>Privacy Policy</a>
        {' · '}
        <a href={`${SITE}/portal`} style={{ color: TEXT_DIM, textDecoration: 'underline' }}>Client Portal</a>
      </p>
    </Shell>
  )
}

export default NewsletterDispatchEmail
