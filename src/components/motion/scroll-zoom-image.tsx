'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface ScrollZoomImageProps {
  src: string
  alt: string
  /** Passed straight to `next/image` so the right source is picked per breakpoint. */
  sizes: string
  priority?: boolean
  /** The frame dictates the height; the image always fills it. */
  frameClassName?: string
  /** How much larger than the frame the image starts, e.g. `0.14` = 14%. */
  intensity?: number
  /** Vertical drift in percent, which gives the move a direction. */
  drift?: number
}

/**
 * A photograph that zooms out as it travels up the viewport.
 *
 * The frame is a fixed box and the image inside it is scaled and nudged, so the
 * layout never shifts — only the crop does. `prefers-reduced-motion` drops the
 * transform rather than shortening it, which is the honest behaviour for a
 * person who has asked the system for less movement.
 */
export function ScrollZoomImage({
  src,
  alt,
  sizes,
  priority = false,
  frameClassName,
  intensity = 0.14,
  drift = 3,
}: ScrollZoomImageProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1 + intensity, 1])
  const y = useTransform(scrollYProgress, [0, 1], [`-${drift}%`, `${drift}%`])

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-elevation-3',
        frameClassName,
      )}
    >
      <motion.div
        style={reduced ? undefined : { scale, y }}
        className="absolute inset-0 will-change-transform"
      >
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  )
}
