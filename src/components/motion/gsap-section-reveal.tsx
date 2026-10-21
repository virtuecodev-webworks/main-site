'use client'

import * as React from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

export interface GsapSectionRevealProps {
  children: React.ReactNode
  className?: string
  /** Stagger children elements matching this selector (e.g., '.gsap-card') */
  staggerSelector?: string
  /** Delay in seconds */
  delay?: number
  /** Travel distance in px */
  y?: number
  /** Duration in seconds */
  duration?: number
}

export function GsapSectionReveal({
  children,
  className,
  staggerSelector,
  delay = 0,
  y = 30,
  duration = 0.8,
}: GsapSectionRevealProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    // Register plugin
    gsap.registerPlugin(ScrollTrigger)

    const el = containerRef.current
    if (!el) return

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const targets = staggerSelector ? el.querySelectorAll(staggerSelector) : el

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y,
        },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          stagger: staggerSelector ? 0.12 : 0,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [staggerSelector, delay, y, duration])

  return (
    <div ref={containerRef} className={cn('transform-gpu', className)}>
      {children}
    </div>
  )
}
