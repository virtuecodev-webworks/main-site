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
  /** 'pill' for the floating header, 'dropdown' for full button, 'inline' for lists. */
  variant?: 'pill' | 'dropdown' | 'inline'
  className?: string
}

/**
 * Senior Software Engineered Global Language Switcher.
 *
 * Implements bulletproof locale navigation:
 *   1. Updates `NEXT_LOCALE` cookie with 1-year persistence and SameSite=Lax.
 *   2. Extracts clean subpath without stale locale prefixes.
 *   3. Preserves URL search params and hashes.
 *   4. Uses deterministic document navigation to guarantee fresh server component
 *      re-hydration, correct `<html lang="..." dir="...">` direction, and zero RSC transition deadlocks.
 */
export function LanguageSwitcher({
  label,
  variant = 'pill',
  className,
}: LanguageSwitcherProps) {
  const activeLocale = useLocale() as AppLocale
  const [isChanging, setIsChanging] = React.useState(false)

  const change = React.useCallback(
    (next: AppLocale) => {
      if (next === activeLocale) return
      setIsChanging(true)
      if (typeof window !== 'undefined') {
        const secure = window.location.protocol === 'https:' ? '; secure' : ''
        document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax${secure}`

        const currentPath = window.location.pathname
        const segments = currentPath.split('/').filter(Boolean)
        const hasLeadingLocale = (locales as readonly string[]).includes(segments[0] ?? '')
        const subPath = hasLeadingLocale ? '/' + segments.slice(1).join('/') : currentPath
        const normalizedSub = subPath === '/' ? '' : subPath
        const targetUrl = `/${next}${normalizedSub}${window.location.search}${window.location.hash}`

        window.location.assign(targetUrl)
      }
    },
    [activeLocale],
  )

  if (variant === 'pill') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#f5f4f01f] bg-white/[0.04] px-2.5 text-[11px] font-mono tracking-wider text-[#f5f4f0]/85 transition-colors hover:border-primary/50 hover:bg-white/10 hover:text-[#f5f4f0]',
              className,
            )}
          >
            {isChanging ? (
              <VirtueSpinner className="size-3" />
            ) : (
              <Globe className="size-3 text-primary" aria-hidden="true" />
            )}
            <span className="font-semibold uppercase">{activeLocale}</span>
            <span className="text-[9px] text-[#f5f4f0]/40">▾</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 border border-white/15 bg-[#141416] p-1.5 text-[#f5f4f0] shadow-2xl backdrop-blur-md">
          <DropdownMenuLabel className="px-2 py-1 text-[10px] font-mono tracking-wider text-[#f5f4f0]/50 uppercase">
            {label}
          </DropdownMenuLabel>
          {locales.map((code) => {
            const isCurrent = code === activeLocale
            return (
              <DropdownMenuItem
                key={code}
                onSelect={() => change(code)}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-white/10 focus:bg-white/10 focus:text-primary',
                  isCurrent ? 'bg-primary/15 font-semibold text-primary' : 'text-[#f5f4f0]/80',
                )}
                dir={localeMeta[code].dir}
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-widest text-[#f5f4f0]/50 uppercase">
                    {code}
                  </span>
                  <span>{localeMeta[code].label}</span>
                </span>
                <span className="font-mono text-[10px] text-[#f5f4f0]/40">{localeMeta[code].region}</span>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

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
                  ? 'font-semibold text-primary'
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
          {isChanging ? (
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
