'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { VW_PATH } from '@/lib/brand/mark-geometry'

interface AmbientBackgroundProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  speed?: number
  align?: 'center' | 'left' | 'right' | 'top-right' | 'bottom-left'
  opacity?: number
}

const SIZES = {
  sm: 'size-[320px] md:size-[420px]',
  md: 'size-[480px] md:size-[640px]',
  lg: 'size-[600px] md:size-[800px]',
  xl: 'size-[720px] md:size-[960px]',
}

const ALIGNMENTS = {
  center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
  left: '-left-20 top-1/2 -translate-y-1/2',
  right: '-right-20 top-1/2 -translate-y-1/2',
  'top-right': '-right-24 -top-24',
  'bottom-left': '-left-24 -bottom-24',
}

/**
 * Ambient Architectural Monogram Wireframe Animation
 *
 * Subtle rotating geometric vector monogram that adds premium depth to page backgrounds.
 * Respects prefers-reduced-motion and keeps opacity low so text is 100% legible.
 */
export function AmbientBackground({
  className,
  size = 'lg',
  speed = 120,
  align = 'center',
  opacity,
}: AmbientBackgroundProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute select-none overflow-hidden',
        ALIGNMENTS[align],
        className,
      )}
      style={{
        opacity: opacity ?? undefined,
      }}
    >
      <motion.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                rotate: [0, 360],
              }
        }
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={cn(
          SIZES[size],
          'text-foreground opacity-[0.035] dark:opacity-[0.055] transition-opacity',
        )}
      >
        <svg viewBox="0 0 96 96" className="size-full stroke-current fill-none">
          {/* Subtle architectural precision guidelines */}
          <circle cx="48" cy="48" r="46" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.35" />
          <circle cx="48" cy="48" r="36" strokeWidth="0.5" opacity="0.3" />
          <circle cx="48" cy="48" r="22" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.25" />
          
          {/* Tile outline */}
          <rect
            x="12"
            y="12"
            width="72"
            height="72"
            rx="16"
            strokeWidth="0.75"
            strokeDasharray="4 4"
            opacity="0.35"
          />

          {/* Crosshair coordinate markers */}
          <line x1="48" y1="2" x2="48" y2="8" strokeWidth="0.75" opacity="0.4" />
          <line x1="48" y1="88" x2="48" y2="94" strokeWidth="0.75" opacity="0.4" />
          <line x1="2" y1="48" x2="8" y2="48" strokeWidth="0.75" opacity="0.4" />
          <line x1="88" y1="48" x2="94" y2="48" strokeWidth="0.75" opacity="0.4" />

          {/* Primary Monogram wireframe path: VW Monogram */}
          <g transform="translate(48,50) scale(0.72) translate(-50,-42)">
            <path d={VW_PATH} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </motion.div>
    </div>
  )
}
