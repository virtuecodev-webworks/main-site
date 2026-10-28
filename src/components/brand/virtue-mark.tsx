'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  MARK_CENTER,
  MARK_TILE,
  MARK_VIEWBOX,
  VIRTUE_LEFT_WING,
  VIRTUE_RIGHT_WING,
} from '@/lib/brand/mark-geometry'

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
      className={cn('overflow-visible select-none', className)}
    >
      <defs>
        <linearGradient id="virtue-gold-l" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7d863" />
          <stop offset="100%" stopColor="#c5981d" />
        </linearGradient>
        <linearGradient id="virtue-gold-r" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#eabf38" />
          <stop offset="100%" stopColor="#b58814" />
        </linearGradient>
      </defs>

      {bare ? null : (
        <>
          {/* Obsidian Tile */}
          <motion.rect
            x={MARK_TILE.x}
            y={MARK_TILE.y}
            width={MARK_TILE.size}
            height={MARK_TILE.size}
            rx={MARK_TILE.radius}
            fill="#0a0a0a"
            initial={shouldAnimate ? { opacity: 0, scale: 0.94 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: shouldAnimate ? delay : 0, ease: EASE }}
            style={{ transformOrigin: `${MARK_CENTER}px ${MARK_CENTER}px` }}
          />
          {/* Architectural Hairline */}
          <rect
            x={0.5}
            y={0.5}
            width={MARK_TILE.size - 1}
            height={MARK_TILE.size - 1}
            rx={MARK_TILE.radius}
            fill="none"
            strokeWidth={1}
            className={tone === 'invert' ? 'stroke-white/25' : 'stroke-white/15'}
          />
        </>
      )}

      {/* Redesigned Architectural Dual-Wing Virtue "V" Monogram */}
      <motion.g
        initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, delay: shouldAnimate ? delay + 0.1 : 0, ease: EASE }}
        style={{ transformOrigin: '48px 48px' }}
      >
        <path d={VIRTUE_LEFT_WING} fill="url(#virtue-gold-l)" />
        <path d={VIRTUE_RIGHT_WING} fill="url(#virtue-gold-r)" />
      </motion.g>
    </svg>
  )
}
