import * as React from 'react'
import {
  CANVAS_BG,
  CARD_BG,
  SQUIRCLE_BG,
  TEXT_DARK,
  TEXT_MUTED_DARK,
  TEXT_FAINT_DARK,
  BORDER_CARD,
  BORDER_DIVIDER,
  BORDER_DIGIT,
  ALERT_BG,
  ALERT_BORDER,
  ALERT_TITLE,
  ALERT_TEXT,
  FONT_DISPLAY,
  FONT_SANS,
  FONT_MONO,
  LOGO_URL,
  SITE,
  GOLD,
  GOLD_DARK,
} from './tokens'
import { AGENCY } from '@/lib/constants'

export interface ShellProps {
  preheader: string
  eyebrow?: string
  heroImageUrl?: string
  heroImageAlt?: string
  children: React.ReactNode
}

/**
 * Virtue & Co. Webworks — Minimalist Architectural Email Shell
 * Matches the live site:
 * - Warm bone (#F5F4F0) outer canvas
 * - Crisp white (#FFFFFF) card with 20px radius and hairline border
 * - Inter Display headings + Instrument Sans body typography
 * - Full-width high-resolution imagery from the website
 * - Signature Vantra gold action pills
 */
export function Shell({
  preheader,
  eyebrow = 'Dispatch',
  heroImageUrl,
  heroImageAlt,
  children,
}: ShellProps) {
  const year = new Date().getFullYear()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{AGENCY.name}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: CANVAS_BG,
          fontFamily: FONT_SANS,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          color: TEXT_DARK,
        }}
      >
        {/* Hidden preview preheader */}
        <div
          style={{
            display: 'none',
            fontSize: 1,
            color: CANVAS_BG,
            lineHeight: 1,
            maxHeight: 0,
            maxWidth: 0,
            opacity: 0,
            overflow: 'hidden',
          }}
        >
          {preheader}
        </div>

        {/* Outer Warm Bone Canvas */}
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{
            background: CANVAS_BG,
            padding: '36px 14px 48px',
          }}
        >
          <tbody>
            <tr>
              <td align="center">
                {/* ── Main Architectural Card (`#FFFFFF`) ── */}
                <table
                  role="presentation"
                  width={580}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: 580,
                    width: '100%',
                    background: CARD_BG,
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: `1px solid ${BORDER_CARD}`,
                    boxShadow: '0 8px 30px rgba(10, 10, 10, 0.04)',
                  }}
                >
                  <tbody>
                    {/* Top Architectural Header Bar */}
                    <tr>
                      <td
                        style={{
                          padding: '24px 30px 20px',
                          borderBottom: `1px solid ${BORDER_DIVIDER}`,
                        }}
                      >
                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td align="left" style={{ verticalAlign: 'middle' }}>
                                <table role="presentation" cellPadding={0} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td
                                        style={{
                                          width: 36,
                                          height: 36,
                                          background: SQUIRCLE_BG,
                                          borderRadius: 10,
                                          textAlign: 'center',
                                          verticalAlign: 'middle',
                                        }}
                                      >
                                        <img
                                          src={LOGO_URL}
                                          width={22}
                                          height={22}
                                          alt="Virtue & Co."
                                          style={{
                                            display: 'inline-block',
                                            width: 22,
                                            height: 22,
                                            objectFit: 'contain',
                                            verticalAlign: 'middle',
                                          }}
                                        />
                                      </td>
                                      <td style={{ paddingLeft: 12, verticalAlign: 'middle' }}>
                                        <div
                                          style={{
                                            fontFamily: FONT_DISPLAY,
                                            fontSize: 14,
                                            fontWeight: 700,
                                            letterSpacing: '-0.02em',
                                            color: TEXT_DARK,
                                            lineHeight: 1.1,
                                          }}
                                        >
                                          VIRTUE <span style={{ color: GOLD }}>&amp;</span> CO.
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 9.5,
                                            fontWeight: 600,
                                            letterSpacing: '0.18em',
                                            color: TEXT_FAINT_DARK,
                                            textTransform: 'uppercase',
                                            marginTop: 2,
                                          }}
                                        >
                                          WEBWORKS
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td align="right" style={{ verticalAlign: 'middle' }}>
                                <span
                                  style={{
                                    fontFamily: FONT_MONO,
                                    fontSize: 10,
                                    fontWeight: 600,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: TEXT_FAINT_DARK,
                                  }}
                                >
                                  ( &nbsp;{eyebrow}&nbsp; )
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Optional Hero Image Banner */}
                    {heroImageUrl && (
                      <tr>
                        <td style={{ padding: '24px 30px 0' }}>
                          <img
                            src={heroImageUrl}
                            alt={heroImageAlt || 'Virtue & Co. Webworks'}
                            width={520}
                            style={{
                              width: '100%',
                              maxWidth: 520,
                              height: 'auto',
                              borderRadius: 14,
                              display: 'block',
                              border: `1px solid ${BORDER_DIVIDER}`,
                              objectFit: 'cover',
                            }}
                          />
                        </td>
                      </tr>
                    )}

                    {/* Main Content Area */}
                    <tr>
                      <td style={{ padding: '32px 30px 36px', textAlign: 'left' }}>
                        {children}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ── Understated Minimalist Footer ── */}
                <table
                  role="presentation"
                  width={580}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: 580, width: '100%', marginTop: 26, textAlign: 'center' }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: GOLD_DARK,
                          paddingBottom: 8,
                        }}
                      >
                        ( &nbsp;&nbsp;&nbsp;Thoughtful design. Built on schedule.&nbsp;&nbsp;&nbsp; )
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: 12, color: TEXT_FAINT_DARK, paddingBottom: 6 }}>
                        © {year} {AGENCY.name}. All rights reserved.
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: 12, color: TEXT_FAINT_DARK }}>
                        <a
                          href={`mailto:${AGENCY.email}`}
                          style={{ color: TEXT_DARK, textDecoration: 'none', fontWeight: 500 }}
                        >
                          {AGENCY.email}
                        </a>
                        {'   '}·{'   '}
                        <span style={{ color: TEXT_DARK, fontWeight: 500 }}>{AGENCY.phone}</span>
                        {'   '}·{'   '}
                        <a
                          href={SITE}
                          style={{ color: TEXT_DARK, textDecoration: 'none', fontWeight: 500 }}
                        >
                          {AGENCY.domain}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

