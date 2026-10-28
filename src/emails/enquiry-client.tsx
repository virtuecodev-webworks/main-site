/**
 * Template 6 — Client Enquiry Auto-Reply
 * Clean high-contrast white card design matching user reference.
 */
import * as React from 'react'
import {
  Shell,
  CardHeadline,
  CardSubtext,
  PrimaryButton,
  SecurityPill,
  Divider,
} from './base/shell'
import { TEXT_DARK, TEXT_MUTED_DARK, PORTAL, CARD_WELL, BORDER_DIVIDER, GOLD } from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface EnquiryClientProps {
  name: string
  service?: string | null
  budget?: string | null
  timeline?: string | null
  message: string
  locale?: string
}

export function EnquiryClientEmail({ name, service, budget, timeline }: EnquiryClientProps) {
  const first = name.split(' ')[0]

  return (
    <Shell preheader={`Hi ${first}, your enquiry is with the studio. We reply within 2 business days.`} eyebrow="Project Brief">
      <CardHeadline>Enquiry Received</CardHeadline>
      <CardSubtext>Hi {first}, your project enquiry has reached the {AGENCY.name} studio.</CardSubtext>

      {/* Summary Box */}
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          background: CARD_WELL,
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 16,
          overflow: 'hidden',
          fontSize: 13,
          margin: '18px 0 20px',
        }}
      >
        <tbody>
          {[
            ['Service', service ?? 'General Web Engineering'],
            ['Budget', budget ?? 'To be discussed'],
            ['Timeline', timeline ?? 'Flexible'],
          ].map(([label, val], idx) => (
            <tr key={label} style={{ borderBottom: idx < 2 ? `1px solid ${BORDER_DIVIDER}` : 'none' }}>
              <td style={{ padding: '12px 16px', color: TEXT_MUTED_DARK, fontWeight: 500, width: '35%' }}>
                {label}
              </td>
              <td style={{ padding: '12px 16px', color: TEXT_DARK, fontWeight: 600, textAlign: 'right' }}>
                {val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Guarantee callout */}
      <div
        style={{
          background: '#0A0A0A',
          border: '1px solid #1E1E1E',
          borderRadius: 14,
          padding: '16px 18px',
          textAlign: 'left',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>
          ( Guaranteed 48-Hour Response )
        </div>
        <div style={{ fontSize: 12.5, color: '#D1D0CB', lineHeight: 1.6 }}>
          A senior engineer is evaluating your scope. You will receive an itemized proposal with deliverables, a binding fixed price, and a delivery schedule.
        </div>
      </div>

      <PrimaryButton href={PORTAL}>Track in Client Portal</PrimaryButton>

      <SecurityPill ip="Studio Brief Logged" />
    </Shell>
  )
}

export default EnquiryClientEmail
