'use client'

import * as React from 'react'
import {
  ArrowRight,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Moon,
  Search,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { SERVICES, PRIMARY_NAV } from '@/lib/studio'
import { AGENCY } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PaletteItem {
  id: string
  group: 'pages' | 'services' | 'actions'
  label: string
  hint?: string
  icon: LucideIcon
  keywords: string
  run: () => void
}

const STORAGE_KEY = 'vcw:theme'

function toggleTheme() {
  const root = document.documentElement
  const next = !root.classList.contains('dark')
  root.classList.toggle('dark', next)
  root.style.colorScheme = next ? 'dark' : 'light'
  try {
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
  } catch {
    /* storage unavailable */
  }
}

export interface CommandPaletteProps {
  className?: string
}

/**
 * Keyboard-first navigation (⌘K / Ctrl-K).
 *
 * The item list is derived from the same `PRIMARY_NAV` and `SERVICES` data the
 * header and services grid use, so routes and labels can never drift apart.
 */
export function CommandPalette({ className }: CommandPaletteProps) {
  const t = useTranslations('Command')
  const tNav = useTranslations('Nav')
  const tServices = useTranslations('Services')
  const tCommon = useTranslations('Common')
  const router = useRouter()

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState(0)
  const listRef = React.useRef<HTMLUListElement>(null)

  const items = React.useMemo<PaletteItem[]>(() => {
    const pages: PaletteItem[] = PRIMARY_NAV.map((item) => ({
      id: `page:${item.href}`,
      group: 'pages',
      label: tNav(item.labelKey),
      icon: Search,
      keywords: `${item.labelKey} ${item.href}`,
      run: () => router.push(item.href),
    }))

    const services: PaletteItem[] = SERVICES.map((service) => ({
      id: `service:${service.key}`,
      group: 'services',
      label: tServices(`items.${service.key}.title`),
      icon: service.icon,
      keywords: `service ${service.key}`,
      run: () => router.push(`/services#${service.key}`),
    }))

    const actions: PaletteItem[] = [
      {
        id: 'action:quote',
        group: 'actions',
        label: t('actions.quote'),
        icon: ArrowRight,
        keywords: 'quote contact brief proposal',
        run: () => router.push('/contact'),
      },
      {
        id: 'action:book',
        group: 'actions',
        label: t('actions.book'),
        icon: ArrowRight,
        keywords: 'book call meeting intro',
        run: () => router.push('/contact#book'),
      },
      {
        id: 'action:email',
        group: 'actions',
        label: t('actions.email'),
        hint: AGENCY.email,
        icon: Mail,
        keywords: 'email mail contact',
        run: () => {
          window.location.href = `mailto:${AGENCY.email}`
        },
      },
      {
        id: 'action:whatsapp',
        group: 'actions',
        label: t('actions.whatsapp'),
        icon: MessageCircle,
        keywords: 'whatsapp chat message',
        run: () => {
          window.open(`https://wa.me/${AGENCY.phone.replace(/[^\d]/g, '')}`, '_blank', 'noopener')
        },
      },
      {
        id: 'action:theme',
        group: 'actions',
        label: tCommon('toggleTheme'),
        icon: Moon,
        keywords: 'theme dark light mode appearance',
        run: toggleTheme,
      },
      {
        id: 'action:admin',
        group: 'actions',
        label: t('actions.admin'),
        icon: LayoutDashboard,
        keywords: 'admin dashboard studio',
        run: () => router.push('/admin'),
      },
    ]

    return [...pages, ...services, ...actions]
  }, [router, t, tCommon, tNav, tServices])

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) =>
      `${item.label} ${item.keywords} ${item.hint ?? ''}`.toLowerCase().includes(needle),
    )
  }, [items, query])

  const groups = React.useMemo(() => {
    const order: PaletteItem['group'][] = ['pages', 'services', 'actions']
    return order
      .map((group) => ({ group, items: filtered.filter((item) => item.group === group) }))
      .filter((entry) => entry.items.length > 0)
  }, [filtered])

  const flat = React.useMemo(() => groups.flatMap((entry) => entry.items), [groups])

  // Global ⌘K / Ctrl-K shortcut.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Keep the highlighted row scrolled into view without an effect per keystroke.
  React.useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    node?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function choose(item: PaletteItem | undefined) {
    if (!item) return
    setOpen(false)
    setQuery('')
    setActive(0)
    item.run()
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % Math.max(flat.length, 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (current - 1 + Math.max(flat.length, 1)) % Math.max(flat.length, 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(flat[active])
    }
  }

  const groupLabels: Record<PaletteItem['group'], string> = {
    pages: t('groups.pages'),
    services: t('groups.services'),
    actions: t('groups.actions'),
  }

  let cursor = -1

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background px-3 text-[13px] text-muted-foreground transition-colors hover:border-gold-300 hover:text-foreground dark:hover:border-gold-500/40',
          className,
        )}
      >
        <Search className="size-3.5" aria-hidden />
        <span>{tCommon('search')}</span>
        <kbd className="ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            setQuery('')
            setActive(0)
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
        >
          <DialogTitle className="sr-only">{t('label')}</DialogTitle>

          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={onInputKeyDown}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <ul ref={listRef} className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
            {groups.length === 0 ? (
              <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                {t('empty')}
              </li>
            ) : (
              groups.map((entry) => (
                <li key={entry.group}>
                  <p className="px-3 pt-3 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {groupLabels[entry.group]}
                  </p>
                  <ul>
                    {entry.items.map((item) => {
                      cursor += 1
                      const index = cursor
                      const Icon = item.icon
                      const isActive = index === active

                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            data-index={index}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => choose(item)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                              isActive ? 'bg-muted text-foreground' : 'text-foreground/85',
                            )}
                          >
                            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.hint ? (
                              <span className="hidden text-xs text-muted-foreground sm:inline">
                                {item.hint}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))
            )}
          </ul>

          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Sun className="size-3.5" aria-hidden />
              {tCommon('toggleTheme')}
            </span>
            <span>↑ ↓ · ↵</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
