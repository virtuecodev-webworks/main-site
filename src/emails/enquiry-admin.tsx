/**
 * Template 7 — Admin Lead Notification
 * Clean high-contrast white card design matching user reference.
 */
import * as React from 'react'
import {
  Shell,
  CardHeadline,
  CardSubtext,
  PrimaryButton,
  SecurityPill,
} from './base/shell'
import { TEXT_DARK, TEXT_MUTED_DARK, SITE, CARD_WELL, BORDER_DIVIDER, MONO_STACK } from './base/tokens'

export interface EnquiryAdminProps {
  id: string
  name: string
  email: string
  phone?: string | null
  company?: string | null
  service?: string | null
  budget?: string | null
  timeline?: string | null
  message: string
  locale: string
  source?: string
  submittedAt?: string
}

export function EnquiryAdminEmail({
  id,
  name,
  email,
  phone,
  company,
  service,
  budget,
  timeline,
  message,
  locale,
}: EnquiryAdminProps) {
  const adminUrl = `${SITE}/en/admin/inquiries`

  return (
    <Shell preheader={`New Lead: ${name} · ${service ?? 'General Inquiry'}`} eyebrow="Admin Lead Alert">
      <CardHeadline>New Client Lead</CardHeadline>
      <CardSubtext>A prospective client just submitted an enquiry through the website.</CardSubtext>

      {/* Details Table */}
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
            ['Client Name', name],
            ['Email', email],
            ['Phone', phone ?? 'Not provided'],
            ['Company', company ?? 'Independent / Founder'],
            ['Service', service ?? 'General Inquiry'],
            ['Budget', budget ?? 'Flexible'],
            ['Timeline', timeline ?? 'Flexible'],
            ['Locale', locale],
          ].map(([label, val], idx) => (
            <tr key={label} style={{ borderBottom: idx < 7 ? `1px solid ${BORDER_DIVIDER}` : 'none' }}>
              <td style={{ padding: '10px 14px', color: TEXT_MUTED_DARK, fontWeight: 500, width: '35%' }}>
                {label}
              </td>
              <td style={{ padding: '10px 14px', color: TEXT_DARK, fontWeight: 600, textAlign: 'right' }}>
                {val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Message Quote */}
      <div
        style={{
          background: CARD_WELL,
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 14,
          padding: '14px 16px',
          textAlign: 'left',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: TEXT_MUTED_DARK,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          ( Client Message )
        </div>
        <div style={{ fontSize: 13.5, color: TEXT_DARK, lineHeight: 1.6 }}>
          &ldquo;{message}&rdquo;
        </div>
      </div>

      <PrimaryButton href={adminUrl}>Open Inquiries Console</PrimaryButton>

      <SecurityPill ip={`Lead ID: ${id.slice(0, 8)}`} />
    </Shell>
  )
}

export default EnquiryAdminEmail
