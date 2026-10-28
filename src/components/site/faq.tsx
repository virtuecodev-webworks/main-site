'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FAQ_KEYS } from '@/lib/studio'
import { VantraButton } from '@/components/ui/vantra-button'
import { cn } from '@/lib/utils'

export interface FaqProps {
  className?: string
  withHeading?: boolean
}

const FAQ_EASE = [0.645, 0.045, 0.355, 1] as const

export function Faq({ className, withHeading = true }: FaqProps) {
  const t = useTranslations('Faq')
  const [open, setOpen] = React.useState<string | null>(FAQ_KEYS[0])

  return (
    <section id="faq" className={cn('section_faq padding-global', className)}>
      <div className="container-max">
        <div
          className={cn(
            'faq_layout grid grid-cols-1 gap-12',
            withHeading ? 'lg:grid-cols-2 lg:items-start' : 'max-w-4xl mx-auto',
          )}
        >
          {withHeading ? (
            <div className="lg:sticky lg:top-24">
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;{t('eyebrow')}&nbsp;&nbsp;&nbsp; )
              </span>
              <h2 className="heading-style-h2 mt-3 max-w-[14ch]">
                {t('title')}
              </h2>
              <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">
                Have a custom technical architecture or multi-phase replatform in mind? Speak directly with the engineers who will build it.
              </p>
              <div className="mt-7">
                <VantraButton href="/contact" variant="dark">
                  Ask us directly
                </VantraButton>
              </div>
            </div>
          ) : null}

          <ul className="faq_list border-t border-border">
            {FAQ_KEYS.map((key, idx) => {
              const isOpen = open === key
              const panelId = `faq-panel-${key}`
              const buttonId = `faq-button-${key}`

              return (
                <li key={key} className="faq_item border-b border-border">
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="faq_question group flex w-full items-center justify-between gap-6 py-7 text-left transition-colors sm:py-8"
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="label-mono-xs text-muted-foreground">
                          0{idx + 1}
                        </span>
                        <span className="font-display text-lg leading-[1.2] font-medium tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary sm:text-[1.375rem]">
                          {t(`items.${key}.q`)}
                        </span>
                      </span>

                      <span
                        aria-hidden="true"
                        className={cn(
                          'faq_icon flex size-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-500 ease-[cubic-bezier(0.645,0.045,0.355,1)]',
                          isOpen
                            ? 'rotate-[135deg] border-primary bg-primary text-[#0a0a0a]'
                            : 'border-border text-foreground group-hover:border-primary',
                        )}
                      >
                        <Plus className="size-4" />
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
                        transition={{ duration: 0.4, ease: FAQ_EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pb-8 pl-8 max-w-[54ch] text-[15px] leading-relaxed text-muted-foreground">
                          {t(`items.${key}.a`)}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
