'use client'

import * as React from 'react'
import { Globe } from 'lucide-react'
import { useLocale } from 'next-intl'
import { getAvailability, nextOpening } from '@/lib/geo/availability'
import { cn } from '@/lib/utils'

export interface VisitorAvailabilityProps {
  variant?: 'pill' | 'inline' | 'card' | 'footer'
  className?: string
}

interface AvailabilitySnapshot {
  open: boolean
  visitorTime: string
  studioTime: string
  visitorZoneCity: string
  nextOpenText: string
}

function computeSnapshot(locale: string): AvailabilitySnapshot {
  const now = new Date()
  const availability = getAvailability(now)
  const openingDate = nextOpening(now)

  let visitorZone = 'UTC'
  try {
    visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    visitorZone = 'UTC'
  }

  const formatTime = (date: Date, timeZone: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone,
      }).format(date)
    } catch {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(date)
    }
  }

  const formatNextOpen = (date: Date, timeZone: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        timeZone,
      }).format(date)
    } catch {
      return 'Mon 09:00 WAT'
    }
  }

  const parts = visitorZone.split('/')
  const rawCity = parts[parts.length - 1]?.replace(/_/g, ' ') || 'Local'
  const visitorZoneCity = rawCity === 'UTC' ? 'UTC' : rawCity

  return {
    open: availability.open,
    visitorTime: formatTime(now, visitorZone),
    studioTime: formatTime(now, 'Africa/Lagos'),
    visitorZoneCity,
    nextOpenText: formatNextOpen(openingDate, visitorZone),
  }
}

/**
 * Displays accurate studio hours (WAT / UTC+1, Mon-Fri 09:00-18:00, Sat 10:00-14:00)
 * converted into the visitor's local timezone.
 */
export function VisitorAvailability({
  variant = 'inline',
  className,
}: VisitorAvailabilityProps) {
  const locale = useLocale()
  const [snapshot, setSnapshot] = React.useState<AvailabilitySnapshot | null>(null)

  React.useEffect(() => {
    setSnapshot(computeSnapshot(locale))
    const timer = window.setInterval(() => {
      setSnapshot(computeSnapshot(locale))
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [locale])

  const statusText = snapshot
    ? snapshot.open
      ? `Studio open now · ${snapshot.studioTime} WAT (${snapshot.visitorTime} ${snapshot.visitorZoneCity})`
      : `Studio closed · Opens ${snapshot.nextOpenText} (${snapshot.visitorZoneCity})`
    : 'Mon–Fri 09:00–18:00 WAT (UTC+1)'

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-[#f5f4f024] bg-[#0a0a0a80] px-3 py-1 text-[11px] font-medium text-[#f5f4f0]/85 backdrop-blur-md',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 rounded-full',
            snapshot?.open ? 'bg-emerald-400' : 'bg-amber-400',
          )}
        />
        <span className="tracking-[0.02em]">{statusText}</span>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={cn('flex flex-col gap-1 text-xs', className)}>
        <span className="font-medium text-[#f5f4f0]/90">
          {snapshot
            ? snapshot.open
              ? `Studio open now (${snapshot.studioTime} WAT · ${snapshot.visitorTime} your time)`
              : `Studio closed · Opens ${snapshot.nextOpenText} your time`
            : 'Mon–Fri 09:00–18:00 WAT (UTC+1)'}
        </span>
        <span className="text-[#f5f4f0]/55">
          Mon–Fri 09:00–18:00 · Sat 10:00–14:00 WAT (UTC+1)
        </span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3.5 py-2.5 text-xs',
          className,
        )}
      >
        <span className="flex items-center gap-2 font-medium text-foreground">
          <span
            aria-hidden="true"
            className={cn(
              'size-2 rounded-full',
              snapshot?.open ? 'bg-emerald-500' : 'bg-amber-500',
            )}
          />
          <span>
            {snapshot
              ? snapshot.open
                ? 'Studio Open Now'
                : `Opens ${snapshot.nextOpenText}`
              : 'Mon–Fri 09:00–18:00 WAT'}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Globe className="size-3 text-primary" aria-hidden="true" />
          {snapshot ? `${snapshot.visitorTime} (${snapshot.visitorZoneCity})` : 'WAT (UTC+1)'}
        </span>
      </div>
    )
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      <span className="label-mono text-current">
        ( &nbsp;&nbsp;{statusText}&nbsp;&nbsp; )
      </span>
    </span>
  )
}
