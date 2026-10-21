/**
 * Template 5 — Payment Receipt
 * Triggered: After Flutterwave webhook confirms payment
 */
import * as React from 'react'
import { Shell, EyebrowLabel, Heading, BodyText, Divider, GoldButton, DataTable } from './base/shell'
import { GOLD, EMERALD, WELL, BORDER_INNER, TEXT, TEXT_MUTED, TEXT_DIM, PORTAL } from './base/tokens'
import { AGENCY } from '@/lib/constants'

export interface PaymentReceiptProps {
  reference: string
  transactionId?: string | null
  amount: string          // pre-formatted, e.g. "$3,500.00"
  purpose?: string | null
  paidAt: string
  customerName?: string | null
  customerEmail: string
}

export function PaymentReceiptEmail({
  reference, transactionId, amount, purpose, paidAt, customerName, customerEmail,
}: PaymentReceiptProps) {
  const display = customerName ?? customerEmail

  return (
    <Shell
      preheader={`Payment confirmed: ${amount} · Ref ${reference}`}
      badge="RECEIPT"
      badgeColor="emerald"
    >
      {/* ── Amount hero block ── */}
      <div style={{ background: WELL, border: `1px solid ${BORDER_INNER}`, borderRadius: 16, padding: '24px 28px', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: GOLD, textTransform: 'uppercase', marginBottom: 8 }}>
          PAYMENT CONFIRMED
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, color: TEXT, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {amount}
        </div>
        <div style={{ marginTop: 8, display: 'inline-block', padding: '4px 12px', background: 'rgba(20,160,108,0.12)', border: `1px solid rgba(20,160,108,0.28)`, borderRadius: 999, fontSize: 11, fontWeight: 700, color: EMERALD, letterSpacing: '0.06em' }}>
          ✓ PAYMENT VERIFIED
        </div>
      </div>

      <EyebrowLabel>TRANSACTION DETAILS</EyebrowLabel>

      <DataTable rows={[
        ['Reference', reference],
        ['Transaction ID', transactionId ?? null],
        ['Amount Paid', amount],
        ['Purpose', purpose ?? null],
        ['Paid at', paidAt],
        ['Payer', display],
      ]} />

      <Divider />

      <BodyText>
        This email is your official payment receipt. Keep it for your accounting
        records. If you need a formal invoice PDF with VAT/tax details, reply directly
        to this email and we'll prepare one within the hour.
      </BodyText>

      <GoldButton href={PORTAL}>Track Your Project in the Portal</GoldButton>

      <p style={{ margin: '20px 0 0', fontSize: 12.5, lineHeight: '1.65', color: TEXT_DIM }}>
        Questions about this payment? Reply to this email —
        a member of the {AGENCY.name} studio team will respond within 1 business day.
      </p>
    </Shell>
  )
}

export default PaymentReceiptEmail
