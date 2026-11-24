'use client'

import * as React from 'react'
import {
  ArrowUpRight,
  ChevronRight,
  LogOut,
  Search,
  X,
} from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { VirtueMark } from '@/components/brand/virtue-mark'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { PHOTOS } from '@/lib/photos'

export interface GlassyNavItem {
  href: string
  label: string
  short: string
  description: string
  icon: React.ReactNode
  exact?: boolean
}

export interface GlassyShellProps {
  workspaceName?: string
  workspaceSubtitle: string
  promptText?: string
  navItems: GlassyNavItem[]
  navLabel: string
  userName?: string | null
  userEmail?: string | null
  userRoleLabel?: string
  themeLabel: string
  backToSiteLabel: string
  signOutLabel: string
  signOutAction: (formData: FormData) => void
  signOutLocale: string
  signOutNext: string
  notificationSlot?: React.ReactNode
  backgroundImage?: string
  panelFrost?: number
  children: React.ReactNode
}

export function saveCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function GlassyDialog({
  title,
  children,
  close,
}: {
  title: string
  children: React.ReactNode
  close: () => void
}) {
  const ref = React.useRef<HTMLDialogElement>(null)
  const labelId = React.useId()

  React.useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    dialog.querySelector('input')?.focus()
  }, [])

  return (
    <dialog
      className="gd-dialog"
      ref={ref}
      aria-labelledby={labelId}
      onClose={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <section className="gd-dialog-inner">
        <header>
          <h2 id={labelId}>{title}</h2>
          <button
            type="button"
            className="gd-icon-button"
            aria-label="Close dialog"
            onClick={() => ref.current?.close()}
          >
            <X aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </dialog>
  )
}

