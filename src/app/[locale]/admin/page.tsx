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
import { listOrdersWithClients } from '@/lib/supabase/orders'
import { getNewsletterDashboardData } from '@/lib/supabase/newsletter-queries'
import { formatMoney } from '@/lib/utils'
import { requireAdmin } from '@/lib/supabase/auth'
import { AdminDesktopDashboard } from '@/components/admin/admin-desktop-dashboard'

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await requireAdmin(locale)

  const t = await getTranslations('Admin.overview')
  const tStatus = await getTranslations('Admin.status')

  const [metrics, inquiries, orders, newsletterData] = await Promise.all([
    getStudioMetrics(),
    listInquiries(6),
    listOrdersWithClients(10),
    getNewsletterDashboardData(),
  ])

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* ============================================================== */}
      {/* 1. MOBILE HERO & ACTIONS (< lg)                                */}
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

            {/* 4 Stat Chips */}
            <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-white/[0.06] p-2.5 text-center border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#f5f4f0]/60 uppercase tracking-wider">Inquiries</span>
                <span className="font-display text-xs sm:text-sm font-bold text-primary mt-0.5">
                  {metrics.newInquiries} New
                </span>
              </div>
              <div className="flex flex-col border-l border-white/10">
                <span className="text-[10px] text-[#f5f4f0]/60 uppercase tracking-wider">Subscribers</span>
                <span className="font-display text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
                  {newsletterData.subscribersCount}
                </span>
              </div>
              <div className="flex flex-col border-l border-white/10">
                <span className="text-[10px] text-[#f5f4f0]/60 uppercase tracking-wider">Portfolio</span>
                <span className="font-display text-xs sm:text-sm font-bold text-[#f5f4f0] mt-0.5">
                  {metrics.published} Live
                </span>
              </div>
              <div className="flex flex-col border-l border-white/10">
                <span className="text-[10px] text-[#f5f4f0]/60 uppercase tracking-wider">Drafts</span>
                <span className="font-display text-xs sm:text-sm font-bold text-[#f5f4f0] mt-0.5">
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
                <span>Orders Desk</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/admin/portfolio/new"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-[#f5f4f0] hover:bg-white/10 active:scale-95 transition-transform"
              >
                <Plus className="size-3.5 text-primary" />
                <span>Add Project</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Action Category Tiles (2x2 Grid) */}
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
              href="/admin/newsletter"
              className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <span className="flex items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {newsletterData.subscribersCount} Active
                </span>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-foreground">Studio Dispatch</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Newsletter &amp; roster</p>
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
      {/* 2. DESKTOP WORKSPACE DASHBOARD (>= lg) (Mockup Replica)         */}
      {/* ============================================================== */}
      <AdminDesktopDashboard
        metrics={metrics}
        inquiries={inquiries}
        orders={orders}
        subscribersCount={newsletterData.subscribersCount}
        adminName={session.name}
        adminEmail={session.email}
        locale={locale}
      />

      {/* ============================================================== */}
      {/* 3. RECENT INQUIRIES LIST                                       */}
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
