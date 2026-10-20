'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Laptop, Tablet, Smartphone, ExternalLink, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DeviceMockupProps {
  desktopSrc?: string
  mobileSrc?: string
  alt?: string
  url?: string | null
  className?: string
}

/**
 * 21st.dev Device Mockup Switcher.
 * Allows interactive preview toggling between Desktop, Tablet, and Mobile viewports
 * for portfolio case studies.
 */
export function DeviceMockup({
  desktopSrc,
  mobileSrc,
  alt = 'Project preview',
  url,
  className,
}: DeviceMockupProps) {
  const [device, setDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  const currentSrc = (device === 'mobile' && mobileSrc) ? mobileSrc : (desktopSrc || mobileSrc)

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Device Toggle Controls */}
      <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/80 p-1 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => setDevice('desktop')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
            device === 'desktop'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Laptop className="size-3.5" />
          <span>Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => setDevice('tablet')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
            device === 'tablet'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Tablet className="size-3.5" />
          <span>Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => setDevice('mobile')}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
            device === 'mobile'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Smartphone className="size-3.5" />
          <span>Mobile</span>
        </button>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-1 border-l border-border pl-3 pr-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <span>Live site</span>
            <ExternalLink className="size-3" />
          </a>
        ) : null}
      </div>

      {/* Frame Container */}
      <div className="w-full flex justify-center py-2">
        <AnimatePresence mode="wait">
          {device === 'desktop' && (
            <motion.div
              key="desktop-frame"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-5xl overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl"
            >
              {/* Browser chrome header */}
              <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-destructive/60" />
                  <span className="size-2.5 rounded-full bg-primary/60" />
                  <span className="size-2.5 rounded-full bg-emerald/60" />
                </div>

                <div className="flex w-1/2 max-w-md items-center justify-center rounded-md border border-border/50 bg-background/80 px-3 py-1 text-[11px] text-muted-foreground">
                  <span className="truncate">{url || 'https://client-production.virtueweb.co'}</span>
                </div>

                <div className="size-3" />
              </div>

              {/* Viewport content */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/20">
                {currentSrc ? (
                  <img
                    src={currentSrc}
                    alt={alt}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted-foreground">
                    Interactive build preview
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {device === 'tablet' && (
            <motion.div
              key="tablet-frame"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[620px] overflow-hidden rounded-2xl border-4 border-muted-foreground/30 bg-card p-1 shadow-2xl ring-1 ring-border"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/20">
                {currentSrc ? (
                  <img
                    src={currentSrc}
                    alt={alt}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted-foreground">
                    Tablet viewport preview
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {device === 'mobile' && (
            <motion.div
              key="mobile-frame"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[340px] overflow-hidden rounded-[2.5rem] border-4 border-muted-foreground/40 bg-card p-2 shadow-2xl ring-1 ring-border"
            >
              {/* Notch pill */}
              <div className="mx-auto mb-2 h-4 w-28 rounded-full bg-muted-foreground/30" />

              <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[2rem] bg-muted/20">
                {currentSrc ? (
                  <img
                    src={currentSrc}
                    alt={alt}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-muted-foreground">
                    Mobile viewport preview
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
