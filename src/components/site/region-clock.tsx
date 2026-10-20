'use client'

import * as React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { getAvailability, nextOpening } from '@/lib/geo/availability'
import { cn } from '@/lib/utils'

/**
 * Region-aware clock components.
 *
 * These are the only surfaces that care what time it is. They deliberately render
 * a server-safe fallback first and only compute once mounted, for two reasons:
 *
 *   1. the pages are statically prerendered, so a "open now" baked at build time
 *      would be permanently wrong;
 *   2. the reader's timezone only exists in the browser, so computing it during
 *      SSR would guarantee a hydration mismatch.
 *
 * Everything is derived from the instant, so the server and the browser never
 * disagree about *whether* the studio is open — only about how to phrase it.
 */

interface Snapshot {
  open: boolean
  now: Date
  nextOpen: Date | null
}

function readSnapshot(): Snapshot {
  const now = new Date()
  const availability = getAvailability(now)
  return {
    open: availability.open,
    now,
    nextOpen: availability.open ? null : nextOpening(now),
  }
}

function formatDate(locale: string, date: Date, options: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch {
    return new Intl.DateTimeFormat('en', options).format(date)
  }
}

/** Wall-clock + zone abbreviation in the reader's own timezone. */
function clockWithZone(locale: string, date: Date): string {
  return formatDate(locale, date, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function useSnapshot(): Snapshot | null {
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null)

  React.useEffect(() => {
    const tick = () => setSnapshot(readSnapshot())
    // Deferred by a tick so the first paint stays the server-rendered fallback.
    const initial = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 30_000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [])

  return snapshot
}

export interface AvailabilityStatusProps {
  /** Shown before the clock is known — the static marketing line. */
  fallback: string
  className?: string
}

/**
 * The hero's live availability pill.
 *
 * Replaces a hard-coded "available" badge with the truth: whether the studio is
 * inside its office hours, plus the current time in the reader's zone. The
 * fallback keeps the original marketing line so the first paint is never empty.
 */
export function AvailabilityStatus({ fallback, className }: AvailabilityStatusProps) {
  const t = useTranslations('Region')
  const locale = useLocale()
  const snapshot = useSnapshot()

  const shell = cn(
    'flex max-w-[19rem] items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-elevation-2',
    className,
  )

  if (!snapshot) {
    return (
      <span className={shell}>
        <span className="relative flex size-2.5 shrink-0" aria-hidden>
          <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-emerald-500" />
          <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-[12.5px] font-medium">{fallback}</span>
      </span>
    )
  }

  const detail = 'Available anytime'

  return (
    <span className={shell} title="Worldwide 24/7 Availability">
      <span className="relative flex size-2.5 shrink-0" aria-hidden>
        <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-emerald-500" />
        <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[12.5px] font-medium">{detail}</span>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {clockWithZone(locale, snapshot.now)}
        </span>
      </span>
    </span>
  )
}

export interface RegionHoursNoteProps {
  className?: string
}

/**
 * Global availability note, confirming round-the-clock availability for global clients.
 */
export function RegionHoursNote({ className }: RegionHoursNoteProps) {
  const locale = useLocale()
  const snapshot = useSnapshot()

  return (
    <div className={cn('text-xs leading-relaxed text-muted-foreground', className)}>
      <p className="flex items-center gap-2 font-medium text-foreground">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
        Available anytime
      </p>
      <p className="mt-1">
        We collaborate with clients globally across all time zones. Reach out anytime.
      </p>
    </div>
  )
}
