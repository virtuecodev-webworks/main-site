'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function FloatingPaths({ position }: { position: number }) {
  // 10 streamlined GPU-accelerated paths per side (20 total) — distinct, crisp, mobile-optimized
  const paths = React.useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        d: `M-${340 - i * 16 * position} -${160 + i * 16}C-${
          340 - i * 16 * position
        } -${160 + i * 16} -${260 - i * 16 * position} ${180 - i * 16} ${
          140 - i * 16 * position
        } ${300 - i * 16}C${540 - i * 16 * position} ${420 - i * 16} ${
          640 - i * 16 * position
        } ${780 - i * 16} ${640 - i * 16 * position} ${780 - i * 16}`,
        width: 1.2 + i * 0.1,
      })),
    [position],
  )

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden transform-gpu will-change-transform [contain:paint]"
      aria-hidden="true"
    >
      <svg
        className="size-full text-slate-800/80 dark:text-gold-400/70"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        <motion.g
          animate={{
            x: position > 0 ? [-12, 12, -12] : [12, -12, 12],
            y: [-8, 8, -8],
          }}
          transition={{
            duration: 22,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="currentColor"
              strokeWidth={path.width}
              strokeOpacity={0.25 + path.id * 0.05}
              initial={{ pathLength: 0.35, pathOffset: 0, opacity: 0.5 }}
              animate={{
                pathLength: [0.35, 0.85, 0.35],
                pathOffset: [0, 1, 0],
                opacity: [0.45, 0.85, 0.45],
              }}
              transition={{
                duration: 20 + path.id * 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  )
}

interface BackgroundPathsHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function BackgroundPathsHero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: BackgroundPathsHeroProps) {
  const words = title.split(' ')

  return (
    <div
      className={cn(
        'relative flex min-h-[75vh] w-full items-center justify-center overflow-hidden bg-background px-4 py-20 sm:px-6 lg:min-h-[82vh]',
        className,
      )}
    >
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {eyebrow ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-gold-600 uppercase dark:text-gold-400"
          >
            <span className="size-1.5 rounded-full bg-gold-500 animate-pulse" />
            {eyebrow}
          </motion.div>
        ) : null}

        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          {words.map((word, wordIndex) => (
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: wordIndex * 0.08,
                duration: 0.6,
                ease: [0.2, 0, 0, 1],
              }}
              className="inline-block mr-2 sm:mr-3.5 last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: [0.2, 0, 0, 1] }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {subtitle}
          </motion.p>
        ) : null}

        {children ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.2, 0, 0, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {children}
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
