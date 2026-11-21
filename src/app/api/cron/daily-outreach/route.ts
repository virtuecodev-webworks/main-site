import 'server-only'

import { NextResponse, type NextRequest } from 'next/server'
import { requireCronOrAdminApi } from '@/lib/outreach/auth'
import { OutreachDatabaseUnavailableError } from '@/lib/outreach/repository'
import { runDailyOutreach } from '@/lib/outreach/runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const auth = await requireCronOrAdminApi(request)
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status })
  }

  const triggeredBy =
    auth.session.source === 'cron'
      ? 'cron'
      : (auth.session.email ?? auth.session.userId ?? 'admin')

  try {
    const summary = await runDailyOutreach({
      mode: 'cron',
      triggeredBy,
    })

    return NextResponse.json({
      ok: true,
      summary,
    })
  } catch (err) {
    if (err instanceof OutreachDatabaseUnavailableError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 })
    }
    const message = err instanceof Error ? err.message : 'Scheduled daily outreach failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
