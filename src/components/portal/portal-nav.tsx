'use client'

import { LayoutList, LogOut, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { signOutAction } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

/**
 * Client portal navigation.
 *
 * Same shape as the studio nav so the two halves of the product feel like one
 * thing, but with only the two places a client needs: their work, and the form
 * for starting something new.
 */
export function PortalNav({
  locale,
  name,
  email,
}: {
  locale: string
  name: string | null
  email: string | null
}) {
  const t = useTranslations('Portal')
  const tNav = useTranslations('Nav')
  const pathname = usePathname()

  const items = [
    { href: '/portal', label: t('title'), icon: LayoutList, active: pathname === '/portal' },
  ]

  return (
    <div className="surface flex flex-col gap-6 p-5">
      <div className="flex items-center justify-between gap-3">
        <VirtueWordmark className="text-[17px]" />
      </div>

      <nav className="flex flex-col gap-1" aria-label={t('title')}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors',
                item.active
                  ? 'bg-gold-50 text-gold-800 dark:bg-gold-500/12 dark:text-gold-300'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}

        {/* A same-page anchor: the new-request form lives on the overview. */}
        <a
          href="#new-request"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" />
          {t('request.title')}
        </a>
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-5">
        <Button asChild variant="ghost" size="sm" className="justify-start">
          <Link href="/">{t('backToSite')}</Link>
        </Button>

        <div className="px-3.5">
          {name ? <p className="truncate text-[12.5px] font-medium">{name}</p> : null}
          <p className="truncate text-[11.5px] text-muted-foreground">{email ?? '-'}</p>
          <p className="mt-0.5 text-[11px] font-medium tracking-[0.12em] text-gold-700 uppercase dark:text-gold-300">
            {tNav('account')}
          </p>
        </div>

        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="next" value={`/${locale}`} />
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="size-4" />
            {t('signOut')}
          </Button>
        </form>
      </div>
    </div>
  )
}
