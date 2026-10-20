'use client'

import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowUpRight,
  Boxes,
  Check,
  Code2,
  LayoutGrid,
  ShoppingBag,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Icon names are resolved here rather than passed in, because the copy is
 * authored in server components and a React component cannot cross that
 * boundary as a prop. A string key can.
 */
const ICONS: Record<string, LucideIcon> = {
  code: Code2,
  wordpress: LayoutGrid,
  wix: Store,
  cart: ShoppingBag,
  boxes: Boxes,
}

export interface FeaturePanelItem {
  id: string
  /** Key into `ICONS`; anything unknown falls back to a neutral glyph. */
  icon: string
  title: string
  description: string
  bullets: string[]
  imageUrl: string
  imageAlt: string
  /** The small card that floats over the photograph. */
  stat: { label: string; value: string }
}

export interface FeaturesPanelProps {
  items: FeaturePanelItem[]
  className?: string
}

/**
 * Feature list beside a live panel.
 *
 * Adapted from a supplied features-with-panel component with three changes:
 *
 *  1. **`framer-motion`, not `motion/react`.** The project already ships
 *     `framer-motion`; adding a second copy of the same library to get a shorter
 *     import path would duplicate ~40kB for nothing.
 *  2. **Flat, restrained surfaces.** The original relied on coloured bloom,
 *     `brightness` filters and blurred halos. Those are banned here, so the
 *     selected state is a gold hairline, a surface step and a decisive colour
 *     change instead.
 *  3. **Local photography.** The original pointed at Unsplash. Every image here
 *     comes from the site's own optimised manifest so there is no third-party
 *     request on a page view.
 *
 * The list and the panel stack on small screens: selection still works, and the
 * panel simply follows the list rather than sitting beside it.
 */
export function FeaturesPanel({ items, className }: FeaturesPanelProps) {
  const [activeId, setActiveId] = React.useState(items[0]?.id ?? '')
  const reduced = useReducedMotion()

  const active = items.find((item) => item.id === activeId) ?? items[0]
  const ActiveIcon = active ? (ICONS[active.icon] ?? Boxes) : Boxes

  if (!active) return null

  const transition = reduced ? { duration: 0 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className={cn('grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12', className)}>
      {/* ---------------------------------------------------------------- */}
      {/* Selector                                                          */}
      {/* ---------------------------------------------------------------- */}
      <ul className="flex flex-col gap-3" aria-label="Choose a service">
        {items.map((item) => {
          const Icon = ICONS[item.icon] ?? Boxes
          const selected = item.id === active.id

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                aria-pressed={selected}
                aria-controls="features-panel"
                className={cn(
                  'focus-ring group w-full rounded-2xl border p-5 text-left transition-colors duration-300',
                  selected
                    ? 'border-gold-400/70 bg-gold-50 dark:border-gold-500/45 dark:bg-gold-500/10'
                    : 'border-border bg-card hover:border-gold-300/70 hover:bg-muted/60',
                )}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-xl border transition-colors duration-300',
                      selected
                        ? 'border-gold-400/60 bg-background text-gold-700 dark:text-gold-300'
                        : 'border-border bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="size-[18px]" strokeWidth={1.9} aria-hidden />
                  </span>

                  <span className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[15.5px] leading-snug font-semibold">{item.title}</span>
                    <span className="text-[13.5px] leading-relaxed text-muted-foreground">
                      {item.description}
                    </span>
                  </span>

                  <ArrowUpRight
                    className={cn(
                      'ml-auto mt-1 size-4 shrink-0 transition-colors duration-300',
                      selected ? 'text-gold-600 dark:text-gold-300' : 'text-ink-400',
                    )}
                    aria-hidden
                  />
                </div>
              </button>
            </li>
          )
        })}
      </ul>

      {/* ---------------------------------------------------------------- */}
      {/* Panel                                                            */}
      {/* ---------------------------------------------------------------- */}
      <div id="features-panel" className="lg:sticky lg:top-24 lg:self-start">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, y: -12 }}
            transition={transition}
          >
            <Card className="gap-0 overflow-hidden p-0 shadow-elevation-2">
              <div className="relative aspect-[16/11] w-full overflow-hidden border-b border-border">
                <Image
                  src={active.imageUrl}
                  alt={active.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />
                <div aria-hidden className="absolute inset-0 bg-ink-950/25" />

                <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-xl border border-white/15 bg-ink-950/85 px-4 py-3 text-white">
                  <ActiveIcon className="size-4 shrink-0 text-gold-400" aria-hidden />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[11px] tracking-[0.14em] text-white/65 uppercase">
                      {active.stat.label}
                    </span>
                    <span className="truncate text-[13.5px] font-semibold">{active.stat.value}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-5 p-6 sm:p-7">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl leading-snug font-semibold">{active.title}</h3>
                  <p className="text-[14px] leading-relaxed text-muted-foreground">
                    {active.description}
                  </p>
                </div>

                <ul className="grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                  {active.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-[13.5px]">
                      <Check
                        className="mt-0.5 size-3.5 shrink-0 text-gold-600 dark:text-gold-400"
                        strokeWidth={2.6}
                        aria-hidden
                      />
                      <span className="text-muted-foreground">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
