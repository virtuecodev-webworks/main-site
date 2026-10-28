import { ArrowUpRight, BadgeDollarSign, FileText, Images, Inbox } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { getStudioMetrics, listInquiries } from '@/lib/supabase/queries'
import { formatMoney } from '@/lib/utils'
import { requireAdmin } from '@/lib/supabase/auth'

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  await requireAdmin(locale)

  const t = await getTranslations('Admin.overview')
  const tStatus = await getTranslations('Admin.status')

  const [metrics, inquiries] = await Promise.all([getStudioMetrics(), listInquiries(6)])

  const cards = [
    {
      key: 'publishedProjects',
      value: String(metrics.published),
      icon: Images,
      href: '/admin/portfolio' as const,
      index: '001',
    },
    {
      key: 'draftProjects',
      value: String(metrics.drafts),
      icon: FileText,
      href: '/admin/portfolio' as const,
      index: '002',
    },
    {
      key: 'newInquiries',
      value: String(metrics.newInquiries),
      icon: Inbox,
      href: '/admin/inquiries' as const,
      index: '003',
    },
    {
      key: 'collectedValue',
      value: formatMoney(metrics.collected, metrics.collectedCurrency, locale),
      icon: BadgeDollarSign,
      href: '/admin/orders' as const,
      index: '004',
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <span className="label-mono text-primary">
            ( &nbsp;&nbsp;&nbsp;Command Overview&nbsp;&nbsp;&nbsp; )
          </span>
          <h1 className="heading-style-h3 mt-2 text-foreground">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0a0a0a] px-4 py-2.5 text-xs font-medium tracking-[0.04em] text-[#f5f4f0] uppercase transition-colors hover:bg-primary hover:text-[#0a0a0a] dark:bg-[#f5f4f0] dark:text-[#0a0a0a]"
        >
          <span>Open Orders Console</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.key}
              href={card.href}
              className="group flex flex-col justify-between gap-8 rounded-[20px] border border-border bg-card p-6 transition-colors hover:border-primary/60"
            >
              <div className="flex items-center justify-between">
                <span className="label-mono-xs text-muted-foreground">
                  ( &nbsp;{card.index}&nbsp; )
                </span>
                <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground transition-colors group-hover:text-primary">
                  {card.value}
                </span>
                <span className="label-mono-xs text-muted-foreground">
                  {t(card.key)}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <section className="rounded-[20px] border border-border bg-card p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="label-mono-xs text-primary">Lead Intake</span>
            <h2 className="heading-style-h4 mt-1">{t('recentInquiries')}</h2>
          </div>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            <span>View all</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {inquiries.length ? (
          <ul className="divide-y divide-border">
            {inquiries.map((inquiry) => (
              <li
                key={inquiry.id}
                className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-foreground/[0.02]"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-display text-sm font-semibold text-foreground">
                    {inquiry.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {inquiry.email}
                    {inquiry.service ? ` · ${inquiry.service}` : ''}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline">{tStatus(inquiry.status)}</Badge>
                  <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                    {new Date(inquiry.created_at).toLocaleDateString(locale, {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">{t('noInquiries')}</p>
        )}
      </section>
    </div>
  )
}
