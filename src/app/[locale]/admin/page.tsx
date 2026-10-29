import {
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  FileText,
  FolderGit2,
  FolderKanban,
  Images,
  Inbox,
  Palette,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* ============================================================== */}
      {/* 1. MOBILE HERO CARD (Mockup Screen 1 Inspiration)               */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-5 lg:hidden">
        <div className="relative overflow-hidden rounded-[26px] border border-border bg-[#0a0a0a] p-6 text-[#f5f4f0] shadow-xl">
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gold-500/15 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="label-mono-xs text-primary">( &nbsp;Studio Command Desk&nbsp; )</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <div>
              <p className="text-xs text-[#f5f4f0]/60">Total Collected Milestone Value</p>
              <h2 className="font-display text-2xl font-bold text-[#f5f4f0] mt-1 tracking-tight">
                {formatMoney(metrics.collected, metrics.collectedCurrency, locale)}
              </h2>
            </div>

            {/* 3 Stat Chips */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.06] p-3 text-center border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10.5px] text-[#f5f4f0]/60 uppercase tracking-wider">Inquiries</span>
                <span className="font-display text-sm font-bold text-primary mt-0.5">
                  {metrics.newInquiries} New
                </span>
              </div>
              <div className="flex flex-col border-x border-white/10">
                <span className="text-[10.5px] text-[#f5f4f0]/60 uppercase tracking-wider">Portfolio</span>
                <span className="font-display text-sm font-bold text-[#f5f4f0] mt-0.5">
                  {metrics.published} Live
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10.5px] text-[#f5f4f0]/60 uppercase tracking-wider">Drafts</span>
                <span className="font-display text-sm font-bold text-[#f5f4f0] mt-0.5">
                  {metrics.drafts}
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/admin/orders"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-[#0a0a0a] shadow-sm active:scale-95 transition-transform"
              >
                <span>Orders Console</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
              <Link
                href="/admin/portfolio/new"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 py-2.5 text-xs font-semibold text-[#f5f4f0] hover:bg-white/15 active:scale-95 transition-all"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Add Project</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Quick Action Category Tiles (2x2 Grid) */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">
            Studio Workspaces
          </span>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/orders"
              className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderKanban className="size-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">Orders Desk</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Live builds &amp; milestones</p>
              </div>
            </Link>

            <Link
              href="/admin/portfolio"
              className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Images className="size-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">Portfolio CMS</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{metrics.published} Live sites</p>
              </div>
            </Link>

            <Link
              href="/admin/inquiries"
              className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Inbox className="size-5" />
                </div>
                {metrics.newInquiries > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {metrics.newInquiries}
                  </span>
                )}
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">Lead Intake</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Briefs &amp; proposals</p>
              </div>
            </Link>

            <Link
              href="/admin/design"
              className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Palette className="size-5" />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">Site Design</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tokens &amp; palette</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. DESKTOP HEADER & METRIC CARDS (>= lg)                        */}
      {/* ============================================================== */}
      <header className="hidden lg:flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
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

      <div className="hidden lg:grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

      {/* ============================================================== */}
      {/* 3. RECENT INQUIRIES LIST (Both Mobile & Desktop)                */}
      {/* ============================================================== */}
      <section className="rounded-[24px] border border-border bg-card p-5 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="label-mono-xs text-primary">Lead Intake</span>
            <h2 className="heading-style-h4 mt-1 font-bold">{t('recentInquiries')}</h2>
          </div>
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-foreground"
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
                className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-foreground/[0.02]"
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
          <p className="py-8 text-center text-xs text-muted-foreground">{t('noInquiries')}</p>
        )}
      </section>
    </div>
  )
}
