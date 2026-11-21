import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { verifyUnsubscribeToken } from '@/lib/outreach/deduplication'
import {
  createOutreachRepository,
  OutreachDatabaseUnavailableError,
} from '@/lib/outreach/repository'
import { issuesToFieldErrors, unsubscribeSchema } from '@/lib/outreach/validation'

export const dynamic = 'force-dynamic'

async function handleUnsubscribe(input: unknown) {
  const parsed = unsubscribeSchema.safeParse(input)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid unsubscribe request',
        fieldErrors: issuesToFieldErrors(parsed.error.issues),
      },
      { status: 400 },
    )
  }

  try {
    const repo = createOutreachRepository()
    const tokenVerified = parsed.data.token
      ? verifyUnsubscribeToken(parsed.data.email, parsed.data.token)
      : false

    const optOut = await repo.addOptOut(parsed.data.email, {
      reason: parsed.data.reason ?? null,
      source: 'unsubscribe',
    })

    return NextResponse.json({
      ok: true,
      email: optOut.email,
      optedOut: true,
      tokenVerified,
      optOut,
      message: 'You have been unsubscribed from future outreach emails.',
    })
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : 'Failed to process unsubscribe request'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  return handleUnsubscribe({
    email: sp.get('email') ?? '',
    token: sp.get('token') ?? undefined,
    reason: sp.get('reason') ?? undefined,
  })
}

export async function POST(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const contentType = (request.headers.get('content-type') ?? '').toLowerCase()

  let rawText = ''
  try {
    rawText = await request.text()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to read request body' },
      { status: 400 },
    )
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formParams = new URLSearchParams(rawText)
    return handleUnsubscribe({
      email: formParams.get('email') ?? sp.get('email') ?? '',
      token: formParams.get('token') ?? sp.get('token') ?? undefined,
      reason: formParams.get('reason') ?? sp.get('reason') ?? undefined,
    })
  }

  let bodyObj: Record<string, unknown> = {}
  if (rawText.trim().length > 0) {
    let parsedJson: unknown
    try {
      parsedJson = JSON.parse(rawText)
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON request body' },
        { status: 400 },
      )
    }

    if (parsedJson === null || typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
      return NextResponse.json(
        { ok: false, error: 'Request body must be a JSON object' },
        { status: 400 },
      )
    }
    bodyObj = parsedJson as Record<string, unknown>
  }

  return handleUnsubscribe({
    email: bodyObj.email !== undefined ? bodyObj.email : (sp.get('email') ?? ''),
    token: bodyObj.token !== undefined ? bodyObj.token : (sp.get('token') ?? undefined),
    reason: bodyObj.reason !== undefined ? bodyObj.reason : (sp.get('reason') ?? undefined),
  })
}
