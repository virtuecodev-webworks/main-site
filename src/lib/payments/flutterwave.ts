import 'server-only'

/**
 * Flutterwave v3 integration.
 *
 * Client side:  the inline `checkout.flutterwave.com/v3.js` script (see
 *               src/components/site/payment-form.tsx). Card data never touches
 *               our servers.
 * Server side:  every charge is re-verified against the Flutterwave API before
 *               we record it, and webhooks are authenticated with `verif-hash`.
 */

const FLW_API = 'https://api.flutterwave.com/v3'

export function isFlutterwaveConfigured() {
  const key = process.env.FLUTTERWAVE_SECRET_KEY
  return Boolean(key && !key.includes('xxxx'))
}

export interface VerifiedTransaction {
  id: number
  txRef: string
  flwRef: string | null
  status: string
  amount: number
  currency: string
  chargedAmount: number
  customerEmail: string | null
  customerName: string | null
  paymentType: string | null
  createdAt: string | null
  raw: unknown
}

interface FlutterwaveEnvelope<T> {
  status: string
  message: string
  data: T
}

/**
 * Re-verifies a transaction by id. Never trust the browser's `callback` payload
 * or the webhook body on its own — both are attacker-controllable.
 */
export async function verifyTransaction(
  transactionId: string | number,
): Promise<VerifiedTransaction | null> {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY
  if (!secret) {
    console.warn('[flutterwave] FLUTTERWAVE_SECRET_KEY missing - cannot verify')
    return null
  }

  try {
    const response = await fetch(`${FLW_API}/transactions/${transactionId}/verify`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[flutterwave] verify failed with HTTP', response.status)
      return null
    }

    const payload = (await response.json()) as FlutterwaveEnvelope<Record<string, unknown>>
    const data = payload.data
    if (!data) return null

    return {
      id: Number(data.id),
      txRef: String(data.tx_ref ?? ''),
      flwRef: (data.flw_ref as string | null) ?? null,
      status: String(data.status ?? 'unknown'),
      amount: Number(data.amount ?? 0),
      currency: String(data.currency ?? 'USD'),
      chargedAmount: Number(data.charged_amount ?? data.amount ?? 0),
      customerEmail: (data.customer as { email?: string } | undefined)?.email ?? null,
      customerName: (data.customer as { name?: string } | undefined)?.name ?? null,
      paymentType: (data.payment_type as string | null) ?? null,
      createdAt: (data.created_at as string | null) ?? null,
      raw: data,
    }
  } catch (error) {
    console.error('[flutterwave] verify threw:', error instanceof Error ? error.message : error)
    return null
  }
}

/**
 * Flutterwave signs webhooks by echoing the dashboard's secret hash in the
 * `verif-hash` header. Compared in constant time.
 */
export function verifyWebhookSignature(headerValue: string | null) {
  const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH
  if (!expected || !headerValue) return false
  if (expected.length !== headerValue.length) return false

  let mismatch = 0
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ headerValue.charCodeAt(index)
  }
  return mismatch === 0
}

/** Amount tolerance when cross-checking the charged total (minor FX rounding). */
export function amountsMatch(a: number, b: number) {
  return Math.abs(a - b) < 0.02
}
