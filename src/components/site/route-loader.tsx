'use client'

import { useTranslations } from 'next-intl'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { cn } from '@/lib/utils'

/**
 * Suspense fallback used by the `[locale]` `loading.tsx`. Client-side so it can
 * read the active locale's copy from the provider.
 */
export function RouteLoader({
  className,
  fullscreen = false,
}: {
  className?: string
  fullscreen?: boolean
}) {
  const t = useTranslations('Common')

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'grid w-full place-items-center px-6',
        fullscreen ? 'min-h-dvh' : 'min-h-[70vh] py-24',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-5">
        <VirtueSpinner className="size-12 text-gold-500" />
        <p className="text-[11px] font-medium tracking-[0.3em] text-muted-foreground uppercase">
          {t('loading')}
        </p>
        <span className="sr-only">{t('loading')}</span>
      </div>
    </div>
  )
}
