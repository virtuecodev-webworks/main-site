'use client'

import * as React from 'react'
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Calendar as CalendarIcon,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  Ellipsis,
  Eye,
  Filter,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { formatMoney } from '@/lib/utils'
import { toast } from 'sonner'
import { AdminPowerSuite } from './admin-power-suite'
import { GlassyDialog, saveCsv } from '@/components/dashboard/glassy-shell'
import {
  GlassyBadge,
  GlassyDonutChart,
  GlassyLegend,
  GlassyMetric,
  GlassyPanel,
  GlassyRevenueChart,
  GlassyStackChart,
  useGlassyAnimations,
} from '@/components/dashboard/glassy-charts'
import type { Inquiry, OrderWithClient } from '@/lib/supabase/types'

interface AdminDesktopDashboardProps {
  metrics: {
    published: number
    drafts: number
    newInquiries: number
    collected: number
    collectedCurrency: string
  }
  inquiries: Inquiry[]
  orders: OrderWithClient[]
  subscribersCount: number
  adminName: string | null
  adminEmail: string | null
  locale: string
}

interface StudioNoteItem {
  id: string
  title: string
  description: string
  completed: boolean
}

type View = 'command' | 'trends' | 'metrics' | 'operations'
type Period = '7 days' | '30 days' | '90 days'
type WorkStatus = 'Needs review' | 'Scheduled' | 'Running' | 'Delivered'

const PERIODS: Period[] = ['7 days', '30 days', '90 days']

const VIEWS: { id: View; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'command',
    label: 'Command Center',
    description: 'Studio revenue, active builds, and what needs your attention.',
    icon: <LayoutDashboard className="size-3.5" aria-hidden="true" />,
  },
  {
    id: 'trends',
    label: 'Trends',
    description: 'Compare collected milestones, operating targets, and pipeline mix.',
    icon: <TrendingUp className="size-3.5" aria-hidden="true" />,
  },
  {
    id: 'metrics',
    label: 'Growth & Links',
    description: 'Pipeline metrics, 1-click checkout links, and SEO readiness.',
    icon: <BarChart3 className="size-3.5" aria-hidden="true" />,
  },
  {
    id: 'operations',
    label: 'Operations',
    description: 'Manage client builds, approvals, and studio sprint notes.',
    icon: <BriefcaseBusiness className="size-3.5" aria-hidden="true" />,
  },
]

const WORK_STATUSES: WorkStatus[] = ['Needs review', 'Scheduled', 'Running', 'Delivered']

const LANE_STYLE: Record<WorkStatus, { icon: React.ReactNode; tone: 'teal' | 'coral' | 'ochre' | 'ink' }> = {
  'Needs review': { icon: <ListChecks aria-hidden="true" />, tone: 'coral' },
  Scheduled: { icon: <Clock3 aria-hidden="true" />, tone: 'ochre' },
  Running: { icon: <Zap aria-hidden="true" />, tone: 'teal' },
  Delivered: { icon: <ShieldCheck aria-hidden="true" />, tone: 'ink' },
}

interface WorkCardItem {
  id: string
  kind: 'order' | 'inquiry'
  reference: string
  title: string
  description: string
  clientLabel: string
  status: WorkStatus
  rawStatus: string
  timestamp: string
  href: string
}

