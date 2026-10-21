/**
 * Template 1 — Confirm Email (OTP)
 * Supabase: Authentication → Email Templates → Confirm signup
 * Subject:  {{ .Token }} is your Virtue & Co. verification code
 */
import * as React from 'react'
import { Shell, EyebrowLabel, Heading, BodyText, Divider } from './base/shell'
import { GOLD, GOLD_LIGHT, WELL, BORDER_INNER, TEXT, TEXT_DIM, EMERALD, FONT_MONO } from './base/tokens'

interface SignupOtpProps {
  /** The 6-digit OTP. In Supabase templates use {{ .Token }} */
  code: string
  name?: string
}

export function SignupOtpEmail({ code, name }: SignupOtpProps) {
  const first = name?.split(' ')[0]
  return (
    <Shell
      preheader={`Your verification code is ${code}. Valid for 10 minutes.`}
      badge="ACCOUNT SECURITY"
      badgeColor="emerald"
    >
      <EyebrowLabel>AUTHENTICATION GATEWAY</EyebrowLabel>
      <Heading>Confirm your account</Heading>
      <BodyText>
        {first ? <><strong style={{ color: TEXT }}>Hi {first},</strong>{' '}use</> : 'Use'}{' '}
        the 6-digit one-time code below to verify your email address and activate
        your private client portal.
      </BodyText>

      {/* ── OTP Code Box (Linear / Raycast inspired) ── */}
      <div style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 16, padding: '32px 20px', textAlign: 'center', margin: '28px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>
          ONE-TIME VERIFICATION CODE
        </div>
        <div style={{ display: 'inline-block', background: '#0B0E15', border: `1.5px solid ${GOLD}`, borderRadius: 12, padding: '14px 28px', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 38, fontWeight: 800, letterSpacing: 10, color: TEXT, paddingLeft: 10, display: 'inline-block' }}>
            {code}
          </span>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: TEXT_DIM, fontWeight: 500 }}>
          ⏱ Valid for 10 minutes · Single-use code
        </div>
      </div>

      {/* ── Security Metadata ── */}
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}
        style={{ background: '#0B0E15', border: `1px solid #1E2534`, borderRadius: 12, marginBottom: 24, fontSize: 12.5 }}>
        <tbody>
          {([
            ['Security Protocol', '256-bit Encrypted OTP'],
            ['Authorized Target', 'Virtue & Co. Client Workspace'],
            ['Account Protection', 'Verified Authentication'],
          ] as [string, string][]).map(([label, value], i) => (
            <tr key={label}>
              <td style={{ padding: '12px 16px', color: TEXT_DIM, width: '38%', borderBottom: i < 2 ? `1px solid #1E2534` : undefined }}>{label}</td>
              <td style={{ padding: '12px 16px', color: i === 2 ? EMERALD : TEXT, fontWeight: 600, borderBottom: i < 2 ? `1px solid #1E2534` : undefined }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: 0, fontSize: 12.5, lineHeight: '1.65', color: TEXT_DIM }}>
        🔒 This is an automated security transmission. If you did not initiate this
        registration, no action is required — your email remains protected. Never share
        this code with anyone.
      </p>
    </Shell>
  )
}

export default SignupOtpEmail
