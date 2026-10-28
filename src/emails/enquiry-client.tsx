import * as React from 'react'
import {
  Shell,
  CardHeadline,
  CardSubtext,
  PrimaryButton,
  Divider,
} from './base/shell'
import {
  TEXT_DARK,
  TEXT_MUTED_DARK,
  PORTAL,
  CARD_WELL,
  BORDER_DIVIDER,
  GOLD_DARK,
  IMAGE_BRAND_BANNER,
  MONO_STACK,
} from './base/tokens'
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
    <Shell
      preheader={`Hi ${first}, we received your project brief. You'll hear from us within 2 business days.`}
      eyebrow="Project Brief"
      heroImageUrl={IMAGE_BRAND_BANNER}
      heroImageAlt="Virtue & Co. Webworks"
    >
      <CardHeadline>Brief received.</CardHeadline>
      <CardSubtext>
        Hi {first}, your project brief has been received. Our lead engineers are reviewing your scope.
      </CardSubtext>

      {/* Summary Box */}
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={{
          background: CARD_WELL,
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 14,
          overflow: 'hidden',
          fontSize: 13.5,
          margin: '20px 0 22px',
        }}
      >
        <tbody>
          {[
            ['Service Requested', service ?? 'Custom Website Design & Development'],
            ['Estimated Budget', budget ?? 'Flexible / To be scoped'],
            ['Target Timeline', timeline ?? 'Flexible schedule'],
          ].map(([label, val], idx) => (
            <tr
              key={label}
              style={{
                borderBottom: idx < 2 ? `1px solid ${BORDER_DIVIDER}` : 'none',
              }}
            >
              <td
                style={{
                  padding: '13px 18px',
                  color: TEXT_MUTED_DARK,
                  fontWeight: 500,
                  width: '40%',
                }}
              >
                {label}
              </td>
              <td
                style={{
                  padding: '13px 18px',
                  color: TEXT_DARK,
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                {val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Response Guarantee Box */}
      <div
        style={{
          background: '#FAF9F6',
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 14,
          padding: '18px 20px',
          textAlign: 'left',
          marginBottom: 22,
        }}
      >
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: GOLD_DARK,
            marginBottom: 6,
          }}
        >
          ( 2 Working Days Response )
        </div>
        <div style={{ fontSize: 13.5, color: TEXT_MUTED_DARK, lineHeight: 1.65 }}>
          You will receive an itemized proposal outlining the technical architecture, deliverables, fixed price, and an exact launch schedule.
        </div>
      </div>

      <PrimaryButton href={PORTAL}>Track in Client Workspace</PrimaryButton>

      <Divider />

      <div style={{ fontSize: 12, color: TEXT_MUTED_DARK, textAlign: 'center', lineHeight: 1.6 }}>
        Need to update your brief or add files? Simply reply directly to this email.
      </div>
    </Shell>
  )
}

export default EnquiryClientEmail
