'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FAQ_KEYS } from '@/lib/studio'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'

export interface FaqProps {
  className?: string
  /** Render the section heading above the list. */
  withHeading?: boolean
}

/**
 * FAQ accordion.
 *
 * Built on plain buttons plus an `AnimatePresence` height reveal rather than a
 * Radix primitive, so it stays dependency-free. Questions come from `FAQ_KEYS`
 * so the copy and the render order can never drift.
 */
export function Faq({ className, withHeading = true }: FaqProps) {
  const t = useTranslations('Faq')
  const [open, setOpen] = React.useState<string | null>(FAQ_KEYS[0])

  return (
    <section className={cn('mx-auto w-full max-w-3xl px-5 sm:px-8', className)}>
      {withHeading ? (
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} align="center" className="mb-10" />
      ) : null}

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {FAQ_KEYS.map((key) => {
          const isOpen = open === key
          const panelId = `faq-panel-${key}`
          const buttonId = `faq-button-${key}`

          return (
            <li key={key}>
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : key)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-muted/60"
                >
                  <span className="font-sans text-[15px] font-semibold text-foreground sm:text-base">
                    {t(`items.${key}.q`)}
                  </span>
                  <span
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-full border transition-colors',
                      isOpen
                        ? 'border-gold-500 bg-gold-500 text-primary-foreground'
                        : 'border-border text-muted-foreground',
                    )}
                    aria-hidden
                  >
                    {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                  </span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {t(`items.${key}.a`)}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
