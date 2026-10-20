import { NextResponse } from 'next/server'
import { verifyTransaction, verifyWebhookSignature } from '@/lib/payments/flutterwave'
import { recordVerifiedTransaction } from '@/lib/payments/record'

/**
 * Flutterwave webhook receiver.
 *
 * Configure the endpoint in the Flutterwave dashboard and paste the same value
 * into `FLUTTERWAVE_WEBHOOK_HASH`. Flutterwave echoes that hash back in the
 * `verif-hash` header, which we compare in constant time.
 *
 * The body is never trusted: even with a valid signature we re-query the
 * transaction from Flutterwave's API before writing to the ledger. Non-2xx
 * responses tell Flutterwave to retry, so failures are reported honestly.
 */
export const runtime = 'nodejs'

interface WebhookBody {
  event?: string
  data?: {
    id?: number | string
    tx_ref?: string
    status?: string
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('verif-hash')
  if (!verifyWebhookSignature(signature)) {
    return new NextResponse('unauthorised', { status: 401 })
  }

  let body: WebhookBody
  try {
    body = (await request.json()) as WebhookBody
  } catch {
    return new NextResponse('invalid-json', { status: 400 })
  }

  const event = body.event
  const data = body.data

  // Acknowledge anything we don't act on so Flutterwave stops retrying.
  if (!data?.id || (event && event !== 'charge.completed')) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const verified = await verifyTransaction(data.id)
  if (!verified || !verified.txRef) {
    console.error('[flutterwave] webhook could not verify transaction', data.id)
    return new NextResponse('verification-failed', { status: 500 })
  }

  try {
    const result = await recordVerifiedTransaction(verified)
    return NextResponse.json({ ok: true, status: result.status, reference: result.reference })
  } catch (error) {
    console.error(
      '[flutterwave] webhook recording failed:',
      error instanceof Error ? error.message : error,
    )
    return new NextResponse('recording-failed', { status: 500 })
  }
}
