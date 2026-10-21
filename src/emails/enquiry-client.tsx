/**
 * Template 6 -- Client Enquiry Auto-Reply
 * Triggered: After contact form submission -- sent to the client
 */
import * as React from 'react'
import { Shell, EyebrowLabel, Heading, BodyText, Divider, GoldButton, DataTable } from './base/shell'
import { GOLD, EMERALD, WELL, BORDER_INNER, TEXT, TEXT_MUTED, TEXT_DIM, PHOTO_SERVICES, CONTACT } from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface EnquiryClientProps {
  name: string
  service?: string | null
  budget?: string | null
  timeline?: string | null
  message: string
  locale?: string
}

const NEXT_STEPS: [string, string][] = [
  ['Within 2 business days', 'You will receive a fully scoped proposal with deliverables, a fixed price, and a guaranteed deadline.'],
  ['Urgent project?', 'Simply reply to this email with the word URGENT and we will prioritise your enquiry immediately.'],
]

export function EnquiryClientEmail({ name, service, budget, timeline, message }: EnquiryClientProps) {
  const first = name.split(' ')[0]

  return (
    <Shell
      preheader={`Hi ${first}, your enquiry is with the studio. We reply within 2 business days.`}
      badge="CONFIRMED"
      badgeColor="emerald"
    >
      {/* Studio image */}
      <div style={{ margin: '-40px -36px 32px' }}>
        <img src={PHOTO_SERVICES} width="100%" alt="Virtue &amp; Co. Services"
          style={{ display: 'block', width: '100%', height: 180, objectFit: 'cover', objectPosition: 'center' }} />
        <div style={{ height: 2, background: `linear-gradient(90deg,${GOLD} 0%,${EMERALD} 100%)` }} />
      </div>

      <EyebrowLabel>ENQUIRY RECEIVED</EyebrowLabel>
      <Heading>Thanks, {first}.</Heading>
      <BodyText>
        Your project enquiry has landed safely with the{' '}
        <strong style={{ color: TEXT }}>{AGENCY.name}</strong> studio and a senior
        engineer is reviewing it right now.
      </BodyText>

      <Divider />

      <EyebrowLabel>YOUR SUBMISSION SUMMARY</EyebrowLabel>

      <DataTable rows={[
        ['Service', service ?? null],
        ['Budget', budget ?? null],
        ['Timeline', timeline ?? null],
      ]} />

      <div style={{ margin: '16px 0 24px', fontSize: 14.5, lineHeight: 1.7, color: TEXT_MUTED, whiteSpace: 'pre-wrap', background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 12, padding: 16 }}>
        {message}
      </div>

      <Divider />

      <div style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 14, padding: '20px 22px', marginBottom: 24 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.18em', color: EMERALD, textTransform: 'uppercase', marginBottom: 10 }}>
          WHAT HAPPENS NEXT
        </div>
        {NEXT_STEPS.map(([title, body]) => (
          <div key={title} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{title}</div>
            <div style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, marginTop: 2 }}>{body}</div>
          </div>
        ))}
      </div>

      <GoldButton href={`mailto:${AGENCY.email}`}>Email the Studio Directly</GoldButton>

      <p style={{ margin: '20px 0 0', fontSize: 12.5, lineHeight: '1.65', color: TEXT_DIM }}>
        You can also reach us via our{' '}
        <a href={CONTACT} style={{ color: GOLD, textDecoration: 'none' }}>contact page</a>.
      </p>
    </Shell>
  )
}

export default EnquiryClientEmail
