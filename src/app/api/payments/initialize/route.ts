import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { isFlutterwaveConfigured } from '@/lib/payments/flutterwave'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { issuesToFieldErrors, paymentSchema } from '@/lib/validation'
import { createReference } from '@/lib/utils'

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

  const publicKey =
    process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY ||
    process.env.FLW_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY
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

  const purpose = [input.purpose, input.reference ? `Invoice ${input.reference}` : null]
    .filter(Boolean)
    .join(' · ')

  const supabase = createSupabaseAdminClient()
  if (supabase) {
    const rawMeta: Record<string, unknown> = {}
    if (input.milestoneId) rawMeta.milestoneId = input.milestoneId
    if (input.orderReference) rawMeta.orderReference = input.orderReference
    if (input.reference) rawMeta.invoiceReference = input.reference

    const { error } = await supabase.from('transactions').insert({
      reference: txRef,
      provider: 'flutterwave',
      amount: input.amount,
      currency: input.currency,
      status: 'pending',
      customer_email: input.customerEmail,
      customer_name: input.customerName,
      purpose: purpose || null,
      raw: rawMeta,
    })

    if (error) console.warn('[payments] could not record pending intent:', error.message)

    // Link the milestone reference to this txRef so verification marks it paid
    if (input.milestoneId) {
      await supabase
        .from('order_milestones')
        .update({ reference: txRef })
        .eq('id', input.milestoneId)
    }
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
