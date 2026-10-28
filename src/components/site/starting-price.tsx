'use client'

import { useLocale, useTranslations } from 'next-intl'
import { VantraButton } from '@/components/ui/vantra-button'
import { Reveal } from '@/components/motion/reveal'
import { useRegion } from './region-provider'
import { PRICE_FLOOR, PRICE_FLOOR_ANCHOR } from '@/lib/studio'
import { cn, formatMoney } from '@/lib/utils'

export interface StartingPriceProps {
  className?: string
  variant?: 'default' | 'pill' | 'inline'
}

export function StartingPrice({ className, variant = 'default' }: StartingPriceProps) {
  const t = useTranslations('Pricing')
  const locale = useLocale()
  const { currency } = useRegion()

  const local = PRICE_FLOOR[currency]
  const amount = local ?? PRICE_FLOOR[PRICE_FLOOR_ANCHOR]
  const shown = local === undefined ? PRICE_FLOOR_ANCHOR : currency

  const formatted = formatMoney(amount, shown, locale, { decimals: false })

  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-border bg-vantra-card-soft px-3 py-1.5 text-xs uppercase',
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="text-muted-foreground">{t('from')}</span>
        <span className="font-semibold text-foreground tabular-nums">
          {formatted} {shown}
        </span>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <span className={cn('text-xs uppercase tracking-wider text-muted-foreground tabular-nums', className)}>
        {t('from')} <strong className="font-semibold text-foreground">{formatted}</strong> {shown}
      </span>
    )
  }

  return (
    <Reveal>
      <div className={cn('flex flex-col items-center text-center', className)}>
        <p className="label-mono">(    {t('eyebrow')}    )</p>

        <h2 className="heading-style-h2 mt-4 max-w-2xl text-balance">{t('title')}</h2>

        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {t('subtitle')}
        </p>

        <p className="mt-9 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          <span className="label-mono-xs text-muted-foreground">{t('from')}</span>
          <span className="font-display text-5xl font-bold tracking-tight text-foreground tabular-nums sm:text-6xl">
            {formatted}
          </span>
          <span className="label-mono-xs text-muted-foreground">{shown}</span>
        </p>

        <p className="mt-5 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground">
          {t('note')}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <VantraButton href="/contact" variant="gold">
            {t('cta')}
          </VantraButton>
          <VantraButton href="/services" variant="dark">
            {t('secondary')}
          </VantraButton>
        </div>
      </div>
    </Reveal>
  )
}
