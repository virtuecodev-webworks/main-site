'use client'

import * as React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

const EASE = [0.2, 0, 0, 1] as const

export interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Seconds to delay the reveal — used to stagger cards in a grid. */
  delay?: number
  /** Vertical travel in pixels. */
  y?: number
  /** Reveal on mount instead of on scroll (for above-the-fold content). */
  immediate?: boolean
  as?: 'div' | 'section' | 'article' | 'li' | 'span'
}

/**
 * Scroll-triggered reveal. Wraps Framer Motion's `whileInView` with the
 * studio's emphasised easing and a hard respect for reduced-motion users.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  immediate = false,
  as = 'div',
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const MotionTag = motion[as]

  if (prefersReducedMotion) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  /*
   * Above-the-fold reveals travel but do not fade.
   *
   * A partially transparent element is not "painted" as far as Largest
   * Contentful Paint is concerned, so fading the hero in delays LCP until the
   * fade gets going. Fading also means that anything sampling the element
   * mid-animation reads the colours blended with whatever is behind it and
   * reports a contrast failure the settled page does not have. The entrance is
   * still animated — the content settles upward — and the first-load brand
   * overlay supplies the fade for the very first paint.
   */
  return (
    <MotionTag
      className={className}
      initial={{ opacity: immediate ? 1 : 0, y }}
      {...(immediate
        ? { animate: { y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-70px' } })}
      transition={{ duration: 0.62, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  )
}

/** Parent that staggers its `Reveal`-like children. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}
