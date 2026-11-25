'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { VirtueMark } from '@/components/brand/virtue-mark'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { VantraButton } from '@/components/ui/vantra-button'
import { CommandPalette } from './command-palette'
import { CountrySwitcher } from './country-switcher'
import { LanguageSwitcher } from './language-switcher'
import { AccountLink } from './account-link'
import { PLACEHOLDER_PROJECTS } from '@/lib/portfolio'
import { SERVICES } from '@/lib/studio'
import { cn } from '@/lib/utils'

const PANEL_EASE = [0.22, 1, 0.36, 1] as const

interface SubItem {
  label: string
  href: string
}

export function SiteHeader() {
  const t = useTranslations('Nav')
  const tServices = useTranslations('Services')
  const pathname = usePathname()

  const [open, setOpen] = React.useState(false)
  const [openSub, setOpenSub] = React.useState<string | null>(null)
  const [scrolled, setScrolled] = React.useState(false)
  const [hovered, setHovered] = React.useState<number | null>(null)
  const headerRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    setOpen(false)
    setOpenSub(null)
  }, [pathname])

  React.useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const measure = () => {
      document.documentElement.style.setProperty(
        '--gr-nav',
        `${Math.round(header.getBoundingClientRect().height)}px`,
      )
    }

    const handleScroll = () => setScrolled(window.scrollY > 12)

    const observer = new ResizeObserver(measure)
    observer.observe(header)
    measure()
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const desktopLinks = [
    { label: t('portfolio'), href: '/portfolio' },
    { label: t('services'), href: '/services' },
    { label: t('about'), href: '/about' },
    { label: t('blog'), href: '/blog' },
    { label: 'Portal', href: '/portal' },
  ]

  const menuRows: Array<{
    key: string
    label: string
    href: string
    subItems?: SubItem[]
  }> = [
    {
      key: 'home',
      label: t('home'),
      href: '/',
    },
    {
      key: 'work',
      label: t('portfolio'),
      href: '/portfolio',
      subItems: PLACEHOLDER_PROJECTS.slice(0, 4).map((p) => ({
        label: p.title,
        href: `/portfolio/${p.slug}`,
      })),
    },
    {
      key: 'services',
      label: t('services'),
      href: '/services',
      subItems: [
        ...SERVICES.map((s) => ({
          label: tServices(`items.${s.key}.title`),
          href: `/services#${s.key}`,
        })),
        {
          label: 'Fixed-Price Package Catalog',
          href: '/services#services-catalog',
        },
        {
          label: 'Interactive Scope Estimator',
          href: '/services#estimator',
        },
      ],
    },
    {
      key: 'about',
      label: t('about'),
      href: '/about',
    },
    {
      key: 'journal',
      label: t('blog'),
      href: '/blog',
    },
    {
      key: 'contact',
      label: t('contact'),
      href: '/contact',
    },
    {
      key: 'payment',
      label: t('payment'),
      href: '/payment',
    },
  ]

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[120] focus:rounded-lg focus:bg-[var(--gr-ink)] focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:tracking-wider focus:text-[var(--gr-card)] focus:uppercase"
      >
        {t('skipToContent')}
      </a>

      {/* Backdrop scrim when menu is open */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: PANEL_EASE }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[4px]"
          />
        )}
      </AnimatePresence>

      {/* Goride-Inspired Floating Frosted Paper Navbar */}
      <header
        ref={headerRef}
        data-scrolled={scrolled || open}
        className="gr-nav gr-frame sticky top-0 z-50"
      >
        <div className="gr-nav-shell">
          <nav
            aria-label="Main"
            className="gr-nav-bar relative flex h-[60px] items-center justify-between gap-3 lg:h-[64px]"
          >
            {/* Brand Lockup */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="gr-focus flex shrink-0 items-center gap-2.5 rounded-md"
              aria-label="Virtue & Co. Webworks — Home"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--gr-accent)] p-1 text-[#14161B] shadow-xs">
                <VirtueMark className="size-full" animate={false} />
              </span>
              <span className="font-display text-[17px] font-bold tracking-[-0.03em] text-[var(--gr-ink)]">
                Virtue <span className="text-[var(--gr-accent)]">&amp;</span> Co.
              </span>
            </Link>

            {/* Centered Desktop Navigation with Sliding Hover Highlight & Active Dot */}
            <ul
              onPointerLeave={() => setHovered(null)}
              className="hidden items-center gap-0.5 lg:flex"
            >
              {desktopLinks.map((link, index) => {
                const active = isActive(link.href)
                return (
                  <li key={link.href} className="relative">
                    {hovered === index && (
                      <motion.span
                        layoutId="gr-nav-hover"
                        aria-hidden="true"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        className="gr-nav-hover absolute inset-0 rounded-[10px]"
                      />
                    )}
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      onPointerEnter={() => setHovered(index)}
                      onFocus={() => setHovered(index)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        'gr-focus relative flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-[14px] font-medium transition-colors duration-200',
                        active || hovered === index
                          ? 'text-[var(--gr-ink)] font-semibold'
                          : 'text-[var(--gr-ink)]/65',
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-[var(--gr-accent)]"
                        />
                      )}
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Right Controls */}
            <div className="flex shrink-0 items-center gap-1.5">
              <CountrySwitcher
                label={t('country')}
                variant="compact"
                className="hidden h-8 rounded-lg border border-[var(--gr-line)] bg-[var(--gr-card)]/60 px-2 text-[var(--gr-ink)] hover:bg-[var(--gr-card)] sm:inline-flex"
              />

              <LanguageSwitcher
                label={t('changeLanguage')}
                variant="pill"
                className="text-[var(--gr-ink)] [&_button]:text-[var(--gr-ink)]"
              />

              <ThemeToggle
                label={t('theme')}
                className="size-9 rounded-[10px] text-[var(--gr-ink)]/75 hover:bg-[var(--gr-ink)]/5 hover:text-[var(--gr-ink)]"
              />

              <AccountLink
                onNavigate={() => setOpen(false)}
                className="hidden h-10 rounded-[10px] px-3 text-[13.5px] font-medium text-[var(--gr-ink)]/80 hover:bg-[var(--gr-ink)]/5 hover:text-[var(--gr-ink)] sm:inline-flex"
              />

              <VantraButton
                href="/contact"
                size="sm"
                variant="dark"
                hoverLabel="Fixed quote"
                onClick={() => setOpen(false)}
                className="hidden sm:inline-flex"
              >
                {t('quote')}
              </VantraButton>

              <button
                type="button"
                aria-expanded={open}
                aria-controls="gr-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((prev) => !prev)}
                className="gr-focus grid size-10 cursor-pointer place-items-center rounded-[11px] border border-[var(--gr-line)] bg-[var(--gr-card)]/70 text-[var(--gr-ink)] transition-colors hover:bg-[var(--gr-card)]"
              >
                {open ? <X aria-hidden="true" className="size-4.5" /> : <Menu aria-hidden="true" className="size-4.5" />}
              </button>
            </div>
          </nav>

          {/* Expandable Navigation & Utility Panel */}
          <AnimatePresence>
            {open && (
              <motion.div
                id="gr-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: PANEL_EASE }}
                className="gr-menu mt-2 rounded-[20px] p-4 sm:p-5 text-[var(--gr-ink)]"
              >
                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
                  <ul className="divide-y divide-[var(--gr-line)]">
                    {menuRows.map((row) => {
                      const active = isActive(row.href)
                      const subExpanded = openSub === row.key
                      return (
                        <li key={row.key} className="py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              href={row.href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'gr-focus inline-flex items-center gap-2 rounded-lg px-2 py-1 text-[16px] font-semibold transition-colors',
                                active
                                  ? 'text-[var(--gr-ink)]'
                                  : 'text-[var(--gr-ink)]/80 hover:text-[var(--gr-ink)]',
                              )}
                            >
                              {active && (
                                <span
                                  aria-hidden="true"
                                  className="size-1.5 rounded-full bg-[var(--gr-accent)]"
                                />
                              )}
                              <span>{row.label}</span>
                            </Link>

                            {row.subItems && row.subItems.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenSub((prev) => (prev === row.key ? null : row.key))
                                }
                                aria-expanded={subExpanded}
                                aria-label={`Toggle ${row.label} submenu`}
                                className="flex size-8 items-center justify-center rounded-lg text-[var(--gr-grey)] transition-colors hover:bg-[var(--gr-panel)] hover:text-[var(--gr-ink)]"
                              >
                                <Plus
                                  className={cn(
                                    'size-4 transition-transform duration-300',
                                    subExpanded && 'rotate-[135deg]',
                                  )}
                                />
                              </button>
                            )}
                          </div>

                          <AnimatePresence initial={false}>
                            {row.subItems && subExpanded && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: PANEL_EASE }}
                                className="overflow-hidden ps-4"
                              >
                                <div className="mt-1.5 flex flex-col gap-1 border-s border-[var(--gr-line)] ps-3 py-1">
                                  {row.subItems.map((sub) => (
                                    <li key={sub.href}>
                                      <Link
                                        href={sub.href}
                                        onClick={() => setOpen(false)}
                                        className="block py-1 text-[13px] text-[var(--gr-grey)] hover:text-[var(--gr-ink)]"
                                      >
                                        {sub.label}
                                      </Link>
                                    </li>
                                  ))}
                                </div>
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </li>
                      )
                    })}
                  </ul>

                  <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--gr-line)] bg-[var(--gr-panel)] p-4">
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--gr-grey)]">
                        Region &amp; Quick Tools
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <CountrySwitcher
                          label={t('country')}
                          className="h-9 rounded-xl border border-[var(--gr-line)] bg-[var(--gr-card)] px-3 text-xs text-[var(--gr-ink)]"
                        />
                        <CommandPalette className="h-9 rounded-xl border-[var(--gr-line)] bg-[var(--gr-card)] text-xs text-[var(--gr-ink)]" />
                      </div>
                      <AccountLink
                        onNavigate={() => setOpen(false)}
                        className="w-full justify-between rounded-xl border border-[var(--gr-line)] bg-[var(--gr-card)] px-3.5 py-2.5 text-xs font-semibold text-[var(--gr-ink)]"
                      />
                    </div>

                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-between rounded-xl bg-[var(--gr-accent)] px-4 py-3 text-sm font-bold text-[#14161B] transition-transform active:scale-[0.99]"
                    >
                      <span>{t('quote')}</span>
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  )
}