function GlassyDock({
  items,
  pathname,
  side = false,
  navLabel,
}: {
  items: GlassyNavItem[]
  pathname: string
  side?: boolean
  navLabel: string
}) {
  const navRef = React.useRef<HTMLElement>(null)
  const markerRef = React.useRef<HTMLSpanElement>(null)

  const activeIndex = React.useMemo(() => {
    const idx = items.findIndex((item) =>
      item.exact ? pathname === item.href : pathname.startsWith(item.href),
    )
    return idx >= 0 ? idx : 0
  }, [items, pathname])

  React.useEffect(() => {
    const container = navRef.current
    const indicator = markerRef.current
    if (!container || !indicator) return

    const adjust = () => {
      const current = container.querySelector<HTMLElement>('[aria-current="page"]')
      if (!current) {
        indicator.style.visibility = 'hidden'
        return
      }
      indicator.style.visibility = 'visible'
      indicator.style.width = `${current.offsetWidth}px`
      indicator.style.height = `${current.offsetHeight}px`
      indicator.style.transform = `translate(${current.offsetLeft}px, ${current.offsetTop}px)`
      indicator.dataset.ready = 'true'
    }

    const observer = new ResizeObserver(adjust)
    observer.observe(container)
    container.querySelectorAll('a').forEach((link) => observer.observe(link))
    adjust()
    return () => observer.disconnect()
  }, [activeIndex, pathname])

  return (
    <nav
      ref={navRef}
      className={side ? 'gd-dock gd-dock-side' : 'gd-dock gd-dock-bottom'}
      aria-label={navLabel}
    >
      <span ref={markerRef} className="gd-dock-indicator" aria-hidden="true" />
      {items.map((item, idx) => {
        const isCurrent = idx === activeIndex
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            aria-label={item.label}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {item.icon}
            <span className="gd-dock-text" aria-hidden="true">
              {item.label}
            </span>
            <span className="gd-dock-short" aria-hidden="true">
              {item.short}
            </span>
            {side && (
              <span className="gd-dock-tip" aria-hidden="true">
                {item.label}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function GlassyShell({
  workspaceName = 'VIRTUE & CO.',
  workspaceSubtitle,
  promptText = 'Search workspace or jump to a desk...',
  navItems,
  navLabel,
  userName,
  userEmail,
  userRoleLabel,
  themeLabel,
  backToSiteLabel,
  signOutLabel,
  signOutAction,
  signOutLocale,
  signOutNext,
  notificationSlot,
  backgroundImage = PHOTOS.studio,
  panelFrost = 14,
  children,
}: GlassyShellProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredItems = React.useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (!terms.length) return navItems
    return navItems.filter((item) =>
      terms.every((t) => `${item.label} ${item.short} ${item.description}`.toLowerCase().includes(t)),
    )
  }, [navItems, query])

  const activeNav = navItems.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  )

  return (
    <div
      className="gd-app"
      style={{ '--gd-panel-frost': `${Math.max(0, Math.min(36, panelFrost))}px` } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="gd-background" src={backgroundImage} alt="" aria-hidden="true" />

      <div className="gd-surround">
        {/* Top Floating Glass Pill Bar */}
        <header className="gd-top">
          <Link href="/" className="gd-brand">
            <span className="gd-logo" aria-hidden="true">
              <VirtueMark className="size-[22px]" animate={false} />
            </span>
            <div className="min-w-0">
              <strong className="truncate">{workspaceName}</strong>
              <small className="truncate">{workspaceSubtitle}</small>
            </div>
          </Link>

          <button
            type="button"
            className="gd-ask"
            aria-label={`Search ${workspaceSubtitle}`}
            onClick={() => {
              setQuery('')
              setSearchOpen(true)
            }}
          >
            <span className="gd-orb" aria-hidden="true" />
            <span className="gd-prompt" key={pathname}>
              {activeNav ? activeNav.description : promptText}
            </span>
            <Search aria-hidden="true" className="gd-ask-search" />
          </button>

          <div className="gd-top-actions">
            {notificationSlot}

            <ThemeToggle
              label={themeLabel}
              className="gd-icon-button !rounded-full !border !border-[var(--gd-line)] !bg-[var(--gd-inner)] hover:!bg-[var(--gd-raised)]"
            />

            <form action={signOutAction}>
              <input type="hidden" name="locale" value={signOutLocale} />
              <input type="hidden" name="next" value={signOutNext} />
              <button
                type="submit"
                title={signOutLabel}
                aria-label={signOutLabel}
                className="gd-icon-button"
              >
                <LogOut aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>

        {/* Main Frosted Glass Stage + Floating Side & Bottom Docks */}
        <div className="gd-stage-wrap">
          <GlassyDock items={navItems} pathname={pathname} side navLabel={`${navLabel} shortcuts`} />

          <main className="gd-stage">
            <div className="gd-stage-scroll">
              {children}
            </div>
          </main>

          <GlassyDock items={navItems} pathname={pathname} navLabel={navLabel} />
        </div>

        {/* Footer Strip */}
        <footer className="gd-footer">
          <span>
            {userName || userEmail || 'Workspace'}
            {userRoleLabel ? ` · ${userRoleLabel}` : ''}
          </span>
          <Link href="/">
            <span>{backToSiteLabel}</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </footer>
      </div>

      {/* Quick Search / Command Dialog */}
      {searchOpen && (
        <GlassyDialog title={`Search ${workspaceSubtitle}`} close={() => setSearchOpen(false)}>
          <label className="gd-search gd-command-input">
            <Search aria-hidden="true" />
            <input
              type="search"
              aria-label="Find a workspace view"
              placeholder="Jump to orders, portfolio, inquiries, design..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="gd-quick-list">
            {filteredItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSearchOpen(false)}
              >
                {item.icon}
                <div>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </div>
                <ChevronRight aria-hidden="true" />
              </Link>
            ))}
            {filteredItems.length === 0 && (
              <p className="gd-empty" role="status">
                No matching workspace views.
              </p>
            )}
          </div>
        </GlassyDialog>
      )}
    </div>
  )
}
