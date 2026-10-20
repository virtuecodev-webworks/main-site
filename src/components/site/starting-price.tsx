'use client'

import { ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { useRegion } from './region-provider'
import { PRICE_FLOOR, PRICE_FLOOR_ANCHOR } from '@/lib/studio'
import { cn, formatMoney } from '@/lib/utils'

export interface StartingPriceProps {
  className?: string
}

/**
 * What the studio charges, stated plainly — in the visitor's own currency.
 *
 * A single published floor rather than a table of invented tiers. Only currencies
 * with an explicitly published figure are shown locally; everything else falls
 * back to the USD anchor and says so, because a converted price is a number we
 * could not honour on an invoice.
 */
export function StartingPrice({ className }: StartingPriceProps) {
  const t = useTranslations('Pricing')
  const locale = useLocale()
  const { currency } = useRegion()

  const local = PRICE_FLOOR[currency]
  const amount = local ?? PRICE_FLOOR[PRICE_FLOOR_ANCHOR]
  const shown = local === undefined ? PRICE_FLOOR_ANCHOR : currency
  const isAnchor = local === undefined

  return (
    <Reveal>
      <div className={cn('flex flex-col items-center text-center', className)}>
        <p className="font-sans text-[11px] font-medium tracking-[0.28em] text-gold-700 uppercase dark:text-gold-300">
          {t('eyebrow')}
        </p>

        <h2 className="mt-4 max-w-2xl text-2xl leading-tight font-semibold text-balance sm:text-3xl">
          {t('title')}
        </h2>

        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {t('subtitle')}
        </p>

        <p className="mt-9 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {t('from')}
          </span>
          <span className="font-sans text-5xl font-bold sm:text-6xl text-foreground">
            {formatMoney(150, 'USD', 'en-US', { decimals: false })}
          </span>
          <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            USD
          </span>
        </p>

        <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
          {t('note')}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="gold" size="lg">
            <Link href="/contact">
              {t('cta')}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">{t('secondary')}</Link>
          </Button>
        </div>
      </div>
    </Reveal>
  )
}
