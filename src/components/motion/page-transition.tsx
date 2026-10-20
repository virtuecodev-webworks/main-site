'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/** Material-3 emphasised easing. */
const EASE = [0.2, 0, 0, 1] as const

/**
 * Subtle enter transition for route content. Kept intentionally short — page
 * transitions should feel like the site breathed, not like it navigated.
 */
export function PageTransition({ children, className }: { children: React.ReactNode; className?: string }) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
