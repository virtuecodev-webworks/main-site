/**
 * Template 4 — Reset Password (OTP)
 * Supabase: Authentication → Email Templates → Reset password
 * Subject:  {{ .Token }} is your Virtue & Co. password reset code
 */
import * as React from 'react'
import { Shell, EyebrowLabel, Heading, BodyText } from './base/shell'
import { GOLD, TEXT, TEXT_DIM, EMERALD, WELL, BORDER_INNER, FONT_MONO } from './base/tokens'

interface ResetOtpProps {
  code: string
  name?: string
}

export function ResetOtpEmail({ code, name }: ResetOtpProps) {
  const first = name?.split(' ')[0]
  return (
    <Shell
      preheader={`Your password reset code is ${code}. Valid for 10 minutes.`}
      badge="RECOVERY"
      badgeColor="gold"
    >
      <EyebrowLabel>ACCOUNT RECOVERY</EyebrowLabel>
      <Heading>Reset your password</Heading>
      <BodyText>
        {first ? <><strong style={{ color: TEXT }}>Hi {first},</strong>{' '}w</> : 'W'}e received
        a request to reset the password for your Virtue &amp; Co. account.
        Enter this 6-digit recovery code on screen to choose a new password.
      </BodyText>

      {/* ── Recovery Code Box ── */}
      <div style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 16, padding: '32px 20px', textAlign: 'center', margin: '28px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>
          PASSWORD RESET CODE
        </div>
        <div style={{ display: 'inline-block', background: '#0B0E15', border: `1.5px solid ${GOLD}`, borderRadius: 12, padding: '14px 28px', boxShadow: '0 8px 24px rgba(0,0,0,0.45)' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 38, fontWeight: 800, letterSpacing: 10, color: TEXT, paddingLeft: 10, display: 'inline-block' }}>
            {code}
          </span>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: TEXT_DIM, fontWeight: 500 }}>
          ⏱ Valid for 10 minutes · Single-use recovery code
        </div>
      </div>

      {/* ── Security Box ── */}
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}
        style={{ background: '#0B0E15', border: '1px solid #1E2534', borderRadius: 12, marginBottom: 24, fontSize: 12.5 }}>
        <tbody>
          {([
            ['Security Protocol', 'Encrypted OTP Verification', false],
            ['Authorized Target', 'Virtue & Co. Client Portal', false],
            ['Security Advisory', 'Do not disclose this code', true],
          ] as [string, string, boolean][]).map(([label, value, isGold], i) => (
            <tr key={label}>
              <td style={{ padding: '12px 16px', color: TEXT_DIM, width: '38%', borderBottom: i < 2 ? '1px solid #1E2534' : undefined }}>{label}</td>
              <td style={{ padding: '12px 16px', color: isGold ? GOLD : TEXT, fontWeight: 600, borderBottom: i < 2 ? '1px solid #1E2534' : undefined }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: 0, fontSize: 12.5, lineHeight: '1.65', color: TEXT_DIM }}>
        🔒 If you did not request this password reset, your account is safe and no
        changes have been applied. Simply ignore this email.
      </p>
    </Shell>
  )
}

export default ResetOtpEmail
