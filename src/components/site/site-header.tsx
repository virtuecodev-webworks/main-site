'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { CommandPalette } from './command-palette'
import { CountrySwitcher } from './country-switcher'
import { LanguageSwitcher } from './language-switcher'
import { Button } from '@/components/ui/button'
import { AccountLink } from './account-link'
import { PRIMARY_NAV } from '@/lib/studio'
import { cn } from '@/lib/utils'

const EASE = [0.2, 0, 0, 1] as const

export function SiteHeader() {
  const t = useTranslations('Nav')
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)
  const [openedAt, setOpenedAt] = React.useState<string | null>(null)

  // The drawer is open only while we remain on the route it was opened from,
  // so client-side navigation dismisses it without an effect.
  const menuOpen = openedAt === pathname
  const toggleMenu = () =>
    setOpenedAt((current) => (current === pathname ? null : pathname))
  const closeMenu = () => setOpenedAt(null)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  React.useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

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
            ? 'border-b border-border bg-background/85 shadow-elevation-1 backdrop-blur-xl'
            : 'border-b border-transparent bg-background/0',
        )}
      >
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-8">
          <Link
            href="/"
            className="shrink-0 text-[17px] sm:text-[19px] transition-opacity duration-200 hover:opacity-75"
          >
            <VirtueWordmark />
          </Link>

          {/*
            The desktop nav appears at `xl`, not `lg`. Between 1024 and 1279 the
            wordmark, six localised nav labels, the country and theme controls,
            the account link and the call to action do not fit inside a
            `max-w-7xl` container: the header measured 124px too wide at 1024. A
            tablet or a small laptop gets the menu button instead, which already
            holds every one of those links.
          */}
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

          <div className="ml-auto flex items-center gap-1.5">
            <CommandPalette className="hidden md:inline-flex" />

            <CountrySwitcher label={t('country')} />

            <ThemeToggle label={t('theme')} />

            <AccountLink className="hidden min-w-[7.5rem] justify-center md:inline-flex" />

            <Button asChild variant="gold" size="sm" className="hidden sm:inline-flex">
              <Link href="/contact">
                {t('quote')}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={t('menu')}
              onClick={toggleMenu}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-nav"
            key="mobile-nav"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-x-0 top-18 z-40 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-border bg-background/97 backdrop-blur-xl xl:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-6" aria-label="Mobile">
              {PRIMARY_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-gold-50 text-gold-800 dark:bg-gold-500/12 dark:text-gold-300'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              ))}

              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-5">
                <CommandPalette className="h-11 w-full justify-center" />
                <div className="flex items-center justify-between gap-3">
                  <CountrySwitcher label={t('country')} />
                  <LanguageSwitcher label={t('changeLanguage')} variant="inline" />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Button asChild variant="gold" size="default" className="flex-1">
                    <Link href="/contact" onClick={closeMenu}>
                      {t('quote')}
                    </Link>
                  </Button>
                  <AccountLink
                    className="flex-1 justify-center"
                    onNavigate={closeMenu}
                    size="default"
                    variant="outline"
                  />
                </div>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
