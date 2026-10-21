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
import { TEXT_DARK, TEXT_MUTED_DARK, PORTAL } from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface EnquiryClientProps {
  name: string
  service?: string | null
  budget?: string | null
  timeline?: string | null
  message: string
  locale?: string
}

export function EnquiryClientEmail({ name, service, budget, timeline, message }: EnquiryClientProps) {
  const first = name.split(' ')[0]

  return (
    <Shell preheader={`Hi ${first}, your enquiry is with the studio. We reply within 2 business days.`}>
      <CardHeadline>Enquiry Received</CardHeadline>
      <CardSubtext>Hi {first}, your project enquiry has reached the {AGENCY.name} studio.</CardSubtext>

      {/* Summary Box */}
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 14,
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
            <tr key={label} style={{ borderBottom: idx < 2 ? '1px solid #E2E8F0' : 'none' }}>
              <td style={{ padding: '12px 16px', color: '#6B7280', fontWeight: 600, width: '35%' }}>
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
          background: '#FEF9EE',
          border: '1px solid #FDE68A',
          borderRadius: 12,
          padding: '14px 18px',
          textAlign: 'left',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
          ⏱ Guaranteed 48-Hour Response
        </div>
        <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.55 }}>
          A senior engineer is evaluating your scope. You will receive an itemized proposal with deliverables, a binding fixed price, and a delivery schedule.
        </div>
      </div>

      <PrimaryButton href={PORTAL}>Track in Client Portal</PrimaryButton>

      <SecurityPill ip="Studio Verified" />
    </Shell>
  )
}

export default EnquiryClientEmail
