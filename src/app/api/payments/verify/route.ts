import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { verifyTransaction } from '@/lib/payments/flutterwave'
import { recordVerifiedTransaction } from '@/lib/payments/record'
import { clientKey, rateLimit } from '@/lib/rate-limit'

/**
 * Confirms a charge after Flutterwave's inline modal returns.
 *
 *   POST /api/payments/verify { transactionId, txRef }
 *
 * The browser's callback payload is treated as a *hint only*: the charge is
 * re-queried directly from Flutterwave before anything is written or emailed.
 */
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const requestHeaders = await headers()

  const limited = rateLimit(clientKey(requestHeaders, 'payment-verify'), {
    limit: 30,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.allowed) {
    return NextResponse.json(
      { ok: false, message: 'rate-limited', retryAfterSeconds: limited.retryAfterSeconds },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSeconds) } },
    )
  }

  let payload: { transactionId?: string | number; txRef?: string } = {}
  try {
    payload = (await request.json()) as typeof payload
  } catch {
    return NextResponse.json({ ok: false, message: 'invalid-json' }, { status: 400 })
  }

  const transactionId = payload.transactionId
  if (transactionId === undefined || transactionId === null || transactionId === '') {
    return NextResponse.json({ ok: false, message: 'missing-transaction' }, { status: 400 })
  }

  const verified = await verifyTransaction(transactionId)
  if (!verified || !verified.txRef) {
    return NextResponse.json({ ok: false, message: 'verification-failed' }, { status: 502 })
  }

  const result = await recordVerifiedTransaction(verified)

  return NextResponse.json({
    ok: true,
    status: result.status,
    reference: result.reference,
    amount: result.amount,
    currency: result.currency,
  })
}
