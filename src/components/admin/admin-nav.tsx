'use client'

import {
  ExternalLink,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { signOutAction } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

/**
 * Console navigation.
 *
 * `adminOnly` items are hidden from agents rather than shown-and-refused: the
 * CMS and the lead inbox are studio-wide tools, while the orders console is the
 * part an agent is actually here for.
 */
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
  const pathname = usePathname()

  const visible = ITEMS.filter((item) => !item.adminOnly || isAdmin)

  return (
    <div className="surface flex flex-col gap-6 p-5">
      <div className="flex items-center justify-between gap-3">
        <VirtueWordmark className="text-[17px]" />
      </div>

      <nav className="flex flex-col gap-1" aria-label={t('label')}>
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
                  ? 'bg-gold-50 text-gold-800 dark:bg-gold-500/12 dark:text-gold-300'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-5">
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href="/">
            <ExternalLink className="size-4" />
            {t('viewSite')}
          </Link>
        </Button>

        <div className="px-3.5">
          {name ? <p className="truncate text-[12.5px] font-medium">{name}</p> : null}
          <p className="truncate text-[11.5px] text-muted-foreground">{email ?? '-'}</p>
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.12em] text-gold-700 uppercase dark:text-gold-300">
            {isAdmin ? tAdmin('roles.admin') : tAdmin('roles.agent')}
          </p>
        </div>

        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={`/${locale}/login`} />
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="size-4" />
            {tAdmin('signOut')}
          </Button>
        </form>
      </div>
    </div>
  )
}
