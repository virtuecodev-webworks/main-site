import { setRequestLocale } from 'next-intl/server'
import { requireAdmin } from '@/lib/supabase/auth'
import { createOutreachRepository } from '@/lib/outreach/repository'
import {
  DEFAULT_OUTREACH_SETTINGS,
  type OutreachDispatch,
  type OutreachProspect,
  type OutreachRun,
  type OutreachSettings,
} from '@/lib/outreach/types'
import { OutreachConsole } from '@/components/admin/outreach-console'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminOutreachPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  await requireAdmin(locale)

  let settings: OutreachSettings = { ...DEFAULT_OUTREACH_SETTINGS }
  let sentToday = 0
  let initialProspects: OutreachProspect[] = []
  let initialRuns: OutreachRun[] = []
  let initialDispatches: OutreachDispatch[] = []

  try {
    const repo = createOutreachRepository()
    const [loadedSettings, loadedSentToday, loadedProspects, loadedRuns, loadedDispatches] =
      await Promise.all([
        repo.getSettingsOrDefault(),
        repo.getSentCountToday().catch(() => 0),
        repo.listProspects({ limit: 50 }).catch(() => []),
        repo.listRuns(20).catch(() => []),
        repo.listDispatches({ limit: 50 }).catch(() => []),
      ])

    settings = loadedSettings
    sentToday = loadedSentToday
    initialProspects = loadedProspects
    initialRuns = loadedRuns
    initialDispatches = loadedDispatches
  } catch {
    // Fallback to defaults when Supabase admin credentials are not configured
  }

  return (
    <div className="flex flex-col gap-7" data-testid="admin-outreach-page">
      <header className="flex flex-col gap-1.5">
        <span className="label-mono-xs text-primary">
          ( &nbsp;Autonomous Client Acquisition&nbsp; )
        </span>
        <h1 className="text-2xl font-semibold">AI Client Scouting &amp; Daily Outreach</h1>
        <p className="text-sm text-muted-foreground">
          Discover businesses lacking a modern website or exhibiting critical redesign issues, and
          dispatch personalized AI audit pitches on a daily schedule.
        </p>
      </header>

      <OutreachConsole
        initialSettings={settings}
        initialSentToday={sentToday}
        initialProspects={initialProspects}
        initialRuns={initialRuns}
        initialDispatches={initialDispatches}
      />
    </div>
  )
}
