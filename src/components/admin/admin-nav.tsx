'use client'

import * as React from 'react'
import {
  ArrowUpRight,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Palette,
  Plus,
  User,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { NotificationBellSheet } from '@/components/portal/notification-bell-sheet'
import { signOutAction } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/admin', labelKey: 'overview', icon: LayoutDashboard, exact: true, adminOnly: true },
  { href: '/admin/orders', labelKey: 'orders', icon: FolderKanban, exact: false, adminOnly: false },
  { href: '/admin/portfolio', labelKey: 'portfolio', icon: Images, exact: false, adminOnly: true },
  { href: '/admin/inquiries', labelKey: 'inquiries', icon: Inbox, exact: false, adminOnly: true },
  { href: '/admin/newsletter', labelKey: 'newsletter', icon: Mail, exact: false, adminOnly: true },
  { href: '/admin/design', labelKey: 'design', icon: Palette, exact: false, adminOnly: true },
] as const

export function AdminNav({
  locale,
  email,
  name,
  isAdmin,
}: {
  locale: string
  email: string | null
  name: string | null
  isAdmin: boolean
}) {
  const t = useTranslations('Admin.nav')
  const tAdmin = useTranslations('Admin')
  const tNav = useTranslations('Nav')
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const visible = ITEMS.filter((item) => !item.adminOnly || isAdmin)
  const initial = (name?.[0] || email?.[0] || 'A').toUpperCase()

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MOBILE TOP APP BAR (Screen 1 Inspiration)                   */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur-md lg:hidden">
        {/* Left: Admin avatar with active status dot */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Admin Menu"
            className="relative flex size-9 items-center justify-center rounded-full bg-primary/20 font-display text-xs font-bold text-primary border border-primary/30"
          >
            <span>{initial}</span>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card animate-pulse" />
          </button>

          <Link href="/" className="flex items-center">
            <VirtueWordmark tone="default" />
          </Link>
        </div>

        {/* Center/Right Controls: Notification Bell, Theme & Drawer Menu */}
        <div className="flex items-center gap-2">
          <NotificationBellSheet />

          <ThemeToggle
            label={tNav('theme')}
            className="size-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground transition-all active:scale-95"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MOBILE SLIDE-OUT MENU DRAWER (< lg)                         */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-md lg:hidden">
          <div className="flex h-full flex-col justify-between bg-card p-6 border-b border-border shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <VirtueWordmark tone="default" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Identity Pill */}
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                {name ? (
                  <p className="font-display text-sm font-bold text-foreground">{name}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">{email ?? '-'}</p>
                <span className="label-mono-xs mt-2 inline-block text-primary">
                  {isAdmin ? tAdmin('roles.admin') : tAdmin('roles.agent')} Console
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-2">
                {visible.map((item) => {
                  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground',
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <span>{t('viewSite')}</span>
                <ArrowUpRight className="size-3.5" />
              </Link>

              <form action={signOutAction}>
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="next" value={`/${locale}/login`} />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 py-2.5 text-xs font-semibold text-destructive hover:bg-destructive/20"
                >
                  <LogOut className="size-4" />
                  <span>{tAdmin('signOut')}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MOBILE BOTTOM APP DOCK WITH ELEVATED '+' (Mockup Inspired)   */}
      {/* ============================================================== */}
      <nav
        aria-label="Mobile Admin Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card/95 px-3 py-2 backdrop-blur-lg lg:hidden"
      >
        {/* Tab 1: Overview */}
        <Link
          href="/admin"
          className={cn(
            'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors w-14',
            pathname === '/admin' ? 'text-primary font-bold' : 'text-muted-foreground',
          )}
        >
          <LayoutDashboard className="size-5" />
          <span>Overview</span>
        </Link>

        {/* Tab 2: Orders */}
        <Link
          href="/admin/orders"
          className={cn(
            'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors w-14',
            pathname.startsWith('/admin/orders') ? 'text-primary font-bold' : 'text-muted-foreground',
          )}
        >
          <FolderKanban className="size-5" />
          <span>Orders</span>
        </Link>

        {/* CENTER ELEVATED ACTION BUTTON (+) — Quickly Add Portfolio Project */}
        <Link
          href="/admin/portfolio/new"
          aria-label="Add New Showcase Project"
          className="-mt-6 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-[#0a0a0a] shadow-lg shadow-gold-500/25 ring-4 ring-background transition-transform active:scale-95"
        >
          <Plus className="size-6 stroke-[2.5]" />
        </Link>

        {/* Tab 3: Inquiries */}
        <Link
          href="/admin/inquiries"
          className={cn(
            'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors w-14',
            pathname.startsWith('/admin/inquiries') ? 'text-primary font-bold' : 'text-muted-foreground',
          )}
        >
          <Inbox className="size-5" />
          <span>Inquiries</span>
        </Link>

        {/* Tab 4: Portfolio */}
        <Link
          href="/admin/portfolio"
          className={cn(
            'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors w-14',
            pathname.startsWith('/admin/portfolio') ? 'text-primary font-bold' : 'text-muted-foreground',
          )}
        >
          <Images className="size-5" />
          <span>Portfolio</span>
        </Link>
      </nav>

      {/* ============================================================== */}
      {/* 4. DESKTOP STICKY SIDEBAR (>= lg)                              */}
      {/* ============================================================== */}
      <aside className="hidden lg:flex flex-col justify-between gap-8 rounded-[24px] bg-[#0a0a0a] p-6 text-[#f5f4f0] lg:sticky lg:top-8 lg:min-h-[calc(100dvh-4rem)] border border-white/10 shadow-xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between gap-3 border-b border-[#f5f4f01f] pb-5">
            <Link href="/">
              <VirtueWordmark tone="invert" />
            </Link>
            <ThemeToggle
              label={tNav('theme')}
              className="size-8 rounded-lg text-[#f5f4f0]/70 hover:bg-white/10 hover:text-[#f5f4f0]"
            />
          </div>

          <div>
            <span className="label-mono-xs text-primary px-3">
              ( &nbsp;Admin Dashboard&nbsp; )
            </span>
            <nav className="mt-3 flex flex-col gap-1.5" aria-label={t('label')}>
              {visible.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors',
                      active
                        ? 'bg-primary text-[#0a0a0a] font-semibold'
                        : 'text-[#f5f4f0]/70 hover:bg-white/8 hover:text-[#f5f4f0]',
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#f5f4f01f] pt-5">
          <div className="rounded-xl border border-[#f5f4f01c] bg-white/[0.04] p-3.5">
            {name ? (
              <p className="truncate font-display text-xs font-semibold text-[#f5f4f0]">
                {name}
              </p>
            ) : null}
            <p className="truncate text-[11.5px] text-[#f5f4f0]/60">{email ?? '-'}</p>
            <span className="label-mono-xs mt-1.5 inline-block text-primary">
              {isAdmin ? tAdmin('roles.admin') : tAdmin('roles.agent')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#f5f4f0]/70 transition-colors hover:text-primary"
            >
              <span>{t('viewSite')}</span>
              <ArrowUpRight className="size-3.5" />
            </Link>

            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="next" value={`/${locale}/login`} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-[#f5f4f0]/80 transition-colors hover:bg-white/15 hover:text-[#f5f4f0]"
              >
                <LogOut className="size-3.5" />
                <span>{tAdmin('signOut')}</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
