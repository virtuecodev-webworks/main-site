'use client'

import { useTranslations } from 'next-intl'
import { VirtueGlassReveal } from '@/components/ui/glass-icon-reveal'
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
        'grid w-full place-items-center bg-[#f5f4f0] px-6 dark:bg-[#0a0a0a]',
        fullscreen ? 'min-h-dvh' : 'min-h-[70vh] py-20',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <VirtueGlassReveal
          loop
          speed={1.4}
          tileSize={148}
          className="size-44 sm:size-52"
          tuning={{
            present: 1.7,
            glide: 1.5,
          }}
        />
        <p className="text-[11px] font-medium tracking-[0.3em] text-muted-foreground uppercase">
          {t('loading')}
        </p>
        <span className="sr-only">{t('loading')}</span>
      </div>
    </div>
  )
}
