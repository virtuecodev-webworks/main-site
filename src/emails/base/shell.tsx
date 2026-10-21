import * as React from 'react'
import {
  BG, CARD, WELL, HEADER_BG,
  BORDER, BORDER_INNER,
  GOLD, GOLD_LIGHT, EMERALD,
  TEXT, TEXT_MUTED, TEXT_DIM, TEXT_FAINT,
  FONT_SANS,
  LOGO_URL, SITE, PORTAL,
} from './tokens'
import { AGENCY } from '@/lib/constants'

interface ShellProps {
  preheader: string
  badge?: string
  badgeColor?: 'emerald' | 'gold' | 'slate'
  children: React.ReactNode
  /** Show the studio proof-point bar at bottom */
  showStats?: boolean
}

function badgeStyle(color: 'emerald' | 'gold' | 'slate' = 'emerald') {
  const map = {
    emerald: { bg: 'rgba(20,160,108,0.12)', border: 'rgba(20,160,108,0.28)', text: EMERALD },
    gold: { bg: 'rgba(220,170,40,0.12)', border: 'rgba(220,170,40,0.30)', text: GOLD },
    slate: { bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.28)', text: '#94A3B8' },
  }
  return map[color]
}

/** Shared luxury-dark branded shell used by every template. */
export function Shell({ preheader, badge = 'STUDIO OFFICIAL', badgeColor = 'emerald', children, showStats = true }: ShellProps) {
  const bd = badgeStyle(badgeColor)
  const year = new Date().getFullYear()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{AGENCY.name}</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: BG, fontFamily: FONT_SANS, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
        {/* Gmail preheader trick */}
        <div style={{ display: 'none', fontSize: 1, color: BG, lineHeight: 1, maxHeight: 0, maxWidth: 0, opacity: 0, overflow: 'hidden' }}>
          {preheader}
        </div>

        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ background: BG, padding: '48px 16px' }}>
          <tbody>
            <tr>
              <td align="center">
                <table role="presentation" width={600} cellPadding={0} cellSpacing={0} style={{ maxWidth: 600, width: '100%', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.65)' }}>
                  <tbody>

                    {/* ── Branded Header ── */}
                    <tr>
                      <td style={{ background: HEADER_BG, padding: '28px 36px', borderBottom: `1px solid ${BORDER}` }}>
                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td style={{ verticalAlign: 'middle' }}>
                                <table role="presentation" cellPadding={0} cellSpacing={0}>
                                  <tbody>
                                    <tr>
                                      <td style={{ width: 44, verticalAlign: 'middle' }}>
                                        <img src={LOGO_URL} width={44} height={44} alt="Virtue &amp; Co." style={{ display: 'block', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }} />
                                      </td>
                                      <td style={{ paddingLeft: 14, verticalAlign: 'middle' }}>
                                        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.01em', color: TEXT, lineHeight: '1.15' }}>
                                          VIRTUE <span style={{ color: GOLD, fontWeight: 800 }}>&amp;</span> CO.
                                        </div>
                                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.24em', color: TEXT_MUTED, marginTop: 3, textTransform: 'uppercase' }}>
                                          WEBWORKS STUDIO
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td align="right" style={{ verticalAlign: 'middle' }}>
                                <span style={{ display: 'inline-block', padding: '5px 12px', background: bd.bg, border: `1px solid ${bd.border}`, borderRadius: 999, fontSize: 10.5, fontWeight: 700, color: bd.text, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                  ● {badge}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* ── Signature 2-px Gold → Emerald Gradient Ribbon ── */}
                    <tr>
                      <td style={{ height: 2, background: `linear-gradient(90deg,${GOLD} 0%,${GOLD_LIGHT} 35%,${EMERALD} 100%)` }} />
                    </tr>

                    {/* ── Main Content ── */}
                    <tr>
                      <td style={{ padding: '40px 36px 32px', color: TEXT_MUTED }}>
                        {children}
                      </td>
                    </tr>

                    {/* ── Studio Proof Points ── */}
                    {showStats && (
                      <tr>
                        <td style={{ padding: '0 36px 32px' }}>
                          <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 14, overflow: 'hidden' }}>
                            <tbody>
                              <tr>
                                <td style={{ padding: '16px 12px', width: '33.3%', borderRight: `1px solid ${BORDER_INNER}`, textAlign: 'center' }}>
                                  <div style={{ fontSize: 16, fontWeight: 800, color: TEXT, marginBottom: 2 }}>95–100</div>
                                  <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Core Web Vitals</div>
                                </td>
                                <td style={{ padding: '16px 12px', width: '33.3%', borderRight: `1px solid ${BORDER_INNER}`, textAlign: 'center' }}>
                                  <div style={{ fontSize: 16, fontWeight: 800, color: GOLD, marginBottom: 2 }}>Fixed Scope</div>
                                  <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Guaranteed Price</div>
                                </td>
                                <td style={{ padding: '16px 12px', width: '33.3%', textAlign: 'center' }}>
                                  <div style={{ fontSize: 16, fontWeight: 800, color: EMERALD, marginBottom: 2 }}>100% Owned</div>
                                  <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Direct Codebase</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}

                    {/* ── Footer ── */}
                    <tr>
                      <td style={{ padding: '28px 36px', background: '#090C12', borderTop: `1px solid ${BORDER}` }}>
                        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                          <tbody>
                            <tr>
                              <td>
                                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{AGENCY.name}</div>
                                <div style={{ fontSize: 12, color: TEXT_DIM, marginTop: 6, lineHeight: 1.6 }}>
                                  Ultra-sleek web engineering &amp; digital experiences.<br />
                                  <a href={`https://${AGENCY.domain}`} style={{ color: GOLD, textDecoration: 'none', fontWeight: 600 }}>{AGENCY.domain}</a>
                                  {' · '}
                                  <a href={`mailto:${AGENCY.email}`} style={{ color: TEXT_MUTED, textDecoration: 'none' }}>{AGENCY.email}</a>
                                </div>
                                <div style={{ fontSize: 11, color: TEXT_FAINT, marginTop: 12 }}>
                                  © {year} Virtue &amp; Co. Webworks. All rights reserved.
                                </div>
                              </td>
                              <td align="right" style={{ verticalAlign: 'top' }}>
                                <a href={PORTAL} style={{ display: 'inline-block', padding: '8px 16px', background: '#151A26', border: '1px solid #283248', borderRadius: 8, fontSize: 12, fontWeight: 600, color: TEXT, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                  Client Portal →
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
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

/* ─── Shared primitive helpers ─── */

export function EyebrowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', color: GOLD, textTransform: 'uppercase', marginBottom: 10 }}>
      {children}
    </div>
  )
}

export function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ margin: '0 0 12px', fontSize: 26, lineHeight: '1.2', fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>
      {children}
    </h1>
  )
}

