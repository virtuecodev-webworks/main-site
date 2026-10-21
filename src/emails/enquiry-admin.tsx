/**
 * Template 7 — Admin Lead Notification
 * Triggered: After contact form submission — sent to admin, triggers push notification
 */
import * as React from 'react'
import { Shell, EyebrowLabel, Heading, BodyText, Divider, GoldButton, DataTable } from './base/shell'
import { GOLD, EMERALD, WELL, BORDER_INNER, TEXT, TEXT_MUTED, TEXT_DIM } from './base/tokens'
import { AGENCY } from '@/lib/constants'

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
  source?: string | null
  submittedAt?: string
}

export function EnquiryAdminEmail(props: EnquiryAdminProps) {
  const {
    id, name, email, phone, company, service, budget, timeline,
    message, locale, source, submittedAt,
  } = props

  const adminUrl = `https://${AGENCY.domain}/admin/inquiries`

  return (
    <Shell
      preheader={`🔔 New lead: ${name}${company ? ` — ${company}` : ''} · ${service ?? 'General enquiry'}`}
      badge="NEW LEAD"
      badgeColor="gold"
      showStats={false}
    >
      {/* ── Alert badge ── */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(220,170,40,0.12)', border: `1.5px solid ${GOLD}`, borderRadius: 12, fontSize: 28 }}>
          🔔
        </span>
      </div>

      <EyebrowLabel>INCOMING ENQUIRY — ACTION REQUIRED</EyebrowLabel>
      <Heading>New project enquiry</Heading>
      <BodyText>
        <strong style={{ color: TEXT }}>{name}</strong>{company ? ` from ${company}` : ''} has
        submitted a project enquiry via the{' '}
        <strong style={{ color: TEXT }}>{locale.toUpperCase()}</strong> site.
        Reply directly to{' '}
        <a href={`mailto:${email}`} style={{ color: GOLD, textDecoration: 'none' }}>{email}</a>{' '}
        to respond.
      </BodyText>

      <Divider />

      <EyebrowLabel>LEAD DETAILS</EyebrowLabel>

      <DataTable rows={[
        ['Name', name],
        ['Email', email],
        ['Phone', phone ?? null],
        ['Company', company ?? null],
        ['Service', service ?? null],
        ['Budget', budget ?? null],
        ['Timeline', timeline ?? null],
        ['Locale', locale],
        ['Source', source ?? null],
        ['Submitted', submittedAt ?? null],
        ['Ref', id],
      ]} />

      {/* ── Message ── */}
      <div style={{ margin: '16px 0 24px' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: TEXT_DIM, marginBottom: 8, fontWeight: 700 }}>
          CLIENT MESSAGE
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.7, color: TEXT_MUTED, whiteSpace: 'pre-wrap', background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 12, padding: 16 }}>
          {message}
        </div>
      </div>

      <Divider />

      {/* ── Quick-action buttons ── */}
      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ marginBottom: 16 }}>
        <tbody>
          <tr>
            <td style={{ paddingRight: 10 }}>
              <a href={`mailto:${email}?subject=Re: your project enquiry&body=Hi ${name.split(' ')[0]},%0A%0A`}
                style={{ display: 'inline-block', padding: '11px 20px', background: GOLD, borderRadius: 10, fontSize: 13.5, fontWeight: 700, color: '#0B0E15', textDecoration: 'none' }}>
                ✉ Reply to Lead →
              </a>
            </td>
            <td>
              <a href={adminUrl}
                style={{ display: 'inline-block', padding: '11px 20px', background: '#151A26', border: '1px solid #283248', borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: TEXT, textDecoration: 'none' }}>
                📋 Open Dashboard
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ margin: '8px 0 0', fontSize: 12.5, lineHeight: '1.65', color: TEXT_DIM }}>
        ⚡ This notification was sent within seconds of form submission.
        Aim to reply within 4 hours during business hours.
      </p>
    </Shell>
  )
}

export default EnquiryAdminEmail
