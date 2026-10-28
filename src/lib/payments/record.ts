import 'server-only'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { paymentReceiptEmail } from '@/lib/email/templates'
import { amountsMatch, type VerifiedTransaction } from './flutterwave'

export type RecordedStatus = 'successful' | 'failed' | 'cancelled' | 'pending'

export interface RecordResult {
  status: RecordedStatus
  reference: string
  amount: number
  currency: string
  /** Whether the ledger row was written (false when Supabase is unconfigured). */
  recorded: boolean
  /** True only on the first transition into `successful`. */
  receiptSent: boolean
}

function normaliseStatus(status: string): RecordedStatus {
  const value = status.toLowerCase()
  if (value === 'successful' || value === 'success') return 'successful'
  if (value === 'cancelled' || value === 'canceled') return 'cancelled'
  if (value === 'pending' || value === 'processing') return 'pending'
  return 'failed'
}

interface PreviousRow {
  id: string
  status: string
  amount: number
  currency: string
  purpose: string | null
  raw: Record<string, unknown> | null
}

/**
 * Records a transaction that has *already* been re-verified against the
 * Flutterwave API, and reconciles any linked `order_milestones` row.
 */
export async function recordVerifiedTransaction(
  verified: VerifiedTransaction,
): Promise<RecordResult> {
  const supabase = createSupabaseAdminClient()
  const attempted = normaliseStatus(verified.status)

  let previous: PreviousRow | null = null

  if (supabase && verified.txRef) {
    const { data } = await supabase
      .from('transactions')
      .select('id,status,amount,currency,purpose,raw')
      .eq('reference', verified.txRef)
      .maybeSingle()

    previous = (data as PreviousRow | null) ?? null
  }

  const amountOk = previous ? amountsMatch(Number(previous.amount), verified.amount) : true
  const currencyOk = previous ? previous.currency === verified.currency : true
  const mismatch = previous ? !amountOk || !currencyOk : false

  if (mismatch) {
    console.error(
      '[payments] amount/currency mismatch for',
      verified.txRef,
      { expected: previous, received: { amount: verified.amount, currency: verified.currency } },
    )
  }

  const status: RecordedStatus =
    attempted === 'successful' && !mismatch ? 'successful' : attempted

  const mergedRaw: Record<string, unknown> = {
    ...(previous?.raw ?? {}),
    ...((verified.raw ?? {}) as Record<string, unknown>),
  }

  const payload = {
    reference: verified.txRef,
    provider: 'flutterwave',
    provider_tx_id: verified.id ? String(verified.id) : null,
    amount: previous?.amount ?? verified.amount,
    currency: verified.currency,
    status,
    customer_email: verified.customerEmail,
    customer_name: verified.customerName,
    purpose: previous?.purpose ?? null,
    raw: mergedRaw,
    updated_at: new Date().toISOString(),
  }

  let recorded = false
  if (supabase && verified.txRef) {
    const { error } = previous
      ? await supabase.from('transactions').update(payload).eq('id', previous.id)
      : await supabase.from('transactions').insert(payload)

    if (error) console.error('[payments] recording failed:', error.message)
    else recorded = true

    // Reconcile linked order_milestones row when payment succeeds
    if (status === 'successful') {
      try {
        const milestoneId =
          typeof mergedRaw.milestoneId === 'string' && mergedRaw.milestoneId
            ? mergedRaw.milestoneId
            : null

        if (milestoneId) {
          await supabase
            .from('order_milestones')
            .update({ status: 'paid', reference: verified.txRef })
            .eq('id', milestoneId)
        } else {
          await supabase
            .from('order_milestones')
            .update({ status: 'paid' })
            .eq('reference', verified.txRef)
        }

        revalidatePath('/', 'layout')
      } catch (milestoneErr) {
        console.warn('[payments] milestone sync warning:', milestoneErr)
      }
    }
  }

  let receiptSent = false
  const alreadySuccessful = previous?.status === 'successful'

  if (status === 'successful' && !alreadySuccessful && verified.customerEmail) {
    const result = await sendEmail({
      to: verified.customerEmail,
      email: await paymentReceiptEmail({
        reference: verified.txRef,
        providerTxId: payload.provider_tx_id,
        amount: payload.amount,
        currency: verified.currency,
        customerName: verified.customerName,
        customerEmail: verified.customerEmail,
        purpose: payload.purpose,
        paidAt: verified.createdAt ?? new Date().toISOString(),
      }),
    })
    receiptSent = result.ok
  }

  return {
    status,
    reference: verified.txRef,
    amount: payload.amount,
    currency: verified.currency,
    recorded,
    receiptSent,
  }
}
