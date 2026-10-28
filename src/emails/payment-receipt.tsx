/**
 * Template 5 — Payment Receipt
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
import { TEXT_DARK, TEXT_MUTED_DARK, PORTAL, GOLD, CARD_WELL, BORDER_DIVIDER, DISPLAY_STACK, MONO_STACK } from './base/tokens'

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
    <Shell preheader={`Payment confirmed: ${amount} · Ref ${reference}`} eyebrow="Payment Receipt">
      <CardHeadline>Payment Confirmed</CardHeadline>
      <CardSubtext>Thank you, {recipient}. Your transaction was successful.</CardSubtext>

      {/* Amount Hero Box */}
      <div
        style={{
          background: '#0A0A0A',
          border: '1px solid #1E1E1E',
          borderRadius: 16,
          padding: '24px 20px',
          margin: '18px 0 22px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: MONO_STACK,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.18em',
            color: GOLD,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          ( ✓ Verified Payment )
        </div>
        <div
          style={{
            fontFamily: DISPLAY_STACK,
            fontSize: 36,
            fontWeight: 500,
            color: '#F5F4F0',
            letterSpacing: '-0.03em',
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
          borderRadius: 16,
          overflow: 'hidden',
          fontSize: 13,
          margin: '0 0 20px',
        }}
      >
        <tbody>
          {[
            ['Reference', reference],
            ['Transaction ID', transactionId ?? 'N/A'],
            ['Purpose', purpose ?? 'Studio Engineering Milestone'],
            ['Date & Time', paidAt],
            ['Billed To', customerEmail],
          ].map(([label, val], idx) => (
            <tr key={label} style={{ borderBottom: idx < 4 ? `1px solid ${BORDER_DIVIDER}` : 'none' }}>
              <td style={{ padding: '12px 16px', color: TEXT_MUTED_DARK, fontWeight: 500, width: '40%' }}>
                {label}
              </td>
              <td style={{ padding: '12px 16px', color: TEXT_DARK, fontWeight: 600, textAlign: 'right' }}>
                {val}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <PrimaryButton href={PORTAL}>Access Your Client Portal</PrimaryButton>

      <SecurityPill ip={`Ref: ${reference}`} />
    </Shell>
  )
}

export default PaymentReceiptEmail

