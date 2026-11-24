'use client'

import * as React from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock3,
  CreditCard,
  Ellipsis,
  Filter,
  FolderGit2,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { toast } from 'sonner'
import { GlassyDialog } from '@/components/dashboard/glassy-shell'
import {
  GlassyBadge,
  GlassyDonutChart,
  GlassyMetric,
  GlassyPanel,
  GlassyStackChart,
  useGlassyAnimations,
} from '@/components/dashboard/glassy-charts'
import type { Order } from '@/lib/supabase/types'

interface ClientDesktopDashboardProps {
  orders: Order[]
  unreadSummary: { total: number; byOrder: Record<string, number> }
  clientName: string | null
  clientEmail: string | null
  locale: string
  currency: string
}

interface NoteItem {
  id: string
  title: string
  description: string
  completed: boolean
}

type PortalView = 'command' | 'progress' | 'board'
type LaneStatus = 'Scoping' | 'Quoted' | 'In Production' | 'Delivered'

const PORTAL_VIEWS: { id: PortalView; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'command',
    label: 'Command Center',
    description: 'Active project builds, milestone velocity, and engineer updates.',
    icon: <LayoutDashboard className="size-3.5" aria-hidden="true" />,
  },
  {
    id: 'progress',
    label: 'Progress',
    description: 'Sprint velocity and delivery breakdown across your builds.',
    icon: <TrendingUp className="size-3.5" aria-hidden="true" />,
  },
  {
    id: 'board',
    label: 'Board & Notes',
    description: 'Track project stages, sprint schedule, and personal brief checklist.',
    icon: <BriefcaseBusiness className="size-3.5" aria-hidden="true" />,
  },
]

const LANES: LaneStatus[] = ['Scoping', 'Quoted', 'In Production', 'Delivered']

const LANE_STYLE: Record<LaneStatus, { icon: React.ReactNode; tone: 'teal' | 'coral' | 'ochre' | 'ink' }> = {
  Scoping: { icon: <ListChecks aria-hidden="true" />, tone: 'coral' },
  Quoted: { icon: <Clock3 aria-hidden="true" />, tone: 'ochre' },
  'In Production': { icon: <Zap aria-hidden="true" />, tone: 'teal' },
  Delivered: { icon: <ShieldCheck aria-hidden="true" />, tone: 'ink' },
}

