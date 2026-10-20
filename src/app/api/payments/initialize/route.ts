import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { isFlutterwaveConfigured } from '@/lib/payments/flutterwave'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { issuesToFieldErrors, paymentSchema } from '@/lib/validation'
import { createReference } from '@/lib/utils'

/**
 * Opens a payment intent.
 *
 *   1. rate limit + validate the browser's request
 *   2. mint a unique `tx_ref` and record a `pending` transaction
 *   3. hand the browser everything it needs to launch Flutterwave's modal
 *
 * No card data ever reaches this route — Flutterwave's inline script collects
 * it. The record created here is only confirmed by `/api/payments/verify` (or
 * the webhook) once Flutterwave's API has been re-queried.
 */
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const requestHeaders = await headers()

  const limited = rateLimit(clientKey(requestHeaders, 'payment-init'), {
    limit: 12,
    windowMs: 10 * 60 * 1000,
  })
  if (!limited.allowed) {
    return NextResponse.json(
      { ok: false, message: 'rate-limited', retryAfterSeconds: limited.retryAfterSeconds },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSeconds) },
      },
    )
  }

  if (!isFlutterwaveConfigured()) {
    return NextResponse.json({ ok: false, message: 'not-configured' }, { status: 503 })
  }

  const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY
  if (!publicKey || publicKey.includes('xxxx')) {
    return NextResponse.json({ ok: false, message: 'not-configured' }, { status: 503 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'invalid-json' }, { status: 400 })
  }

  const parsed = paymentSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'validation', fieldErrors: issuesToFieldErrors(parsed.error.issues) },
      { status: 422 },
    )
  }

  const input = parsed.data
  const txRef = createReference('VCW')

  // Keep the client's invoice reference visible for reconciliation.
  const purpose = [input.purpose, input.reference ? `Invoice ${input.reference}` : null]
    .filter(Boolean)
    .join(' · ')

  const supabase = createSupabaseAdminClient()
  if (supabase) {
    const { error } = await supabase.from('transactions').insert({
      reference: txRef,
      provider: 'flutterwave',
      amount: input.amount,
      currency: input.currency,
      status: 'pending',
      customer_email: input.customerEmail,
      customer_name: input.customerName,
      purpose: purpose || null,
    })

    if (error) console.warn('[payments] could not record pending intent:', error.message)
  }

  return NextResponse.json({
    ok: true,
    txRef,
    amount: input.amount,
    currency: input.currency,
    publicKey,
    redirectUrl: process.env.NEXT_PUBLIC_FLUTTERWAVE_REDIRECT_URL ?? null,
  })
}
