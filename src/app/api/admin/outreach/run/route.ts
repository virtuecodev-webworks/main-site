import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/outreach/auth'
import { OutreachDatabaseUnavailableError } from '@/lib/outreach/repository'
import { runDailyOutreach } from '@/lib/outreach/runner'
import { issuesToFieldErrors, outreachTriggerSchema } from '@/lib/outreach/validation'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
  }

  let body: unknown = {}
  try {
    const rawText = await request.text()
    if (rawText.trim().length > 0) {
      body = JSON.parse(rawText)
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON request body' },
      { status: 400 },
    )
  }

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, error: 'Request body must be a JSON object' },
      { status: 400 },
    )
  }

  const parsed = outreachTriggerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid outreach trigger payload',
        fieldErrors: issuesToFieldErrors(parsed.error.issues),
      },
      { status: 400 },
    )
  }

  try {
    const summary = await runDailyOutreach({
      mode: parsed.data.mode,
      triggeredBy: auth.session.email ?? auth.session.userId,
      testRecipientEmail: parsed.data.testRecipientEmail,
      overrideCriteria: parsed.data.overrideCriteria,
      seedCandidates: parsed.data.seedCandidates,
    })

    return NextResponse.json({
      ok: true,
      summary,
    })
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : 'Outreach execution failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