export function ClientDesktopDashboard({
  orders,
  unreadSummary,
  clientName,
  clientEmail,
  locale,
  currency,
}: ClientDesktopDashboardProps) {
  const [view, setView] = React.useState<PortalView>('command')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'review' | 'delivered'>('all')
  const [inspectedOrder, setInspectedOrder] = React.useState<Order | null>(null)

  const contentRef = React.useRef<HTMLDivElement>(null)
  useGlassyAnimations(contentRef, [view])

  const [notes, setNotes] = React.useState<NoteItem[]>([
    {
      id: '1',
      title: 'Full Custom Web Platform Brief',
      description: 'Review architecture specification, database schema, and sub-100ms fluid navigation.',
      completed: true,
    },
    {
      id: '2',
      title: 'Design System & Typography Verification',
      description: 'Confirm bespoke type hierarchy, brand accent tokens, and light/dark contrast compliance.',
      completed: false,
    },
    {
      id: '3',
      title: 'Multi-Currency Payments & Escrow',
      description: 'Verify checkout credentials and automated milestone invoice receipts.',
      completed: false,
    },
  ])

  const [newNoteTitle, setNewNoteTitle] = React.useState('')
  const [newNoteDesc, setNewNoteDesc] = React.useState('')
  const [showAddNote, setShowAddNote] = React.useState(false)

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('vcw-client-notes')
      if (saved) setNotes(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [])

  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated)
    try {
      localStorage.setItem('vcw-client-notes', JSON.stringify(updated))
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
    const newItem: NoteItem = {
      id: Date.now().toString(),
      title: newNoteTitle.trim(),
      description: newNoteDesc.trim() || 'Custom deliverable requirement',
      completed: false,
    }
    saveNotes([newItem, ...notes])
    setNewNoteTitle('')
    setNewNoteDesc('')
    setShowAddNote(false)
    toast.success('Note added to project notebook')
  }

  const now = React.useMemo(() => new Date(), [])
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const displayName = clientName || clientEmail?.split('@')[0] || 'Client'

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

  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.reference.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false
      if (statusFilter === 'active') {
        return o.status === 'scoping' || o.status === 'active' || o.status === 'review' || o.status === 'quoted'
      }
      if (statusFilter === 'review') return o.status === 'review'
      if (statusFilter === 'delivered') return o.status === 'delivered'
      return true
    })
  }, [orders, searchQuery, statusFilter])

  const activeOrders = orders.filter(
    (o) => o.status === 'scoping' || o.status === 'active' || o.status === 'review' || o.status === 'quoted',
  )
  const completedCount = orders.filter((o) => o.status === 'delivered').length
  const leadOrder =
    orders.find((o) => o.status === 'active' || o.status === 'review' || o.status === 'scoping' || o.status === 'quoted') ??
    orders[0]

  const mapLane = (status: Order['status']): LaneStatus => {
    if (status === 'delivered') return 'Delivered'
    if (status === 'active') return 'In Production'
    if (status === 'quoted') return 'Quoted'
    return 'Scoping'
  }

  const stackVelocity = [
    { label: 'Plan', lower: Math.max(1, orders.length), upper: 1 },
    { label: 'Design', lower: Math.max(2, activeOrders.length + 1), upper: 1 },
    { label: 'Build', lower: Math.max(2, activeOrders.length + 2), upper: Math.max(1, unreadSummary.total) },
    { label: 'QA', lower: Math.max(1, completedCount + 1), upper: 1 },
    { label: 'Launch', lower: Math.max(1, completedCount + 1), upper: 0 },
  ]

  const totalCount = Math.max(1, orders.length)
  const prodPct = Math.round(((activeOrders.length || 1) / totalCount) * 100)
  const shippedPct = Math.round((completedCount / totalCount) * 100)
  const otherPct = Math.max(0, 100 - prodPct - shippedPct)

  const currentMeta = PORTAL_VIEWS.find((v) => v.id === view)!

  return (
    <div className="flex flex-col gap-4">
      <header className="gd-view-head">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gd-teal)]">
            {greeting}, {displayName}
          </span>
          <h1 className="mt-1">{currentMeta.label}</h1>
          <p>{currentMeta.description}</p>
        </div>

        <div className="gd-view-actions">
          <div className="gd-period" role="tablist" aria-label="Client workspace views">
            {PORTAL_VIEWS.map((v) => (
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

          <a href="#new-request" className="gd-primary">
            <Plus aria-hidden="true" />
            New Request
          </a>
        </div>
      </header>

      <div className="gd-content" ref={contentRef} key={view}>
        {view === 'command' && (
          <div className="gd-command-grid">
            {/* Hero Active Project Card */}
            <GlassyPanel
              title={leadOrder ? 'Active project focus' : 'Start your build'}
              className="gd-balance"
              action={<span className="gd-unit">{leadOrder?.currency || currency}</span>}
            >
              {leadOrder ? (
                <>
                  <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                    {leadOrder.title}
                  </div>
                  <div className="gd-balance-change">
                    <GlassyBadge status={leadOrder.status.replace('_', ' ')} />
                    <span className="font-mono">{leadOrder.reference}</span>
                  </div>
                  <div className="gd-balance-actions">
                    <Link
                      href={`/portal/orders/${leadOrder.reference}`}
                      className="gd-primary"
                    >
                      Open desk <ArrowUpRight aria-hidden="true" />
                    </Link>
                    <Link href="/payment" className="gd-secondary">
                      Instant Pay <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-display text-2xl font-extrabold tracking-tight leading-tight">
                    Ready when you are
                  </div>
                  <p className="mt-2 text-xs text-[var(--gd-muted)]">
                    Submit your first project brief below and track live milestones directly here.
                  </p>
                  <div className="gd-balance-actions">
                    <a href="#new-request" className="gd-primary">
                      Start Brief <ArrowUpRight aria-hidden="true" />
                    </a>
                    <Link href="/portfolio" className="gd-secondary">
                      Live Work <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </>
              )}

              <div className="gd-streams" aria-label="Project summary">
                <div>
                  <span>Total builds</span>
                  <strong>{orders.length}</strong>
                </div>
                <div>
                  <span>In production</span>
                  <strong>{activeOrders.length} active</strong>
                </div>
                <div>
                  <span>Shipped</span>
                  <strong>{completedCount} live</strong>
                </div>
              </div>
            </GlassyPanel>

            {/* 2x2 Metric Bento */}
            <div className="gd-summary">
              <GlassyMetric
                title="Active builds"
                icon={<Zap />}
                value={activeOrders.length}
                change="24/7 Desk"
                detail="in production"
                tone="teal"
              />
              <GlassyMetric
                title="Builds shipped"
                icon={<CheckCircle2 />}
                value={completedCount}
                detail="verified live"
              />
              <GlassyMetric
                title="Unread updates"
                icon={<MessageSquare />}
                value={unreadSummary.total}
                change={unreadSummary.total > 0 ? 'New' : 'Caught up'}
                detail="from engineers"
                tone={unreadSummary.total > 0 ? 'coral' : undefined}
              />
              <GlassyMetric
                title="Checklist items"
                icon={<ListChecks />}
                value={notes.filter((n) => !n.completed).length}
                detail={`${notes.filter((n) => n.completed).length} completed`}
              />
            </div>

            {/* Milestone Velocity Stack Chart */}
            <GlassyPanel
              title="Delivery velocity"
              subtitle="Sprint stages across your studio workspace"
              className="gd-command-chart"
            >
              <GlassyStackChart
                items={stackVelocity}
                labels={['Completed', 'Active']}
                tones={['ink', 'teal']}
                title="Project sprint progress"
              />
            </GlassyPanel>

            {/* Left Column Side Stack */}
            <div className="gd-command-side">
              <GlassyPanel title="Overall completion" className="gd-capacity">
                <div
                  className="gd-capacity-track"
                  role="meter"
                  aria-label="Project delivery completion"
                  aria-valuenow={completedCount}
                  aria-valuemin={0}
                  aria-valuemax={Math.max(1, orders.length)}
                >
                  <span
                    className="gd-fill"
                    style={{
                      width: `${orders.length > 0 ? Math.max(18, Math.round(((completedCount + activeOrders.length * 0.5) / orders.length) * 100)) : 25}%`,
                    }}
                  />
                </div>
                <div className="gd-capacity-label">
                  <span>
                    <strong>{completedCount}</strong> shipped
                  </span>
                  <span>{orders.length} total projects</span>
                </div>
              </GlassyPanel>

              <GlassyPanel
                title="Escrow & showcase"
                subtitle="Quick links for settlement and examples"
                className="gd-approvals"
              >
                <div className="gd-approval-content">
                  <span className="gd-list-icon">
                    <CreditCard aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Milestone Settlement</strong>
                    <small>Encrypted multi-currency checkout</small>
                  </div>
                  <Link
                    href="/payment"
                    className="gd-icon-button"
                    aria-label="Open Instant Pay"
                  >
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </div>
              </GlassyPanel>
            </div>

            {/* Projects Table */}
            <GlassyPanel
              title="My projects"
              className="gd-activity"
              action={
                <div className="gd-table-tools">
                  <label className="gd-search">
                    <Search aria-hidden="true" />
                    <input
                      type="search"
                      placeholder="Search projects"
                      aria-label="Search projects"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </label>
                  <label className="gd-filter">
                    <Filter aria-hidden="true" />
                    <select
                      aria-label="Filter projects"
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as 'all' | 'active' | 'review' | 'delivered')
                      }
                    >
                      <option value="all">All builds</option>
                      <option value="active">Active</option>
                      <option value="review">In review</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </label>
                </div>
              }
            >
              <div className="gd-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Project</th>
                      <th scope="col">Reference</th>
                      <th scope="col">Status</th>
                      <th scope="col">Unread</th>
                      <th scope="col" className="text-right">
                        Discussion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const unread = unreadSummary.byOrder[order.id] ?? 0
                      return (
                        <tr key={order.id}>
                          <td>
                            <Link href={`/portal/orders/${order.reference}`} className="hover:underline">
                              {order.title}
                            </Link>
                          </td>
                          <td className="font-mono text-[10.5px] opacity-80">{order.reference}</td>
                          <td>
                            <GlassyBadge status={order.status.replace('_', ' ')} />
                          </td>
                          <td>{unread > 0 ? `${unread} new` : 'Up to date'}</td>
                          <td className="text-right">
                            <Link
                              href={`/portal/orders/${order.reference}`}
                              className="inline-flex items-center gap-1 font-bold hover:underline"
                            >
                              <span>Open</span>
                              <ArrowUpRight className="size-3" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <p className="gd-empty" role="status">
                  No matching projects found. Start a new brief below.
                </p>
              )}
            </GlassyPanel>
          </div>
        )}

        {view === 'progress' && (
          <div className="gd-analytics">
            <div className="gd-metric-grid">
              <GlassyMetric
                title="Active builds"
                icon={<Zap />}
                value={activeOrders.length}
                tone="teal"
                detail="in engineering"
              />
              <GlassyMetric
                title="Shipped"
                icon={<CheckCircle2 />}
                value={completedCount}
                detail="live in production"
              />
              <GlassyMetric
                title="Unread updates"
                icon={<MessageSquare />}
                value={unreadSummary.total}
                detail="engineer messages"
              />
              <GlassyMetric
                title="Showcase sites"
                icon={<FolderGit2 />}
                value={6}
                detail="studio benchmarks"
              />
            </div>

            <div className="gd-analytics-grid">
              <GlassyPanel
                title="Sprint stage throughput"
                subtitle="Planned vs completed milestones"
              >
                <GlassyStackChart
                  items={stackVelocity}
                  labels={['Completed', 'Active']}
                  tones={['ink', 'coral']}
                  title="Milestone throughput"
                />
              </GlassyPanel>

              <GlassyPanel title="Build mix">
                <GlassyDonutChart
                  segments={[
                    { label: 'Active', percentage: prodPct || 60, tone: 'coral' },
                    { label: 'Shipped', percentage: shippedPct || 25, tone: 'teal' },
                    { label: 'Queued', percentage: otherPct || 15, tone: 'ink' },
                  ]}
                  total={orders.length}
                  totalLabel="Projects"
                />
              </GlassyPanel>
            </div>
          </div>
        )}

        {view === 'board' && (
          <div className="gd-analytics">
            <GlassyPanel
              title="Project status board"
              subtitle="Click any project card to inspect details or open its live discussion."
            >
              <div className="gd-lanes">
                {LANES.map((lane) => {
                  const laneOrders = orders.filter((o) => mapLane(o.status) === lane)
                  return (
                    <section className="gd-lane" key={lane} aria-label={lane}>
                      <header>
                        <i data-tone={LANE_STYLE[lane].tone} aria-hidden="true">
                          {LANE_STYLE[lane].icon}
                        </i>
                        <h3>{lane}</h3>
                        <span>{laneOrders.length}</span>
                      </header>
                      {laneOrders.map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          className="gd-work-item"
                          onClick={() => setInspectedOrder(order)}
                        >
                          <span className="gd-work-titlerow">
                            <strong className="truncate">{order.title}</strong>
                            <Ellipsis aria-hidden="true" />
                          </span>
                          <span className="gd-work-detail line-clamp-2">
                            {order.brief || order.service || 'Custom web engineering build'}
                          </span>
                          <span className="gd-work-meta">
                            <span>{order.reference}</span>
                            <span>
                              {new Date(order.updated_at).toLocaleDateString(locale, {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          </span>
                        </button>
                      ))}
                      {laneOrders.length === 0 && <p className="gd-empty">None in stage.</p>}
                    </section>
                  )
                })}
              </div>
            </GlassyPanel>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <GlassyPanel
                title="Sprint schedule"
                subtitle="Current engineering week"
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
                      <p className="font-bold text-xs">Kickoff &amp; Specification Scope</p>
                      <p className="text-[10.5px] text-[var(--gd-muted)] mt-0.5">
                        01:00 PM – 02:30 PM · Client Desk
                      </p>
                    </div>
                    <GlassyBadge status="Active" />
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--gd-inner)] border border-[var(--gd-line)] border-l-4 border-l-[var(--gd-ochre)] flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-xs">Core UI Architecture &amp; Staging Preview</p>
                      <p className="text-[10.5px] text-[var(--gd-muted)] mt-0.5">
                        04:00 PM – 05:30 PM · Studio Sprint
                      </p>
                    </div>
                    <GlassyBadge status="Scheduled" />
                  </div>
                </div>
              </GlassyPanel>

              <GlassyPanel
                title="Notes & requirements"
                subtitle="Persisted locally for your project brief"
                action={
                  <button
                    type="button"
                    onClick={() => setShowAddNote(!showAddNote)}
                    className="gd-secondary !min-block-size-[32px] !py-1 !px-3"
                  >
                    <Plus className="size-3.5" />
                    Add note
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
                      placeholder="Note title..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--gd-surface)] border border-[var(--gd-line)] text-xs"
                      required
                    />
                    <input
                      type="text"
                      value={newNoteDesc}
                      onChange={(e) => setNewNoteDesc(e.target.value)}
                      placeholder="Short reminder..."
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
                        aria-label="Toggle note completion"
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

      {/* Project Inspection Dialog */}
      {inspectedOrder && (
        <GlassyDialog title={inspectedOrder.title} close={() => setInspectedOrder(null)}>
          <GlassyBadge status={inspectedOrder.status.replace('_', ' ')} />
          <p className="gd-work-dialog-description">
            {inspectedOrder.brief || 'Custom web engineering build with Virtue & Co. Webworks.'}
          </p>
          <dl className="gd-work-facts">
            <div>
              <dt>Reference</dt>
              <dd>{inspectedOrder.reference}</dd>
            </div>
            <div>
              <dt>Currency</dt>
              <dd>{inspectedOrder.currency}</dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{inspectedOrder.service || 'Custom'}</dd>
            </div>
          </dl>
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/portal/orders/${inspectedOrder.reference}`}
              onClick={() => setInspectedOrder(null)}
              className="gd-primary"
            >
              <span>Open Discussion</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </GlassyDialog>
      )}
    </div>
  )
}
