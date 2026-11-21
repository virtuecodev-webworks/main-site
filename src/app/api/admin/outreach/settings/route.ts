import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/outreach/auth'
import {
  createOutreachRepository,
  OutreachDatabaseUnavailableError,
} from '@/lib/outreach/repository'
import {
  issuesToFieldErrors,
  outreachSettingsUpdateSchema,
} from '@/lib/outreach/validation'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdminApi()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
  }

  try {
    const repo = createOutreachRepository()
    const [settings, sentToday] = await Promise.all([
      repo.getSettings(),
      repo.getSentCountToday(),
    ])

    return NextResponse.json({
      ok: true,
      settings,
      sentToday,
    })
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : 'Failed to load outreach settings'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
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

  const parsed = outreachSettingsUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid outreach settings payload',
        fieldErrors: issuesToFieldErrors(parsed.error.issues),
      },
      { status: 400 },
    )
  }

  try {
    const repo = createOutreachRepository()
    const settings = await repo.upsertSettings(parsed.data)
    const sentToday = await repo.getSentCountToday()

    return NextResponse.json({
      ok: true,
      settings,
      sentToday,
    })
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : 'Failed to update outreach settings'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
