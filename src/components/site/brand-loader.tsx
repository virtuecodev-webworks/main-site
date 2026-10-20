'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { VirtueMark } from '@/components/brand/virtue-mark'

export interface BrandLoaderProps {
  label: string
}

/**
 * First-load architectural brand veil — the precision illustrated logo motion is the preloader.
 */
export function BrandLoader({ label }: { label: string }) {
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(false)
      return
    }

    // Play full smooth 1.5s architectural draw
    const timer = window.setTimeout(() => {
      setVisible(false)
    }, 1500)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        setVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [prefersReducedMotion])

  React.useEffect(() => {
    if (!visible) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [visible])

  const show = visible && !prefersReducedMotion

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="brand-loader"
          role="status"
          aria-live="polite"
          aria-label={label}
          onClick={() => setVisible(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background cursor-pointer select-none font-sans"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle clean grid backdrop */}
          <div
            aria-hidden
            className="grid-backdrop pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(circle_at_50%_50%,#000_50%,transparent_100%)]"
          />

          <div className="relative flex flex-col items-center gap-6">
            {/* Architectural Monogram Logo with frame-accurate drawing */}
            <div className="relative h-24 w-24">
              <VirtueMark className="h-full w-full shadow-lg" animate delay={0.05} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="font-sans font-bold text-lg tracking-tight text-foreground">
                Virtue <span className="text-primary">&amp;</span> Co.
              </span>
              <span className="font-sans text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">
                WEBWORKS
              </span>
            </motion.div>
          </div>

          {/* Minimal hairline progress indicator */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-border/40">
            <motion.div
              className="h-full bg-primary"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <span className="sr-only">{label}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
