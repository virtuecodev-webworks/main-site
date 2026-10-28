import * as React from 'react'
import {
  CANVAS_BG,
  CARD_BG,
  CARD_WELL,
  SQUIRCLE_BG,
  TEXT_DARK,
  TEXT_FAINT_DARK,
  TEXT_MUTED_LIGHT,
  ALERT_BG,
  ALERT_BORDER,
  ALERT_TITLE,
  ALERT_TEXT,
  PILL_BG,
  PILL_TEXT,
  BORDER_DIGIT,
  BORDER_DIVIDER,
  FONT_DISPLAY,
  FONT_SANS,
  FONT_MONO,
  LOGO_URL,
  SITE,
  GOLD,
} from './tokens'
import { AGENCY } from '@/lib/constants'

export interface ShellProps {
  preheader: string
  eyebrow?: string
  children: React.ReactNode
}

/**
 * Vantra Studio × Virtue & Co. Webworks Email Shell.
 * - Deep Obsidian (`#0A0A0A`) outer canvas with warm gold radial atmosphere
 * - Architectural Warm Bone (`#F5F4F0`) main container with `20px` radius
 * - Top metadata bar with `#0A0A0A` logo badge and `( VIRTUE & CO. )` mono tag
 */
export function Shell({ preheader, eyebrow = 'Studio Dispatch', children }: ShellProps) {
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

        {/* Outer Obsidian Canvas */}
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{
            background: `${CANVAS_BG} radial-gradient(circle at 50% 0%, rgba(220, 170, 40, 0.16) 0%, rgba(10, 10, 10, 0) 65%) no-repeat`,
            padding: '44px 14px 48px',
          }}
        >
          <tbody>
            <tr>
              <td align="center">
                {/* ── Main Vantra Architectural Card (`#F5F4F0`) ── */}
                <table
                  role="presentation"
                  width={520}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: 520,
                    width: '100%',
                    background: CARD_BG,
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 28px 70px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(245, 244, 240, 0.14)',
                  }}
                >
                  <tbody>
                    {/* Top Architectural Header Bar */}
                    <tr>
                      <td
                        style={{
                          padding: '24px 32px 20px',
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
                                          width: 38,
                                          height: 38,
                                          background: SQUIRCLE_BG,
                                          borderRadius: 10,
                                          textAlign: 'center',
                                          verticalAlign: 'middle',
                                        }}
                                      >
                                        <img
                                          src={LOGO_URL}
                                          width={24}
                                          height={24}
                                          alt="Virtue & Co."
                                          style={{
                                            display: 'inline-block',
                                            width: 24,
                                            height: 24,
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
                                            letterSpacing: '-0.03em',
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
                                            letterSpacing: '0.2em',
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
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    letterSpacing: '0.06em',
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

                    {/* Main Body */}
                    <tr>
                      <td style={{ padding: '36px 32px 34px', textAlign: 'left' }}>
                        {children}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ── Dark Footer Area (`#0A0A0A` Pedestal) ── */}
                <table
                  role="presentation"
                  width={520}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: 520, width: '100%', marginTop: 28, textAlign: 'center' }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          fontFamily: FONT_MONO,
                          fontSize: 10.5,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: GOLD,
                          paddingBottom: 10,
                        }}
                      >
                        ( &nbsp;&nbsp;&nbsp;One Team, No Handoffs&nbsp;&nbsp;&nbsp; )
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: 12, color: TEXT_MUTED_LIGHT, paddingBottom: 6 }}>
                        © {year} {AGENCY.name}. All rights reserved.
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: 12, color: TEXT_MUTED_LIGHT }}>
                        <a
                          href={`mailto:${AGENCY.email}`}
                          style={{ color: '#F5F4F0', textDecoration: 'none', fontWeight: 500 }}
                        >
                          {AGENCY.email}
                        </a>
                        {'   '}·{'   '}
                        <span style={{ color: '#F5F4F0', fontWeight: 500 }}>{AGENCY.phone}</span>
                        {'   '}·{'   '}
                        <a
                          href={SITE}
                          style={{ color: GOLD, textDecoration: 'none', fontWeight: 500 }}
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
/*  Digit Boxes Component: [ 5 ] [ 2 ] [ 5 ] [ 0 ] [ 9 ] [ 8 ]        */
/* ------------------------------------------------------------------ */
export function DigitBoxes({ code }: { code: string }) {
  const digits = code.replace(/\s+/g, '').split('')

  return (
    <div style={{ margin: '22px 0 22px', textAlign: 'center' }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
        <tbody>
          <tr>
            {digits.map((digit, idx) => (
              <td key={idx} style={{ padding: '0 4px' }}>
                <div
                  style={{
                    width: 46,
                    height: 56,
                    lineHeight: '56px',
                    background: CARD_WELL,
                    border: `1.5px solid ${BORDER_DIGIT}`,
                    borderRadius: 12,
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: FONT_DISPLAY,
                    color: TEXT_DARK,
                    textAlign: 'center',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {digit}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
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
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: ALERT_TITLE,
          marginBottom: 6,
        }}
      >
        Security Notice · {dateStr}
      </div>
      <div style={{ fontSize: 12.5, color: ALERT_TEXT, lineHeight: 1.6 }}>
        This single-use verification code was requested for your {AGENCY.name} account. Never share this code with anyone. If you did not initiate this request, you can safely <strong>{actionText}</strong>.
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Security Metadata Pill                                            */
/* ------------------------------------------------------------------ */
export function SecurityPill({ label, ip }: { label?: string; ip?: string }) {
  const display =
    label ??
    (ip && ip !== '192.135.152' ? ip : 'TLS 1.3 · Studio Auth Verified')

  return (
    <div style={{ textAlign: 'left', marginTop: 18 }}>
      <span
        style={{
          display: 'inline-block',
          background: PILL_BG,
          color: PILL_TEXT,
          fontSize: 10.5,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 8,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: GOLD }}>●</span> &nbsp;{display}
      </span>
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
        fontSize: 28,
        fontWeight: 700,
        color: TEXT_DARK,
        lineHeight: 1.08,
        margin: '0 0 10px',
        letterSpacing: '-0.03em',
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
        fontSize: 14.5,
        color: TEXT_FAINT_DARK,
        fontWeight: 400,
        lineHeight: 1.55,
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
      Automated studio security dispatch. Need help? Contact{' '}
      <a href={`mailto:${AGENCY.email}`} style={{ color: TEXT_DARK, fontWeight: 600 }}>
        {AGENCY.email}
      </a>
      .
    </div>
  )
}

export function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '24px 0 16px', textAlign: 'left' }}>
      <a
        href={href}
        style={{
          display: 'inline-block',
          padding: '13px 26px',
          background: '#0A0A0A',
          borderRadius: 12,
          color: '#F5F4F0',
          fontSize: 13.5,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          textDecoration: 'none',
        }}
      >
        {children} &nbsp;<span style={{ color: GOLD }}>↗</span>
      </a>
    </div>
  )
}

export function GoldButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '24px 0 16px', textAlign: 'left' }}>
      <a
        href={href}
        style={{
          display: 'inline-block',
          padding: '13px 26px',
          background: GOLD,
          borderRadius: 12,
          color: '#0A0A0A',
          fontSize: 13.5,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          textDecoration: 'none',
        }}
      >
        {children} &nbsp;↗
      </a>
    </div>
  )
}

export function Divider() {
  return <div style={{ height: 1, background: BORDER_DIVIDER, margin: '24px 0' }} />
}
