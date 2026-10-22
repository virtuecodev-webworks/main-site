'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MARK_CENTER, MARK_TILE, MARK_V_SCALE, MARK_VIEWBOX, VW_POLYGON } from '@/lib/brand/mark-geometry'

const EASE = [0.22, 1, 0.36, 1] as const

export interface VirtueMarkProps {
  className?: string
  animate?: boolean
  title?: string
  delay?: number
  bare?: boolean
  tone?: 'default' | 'invert'
}

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
      <defs>
        <linearGradient id="vw-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C84A" />
          <stop offset="100%" stopColor="#B8922A" />
        </linearGradient>
      </defs>

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

      <motion.g
        transform={`translate(${MARK_CENTER} ${MARK_CENTER + 2}) scale(${MARK_V_SCALE}) translate(-50 -42)`}
        initial={shouldAnimate ? { opacity: 0, scale: 0.88 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: shouldAnimate ? delay + 0.15 : 0, ease: EASE }}
        style={{ transformOrigin: `50px 42px` }}
      >
        <polygon
          points={VW_POLYGON}
          fill="url(#vw-gold)"
        />
      </motion.g>
    </svg>
  )
}