export function AdminDesktopDashboard({
  metrics,
  inquiries,
  orders,
  subscribersCount,
  adminName,
  adminEmail,
  locale,
}: AdminDesktopDashboardProps) {
  const [view, setView] = React.useState<View>('command')
  const [period, setPeriod] = React.useState<Period>('30 days')
  const [activityQuery, setActivityQuery] = React.useState('')
  const [activityStatus, setActivityStatus] = React.useState('All statuses')
  const [laneFilter, setLaneFilter] = React.useState<WorkStatus | 'All lanes'>('All lanes')
  const [inspectedItem, setInspectedItem] = React.useState<WorkCardItem | null>(null)

  const contentRef = React.useRef<HTMLDivElement>(null)
  useGlassyAnimations(contentRef, [view, period])

  // Studio Notes checklist
  const [notes, setNotes] = React.useState<StudioNoteItem[]>([
    {
      id: '1',
      title: 'Review Client Intake & Architecture Specifications',
      description: 'Audit scope briefs and milestones for active client orders.',
      completed: true,
    },
    {
      id: '2',
      title: 'Studio Newsletter Roster & Autonomous Cron Verification',
      description: 'Ensure active subscriber roster syncs with verified database profiles.',
      completed: true,
    },
    {
      id: '3',
      title: 'PWA Web Push Notifications & Mobile Install Mode',
      description: 'Monitor device push subscriptions and install prompts for returning clients.',
      completed: false,
    },
    {
      id: '4',
      title: 'Portfolio Showcase Live Interactive Demos',
      description: 'Inspect live site button visibility settings across published case studies.',
      completed: false,
    },
  ])

  const [newNoteTitle, setNewNoteTitle] = React.useState('')
  const [newNoteDesc, setNewNoteDesc] = React.useState('')
  const [showAddNote, setShowAddNote] = React.useState(false)

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('vcw-admin-studio-notes')
      if (saved) setNotes(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [])

  const saveNotes = (updated: StudioNoteItem[]) => {
    setNotes(updated)
    try {
      localStorage.setItem('vcw-admin-studio-notes', JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const toggleNote = (id: string) => {
    saveNotes(notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n)))
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNoteTitle.trim()) return
    const newItem: StudioNoteItem = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      description: newNoteDesc.trim() || 'Internal studio administrative task',
      completed: false,
    }
    saveNotes([newItem, ...notes])
    setNewNoteTitle('')
    setNewNoteDesc('')
    setShowAddNote(false)
    toast.success('Studio note created')
  }

  const now = React.useMemo(() => new Date(), [])
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const displayName = adminName || adminEmail?.split('@')[0] || 'Director'

  // Weekly Calendar strip
  const weekDays = React.useMemo(() => {
    const curr = new Date()
    const dayOfWeek = curr.getDay() || 7
    const monday = new Date(curr)
    monday.setDate(curr.getDate() - dayOfWeek + 1)
    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    return dayNames.map((name, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return {
        name,
        date: d.getDate(),
        isToday: d.toDateString() === now.toDateString(),
      }
    })
  }, [now])

  // Real derived pipeline counts
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'active' || o.status === 'quoted' || o.status === 'scoping' || o.status === 'review',
  ).length
  const scopingCount = orders.filter((o) => o.status === 'scoping' || o.status === 'review' || o.status === 'inquiry').length
  const runningCount = orders.filter((o) => o.status === 'active').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length
  const wonInquiries = inquiries.filter((i) => i.status === 'won').length
  const conversionRate = inquiries.length > 0 ? Math.round((wonInquiries / inquiries.length) * 100) : 100

  // Map real orders + inquiries into unified activity rows & Kanban cards
  const workItems: WorkCardItem[] = React.useMemo(() => {
    const orderItems: WorkCardItem[] = orders.map((order) => {
      const status: WorkStatus =
        order.status === 'delivered'
          ? 'Delivered'
          : order.status === 'active'
            ? 'Running'
            : order.status === 'quoted'
              ? 'Scheduled'
              : 'Needs review'
      const clientLabel = order.client?.full_name || order.client?.company || order.client?.email || 'Client'
      return {
        id: `order-${order.id}`,
        kind: 'order',
        reference: order.reference,
        title: order.title,
        description: order.brief || `${order.service || 'Custom build'} · ${clientLabel}`,
        clientLabel,
        status,
        rawStatus: order.status.replace('_', ' '),
        timestamp: new Date(order.updated_at).toLocaleDateString(locale, {
          day: '2-digit',
          month: 'short',
        }),
        href: `/admin/orders/${order.reference}`,
      }
    })

    const inquiryItems: WorkCardItem[] = inquiries.map((inq) => {
      const status: WorkStatus =
        inq.status === 'won'
          ? 'Delivered'
          : inq.status === 'contacted'
            ? 'Scheduled'
            : 'Needs review'
      return {
        id: `inq-${inq.id}`,
        kind: 'inquiry',
        reference: inq.service || 'Inquiry',
        title: `${inq.name}${inq.company ? ` · ${inq.company}` : ''}`,
        description: inq.message || `Inquiry from ${inq.email}`,
        clientLabel: inq.email,
        status,
        rawStatus: inq.status,
        timestamp: new Date(inq.created_at).toLocaleDateString(locale, {
          day: '2-digit',
          month: 'short',
        }),
        href: '/admin/inquiries',
      }
    })

    return [...orderItems, ...inquiryItems]
  }, [orders, inquiries, locale])

  const filteredActivity = React.useMemo(() => {
    return workItems.filter((item) => {
      const haystack = `${item.title} ${item.reference} ${item.clientLabel} ${item.status}`.toLowerCase()
      const matchesQuery = haystack.includes(activityQuery.trim().toLowerCase())
      const matchesStatus = activityStatus === 'All statuses' || item.status === activityStatus
      return matchesQuery && matchesStatus
    })
  }, [workItems, activityQuery, activityStatus])

  // Period chart series scaled around real collected milestone value
  const baseCollectedK = Math.max(2.4, metrics.collected / 1000)
  const periodSeries = React.useMemo(() => {
    const map: Record<
      Period,
      {
        axis: string[]
        collected: number[]
        target: number[]
        ordersMix: { label: string; percentage: number; tone: 'coral' | 'ink' | 'teal' }[]
      }
    > = {
      '7 days': {
        axis: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'],
        collected: [0.6, 0.9, 0.85, 1.3, 1.1, 1.45, Math.max(1.2, baseCollectedK * 0.4)],
        target: [0.5, 0.7, 0.75, 0.95, 0.9, 1.1, 1.2],
        ordersMix: [
          { label: 'Active', percentage: Math.max(15, Math.round(((runningCount || 3) / Math.max(1, orders.length || 6)) * 100)), tone: 'coral' },
          { label: 'Scoping', percentage: Math.max(15, Math.round(((scopingCount || 2) / Math.max(1, orders.length || 6)) * 100)), tone: 'ink' },
          { label: 'Shipped', percentage: Math.max(10, 100 - Math.max(15, Math.round(((runningCount || 3) / Math.max(1, orders.length || 6)) * 100)) - Math.max(15, Math.round(((scopingCount || 2) / Math.max(1, orders.length || 6)) * 100))), tone: 'teal' },
        ],
      },
      '30 days': {
        axis: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Now'],
        collected: [1.8, 2.4, 2.1, 3.2, 2.9, 3.6, Math.max(2.6, baseCollectedK)],
        target: [1.5, 2.0, 2.2, 2.5, 2.6, 3.0, 3.3],
        ordersMix: [
          { label: 'Active', percentage: 48, tone: 'coral' },
          { label: 'Scoping', percentage: 32, tone: 'ink' },
          { label: 'Shipped', percentage: 20, tone: 'teal' },
        ],
      },
      '90 days': {
        axis: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Now'],
        collected: [3.2, 4.1, 3.9, 5.2, 6.4, 7.1, Math.max(4.5, baseCollectedK * 1.4)],
        target: [2.8, 3.4, 3.6, 4.2, 5.0, 5.8, 6.2],
        ordersMix: [
          { label: 'Active', percentage: 42, tone: 'coral' },
          { label: 'Scoping', percentage: 26, tone: 'ink' },
          { label: 'Shipped', percentage: 32, tone: 'teal' },
        ],
      },
    }
    return map[period]
  }, [period, baseCollectedK, runningCount, scopingCount, orders.length])

  const stackActivity = React.useMemo(
    () => [
      { label: 'Mon', lower: Math.max(2, orders.length), upper: Math.max(1, metrics.newInquiries) },
      { label: 'Tue', lower: Math.max(3, runningCount + 2), upper: Math.max(1, scopingCount + 1) },
      { label: 'Wed', lower: Math.max(2, deliveredCount + 3), upper: Math.max(1, metrics.drafts + 1) },
      { label: 'Thu', lower: Math.max(4, metrics.published + 2), upper: Math.max(2, scopingCount + 1) },
      { label: 'Fri', lower: Math.max(3, orders.length + 1), upper: Math.max(1, metrics.newInquiries + 2) },
      { label: 'Sat', lower: Math.max(2, runningCount + 1), upper: 1 },
      { label: 'Sun', lower: Math.max(2, deliveredCount + 2), upper: 1 },
    ],
    [orders.length, metrics.newInquiries, metrics.published, metrics.drafts, runningCount, scopingCount, deliveredCount],
  )

  const handleExportCsv = () => {
    saveCsv(`virtue-studio-${view}-${period.replace(' ', '-')}.csv`, [
      ['Type', 'Reference', 'Title', 'Client / Email', 'Status', 'Date'],
      ...workItems.map((w) => [w.kind, w.reference, w.title, w.clientLabel, w.status, w.timestamp]),
    ])
    toast.success('Studio CSV exported')
  }

  const currentViewMeta = VIEWS.find((v) => v.id === view)!
  const capacityMax = Math.max(12, orders.length + 6)
  const capacityUsed = Math.max(1, activeOrdersCount)
  const lanes = laneFilter === 'All lanes' ? WORK_STATUSES : [laneFilter]

  return (
    <div className="flex flex-col gap-4">
      {/* View Header & Controls */}
      <header className="gd-view-head">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gd-teal)]">
            {greeting}, {displayName}
          </span>
          <h1 className="mt-1">{currentViewMeta.label}</h1>
          <p>{currentViewMeta.description}</p>
        </div>

        <div className="gd-view-actions">
          {/* Sub-view switcher */}
          <div className="gd-period" role="tablist" aria-label="Dashboard workspace views">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={view === v.id}
                aria-pressed={view === v.id}
                onClick={() => setView(v.id)}
                className="inline-flex items-center gap-1.5"
              >
                {v.icon}
                <span>{v.label === 'Command Center' ? 'Command' : v.label}</span>
              </button>
            ))}
          </div>

          {view !== 'operations' && (
            <div className="gd-period" role="group" aria-label="Reporting period">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={p === period}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <button type="button" className="gd-primary gd-export" onClick={handleExportCsv}>
            <ArrowDownToLine aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Main Animated Stage Content */}
      <div className="gd-content" ref={contentRef} key={`${view}-${period}`}>
        {view === 'command' && (
          <div className="gd-command-grid">
            {/* Hero Revenue Card */}
            <GlassyPanel
              title="Collected milestone value"
              className="gd-balance"
              action={<span className="gd-unit">{metrics.collectedCurrency}</span>}
            >
              <div className="gd-balance-number">
                <span className="sr-only">
                  {formatMoney(metrics.collected, metrics.collectedCurrency, locale)}
                </span>
                <span aria-hidden="true">
                  {formatMoney(metrics.collected, metrics.collectedCurrency, locale)}
                </span>
              </div>
              <div className="gd-balance-change">
                <span className="gd-delta">
                  <ArrowUpRight aria-hidden="true" />
                  {conversionRate}%
                </span>
                <span>lead conversion · {orders.length} orders logged</span>
              </div>
              <div className="gd-balance-actions">
                <button
                  type="button"
                  className="gd-primary"
                  onClick={() => setView('trends')}
                >
                  View trends <ArrowUpRight aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="gd-secondary"
                  onClick={() => setView('metrics')}
                >
                  Payment links <ArrowRight aria-hidden="true" />
                </button>
              </div>
              <div className="gd-streams" aria-label="Studio breakdown">
                <div>
                  <span>Active builds</span>
                  <strong>{activeOrdersCount} live</strong>
                </div>
                <div>
                  <span>Showcase sites</span>
                  <strong>{metrics.published} published</strong>
                </div>
                <div>
                  <span>Drafts</span>
                  <strong>{metrics.drafts} queued</strong>
                </div>
              </div>
            </GlassyPanel>

            {/* 2x2 Summary Bento */}
            <div className="gd-summary">
              <GlassyMetric
                title="Active orders"
                icon={<FolderKanban />}
                value={activeOrdersCount}
                change={`+${runningCount} running`}
                detail="in production"
                tone="teal"
              />
              <GlassyMetric
                title="Subscribers"
                icon={<Users />}
                value={subscribersCount}
                change="Roster"
                detail="studio dispatch"
              />
              <GlassyMetric
                title="New inquiries"
                icon={<Inbox />}
                value={metrics.newInquiries}
                change={metrics.newInquiries > 0 ? 'Action' : 'Clear'}
                detail="awaiting reply"
                tone="coral"
              />
              <GlassyMetric
                title="Live showcase"
                icon={<Images />}
                value={metrics.published}
                detail={`${metrics.drafts} in draft`}
              />
            </div>

            {/* Stacked Activity Chart */}
            <GlassyPanel
              title="Studio pipeline cadence"
              subtitle="Completed deliverables and scoping reviews"
              className="gd-command-chart"
            >
              <GlassyStackChart
                items={stackActivity}
                labels={['Deliverables', 'Reviews']}
                tones={['ink', 'teal']}
                title="Studio activity by day"
              />
            </GlassyPanel>

            {/* Left Column Side Stack */}
            <div className="gd-command-side">
              <GlassyPanel title="Sprint capacity" className="gd-capacity">
                <div
                  className="gd-capacity-track"
                  role="meter"
                  aria-label="Active engineering sprint capacity"
                  aria-valuenow={capacityUsed}
                  aria-valuemin={0}
                  aria-valuemax={capacityMax}
                >
                  <span
                    className="gd-fill"
                    style={{ width: `${Math.min(100, (capacityUsed / capacityMax) * 100)}%` }}
                  />
                </div>
                <div className="gd-capacity-label">
                  <span>
                    <strong>{capacityUsed}</strong> active slots
                  </span>
                  <span>{capacityMax} studio capacity</span>
                </div>
              </GlassyPanel>

              <GlassyPanel
                title="Quick actions"
                subtitle="Launch new showcase or jump to operations"
                className="gd-approvals"
              >
                <div className="gd-approval-content">
                  <span className="gd-list-icon">
                    <Sparkles aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Add Showcase / Operations</strong>
                    <small>{scopingCount} orders scoping · {metrics.newInquiries} new leads</small>
                  </div>
                  <Link
                    href="/admin/portfolio/new"
                    className="gd-icon-button"
                    aria-label="Add new showcase project"
                    title="Add new showcase project"
                  >
                    <Plus aria-hidden="true" />
                  </Link>
                </div>
              </GlassyPanel>
            </div>

            {/* Recent Activity & Orders Table */}
            <GlassyPanel
              title="Recent orders & inquiries"
              className="gd-activity"
              action={
                <div className="gd-table-tools">
                  <label className="gd-search">
                    <Search aria-hidden="true" />
                    <input
                      type="search"
                      placeholder="Search orders or leads"
                      aria-label="Search orders or leads"
                      value={activityQuery}
                      onChange={(e) => setActivityQuery(e.target.value)}
                    />
                  </label>
                  <label className="gd-filter">
                    <Filter aria-hidden="true" />
                    <select
                      aria-label="Filter status"
                      value={activityStatus}
                      onChange={(e) => setActivityStatus(e.target.value)}
                    >
                      {['All statuses', ...WORK_STATUSES].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
              }
            >
              <div className="gd-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Project / Lead</th>
                      <th scope="col">Reference</th>
                      <th scope="col">Status</th>
                      <th scope="col">Updated</th>
                      <th scope="col" className="text-right">
                        Desk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivity.slice(0, 8).map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Link href={item.href} className="hover:underline">
                            {item.title}
                          </Link>
                        </td>
                        <td className="font-mono text-[10.5px] opacity-80">{item.reference}</td>
                        <td>
                          <GlassyBadge status={item.status} />
                        </td>
                        <td>{item.timestamp}</td>
                        <td className="text-right">
                          <Link
                            href={item.href}
                            className="inline-flex items-center gap-1 font-bold hover:underline"
                          >
                            <span>Open</span>
                            <ArrowUpRight className="size-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredActivity.length === 0 && (
                <p className="gd-empty" role="status">
                  No matching orders or inquiries.
                </p>
              )}
            </GlassyPanel>
          </div>
        )}

        {view === 'trends' && (
          <div className="gd-analytics">
            <div className="gd-metric-grid">
              <GlassyMetric
                title="Collected"
                icon={<CircleDollarSign />}
                value={metrics.collected}
                displayOverride={formatMoney(metrics.collected, metrics.collectedCurrency, locale)}
                change="+12.4%"
                tone="teal"
              />
              <GlassyMetric
                title="Total orders"
                icon={<FolderKanban />}
                value={orders.length}
                detail="on ledger"
              />
              <GlassyMetric
                title="Lead conversion"
                icon={<Eye />}
                value={conversionRate}
                format="percent"
                detail="won vs inquiries"
              />
              <GlassyMetric
                title="Published sites"
                icon={<Images />}
                value={metrics.published}
                detail={`${metrics.drafts} drafts`}
              />
            </div>

            <div className="gd-analytics-grid">
              <GlassyPanel
                title="Revenue vs sprint target"
                subtitle={`Cumulative trajectory · ${period}`}
                action={
                  <GlassyLegend
                    entries={[
                      { label: 'Collected', tone: 'coral' },
                      { label: 'Target', tone: 'ink' },
                    ]}
                  />
                }
              >
                <GlassyRevenueChart
                  labels={periodSeries.axis}
                  primarySeries={periodSeries.collected}
                  secondarySeries={periodSeries.target}
                  primaryLabel="Collected"
                  secondaryLabel="Target"
                />
              </GlassyPanel>

              <GlassyPanel title="Pipeline mix" className="gd-device-panel">
                <GlassyDonutChart
                  segments={periodSeries.ordersMix}
                  total={Math.max(orders.length, 1)}
                  totalLabel="Orders"
                />
              </GlassyPanel>
            </div>

            <GlassyPanel title="Reporting snapshot" className="gd-statement">
              <div className="gd-approval-content">
                <span className="gd-list-icon">
                  <Clock3 aria-hidden="true" />
                </span>
                <div>
                  <strong>Studio milestone &amp; inquiry ledger</strong>
                  <small>
                    {period} · {periodSeries.axis[0]} to {periodSeries.axis.at(-1)} · {workItems.length} total records
                  </small>
                </div>
                <button
                  type="button"
                  className="gd-icon-button"
                  aria-label="Download studio CSV"
                  onClick={handleExportCsv}
                >
                  <Download aria-hidden="true" />
                </button>
              </div>
            </GlassyPanel>
          </div>
        )}

        {view === 'metrics' && (
          <div className="gd-analytics">
            <div className="gd-metric-grid">
              <GlassyMetric
                title="Collected"
                icon={<CircleDollarSign />}
                value={metrics.collected}
                displayOverride={formatMoney(metrics.collected, metrics.collectedCurrency, locale)}
                tone="teal"
              />
              <GlassyMetric
                title="Active builds"
                icon={<Zap />}
                value={activeOrdersCount}
                detail="scoping & active"
              />
              <GlassyMetric
                title="Shipped builds"
                icon={<CheckCircle2 />}
                value={deliveredCount}
                detail="delivered to clients"
              />
              <GlassyMetric
                title="Subscribers"
                icon={<Users />}
                value={subscribersCount}
                detail="active dispatch list"
              />
            </div>

            <div className="gd-analytics-grid">
              <GlassyPanel
                title="Deliverables vs scoping reviews"
                subtitle="Daily engineering throughput across active retainers"
              >
                <GlassyStackChart
                  items={stackActivity}
                  labels={['Deliverables', 'Reviews']}
                  tones={['ink', 'coral']}
                  title="Deliverables and reviews"
                />
              </GlassyPanel>

              <GlassyPanel title="Order distribution">
                <GlassyDonutChart
                  segments={periodSeries.ordersMix}
                  total={Math.max(orders.length, 1)}
                  totalLabel="Builds"
                />
              </GlassyPanel>
            </div>

            {/* Embedded AdminPowerSuite inside a GlassyPanel */}
            <div className="gd-panel !p-0 overflow-hidden" data-gd-enter>
              <AdminPowerSuite
                metrics={metrics}
                orders={orders}
                inquiries={inquiries}
                locale={locale}
              />
            </div>
          </div>
        )}

        {view === 'operations' && (
          <div className="gd-analytics">
            <div className="gd-metric-grid">
              <GlassyMetric
                title="Collected value"
                icon={<CircleDollarSign />}
                value={metrics.collected}
                displayOverride={formatMoney(metrics.collected, metrics.collectedCurrency, locale)}
                tone="teal"
              />
              <GlassyMetric
                title="Work items"
                icon={<Zap />}
                value={workItems.length}
                detail="orders & inquiries"
              />
              <GlassyMetric
                title="Needs review"
                icon={<ListChecks />}
                value={workItems.filter((w) => w.status === 'Needs review').length}
                detail="waiting on studio"
                tone="coral"
              />
              <GlassyMetric
                title="Running builds"
                icon={<ShieldCheck />}
                value={workItems.filter((w) => w.status === 'Running').length}
                detail="active engineering"
              />
            </div>

            {/* 4-Lane Kanban Operations Board */}
            <GlassyPanel
              title="Active operations board"
              subtitle="Click any order or inquiry card to inspect details or jump straight to its desk."
              action={
                <label className="gd-filter">
                  <Filter aria-hidden="true" />
                  <select
                    aria-label="Filter operations lanes"
                    value={laneFilter}
                    onChange={(e) => setLaneFilter(e.target.value as WorkStatus | 'All lanes')}
                  >
                    {['All lanes', ...WORK_STATUSES].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              }
            >
              <div className="gd-lanes" data-filtered={laneFilter !== 'All lanes'}>
                {lanes.map((lane) => {
                  const items = workItems.filter((item) => item.status === lane)
                  return (
                    <section className="gd-lane" key={lane} aria-label={lane}>
                      <header>
                        <i data-tone={LANE_STYLE[lane].tone} aria-hidden="true">
                          {LANE_STYLE[lane].icon}
                        </i>
                        <h3>{lane}</h3>
                        <span>{items.length}</span>
                      </header>
                      {items.slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="gd-work-item"
                          onClick={() => setInspectedItem(item)}
                        >
                          <span className="gd-work-titlerow">
                            <strong className="truncate">{item.title}</strong>
                            <Ellipsis aria-hidden="true" />
                          </span>
                          <span className="gd-work-detail line-clamp-2">{item.description}</span>
                          <span className="gd-work-meta">
                            <span>{item.reference}</span>
                            <span>{item.timestamp}</span>
                          </span>
                        </button>
                      ))}
                      {items.length === 0 && <p className="gd-empty">Lane clear.</p>}
                    </section>
                  )
                })}
              </div>
            </GlassyPanel>

            {/* Studio Sprint Schedule & Notes Split */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <GlassyPanel
                title="Studio sprint schedule"
                subtitle="Weekly engineering cadence"
                action={
                  <span className="gd-unit inline-flex items-center gap-1">
                    <CalendarIcon className="size-3" /> Sync
                  </span>
                }
              >
                <div className="grid grid-cols-7 gap-1.5 mb-4">
                  {weekDays.map((d, i) => (
                    <div
                      key={i}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl text-center border transition-all ${
                        d.isToday
                          ? 'bg-[var(--gd-primary)] text-[var(--gd-primary-ink)] border-transparent font-bold shadow-sm'
                          : 'bg-[var(--gd-inner)] border-[var(--gd-line)] text-[var(--gd-muted)]'
                      }`}
                    >
                      <span className="text-[9.5px] font-bold uppercase tracking-wider">{d.name}</span>
                      <span className="text-xs font-extrabold mt-0.5">{d.date}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] border-l-4 border-l-[var(--gd-teal)] flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-xs">Lead Discovery &amp; Architectural Intake</p>
                      <p className="text-[10.5px] text-[var(--gd-muted)] mt-0.5">
                        10:00 AM – 11:30 AM · Inquiries Desk
                      </p>
                    </div>
                    <GlassyBadge status="Active" />
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] border-l-4 border-l-[var(--gd-ochre)] flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-xs">Full-Stack Design System &amp; Builds</p>
                      <p className="text-[10.5px] text-[var(--gd-muted)] mt-0.5">
                        02:00 PM – 04:30 PM · Active Sprints
                      </p>
                    </div>
                    <GlassyBadge status="Scheduled" />
                  </div>
                </div>
              </GlassyPanel>

              <GlassyPanel
                title="Studio notes & roadmap"
                subtitle="Persisted locally for your command desk"
                action={
                  <button
                    type="button"
                    onClick={() => setShowAddNote(!showAddNote)}
                    className="gd-secondary !min-block-size-[32px] !py-1 !px-3"
                  >
                    <Plus className="size-3.5" />
                    Add task
                  </button>
                }
              >
                {showAddNote && (
                  <form
                    onSubmit={handleAddNote}
                    className="mb-3 p-3 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] space-y-2"
                  >
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Task title..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--gd-surface)] border border-[var(--gd-line)] text-xs"
                      required
                    />
                    <input
                      type="text"
                      value={newNoteDesc}
                      onChange={(e) => setNewNoteDesc(e.target.value)}
                      placeholder="Context or reminder..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--gd-surface)] border border-[var(--gd-line)] text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddNote(false)}
                        className="gd-secondary !min-block-size-[30px] !py-1 !px-3"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="gd-primary !min-block-size-[30px] !py-1 !px-3"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {notes.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleNote(item.id)}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] hover:bg-[var(--gd-raised)] transition-colors cursor-pointer"
                    >
                      <button
                        type="button"
                        aria-label="Toggle task completion"
                        className={`size-5 shrink-0 rounded-full border mt-0.5 flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-[var(--gd-teal)] border-transparent text-white'
                            : 'border-[var(--gd-muted)]'
                        }`}
                      >
                        {item.completed && <CheckCircle2 className="size-3.5 stroke-[3]" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-xs ${
                            item.completed ? 'line-through opacity-60' : ''
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-[10.5px] text-[var(--gd-muted)] leading-relaxed mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassyPanel>
            </div>
          </div>
        )}
      </div>

      {/* Work Item Inspection Dialog */}
      {inspectedItem && (
        <GlassyDialog title={inspectedItem.title} close={() => setInspectedItem(null)}>
          <GlassyBadge status={inspectedItem.status} />
          <p className="gd-work-dialog-description">{inspectedItem.description}</p>
          <dl className="gd-work-facts">
            <div>
              <dt>Type</dt>
              <dd className="capitalize">{inspectedItem.kind}</dd>
            </div>
            <div>
              <dt>Client / Contact</dt>
              <dd className="truncate">{inspectedItem.clientLabel}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{inspectedItem.reference}</dd>
            </div>
          </dl>
          <div className="flex items-center justify-end gap-2">
            <Link
              href={inspectedItem.href}
              onClick={() => setInspectedItem(null)}
              className="gd-primary"
            >
              <span>Open in {inspectedItem.kind === 'order' ? 'Orders Desk' : 'Inquiries'}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </GlassyDialog>
      )}
    </div>
  )
}
