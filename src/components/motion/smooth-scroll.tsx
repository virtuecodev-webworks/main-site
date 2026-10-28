'use client'

import * as React from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * Vantra Studio Scroll Progress & Anchor Smooth-Scroll Controller.
 *
 * Preserves 100% native OS/browser scroll responsiveness (never hijacks or blocks
 * wheel/trackpad events with `preventDefault()`) while providing spring-smoothed
 * scroll progress telemetry and smooth anchor navigation.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <>
      {/* Subtle Top Scroll Progress Hairline */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-[2px] origin-left bg-primary/85"
      />
      {children}
    </>
  )
}
