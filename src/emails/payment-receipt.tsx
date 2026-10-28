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
  GOLD,
  GOLD_DARK,
  CARD_WELL,
  BORDER_DIVIDER,
  DISPLAY_STACK,
  MONO_STACK,
  IMAGE_AURUM,
} from './base/tokens'

export interface PaymentReceiptProps {
  reference: string
  transactionId?: string | null
  amount: string
  purpose?: string | null
  paidAt: string
  customerName?: string | null
  customerEmail: string
}

export function PaymentReceiptEmail({
  reference,
  transactionId,
  amount,
  purpose,
  paidAt,
  customerName,
  customerEmail,
}: PaymentReceiptProps) {
  const recipient = customerName ?? customerEmail

  return (
    <Shell
      preheader={`Payment confirmed: ${amount} · Ref ${reference}`}
      eyebrow="Payment Receipt"
      heroImageUrl={IMAGE_AURUM}
      heroImageAlt="Virtue & Co. Webworks — Verified Payment"
    >
      <CardHeadline>Payment confirmed.</CardHeadline>
      <CardSubtext>Thank you, {recipient}. Your transaction has been securely processed.</CardSubtext>

      {/* Amount Hero Box */}
      <div
        style={{
          background: '#0A0A0A',
          border: '1px solid #1E1E1E',
          borderRadius: 14,
          padding: '24px 20px',
          margin: '20px 0 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.16em',
            color: GOLD,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          ( Verified Payment )
        </div>
        <div
          style={{
            fontFamily: DISPLAY_STACK,
            fontSize: 34,
            fontWeight: 600,
            color: '#F5F4F0',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
          }}
        >
          {amount}
        </div>
      </div>

      {/* Details Ledger */}
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
          margin: '18px 0 22px',
        }}
      >
        <tbody>
          {[
            ['Order Reference', reference],
            ['Payment Purpose', purpose ?? 'Website Engineering Milestone'],
            ['Date & Time', paidAt],
            ['Transaction ID', transactionId ?? reference],
          ].map(([label, val], idx) => (
            <tr
              key={label}
              style={{
                borderBottom: idx < 3 ? `1px solid ${BORDER_DIVIDER}` : 'none',
              }}
            >
              <td
                style={{
                  padding: '12px 18px',
                  color: TEXT_MUTED_DARK,
                  fontWeight: 500,
                  width: '40%',
                }}
              >
                {label}
              </td>
              <td
                style={{
                  padding: '12px 18px',
                  color: TEXT_DARK,
                  fontWeight: 600,
                  textAlign: 'right',
                  fontFamily: label === 'Order Reference' || label === 'Transaction ID' ? MONO_STACK : undefined,
                  fontSize: label === 'Order Reference' || label === 'Transaction ID' ? 12 : 13.5,
                }}
              >
                {val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PrimaryButton href={`${PORTAL}/orders/${reference}`}>
        View Order in Client Workspace
      </PrimaryButton>

      <Divider />

      <div style={{ fontSize: 12, color: TEXT_MUTED_DARK, textAlign: 'center', lineHeight: 1.6 }}>
        Need an invoice or have billing questions? Simply reply to this email.
      </div>
    </Shell>
  )
}

export default PaymentReceiptEmail
