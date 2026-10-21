import * as React from 'react'
import {
  CANVAS_BG, CARD_BG, SQUIRCLE_BG,
  TEXT_DARK, TEXT_MUTED_DARK, TEXT_FAINT_DARK,
  TEXT_MUTED_LIGHT,
  ALERT_BG, ALERT_BORDER, ALERT_TITLE, ALERT_TEXT,
  PILL_BG, PILL_TEXT,
  BORDER_DIGIT, BORDER_DIVIDER,
  FONT_SANS, FONT_MONO,
  LOGO_URL, SITE, CONTACT,
  GOLD,
} from './tokens'
import { AGENCY } from '@/lib/constants'

export interface ShellProps {
  preheader: string
  children: React.ReactNode
}

/**
 * Luxury Floating Card on Dark Cosmic Pedestal Shell
 * Precisely matched to the screenshot aesthetic:
 * - Deep dark space outer canvas with radiant sapphire spotlight pedestal
 * - Crisp elevated white card with rounded squircle logo
 * - Elegant circular social pills and copyright footer
 */
export function Shell({ preheader, children }: ShellProps) {
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

        {/* Outer Canvas Table */}
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{
            background: `${CANVAS_BG} radial-gradient(circle at 50% 100%, rgba(37, 99, 235, 0.45) 0%, rgba(15, 23, 42, 0) 70%) no-repeat`,
            padding: '54px 16px 48px',
          }}
        >
          <tbody>
            <tr>
              <td align="center">
                {/* ── Main Elevated White Card ── */}
                <table
                  role="presentation"
                  width={460}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    maxWidth: 460,
                    width: '100%',
                    background: CARD_BG,
                    borderRadius: 30,
                    overflow: 'hidden',
                    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: '44px 34px 38px', textAlign: 'center' }}>
                        {/* ── Logo Squircle Badge ── */}
                        <div style={{ textAlign: 'center', marginBottom: 22 }}>
                          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                            <tbody>
                              <tr>
                                <td
                                  align="center"
                                  style={{
                                    width: 64,
                                    height: 64,
                                    background: SQUIRCLE_BG,
                                    borderRadius: 18,
                                    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.15)',
                                    verticalAlign: 'middle',
                                    textAlign: 'center',
                                  }}
                                >
                                  <img
                                    src={LOGO_URL}
                                    width={40}
                                    height={40}
                                    alt="Virtue &amp; Co."
                                    style={{
                                      display: 'inline-block',
                                      width: 40,
                                      height: 40,
                                      objectFit: 'contain',
                                      verticalAlign: 'middle',
                                    }}
                                  />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Card Content Body */}
                        {children}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ── Pedestal Footer Area (Outside White Card) ── */}
                <table
                  role="presentation"
                  width={460}
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: 460, width: '100%', marginTop: 32, textAlign: 'center' }}
                >
                  <tbody>
                    {/* Social Media Pill Buttons */}
                    <tr>
                      <td align="center" style={{ paddingBottom: 22 }}>
                        <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
                          <tbody>
                            <tr>
                              {/* Twitter / X */}
                              <td style={{ padding: '0 6px' }}>
                                <a
                                  href="https://twitter.com"
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-block',
                                    width: 42,
                                    height: 42,
                                    borderRadius: '50%',
                                    background: '#FFFFFF',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                    textAlign: 'center',
                                    lineHeight: '42px',
                                    textDecoration: 'none',
                                    fontSize: 16,
                                  }}
                                >
                                  𝕏
                                </a>
                              </td>
                              {/* Instagram */}
                              <td style={{ padding: '0 6px' }}>
                                <a
                                  href="https://instagram.com"
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-block',
                                    width: 42,
                                    height: 42,
                                    borderRadius: '50%',
                                    background: '#FFFFFF',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                    textAlign: 'center',
                                    lineHeight: '42px',
                                    textDecoration: 'none',
                                    fontSize: 17,
                                  }}
                                >
                                  📸
                                </a>
                              </td>
                              {/* Studio / Web */}
                              <td style={{ padding: '0 6px' }}>
                                <a
                                  href={SITE}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: 'inline-block',
                                    width: 42,
                                    height: 42,
                                    borderRadius: '50%',
                                    background: '#FFFFFF',
                                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                                    textAlign: 'center',
                                    lineHeight: '42px',
                                    textDecoration: 'none',
                                    fontSize: 17,
                                  }}
                                >
                                  🌐
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Legal Copyright */}
                    <tr>
                      <td style={{ fontSize: 12.5, color: TEXT_MUTED_LIGHT, paddingBottom: 6 }}>
                        All rights reserved to {AGENCY.name} © {year}.
                      </td>
                    </tr>

                    {/* Contact & Support */}
                    <tr>
                      <td style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>
                        Email:{' '}
                        <a
                          href={`mailto:${AGENCY.fallbackEmail}`}
                          style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {AGENCY.fallbackEmail}
                        </a>
                        {'   '}·{'   '}
                        Contact Number:{' '}
                        <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{AGENCY.phone}</span>
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
    <div style={{ margin: '14px 0 16px', textAlign: 'center' }}>
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
        <tbody>
          <tr>
            {digits.map((digit, idx) => (
              <td key={idx} style={{ padding: '0 4px' }}>
                <div
                  style={{
                    width: 44,
                    height: 52,
                    lineHeight: '52px',
                    background: '#FFFFFF',
                    border: `1.5px solid ${BORDER_DIGIT}`,
                    borderRadius: 11,
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: FONT_MONO,
                    color: TEXT_DARK,
                    textAlign: 'center',
                    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
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
/*  Security Alert Box: "Was this request not made by you?"           */
/* ------------------------------------------------------------------ */
export function SecurityNotice({
  requestDate,
  browser = 'Chrome browser',
  os = 'macOS',
  actionText = 'ignore this email',
}: {
  requestDate?: string
  browser?: string
  os?: string
  actionText?: string
}) {
  const dateStr =
    requestDate ??
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div
      style={{
        background: ALERT_BG,
        border: `1px solid ${ALERT_BORDER}`,
        borderRadius: 14,
        padding: '16px 20px',
        textAlign: 'left',
        margin: '22px 0 20px',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: ALERT_TITLE,
          marginBottom: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 15, lineHeight: 1 }}>⚠️</span>
        <span>Was this request not made by you?</span>
      </div>
      <div style={{ fontSize: 12, color: ALERT_TEXT, lineHeight: 1.6 }}>
        This code was generated from a request made using <strong>{browser}</strong> on{' '}
        <strong>{os}</strong> on <strong>{dateStr}</strong>. If you did not initiate this request,
        you can safely <strong>{actionText}</strong>.
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Security IP Pill: "● IP 192.135.152"                              */
/* ------------------------------------------------------------------ */
export function SecurityPill({ ip = '192.135.152' }: { ip?: string }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 16 }}>
      <span
        style={{
          display: 'inline-block',
          background: PILL_BG,
          color: PILL_TEXT,
          fontSize: 11,
          fontWeight: 600,
          padding: '5px 14px',
          borderRadius: 999,
          letterSpacing: '0.04em',
        }}
      >
        ● IP {ip}
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
        fontSize: 22,
        fontWeight: 700,
        color: TEXT_DARK,
        lineHeight: 1.35,
        margin: '0 0 10px',
        letterSpacing: '-0.01em',
        fontFamily: FONT_SANS,
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
        fontSize: 13,
        color: TEXT_FAINT_DARK,
        fontWeight: 500,
        lineHeight: 1.5,
        margin: '0 0 18px',
      }}
    >
      {children}
    </p>
  )
}

export function AutomatedMessageNote() {
  return (
    <div style={{ fontSize: 12, color: TEXT_FAINT_DARK, margin: '14px 0 4px', textAlign: 'center' }}>
      This is an automated message. <strong style={{ color: TEXT_DARK }}>Please do not reply.</strong>
    </div>
  )
}

export function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '22px 0 16px', textAlign: 'center' }}>
      <a
        href={href}
        style={{
          display: 'inline-block',
          padding: '13px 32px',
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
          border: '1px solid #111827',
          borderRadius: 999,
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        }}
      >
        {children}
      </a>
    </div>
  )
}

export function GoldButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div style={{ margin: '22px 0 16px', textAlign: 'center' }}>
      <a
        href={href}
        style={{
          display: 'inline-block',
          padding: '13px 32px',
          background: 'linear-gradient(135deg, #DCAA28 0%, #F59E0B 100%)',
          borderRadius: 999,
          color: '#08090C',
          fontSize: 14,
          fontWeight: 800,
          textDecoration: 'none',
          boxShadow: '0 6px 18px rgba(220, 170, 40, 0.3)',
        }}
      >
        {children}
      </a>
    </div>
  )
}

export function Divider() {
  return <div style={{ height: 1, background: BORDER_DIVIDER, margin: '22px 0' }} />
}
