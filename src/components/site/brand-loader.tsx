'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { VirtueGlassReveal } from '@/components/ui/glass-icon-reveal'

export interface BrandLoaderProps {
  label: string
}

/**
 * First-load architectural brand veil — WebGL2 liquid-glass Virtue monogram reveal.
 */
export function BrandLoader({ label }: BrandLoaderProps) {
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    if (prefersReducedMotion) return

    const timer = window.setTimeout(() => {
      setVisible(false)
    }, 2450)

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
    if (!visible || prefersReducedMotion) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [visible, prefersReducedMotion])

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
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#f5f4f0] font-sans select-none dark:bg-[#0a0a0a]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex flex-col items-center gap-3">
            {/* WebGL2 Liquid-Glass Virtue Logo Reveal */}
            <VirtueGlassReveal
              className="h-56 w-56 sm:h-64 sm:w-64"
              tileSize={220}
              loop={false}
              speed={1.45}
              tuning={{
                present: 1.85,
                glide: 1.65,
                startZoom: 2.3,
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
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
              transition={{ duration: 2.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <span className="sr-only">{label}</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
