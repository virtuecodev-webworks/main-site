'use client'

import * as React from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { usePathname } from '@/i18n/navigation'

/** Material-3 emphasised easing. */
const EASE = [0.2, 0, 0, 1] as const

/**
 * Route-change progress bar.
 *
 * A hairline gold sweep pinned to the top of the viewport that fires on every
 * client-side navigation, so a page swap never feels like a dead click. The
 * first paint is skipped (the brand veil owns that moment), and animation is
 * driven imperatively through `useAnimationControls` rather than state — which
 * keeps it out of the render path and out of `useEffect` state churn.
 */
export function RouteProgress() {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const controls = useAnimationControls()
  const isFirst = React.useRef(true)

  React.useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    if (prefersReducedMotion) return

    controls.set({ width: '0%', opacity: 1 })
    void controls.start({
      width: '100%',
      opacity: 0,
      transition: { duration: 0.9, ease: EASE, times: [0, 0.7, 1] },
    })
  }, [pathname, controls, prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-[3px] origin-left rounded-r-full bg-primary"
      initial={{ width: '0%', opacity: 0 }}
      animate={controls}
    />
  )
}
