'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  MARK_CENTER,
  MARK_STROKES,
  MARK_TILE,
  MARK_V_SCALE,
  MARK_VIEWBOX,
} from '@/lib/brand/mark-geometry'

/** Emphasised easing. */
const EASE = [0.22, 1, 0.36, 1] as const

export interface VirtueMarkProps {
  className?: string
  /** Draw the mark in on mount. Disable inside dense lists. */
  animate?: boolean
  /** Accessible label. Pass an empty string for a purely decorative instance. */
  title?: string
  /** Milliseconds before the draw begins. */
  delay?: number
  /** Render only the "V", without the charcoal tile. */
  bare?: boolean
  /** Tone for light vs dark inverted surfaces (e.g. footer) */
  tone?: 'default' | 'invert'
}

/**
 * The Virtue & Co. square icon — the "V" in brand gold on a charcoal tile.
 *
 * This is the only place the mark appears as a symbol: the wordmark carries the
 * header, and this tile is reserved for the favicon, app icon, social avatar and
 * the first-load animation. A hairline appears in dark mode so the charcoal tile
 * still reads against the near-black page.
 *
 * Colours come from the design tokens, so the same component is correct in both
 * themes. The "V" is drawn with `pathLength` for a genuine self-drawing reveal.
 */
export function VirtueMark({
  className,
  animate = true,
  title = 'Virtue & Co. Webworks',
  delay = 0,
  bare = false,
  tone = 'default',
}: VirtueMarkProps) {
  const prefersReducedMotion = useReducedMotion()
  const shouldAnimate = animate && !prefersReducedMotion

  return (
    <svg
      viewBox={MARK_VIEWBOX}
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={cn('overflow-visible', className)}
    >
      {bare ? null : (
        <>
          <motion.rect
            x={MARK_TILE.x}
            y={MARK_TILE.y}
            width={MARK_TILE.size}
            height={MARK_TILE.size}
            rx={MARK_TILE.radius}
            className="fill-mark-tile"
            initial={shouldAnimate ? { opacity: 0, scale: 0.94 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: shouldAnimate ? delay : 0, ease: EASE }}
            style={{ transformOrigin: `${MARK_CENTER}px ${MARK_CENTER}px` }}
          />
          {/* Hairline, inset so it never bleeds past the viewBox. */}
          <rect
            x={0.5}
            y={0.5}
            width={MARK_TILE.size - 1}
            height={MARK_TILE.size - 1}
            rx={MARK_TILE.radius}
            fill="none"
            strokeWidth={1}
            className={tone === 'invert' ? 'stroke-white/25' : 'stroke-transparent dark:stroke-white/15'}
          />
        </>
      )}

      <g
        transform={`translate(${MARK_CENTER} ${MARK_CENTER}) scale(${MARK_V_SCALE}) translate(-${MARK_CENTER} -${MARK_CENTER})`}
      >
        {MARK_STROKES.map((stroke, idx) => (
          <motion.path
            key={stroke.order}
            d={stroke.d}
            fill="none"
            className={idx === 2 ? 'stroke-emerald' : 'stroke-primary'}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={shouldAnimate ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{
              duration: shouldAnimate ? 0.65 : 0,
              delay: shouldAnimate ? delay + 0.15 + idx * 0.12 : 0,
              ease: EASE,
            }}
          />
        ))}
      </g>
    </svg>
  )
}