/* ------------------------------------------------------------------ */
/*  Email Hero Image Helper                                           */
/* ------------------------------------------------------------------ */
export function EmailHeroImage({
  src,
  alt = 'Virtue & Co. Showcase',
  caption,
}: {
  src: string
  alt?: string
  caption?: string
}) {
  return (
    <div style={{ margin: '18px 0 24px' }}>
      <img
        src={src}
        alt={alt}
        width={520}
        style={{
          width: '100%',
          maxWidth: 520,
          height: 'auto',
          borderRadius: 14,
          display: 'block',
          border: `1px solid ${BORDER_DIVIDER}`,
          objectFit: 'cover',
        }}
      />
      {caption && (
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: TEXT_FAINT_DARK,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: 8,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Digit Code Block (for OTPs)                                       */
/* ------------------------------------------------------------------ */
export function DigitBlock({ code }: { code: string }) {
  const digits = code.replace(/\s+/g, '').split('')

  return (
    <table
      role="presentation"
      align="center"
      cellPadding={0}
      cellSpacing={0}
      style={{ margin: '24px auto 26px' }}
    >
      <tbody>
        <tr>
          {digits.map((digit, i) => (
            <td
              key={i}
              style={{
                width: 48,
                height: 56,
                background: '#FAF9F6',
                border: `1.5px solid ${BORDER_DIGIT}`,
                borderRadius: 12,
                textAlign: 'center',
                verticalAlign: 'middle',
                fontFamily: FONT_DISPLAY,
                fontSize: 24,
                fontWeight: 700,
                color: TEXT_DARK,
                padding: 0,
                marginLeft: i > 0 ? 8 : 0,
              }}
            >
              {digit}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

export const DigitBoxes = DigitBlock

/* ------------------------------------------------------------------ */
/*  Security Metadata Pill                                            */
/* ------------------------------------------------------------------ */
export function SecurityPill({ label, ip }: { label?: string; ip?: string }) {
  const display = label ?? (ip && ip !== '192.135.152' ? ip : 'TLS 1.3 · Verified')

  return (
    <div style={{ textAlign: 'left', marginTop: 18 }}>
      <span
        style={{
          display: 'inline-block',
          background: '#0A0A0A',
          color: '#F5F4F0',
          fontSize: 10,
          fontWeight: 600,
          padding: '5px 12px',
          borderRadius: 8,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: FONT_MONO,
        }}
      >
        <span style={{ color: GOLD }}>●</span> &nbsp;{display}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Security Notice Box                                               */
/* ------------------------------------------------------------------ */
export function SecurityNotice({
  requestDate,
  actionText = 'ignore this email',
}: {
  requestDate?: string
  browser?: string
  os?: string
  actionText?: string
}) {
  const dateStr =
    requestDate ??
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div
      style={{
        background: ALERT_BG,
        border: `1px solid ${ALERT_BORDER}`,
        borderRadius: 14,
        padding: '16px 20px',
        textAlign: 'left',
        margin: '22px 0 18px',
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ALERT_TITLE,
          marginBottom: 6,
        }}
      >
        Security Notice · {dateStr}
      </div>
      <div style={{ fontSize: 13, color: ALERT_TEXT, lineHeight: 1.6 }}>
        This single-use code was requested for your {AGENCY.name} account. If you did not make this request, you can safely <strong>{actionText}</strong>.
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared Card Typography & Helpers                                   */
/* ------------------------------------------------------------------ */
export function CardHeadline({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontSize: 26,
        fontWeight: 600,
        color: TEXT_DARK,
        lineHeight: 1.18,
        margin: '0 0 10px',
        letterSpacing: '-0.025em',
        fontFamily: FONT_DISPLAY,
      }}
    >
      {children}
    </h1>
  )
}

export function CardSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 15,
        color: TEXT_MUTED_DARK,
        fontWeight: 400,
        lineHeight: 1.65,
        margin: '0 0 18px',
      }}
    >
      {children}
    </p>
  )
}

export function AutomatedMessageNote() {
  return (
    <div style={{ fontSize: 12, color: TEXT_FAINT_DARK, margin: '14px 0 4px', textAlign: 'left' }}>
      Official message from Virtue &amp; Co. Webworks. Questions? Reply directly or contact{' '}
      <a href={`mailto:${AGENCY.email}`} style={{ color: TEXT_DARK, fontWeight: 600 }}>
        {AGENCY.email}
      </a>
      .
    </div>
  )
}

/* Vantra Signature Gold Pill Action Button (Matches site's .vantra-btn-gold) */
export function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '26px 0 16px', textAlign: 'left' }}>
      <a
        href={href}
        style={{
          display: 'inline-block',
          padding: '13px 28px',
          background: GOLD,
          borderRadius: 9999,
          color: '#0A0A0A',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: FONT_SANS,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        {children} &nbsp;→
      </a>
    </div>
  )
}

/* Secondary Obsidian Action Button */
export function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '14px 0', textAlign: 'left' }}>
      <a
        href={href}
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          background: '#0A0A0A',
          borderRadius: 9999,
          color: '#F5F4F0',
          fontSize: 12.5,
          fontWeight: 600,
          fontFamily: FONT_SANS,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        {children} &nbsp;→
      </a>
    </div>
  )
}

export function GoldButton({ href, children }: { href: string; children: React.ReactNode }) {
  return <PrimaryButton href={href}>{children}</PrimaryButton>
}

export function Divider() {
  return <div style={{ height: 1, background: BORDER_DIVIDER, margin: '24px 0' }} />
}
