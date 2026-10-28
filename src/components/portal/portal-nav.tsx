'use client'

import { ArrowUpRight, CreditCard, LayoutList, LogOut, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { signOutAction } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

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
    <aside className="flex flex-col justify-between gap-8 rounded-[20px] bg-[#0a0a0a] p-6 text-[#f5f4f0] lg:sticky lg:top-8 lg:min-h-[calc(100dvh-4rem)]">
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
            ( &nbsp;Client Workspace&nbsp; )
          </span>
          <nav className="mt-3 flex flex-col gap-1.5" aria-label={t('title')}>
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
                      ? 'bg-primary text-[#0a0a0a] font-semibold'
                      : 'text-[#f5f4f0]/70 hover:bg-white/8 hover:text-[#f5f4f0]',
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <a
              href="/portal#new-request"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-[#f5f4f0]/70 transition-colors hover:bg-white/8 hover:text-[#f5f4f0]"
            >
              <Plus className="size-4 text-primary" />
              <span>{t('request.title')}</span>
            </a>

            <Link
              href="/payment"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-[#f5f4f0]/70 transition-colors hover:bg-white/8 hover:text-[#f5f4f0]"
            >
              <CreditCard className="size-4 text-primary" />
              <span>Instant Pay</span>
            </Link>
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
            {tNav('account')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#f5f4f0]/70 transition-colors hover:text-primary"
          >
            <span>{t('backToSite')}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>

          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="next" value={`/${locale}`} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-[#f5f4f0]/80 transition-colors hover:bg-white/15 hover:text-[#f5f4f0]"
            >
              <LogOut className="size-3.5" />
              <span>{t('signOut')}</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
