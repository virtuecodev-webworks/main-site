import { NextResponse } from 'next/server'
import { handleInquiry } from '@/lib/inquiries/handler'

/**
 * Public lead-capture endpoint.
 *
 * Mirrors the `submitInquiry` Server Action by sharing the exact same pipeline
 * (`handleInquiry`), so an integration hitting this route behaves identically
 * to the on-site contact form.
 *
 *   POST /api/contact { name, email, message, ... }
 */
export const runtime = 'nodejs'

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, code: 'error', message: 'invalid-json' }, { status: 400 })
  }

  const result = await handleInquiry(payload)

  if (result.ok) return NextResponse.json(result, { status: 201 })

  if (result.code === 'rate-limited') {
    return NextResponse.json(result, {
      status: 429,
      headers: result.retryAfterSeconds
        ? { 'Retry-After': String(result.retryAfterSeconds) }
        : undefined,
    })
  }

  const status = result.code === 'validation' ? 422 : 500
  return NextResponse.json(result, { status })
}
