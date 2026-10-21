'use client'

import * as React from 'react'
import { Globe } from 'lucide-react'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { locales, localeMeta, type AppLocale } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface LanguageSwitcherProps {
  label: string
  /** Compact icon-only trigger for the header; full list for the footer. */
  variant?: 'dropdown' | 'inline'
  className?: string
}

/**
 * Global language switcher.
 *
 * Every locale keeps an explicit URL prefix (`/en`, `/fr`, `/ar`) so switching
 * languages preserves the current page and remains shareable and indexable.
 */
export function LanguageSwitcher({
  label,
  variant = 'dropdown',
  className,
}: LanguageSwitcherProps) {
  const activeLocale = useLocale() as AppLocale
  const pathname = usePathname()
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  const change = React.useCallback(
    (next: AppLocale) => {
      if (next === activeLocale) return
      if (typeof document !== 'undefined') {
        const secure = window.location.protocol === 'https:' ? '; secure' : ''
        document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax${secure}`
      }
      startTransition(() => {
        router.replace(pathname, { locale: next })
      })
    },
    [activeLocale, pathname, router],
  )

  if (variant === 'inline') {
    return (
      <ul className={cn('flex flex-wrap gap-x-4 gap-y-2', className)}>
        {locales.map((code) => (
          <li key={code}>
            <button
              type="button"
              onClick={() => change(code)}
              aria-current={code === activeLocale ? 'true' : undefined}
              className={cn(
                'inline-flex min-h-6 items-center text-[13px] transition-colors',
                code === activeLocale
                  ? 'font-semibold text-gold-700'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {localeMeta[code].label}
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={label}
          className={cn('gap-2 px-3 text-muted-foreground hover:text-foreground', className)}
        >
          {pending ? (
            <VirtueSpinner className="size-4" />
          ) : (
            <Globe className="size-4" />
          )}
          <span className="text-[13px] font-medium">{localeMeta[activeLocale].label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => change(code)}
            className="justify-between"
            dir={localeMeta[code].dir}
          >
            <span className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {code}
              </span>
              <span className={code === activeLocale ? 'font-semibold' : undefined}>
                {localeMeta[code].label}
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground">{localeMeta[code].region}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
