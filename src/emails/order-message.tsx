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
  CARD_WELL,
  BORDER_DIVIDER,
  MONO_STACK,
  IMAGE_BRAND_BANNER,
  GOLD,
  BORDER_CARD,
} from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface OrderMessageEmailProps {
  recipientName?: string
  senderName: string
  senderRole: 'admin' | 'agent' | 'client'
  orderReference: string
  orderTitle: string
  messageBody: string
  actionUrl: string
  isStaffRecipient?: boolean
}

export function OrderMessageEmail({
  recipientName,
  senderName,
  senderRole,
  orderReference,
  orderTitle,
  messageBody,
  actionUrl,
  isStaffRecipient = false,
}: OrderMessageEmailProps) {
  const greeting = recipientName ? `Hello ${recipientName.split(' ')[0]},` : 'Hello,'
  const roleLabel = senderRole === 'client' ? 'Client' : 'Lead Engineer'
  const actionButtonText = isStaffRecipient ? 'Reply in Admin Workspace' : 'Reply in Client Portal'

  // Clean message preview if it contains metadata blocks
  const cleanBody = messageBody.split('<!--VCW_CHAT_PAYLOAD_START-->')[0].trim()

  return (
    <Shell
      preheader={`New message from ${senderName} on ${orderReference}: "${cleanBody.slice(0, 80)}${cleanBody.length > 80 ? '...' : ''}"`}
      eyebrow={`Order Dispatch · ${orderReference}`}
      heroImageUrl={IMAGE_BRAND_BANNER}
      heroImageAlt="Virtue & Co. Webworks"
    >
      <CardHeadline>New message on your project.</CardHeadline>
      <CardSubtext>
        {greeting} you have received a new message regarding <strong>{orderTitle}</strong>.
      </CardSubtext>

      {/* Message sender header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 20,
          marginBottom: 10,
          padding: '0 4px',
        }}
      >
        <span
          style={{
            fontFamily: MONO_STACK,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: TEXT_DARK,
          }}
        >
          {senderName} &nbsp;·&nbsp;{' '}
          <span style={{ color: GOLD }}>{roleLabel}</span>
        </span>
        <span
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10.5,
            color: TEXT_MUTED_DARK,
            background: CARD_WELL,
            border: `1px solid ${BORDER_DIVIDER}`,
            borderRadius: 6,
            padding: '2px 8px',
          }}
        >
          {orderReference}
        </span>
      </div>

      {/* Message content card */}
      <div
        style={{
          background: CARD_WELL,
          border: `1px solid ${BORDER_DIVIDER}`,
          borderRadius: 14,
          padding: '22px 24px',
          textAlign: 'left',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            color: TEXT_DARK,
            fontSize: 14.5,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {cleanBody}
        </div>
      </div>

      {/* Primary Action Button */}
      <PrimaryButton href={actionUrl}>{actionButtonText}</PrimaryButton>

      {/* Direct Email Reply Callout */}
      <div
        style={{
          marginTop: 20,
          background: '#FCFBF8',
          border: `1px dashed ${BORDER_CARD}`,
          borderRadius: 12,
          padding: '14px 18px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 12.5,
            color: TEXT_MUTED_DARK,
            lineHeight: 1.6,
          }}
        >
          💬 <strong>Two-way reply:</strong> You can click the button above to reply on the web, or simply <strong>hit "Reply"</strong> directly in your email app.
        </div>
      </div>

      <Divider />

      <div style={{ fontSize: 11.5, color: TEXT_MUTED_DARK, textAlign: 'center', lineHeight: 1.6 }}>
        This notification was delivered by {AGENCY.name}. Responses are automatically logged in your project thread.
      </div>
    </Shell>
  )
}
