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
import { TEXT_DARK, TEXT_MUTED_DARK, PORTAL, GOLD } from './base/tokens'

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
    <Shell preheader={`Payment confirmed: ${amount} · Ref ${reference}`}>
      <CardHeadline>Payment Confirmed</CardHeadline>
      <CardSubtext>Thank you, {recipient}. Your transaction was successful.</CardSubtext>

      {/* Amount Hero Box */}
      <div
        style={{
          background: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: 20,
          padding: '22px 20px',
          margin: '18px 0 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: GOLD, textTransform: 'uppercase', marginBottom: 6 }}>
          ✓ Verified Payment
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: TEXT_DARK, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
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
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 14,
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
            <tr key={label} style={{ borderBottom: idx < 4 ? '1px solid #F1F5F9' : 'none' }}>
              <td style={{ padding: '12px 16px', color: '#6B7280', fontWeight: 600, width: '40%' }}>
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

      <SecurityPill ip={reference} />
    </Shell>
  )
}

export default PaymentReceiptEmail

