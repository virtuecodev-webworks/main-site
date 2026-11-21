import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminApi } from '@/lib/outreach/auth'
import {
  createOutreachRepository,
  OutreachDatabaseUnavailableError,
} from '@/lib/outreach/repository'
import { issuesToFieldErrors, runsQuerySchema } from '@/lib/outreach/validation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi()
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
  }

  const sp = request.nextUrl.searchParams
  const parsed = runsQuerySchema.safeParse({
    limit: sp.get('limit') ?? undefined,
    offset: sp.get('offset') ?? undefined,
    mode: sp.get('mode') ?? undefined,
    status: sp.get('status') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid runs query parameters',
        fieldErrors: issuesToFieldErrors(parsed.error.issues),
      },
      { status: 400 },
    )
  }

  try {
    const repo = createOutreachRepository()
    const runIdFilter = sp.get('runId')?.trim() || undefined
    const fetchWindow = Math.min(200, parsed.data.limit + parsed.data.offset + 50)

    const [rawRuns, dispatches] = await Promise.all([
      repo.listRuns(fetchWindow),
      repo.listDispatches({
        runId: runIdFilter,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
      }),
    ])

    let filteredRuns = rawRuns
    if (parsed.data.mode) {
      filteredRuns = filteredRuns.filter((run) => run.mode === parsed.data.mode)
    }
    if (parsed.data.status) {
      filteredRuns = filteredRuns.filter((run) => run.status === parsed.data.status)
    }

    const runs = filteredRuns.slice(
      parsed.data.offset,
      parsed.data.offset + parsed.data.limit,
    )

    return NextResponse.json({
      ok: true,
      runs,
      dispatches,
    })
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : 'Failed to list outreach runs'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
