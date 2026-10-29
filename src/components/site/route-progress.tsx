'use client'

import * as React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Global Top Loading Progress Bar.
 *
 * Responds in 0ms on any link tap, navigation click, or route transition.
 * Trickles progressively (15% -> 40% -> 70% -> 85%) while loading, then
 * shoots to 100% and smoothly fades out as soon as the route or action completes.
 */

// Global event bus so any in-page tab or action can trigger the top loading bar
type ProgressListener = (action: 'start' | 'stop') => void
const listeners = new Set<ProgressListener>()

export function startTopProgress() {
  listeners.forEach((fn) => fn('start'))
}

export function stopTopProgress() {
  listeners.forEach((fn) => fn('stop'))
}

export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [progress, setProgress] = React.useState(0)
  const [visible, setVisible] = React.useState(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const trickleRef = React.useRef<NodeJS.Timeout | null>(null)

  // Start progress trickle
  const start = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (trickleRef.current) clearTimeout(trickleRef.current)

    setVisible(true)
    setProgress(15)

    // Trickle simulation
    const trickle = (current: number) => {
      trickleRef.current = setTimeout(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev
          const next = prev + Math.max(2, (85 - prev) * 0.25)
          trickle(next)
          return next
        })
      }, 150)
    }
    trickle(15)
  }, [])

  // Complete progress and fade out
  const complete = React.useCallback(() => {
    if (trickleRef.current) clearTimeout(trickleRef.current)

    setProgress(100)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setProgress(0)
      }, 200)
    }, 250)
  }, [])

  // Listen to external manual triggers
  React.useEffect(() => {
    const listener: ProgressListener = (action) => {
      if (action === 'start') start()
      else complete()
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [start, complete])

  // Route change completion listener
  React.useEffect(() => {
    complete()
  }, [pathname, searchParams, complete])

  // Global instantaneous click / tap interceptor (responds in 0ms)
  React.useEffect(() => {
    function handleClick(e: MouseEvent | TouchEvent) {
      // Find closest anchor tag
      const target = e.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      const targetAttr = anchor.getAttribute('target')
      const download = anchor.getAttribute('download')

      // Ignore open in new tab, downloads, or external links
      if (targetAttr === '_blank' || download !== null) return
      if (!href) return

      // Ignore anchor hash changes on same page
      if (href.startsWith('#')) return

      // Handle modifier keys (CMD/Ctrl click)
      if (e instanceof MouseEvent && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
        return
      }

      // Check if it's an internal route
      const isInternal =
        href.startsWith('/') ||
        href.startsWith(window.location.origin) ||
        (!href.startsWith('http://') && !href.startsWith('https://') && !href.startsWith('mailto:') && !href.startsWith('tel:'))

      if (isInternal) {
        // Start loading bar immediately!
        start()
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
      if (timerRef.current) clearTimeout(timerRef.current)
      if (trickleRef.current) clearTimeout(trickleRef.current)
    }
  }, [start])

  if (!visible && progress === 0) return null

  return (
    <div
      role="progressbar"
      aria-label="Page navigation loading indicator"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className="pointer-events-none fixed inset-x-0 top-0 z-[99999] h-[3px] overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 250ms ease-in-out',
      }}
    >
      {/* Background track hint */}
      <div className="absolute inset-0 bg-gold-500/10" />

      {/* Active Gold Progress Bar */}
      <div
        className="h-full bg-primary relative transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 12px var(--color-primary, #dcaa28), 0 0 6px var(--color-primary, #dcaa28)',
        }}
      >
        {/* Glowing Head Point */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/40 blur-[2px] rounded-full" />
      </div>
    </div>
  )
}
