'use client'

import * as React from 'react'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface VisitorAvailabilityProps {
  variant?: 'pill' | 'inline' | 'card' | 'footer'
  className?: string
}

interface TimeSnapshot {
  formattedTime: string
  cityLabel: string
  timeZone: string
  isDaytimeInVisitorZone: boolean
}

function computeVisitorTime(): TimeSnapshot {
  try {
    const now = new Date()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

    const formattedTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(now)

    const hourStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone,
    }).format(now)
    const hour = Number.parseInt(hourStr, 10)
    const isDaytimeInVisitorZone = Number.isNaN(hour) ? true : hour >= 7 && hour < 21

    const parts = timeZone.split('/')
    const rawCity = parts[parts.length - 1]?.replace(/_/g, ' ') || 'Global'
    const cityLabel = rawCity === 'UTC' ? 'Global Desk' : rawCity

    return {
      formattedTime,
      cityLabel,
      timeZone,
      isDaytimeInVisitorZone,
    }
  } catch {
    return {
      formattedTime: '09:00 AM',
      cityLabel: 'Global Desk',
      timeZone: 'UTC',
      isDaytimeInVisitorZone: true,
    }
  }
}

/**
 * Syncs studio availability to the visitor's local timezone and country cleanly without any green dots.
 */
export function VisitorAvailability({
  variant = 'inline',
  className,
}: VisitorAvailabilityProps) {
  const [snapshot, setSnapshot] = React.useState<TimeSnapshot | null>(null)

  React.useEffect(() => {
    setSnapshot(computeVisitorTime())
    const timer = window.setInterval(() => {
      setSnapshot(computeVisitorTime())
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const timeText = snapshot ? `${snapshot.formattedTime} (${snapshot.cityLabel})` : 'Local Desk Active'
  const scheduleLabel = snapshot?.isDaytimeInVisitorZone
    ? `Available now · ${snapshot.formattedTime} ${snapshot.cityLabel} time`
    : `Available now · Global Desk (${snapshot?.formattedTime ?? 'Live'} ${snapshot?.cityLabel ?? ''})`

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-full border border-[#f5f4f024] bg-[#0a0a0a80] px-3 py-1 text-[11px] font-medium text-[#f5f4f0]/85 backdrop-blur-md',
          className,
        )}
      >
        <span className="tracking-[0.03em]">{scheduleLabel}</span>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <div className="inline-flex items-center text-xs font-medium text-[#f5f4f0]">
          <span>Available Now · Synced to {snapshot?.cityLabel ?? 'Your Region'}</span>
        </div>
        <span className="text-xs text-[#f5f4f0]/55">
          Local clock: {timeText} · Mon – Sun Global Engineering Coverage
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
        <span className="font-medium text-foreground">
          Desk Online · {snapshot?.cityLabel ?? 'Global'}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <Globe className="size-3 text-primary" aria-hidden="true" />
          {snapshot ? snapshot.formattedTime : '09:00 – 21:00 Local'}
        </span>
      </div>
    )
  }

  return (
    <span className={cn('inline-flex items-center', className)}>
      <span className="label-mono text-current">
        ( &nbsp;&nbsp;{scheduleLabel}&nbsp;&nbsp; )
      </span>
    </span>
  )
}
