'use client'

import * as React from 'react'
import { Check, Globe2, Search } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRegion } from './region-provider'
import { countryName, listCountries } from '@/lib/geo/countries'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface CountrySwitcherProps {
  label: string
  /** `compact` is the header trigger; `full` is the footer's inline one. */
  variant?: 'compact' | 'full'
  className?: string
}

/**
 * The place to change country.
 *
 * A searchable dialog rather than a dropdown, because there are ~110 countries
 * and a menu with built-in typeahead fights any search field you put inside it.
 *
 * Choosing a country writes a cookie that outranks IP detection, and updates the
 * provider in place: currency, pricing and the availability clock follow
 * immediately, with no navigation and no round trip.
 */
export function CountrySwitcher({ label, variant = 'compact', className }: CountrySwitcherProps) {
  const t = useTranslations('Region')
  const locale = useLocale()
  const { country, currency, source, ready, setCountry, resetToDetected } = useRegion()

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const all = React.useMemo(() => listCountries(locale), [locale])

  const results = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return all
    return all.filter(
      (entry) =>
        entry.code.toLowerCase().includes(needle) ||
        entry.currency.toLowerCase().includes(needle) ||
        countryName(entry.code, locale).toLowerCase().includes(needle),
    )
  }, [all, locale, query])

  function choose(code: string) {
    setCountry(code)
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery('')
      }}
    >
      <DialogTrigger asChild>
        {variant === 'compact' ? (
          <Button
            variant="ghost"
            size="sm"
            /* The visible text is the country code, so the label has to contain
               it — otherwise voice control cannot act on what is on screen
               (WCAG 2.5.3). */
            aria-label={`${label}: ${country.code}`}
            className={cn('gap-2 px-2.5 text-muted-foreground hover:text-foreground', className)}
          >
            <Globe2 className="size-4" />
            <span className="font-mono text-[11px] font-semibold tracking-widest">
              {country.code}
            </span>
          </Button>
        ) : (
          <button
            type="button"
            className={cn(
              'inline-flex min-h-6 items-center gap-2.5 text-[13px] text-ink-300 transition-colors hover:text-gold-400',
              className,
            )}
          >
            <Globe2 className="size-4 shrink-0" />
            <span>{countryName(country.code, locale)}</span>
            <span className="font-mono text-[10px] tracking-widest text-ink-400 uppercase">
              {currency}
            </span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-[85dvh] flex-col gap-5">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
            autoComplete="off"
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-border py-3 text-[12px]">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 font-medium',
              ready && source === 'chosen'
                ? 'bg-gold-50 text-gold-800 dark:bg-gold-500/12 dark:text-gold-300'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {ready && source === 'chosen' ? t('chosen') : t('detected')}
          </span>
          {ready && source === 'chosen' ? (
            <button
              type="button"
              onClick={() => {
                resetToDetected()
                setOpen(false)
              }}
              className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t('reset')}
            </button>
          ) : null}
        </div>

        {results.length === 0 ? (
          <p className="flex-1 py-8 text-center text-sm text-muted-foreground">{t('noResults')}</p>
        ) : (
          <ul className="-mx-1 flex-1 overflow-y-auto pr-1">
            {results.map((entry) => {
              const active = entry.code === country.code
              return (
                <li key={entry.code}>
                  <button
                    type="button"
                    onClick={() => choose(entry.code)}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'bg-gold-50 text-gold-800 dark:bg-gold-500/12 dark:text-gold-300'
                        : 'hover:bg-muted',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="w-8 shrink-0 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        {entry.code}
                      </span>
                      <span className={cn('truncate text-sm', active && 'font-semibold')}>
                        {countryName(entry.code, locale)}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2.5">
                      <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                        {entry.currency}
                      </span>
                      {active ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <p className="text-[11.5px] leading-relaxed text-muted-foreground">{t('settlementNote')}</p>
      </DialogContent>
    </Dialog>
  )
}