export function BodyText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: '1.65', color: TEXT_MUTED, ...style }}>
      {children}
    </p>
  )
}

export function Divider() {
  return <div style={{ height: 1, background: BORDER, margin: '24px 0' }} />
}

export function GoldButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '22px 0 10px' }}>
      <tbody>
        <tr>
          <td style={{ background: GOLD, borderRadius: 10, boxShadow: '0 4px 18px rgba(220,170,40,0.35)' }}>
            <a href={href} style={{ display: 'inline-block', padding: '13px 26px', fontSize: 14, fontWeight: 700, color: '#0B0E15', textDecoration: 'none', letterSpacing: '0.02em' }}>
              {children} →
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export function DataRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <tr>
      <td style={{ padding: '11px 16px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT_DIM, width: '34%', verticalAlign: 'middle', borderTop: isLast ? undefined : undefined }}>
        {label}
      </td>
      <td style={{ padding: '11px 16px', fontSize: 13.5, color: TEXT, fontWeight: 600, verticalAlign: 'middle' }}>
        {value}
      </td>
    </tr>
  )
}

export function DataTable({ rows }: { rows: [string, string | null | undefined][] }) {
  const filled = rows.filter(([, v]) => v != null && v !== '')
  if (!filled.length) return null
  return (
    <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}
      style={{ borderCollapse: 'collapse', margin: '16px 0', background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 12, overflow: 'hidden' }}>
      <tbody>
        {filled.map(([label, value], i) => (
          <tr key={label}>
            <td style={{ padding: '11px 16px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT_DIM, width: '34%', verticalAlign: 'middle', borderTop: i > 0 ? `1px solid ${BORDER_INNER}` : undefined }}>{label}</td>
            <td style={{ padding: '11px 16px', fontSize: 13.5, color: TEXT, fontWeight: 600, verticalAlign: 'middle', borderTop: i > 0 ? `1px solid ${BORDER_INNER}` : undefined }}>{value ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
