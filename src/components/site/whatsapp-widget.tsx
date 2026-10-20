'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { WHATSAPP_DIGITS } from '@/lib/constants'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Floating WhatsApp contact.
 *
 * Renders nothing when no number is configured, so an unset
 * `AGENCY.phone` can never ship a dead `wa.me` link. Positioned with logical
 * properties (`end-*`) so it mirrors correctly in the Arabic RTL layout.
 */
export function WhatsAppWidget() {
  const t = useTranslations('WhatsApp')
  const [open, setOpen] = React.useState(false)

  if (!WHATSAPP_DIGITS) return null

  const href = `https://wa.me/${WHATSAPP_DIGITS}`

  return (
    <div className="fixed end-5 bottom-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="w-[min(78vw,320px)] rounded-2xl border border-border bg-card p-5 shadow-elevation-3"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-sm font-semibold">{t('title')}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('close')}
                className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{t('body')}</p>

            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <MessageCircle className="size-4" aria-hidden />
              {t('cta')}
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t('label')}
        aria-expanded={open}
        className="grid size-13 place-items-center rounded-full bg-emerald-600 text-white shadow-elevation-3 transition-transform duration-200 hover:scale-105 hover:bg-emerald-700"
      >
        {open ? (
          <X className="size-5" aria-hidden />
        ) : (
          <MessageCircle className="size-6" aria-hidden />
        )}
      </button>
    </div>
  )
}
