'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'vcw:cookie-consent'

/**
 * Cookie consent notice.
 *
 * Shown until the visitor makes a choice, then remembered in `localStorage`.
 * The site only sets preference cookies (language, theme) and privacy-friendly
 * analytics, so "essential only" is a genuine, working option — not a dark
 * pattern that breaks the site.
 */
export function CookieConsent() {
  const t = useTranslations('Cookie')
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(STORAGE_KEY)
    } catch {
      /* Private mode: keep the notice hidden rather than blocking the page. */
      return
    }

    if (stored) return

    // Deferred to a microtask so this is a subscription callback rather than a
    // synchronous cascading render inside the effect body. The banner animates
    // in either way, so the delay is never perceptible.
    const id = window.setTimeout(() => setVisible(true), 0)
    return () => window.clearTimeout(id)
  }, [])

  function decide(value: 'all' | 'essential') {
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* Storage unavailable — the choice simply does not persist. */
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-label={t('title')}
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-elevation-3 sm:inset-x-auto sm:start-5 sm:bottom-5"
        >
          <div className="flex items-start gap-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-50 text-gold-700 dark:bg-gold-500/12 dark:text-gold-300">
              <Cookie className="size-4" aria-hidden />
            </span>

            <div className="flex-1">
              <h2 className="font-display text-sm font-semibold">{t('title')}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {t('body')}{' '}
                <Link href="/privacy" className="text-gold-700 underline-offset-4 hover:underline dark:text-gold-400">
                  {t('policy')}
                </Link>
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <Button size="sm" variant="gold" onClick={() => decide('all')}>
                  {t('accept')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => decide('essential')}>
                  {t('decline')}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
