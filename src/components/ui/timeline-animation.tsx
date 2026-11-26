'use client'

import * as React from 'react'
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'

type SupportedTag = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'section' | 'article'

const MOTION_TAGS = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  p: motion.p,
  span: motion.span,
  section: motion.section,
  article: motion.article,
} as const

const DEFAULT_VARIANTS: Variants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      delay: i * 0.12,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  hidden: {
    y: -16,
    opacity: 0,
    filter: 'blur(8px)',
  },
}

export interface TimelineContentProps {
  as?: SupportedTag
  animationNum?: number
  timelineRef: React.RefObject<HTMLElement | null>
  customVariants?: Variants
  className?: string
  children: React.ReactNode
}

/**
 * Scroll-triggered staggered reveal wrapper compatible with TimelineContent API.
 */
export function TimelineContent({
  as = 'div',
  animationNum = 0,
  timelineRef,
  customVariants = DEFAULT_VARIANTS,
  className,
  children,
}: TimelineContentProps) {
  const prefersReducedMotion = useReducedMotion()
  const isInView = useInView(timelineRef, { once: true, amount: 0.1 })

  const MotionTag = MOTION_TAGS[as] ?? motion.div

  if (prefersReducedMotion) {
    const PlainTag = as
    return <PlainTag className={className}>{children}</PlainTag>
  }

  return (
    <MotionTag
      custom={animationNum}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={customVariants}
      className={className}
    >
      {children}
    </MotionTag>
  )
}
