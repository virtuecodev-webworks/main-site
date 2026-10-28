'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { VirtueMark } from '@/components/brand/virtue-mark'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { CommandPalette } from './command-palette'
import { CountrySwitcher } from './country-switcher'
import { LanguageSwitcher } from './language-switcher'
import { AccountLink } from './account-link'
import { PLACEHOLDER_PROJECTS } from '@/lib/portfolio'
import { SERVICES } from '@/lib/studio'
import { cn } from '@/lib/utils'

const PANEL_EASE = [0.645, 0.045, 0.355, 1] as const

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

  React.useEffect(() => {
    setOpen(false)
    setOpenSub(null)
  }, [pathname])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const pageTitle = React.useMemo(() => {
    if (pathname === '/') return t('homeTagline')
    if (pathname.startsWith('/about')) return t('aboutTagline')
    if (pathname.startsWith('/portfolio')) return t('portfolioTagline')
    if (pathname.startsWith('/services')) return t('servicesTagline')
    if (pathname.startsWith('/blog')) return t('blogTagline')
    if (pathname.startsWith('/contact')) return t('contactTagline')
    if (pathname.startsWith('/payment')) return t('paymentTagline')
    return 'Virtue & Co. Webworks'
  }, [pathname, t])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

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
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:rounded-lg focus:bg-[#0a0a0a] focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:tracking-wider focus:text-[#f5f4f0] focus:uppercase"
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
            transition={{ duration: 0.35, ease: PANEL_EASE }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
            className="header-bg fixed inset-0 z-40 bg-[#0a0a0a]/45 backdrop-blur-[6px]"
          />
        )}
      </AnimatePresence>

      {/* Vantra Floating Pill Header */}
      <header className="header pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-4 sm:px-5">
        <div className="nav_shell pointer-events-auto relative mx-auto w-full max-w-[30rem] sm:max-w-[32rem] overflow-hidden rounded-xl border border-[#f5f4f029] bg-[#0a0a0ac7] px-3.5 py-2 text-[#f5f4f0] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {/* Top Bar */}
          <div className="nav_bar flex min-h-[2.25rem] items-center justify-between gap-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="nav_brand group flex items-center gap-2.5 shrink-0"
              aria-label="Virtue & Co. Webworks — Home"
            >
              <span className="flex size-7 items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-90">
                <VirtueMark className="size-full" animate={false} tone="invert" />
              </span>
              <span className="font-display text-[13px] font-bold tracking-[-0.03em] text-[#f5f4f0] hidden xs:inline">
                VIRTUE <span className="text-primary">&amp;</span> CO.
              </span>
            </Link>

            <div className="nav_page-title truncate text-center font-sans text-[11px] font-medium tracking-[0.04em] text-[#f5f4f0]/80 uppercase">
              {pageTitle}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <LanguageSwitcher
                label={t('changeLanguage')}
                variant="pill"
              />

              <ThemeToggle
                label={t('theme')}
                className="size-8 rounded-lg text-[#f5f4f0]/75 hover:bg-white/10 hover:text-[#f5f4f0]"
              />

              <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-controls="vantra-nav-panel"
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                className="nav_toggle group flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'nav_menu-glyph relative block transition-all duration-300 ease-[cubic-bezier(0.215,0.61,0.355,1)]',
                    open ? 'size-4 rotate-45' : 'size-3 group-hover:size-4',
                  )}
                >
                  <span className="absolute top-0 left-0 size-[3px] rounded-[0.5px] bg-[#f5f4f0] transition-colors group-hover:bg-primary" />
                  <span className="absolute top-0 right-0 size-[3px] rounded-[0.5px] bg-primary" />
                  <span className="absolute bottom-0 left-0 size-[3px] rounded-[0.5px] bg-[#f5f4f0]" />
                  <span className="absolute right-0 bottom-0 size-[3px] rounded-[0.5px] bg-[#f5f4f0] transition-colors group-hover:bg-primary" />
                </span>
              </button>
            </div>
          </div>

          {/* Expandable Accordion Panel */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.nav
                id="vantra-nav-panel"
                aria-label="Primary navigation"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: PANEL_EASE }}
                className="nav_panel overflow-hidden"
              >
                <div className="pt-3 pb-1.5">
                  <ul className="nav_menu divide-y divide-[#f5f4f01c] border-t border-[#f5f4f01c]">
                    {menuRows.map((row, idx) => {
                      const active = isActive(row.href)
                      const subExpanded = openSub === row.key
                      return (
                        <motion.li
                          key={row.key}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.35,
                            delay: 0.04 * idx,
                            ease: PANEL_EASE,
                          }}
                          className="nav_menu-row py-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <Link
                              href={row.href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'nav_link inline-flex items-center gap-2.5 font-sans text-[15px] font-medium tracking-[-0.01em] transition-colors',
                                active
                                  ? 'text-primary'
                                  : 'text-[#f5f4f0] hover:text-primary',
                              )}
                            >
                              <span>{row.label}</span>
                              {active && (
                                <span
                                  aria-hidden="true"
                                  className="size-1.5 rounded-full bg-primary"
                                />
                              )}
                            </Link>

                            {row.subItems && row.subItems.length > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenSub((prev) => (prev === row.key ? null : row.key))
                                }
                                aria-expanded={subExpanded}
                                aria-label={`Toggle ${row.label} submenu`}
                                className="flex size-7 items-center justify-center rounded-md text-[#f5f4f0]/65 transition-colors hover:bg-white/10 hover:text-[#f5f4f0]"
                              >
                                <Plus
                                  className={cn(
                                    'size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)]',
                                    subExpanded && 'rotate-[135deg] text-primary',
                                  )}
                                />
                              </button>
                            )}
                          </div>

                          {/* Expandable Submenu */}
                          <AnimatePresence initial={false}>
                            {row.subItems && subExpanded && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: PANEL_EASE }}
                                className="overflow-hidden pl-3"
                              >
                                <div className="mt-2 flex flex-col gap-1.5 border-l border-[#f5f4f024] pl-3 py-1">
                                  {row.subItems.map((sub) => (
                                    <li key={sub.href}>
                                      <Link
                                        href={sub.href}
                                        onClick={() => setOpen(false)}
                                        className="nav_sub-link block py-0.5 text-[13px] text-[#f5f4f0]/65 transition-opacity hover:text-[#f5f4f0] hover:opacity-100"
                                      >
                                        {sub.label}
                                      </Link>
                                    </li>
                                  ))}
                                </div>
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </motion.li>
                      )
                    })}
                  </ul>

                  {/* Utility Bar inside Pill Menu */}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#f5f4f01c] pt-3 text-xs">
                    <div className="flex items-center gap-1">
                      <CountrySwitcher
                        label={t('country')}
                        className="h-8 px-2 text-[#f5f4f0]/75 hover:bg-white/10 hover:text-[#f5f4f0]"
                      />
                      <LanguageSwitcher
                        label={t('changeLanguage')}
                        variant="inline"
                        className="[&_button]:text-[#f5f4f0]/70 [&_button:hover]:text-primary"
                      />
                      <CommandPalette className="h-8 border-[#f5f4f024] bg-white/5 text-[#f5f4f0]/80 hover:bg-white/10 hover:text-[#f5f4f0]" />
                    </div>

                    <AccountLink
                      onNavigate={() => setOpen(false)}
                      className="h-8 rounded-lg bg-white/8 px-3 text-xs text-[#f5f4f0] hover:bg-white/15 hover:text-[#f5f4f0]"
                    />
                  </div>

                  {/* Bottom Panel CTA */}
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="nav_panel-cta group mt-3 flex w-full items-center justify-between rounded-lg bg-[#f5f4f0] px-4 py-3 text-[13px] font-medium tracking-[-0.01em] text-[#0a0a0a] transition-colors duration-300 hover:bg-primary hover:text-[#0a0a0a]"
                  >
                    <span>{t('quote')}</span>
                    <span className="flex size-5 items-center justify-center rounded-[4px] bg-[#0a0a0a] text-[#f5f4f0] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="size-3.5" />
                    </span>
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  )
}
