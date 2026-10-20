import { ArrowRight, BadgeDollarSign, FileText, Images, Inbox } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

  // CMS and lead routes stay admin-only: an agent belongs in the orders console.
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
    },
    { key: 'draftProjects', value: String(metrics.drafts), icon: FileText, href: '/admin/portfolio' as const },
    {
      key: 'newInquiries',
      value: String(metrics.newInquiries),
      icon: Inbox,
      href: '/admin/inquiries' as const,
    },
    {
      key: 'collectedValue',
      value: formatMoney(metrics.collected, metrics.collectedCurrency, locale),
      icon: BadgeDollarSign,
      href: '/admin/inquiries' as const,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.key} className="surface flex flex-col gap-4 p-5 shadow-elevation-1">
              <span className="grid size-10 place-items-center rounded-xl bg-gold-500/12 text-gold-700 ring-1 ring-gold-500/25 ring-inset">
                <Icon className="size-4.5" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tracking-tight">{card.value}</span>
                <span className="text-[12px] tracking-[0.1em] text-muted-foreground uppercase">
                  {t(card.key)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <section className="surface flex flex-col p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">{t('recentInquiries')}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/inquiries">
              {t('recentInquiries')}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {inquiries.length ? (
          <ul className="mt-5 divide-y divide-border">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{inquiry.name}</span>
                  <span className="truncate text-[12px] text-muted-foreground">
                    {inquiry.email}
                    {inquiry.service ? ` · ${inquiry.service}` : ''}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant="outline">{tStatus(inquiry.status)}</Badge>
                  <span className="hidden text-[12px] text-muted-foreground sm:inline">
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
          <p className="mt-5 text-sm text-muted-foreground">{t('noInquiries')}</p>
        )}
      </section>
    </div>
  )
}
