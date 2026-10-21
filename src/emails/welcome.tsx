/**
 * Template 2 -- Welcome to the Client Portal
 * Triggered: After email OTP is verified during signup
 */
import * as React from 'react'
import { Shell, EyebrowLabel, Heading, BodyText, Divider, GoldButton } from './base/shell'
import { GOLD, EMERALD, WELL, BORDER_INNER, TEXT, TEXT_MUTED, TEXT_DIM, PHOTO_COLLABORATION, PHOTO_PROCESS, PORTAL, CONTACT } from './base/tokens'
import { AGENCY } from '@/lib/constants'

interface WelcomeEmailProps {
  name?: string
}

const ONBOARDING_STEPS: [string, string, string][] = [
  ['01', 'Browse our services', 'Explore fixed-price website packages -- custom builds, WordPress, Wix, and full e-commerce stores.'],
  ['02', 'Submit a project enquiry', 'Tell us about your goals and we will reply with a full scoped proposal within 2 business days.'],
  ['03', 'Track your project live', 'Once engaged, your client portal gives you real-time visibility into every milestone.'],
]

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  const first = name?.split(' ')[0] ?? 'there'

  return (
    <Shell
      preheader={`Welcome to ${AGENCY.name}, ${first}. Your client workspace is now active.`}
      badge="WELCOME"
      badgeColor="gold"
    >
      {/* Hero Photo Banner */}
      <div style={{ margin: '-40px -36px 32px' }}>
        <img
          src={PHOTO_COLLABORATION}
          width="100%"
          alt="Virtue &amp; Co. Studio"
          style={{ display: 'block', width: '100%', height: 200, objectFit: 'cover', objectPosition: 'center' }}
        />
        <div style={{ marginTop: -4, height: 4, background: `linear-gradient(90deg,${GOLD} 0%,${EMERALD} 100%)` }} />
      </div>

      <EyebrowLabel>STUDIO ONBOARDING</EyebrowLabel>
      <Heading>Welcome, {first}.</Heading>
      <BodyText>
        Your client workspace at <strong style={{ color: TEXT }}>{AGENCY.name}</strong> is
        now active. You are in the right place for ultra-fast, precision-engineered
        websites built to perform.
      </BodyText>

      <Divider />
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: GOLD, textTransform: 'uppercase', marginBottom: 14 }}>
        WHAT HAPPENS NEXT
      </div>

      {ONBOARDING_STEPS.map(([num, title, body]) => (
        <table key={num} role="presentation" width="100%" cellPadding={0} cellSpacing={0}
          style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 12, padding: 0, marginBottom: 10, overflow: 'hidden' }}>
          <tbody>
            <tr>
              <td style={{ width: 52, padding: 16, verticalAlign: 'top' }}>
                <div style={{ width: 32, height: 32, background: 'rgba(220,170,40,0.12)', border: '1px solid rgba(220,170,40,0.3)', borderRadius: 8, fontSize: 12, fontWeight: 800, color: GOLD, textAlign: 'center', lineHeight: '32px' }}>
                  {num}
                </div>
              </td>
              <td style={{ padding: '16px 16px 16px 0', verticalAlign: 'top' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6 }}>{body}</div>
              </td>
            </tr>
          </tbody>
        </table>
      ))}

      <Divider />

      <div style={{ marginBottom: 24 }}>
        <img src={PHOTO_PROCESS} width="100%" alt="Our engineering process"
          style={{ display: 'block', width: '100%', height: 160, objectFit: 'cover', objectPosition: 'center top', borderRadius: 12, border: `1px solid ${BORDER_INNER}` }} />
        <div style={{ marginTop: 8, fontSize: 11.5, color: TEXT_DIM, textAlign: 'center' }}>
          Every project runs through our precision engineering process.
        </div>
      </div>

      <GoldButton href={PORTAL}>Open Your Client Portal</GoldButton>

      <p style={{ margin: '20px 0 0', fontSize: 12.5, lineHeight: '1.65', color: TEXT_DIM }}>
        Questions? Reply to this email or{' '}
        <a href={CONTACT} style={{ color: GOLD, textDecoration: 'none' }}>start a conversation on our site</a>.
        A real senior engineer reads and responds -- not a bot.
      </p>
    </Shell>
  )
}

export default WelcomeEmail
