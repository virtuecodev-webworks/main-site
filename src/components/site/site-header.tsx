'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { CommandPalette } from './command-palette'
import { CountrySwitcher } from './country-switcher'
import { LanguageSwitcher } from './language-switcher'
import { Button } from '@/components/ui/button'
import { AccountLink } from './account-link'
import { KineticNav } from './kinetic-nav'
import { PRIMARY_NAV } from '@/lib/studio'
import { cn } from '@/lib/utils'

const EASE = [0.2, 0, 0, 1] as const

export function SiteHeader() {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[110] focus:rounded-full focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {t('skipToContent')}
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300',
          scrolled
            ? 'border-b border-border bg-background/92 shadow-elevation-1 backdrop-blur-xl'
            : 'border-b border-border/40 bg-background/70 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-8">
          <Link
            href="/"
            className="shrink-0 text-[17px] sm:text-[19px] transition-opacity duration-200 hover:opacity-75"
          >
            <VirtueWordmark />
          </Link>

          <nav className="ml-4 hidden items-center gap-1 xl:flex" aria-label="Primary">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'relative rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-200',
                  isActive(item.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(item.labelKey)}
                {isActive(item.href) ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-2 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-primary to-emerald shadow-[0_0_8px_rgba(220,170,40,0.6)]"
                    transition={{ duration: 0.32, ease: EASE }}
                  />
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <CommandPalette className="hidden md:inline-flex" />

            <CountrySwitcher label={t('country')} />

            <ThemeToggle label={t('theme')} />

            <AccountLink className="hidden min-w-[7.5rem] justify-center md:inline-flex" />

            <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex rounded-full">
              <Link href="/contact">
                {t('quote')}
                <ArrowUpRight className="size-4 ml-1" />
              </Link>
            </Button>

            <KineticNav className="xl:hidden" />
          </div>
        </div>
      </header>
    </>
  )
}
