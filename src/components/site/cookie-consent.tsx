'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'vcw:cookie-consent'

/**
 * Low-profile cookie consent bar.
 *
 * Kept compact on mobile so it never obscures the hero headline or primary CTA,
 * and delayed slightly after initial paint so first-screen engagement is smooth.
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

    const id = window.setTimeout(() => setVisible(true), 1200)
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          role="region"
          aria-label={t('title')}
          className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-md rounded-xl border border-border bg-card/95 p-3 shadow-elevation-3 backdrop-blur-md sm:inset-x-auto sm:start-5 sm:bottom-5 sm:rounded-2xl sm:p-4"
        >
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 hidden size-7 shrink-0 place-items-center rounded-full bg-gold-50 text-gold-700 dark:bg-gold-500/12 dark:text-gold-300 sm:grid">
                <Cookie className="size-3.5" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug text-muted-foreground">
                  <strong className="font-semibold text-foreground">{t('title')}:</strong>{' '}
                  {t('body')}{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-gold-700 underline underline-offset-4 hover:opacity-80 dark:text-gold-400"
                  >
                    {t('policy')}
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={() => decide('essential')}>
                {t('decline')}
              </Button>
              <Button size="sm" variant="gold" className="h-8 px-3 text-xs" onClick={() => decide('all')}>
                {t('accept')}
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
