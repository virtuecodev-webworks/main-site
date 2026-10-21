'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${
      189 + i * 6
    } -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${
      343 - i * 6
    }C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${
      875 - i * 6
    } ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(220,170,40,${0.08 + i * 0.02})`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="size-full text-foreground/20 dark:text-gold-400/25"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.025}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
            animate={{
              pathLength: 1,
              opacity: [0.25, 0.6, 0.25],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 22 + (path.id % 8) * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
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
        'relative flex min-h-[82vh] w-full items-center justify-center overflow-hidden bg-background px-4 py-20 sm:px-6 lg:min-h-[88vh]',
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
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-gold-600 uppercase dark:text-gold-400"
          >
            <span className="size-1.5 rounded-full bg-gold-500 animate-pulse" />
            {eyebrow}
          </motion.div>
        ) : null}

        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-7xl">
          {words.map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block mr-2 sm:mr-3.5 last:mr-0">
              {word.split('').map((letter, letterIndex) => (
                <motion.span
                  key={`${wordIndex}-${letterIndex}`}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: wordIndex * 0.08 + letterIndex * 0.02,
                    type: 'spring',
                    stiffness: 140,
                    damping: 22,
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          ))}
        </h1>

        {subtitle ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {subtitle}
          </motion.p>
        ) : null}

        {children ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.2, 0, 0, 1] }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {children}
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
