'use client'

import * as React from 'react'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  FolderGit2,
  Inbox,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/utils'
import { toast } from 'sonner'
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

export function AdminDesktopDashboard({
  metrics,
  inquiries,
  orders,
  subscribersCount,
  adminName,
  adminEmail,
  locale,
}: AdminDesktopDashboardProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'scoping' | 'delivered'>('all')

  // Initial studio notes checklist
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
      title: 'PWA Web Push Notifications & Native Mobile App Mode',
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

  // Persist notes in localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('vcw-admin-studio-notes')
      if (saved) {
        setNotes(JSON.parse(saved))
      }
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
    const updated = notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n))
    saveNotes(updated)
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
    const updated = [newItem, ...notes]
    saveNotes(updated)
    setNewNoteTitle('')
    setNewNoteDesc('')
    setShowAddNote(false)
    toast.success('Studio note created')
  }

  // Greeting & Date calculations
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const displayName = adminName || adminEmail?.split('@')[0] || 'Administrator'
  const dateFormatted = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  // Dynamic Current Week for Calendar strip
  const weekDays = React.useMemo(() => {
    const curr = new Date()
    const first = curr.getDate() - curr.getDay() + 1 // Monday
    const days = []
    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i))
      days.push({
        name: dayNames[i],
        date: d.getDate(),
        isToday: d.toDateString() === now.toDateString(),
      })
    }
    return days
  }, [now])

  // Filter orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const clientStr = o.client ? `${o.client.full_name ?? ''} ${o.client.email ?? ''}` : ''
      const matchesSearch =
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clientStr.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      if (statusFilter === 'active') return o.status === 'active' || o.status === 'quoted'
      if (statusFilter === 'scoping') return o.status === 'scoping' || o.status === 'review'
      if (statusFilter === 'delivered') return o.status === 'delivered'
      return true
    })
  }, [orders, searchQuery, statusFilter])

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Admin dashboard URL copied')
    }
  }

  return (
    <div className="hidden lg:flex flex-col gap-7">
      {/* ============================================================== */}
      {/* 1. TOP COMMAND & SEARCH BAR (Mockup Replica)                    */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, clients, or type a command..."
            className="w-full pl-10 pr-12 py-2 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40 text-foreground placeholder:text-muted-foreground/70"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground font-semibold">
            ⌘F
          </kbd>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            className="gap-2 bg-gold-500 hover:bg-gold-600 text-obsidian font-semibold rounded-xl text-xs px-4"
          >
            <Link href="/admin/portfolio/new">
              <Plus className="size-4 stroke-[2.5]" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. GREETING & METRIC CAPSULE STRIP                              */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">{dateFormatted}</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              {greeting}! {displayName},
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2 text-xs rounded-xl"
            >
              <Share2 className="size-3.5" />
              Share Report
            </Button>
            <Button
              asChild
              size="sm"
              className="gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold rounded-xl text-xs"
            >
              <Link href="/admin/portfolio/new">
                <Plus className="size-3.5" />
                Add Showcase
              </Link>
            </Button>
          </div>
        </div>

        {/* Metric Capsule Pills (Mockup Direct Translation) */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
            <TrendingUp className="size-3.5 text-gold-500" />
            <span>
              <strong className="text-foreground font-semibold">
                {formatMoney(metrics.collected, metrics.collectedCurrency, locale)}
              </strong>{' '}
              Milestone Value
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>
              <strong className="text-foreground font-semibold">{metrics.published}</strong> Live Showcase Sites
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
            <Inbox className="size-3.5 text-purple-500" />
            <span>
              <strong className="text-foreground font-semibold">{metrics.newInquiries}</strong> Inquiries Awaiting Action
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
            <Users className="size-3.5 text-blue-500" />
            <span>
              <strong className="text-foreground font-semibold">{subscribersCount}</strong> Active Subscribers
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. PRIMARY ORDERS DESK TABLE CARD (Mockup Replica)              */}
      {/* ============================================================== */}
      <div className="surface rounded-2xl border border-border overflow-hidden">
        {/* Card Header & Filter Tabs */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-base font-bold text-foreground">Client Orders &amp; Builds</h2>
            <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 text-xs">
              {(['all', 'active', 'scoping', 'delivered'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStatusFilter(mode)}
                  className={`px-3 py-1 rounded-lg capitalize text-xs font-medium transition-all ${
                    statusFilter === mode
                      ? 'bg-card text-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode === 'all' ? 'All Orders' : mode}
                </button>
              ))}
            </div>
          </div>

          <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline">
            See All ↗
          </Link>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-5 font-semibold">Client Project &amp; Reference</th>
                <th className="py-3 px-5 font-semibold">Client Identity</th>
                <th className="py-3 px-5 font-semibold">Status</th>
                <th className="py-3 px-5 text-right font-semibold">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No active client orders found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const clientName = order.client?.full_name || order.client?.company || order.client?.email || 'Client'
                  const clientInitial = clientName[0].toUpperCase()

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <span>{order.title}</span>
                          </Link>
                          <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                            <span className="font-mono text-primary font-semibold">{order.reference}</span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="size-3" /> Updates
                            </span>
                            <span className="flex items-center gap-1">
                              <Paperclip className="size-3" /> Scope Attached
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] text-blue-500">
                            {clientInitial}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-xs leading-none">
                              {clientName}
                            </p>
                            <span className="text-[10px] text-muted-foreground">{order.client?.email ?? '-'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] font-semibold bg-primary/10 text-primary border-primary/30"
                        >
                          ● {order.status.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs text-muted-foreground group-hover:text-primary"
                        >
                          <Link href={`/admin/orders/${order.id}`}>
                            <span>Open Desk</span>
                            <ExternalLink className="size-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM 2-COLUMN SPLIT: SCHEDULE & NOTES (Mockup Replica)      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Studio Production Schedule */}
        <div className="surface p-6 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-gold-500" />
                <h3 className="font-display text-sm font-bold text-foreground">Studio Sprint Schedule</h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">Operations Sync</span>
            </div>

            {/* Weekly Calendar Day Strip (Mockup Direct Translation) */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekDays.map((d, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-center border transition-all ${
                    d.isToday
                      ? 'bg-gold-500 text-obsidian border-gold-600 font-bold shadow-md shadow-gold-500/20'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wider">{d.name}</span>
                  <span className="text-sm font-bold mt-0.5">{d.date}</span>
                </div>
              ))}
            </div>

            {/* Timeline Milestones with Left Accent Bar */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-card border border-border border-l-4 border-l-emerald-500 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-foreground">Lead Discovery &amp; Architectural Intake</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">10:00 AM – 11:30 AM · Inquiries Desk</p>
                </div>
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="inline-block size-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-400 flex items-center justify-center">
                    AD
                  </div>
                  <div className="inline-block size-6 rounded-full bg-gold-500/20 border border-gold-500/40 text-[9px] font-bold text-gold-400 flex items-center justify-center">
                    VC
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border border-l-4 border-l-gold-500 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-foreground">Full-Stack Design System &amp; Fluid Engineering</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">02:00 PM – 04:30 PM · Active Sprints</p>
                </div>
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="inline-block size-6 rounded-full bg-gold-500/20 border border-gold-500/40 text-[9px] font-bold text-gold-400 flex items-center justify-center">
                    VC
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border border-l-4 border-l-purple-500 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-foreground">Autonomous Newsletter Dispatch &amp; Sync Check</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">05:00 PM – 06:00 PM · AI Engine</p>
                </div>
                <div className="flex -space-x-1.5 overflow-hidden">
                  <div className="inline-block size-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-[9px] font-bold text-purple-400 flex items-center justify-center">
                    AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Studio Direct Notes & Checklist */}
        <div className="surface p-6 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h3 className="font-display text-sm font-bold text-foreground">Studio Notes &amp; Roadmap</h3>
              </div>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="size-3.5" />
                Add Task
              </button>
            </div>

            {/* Quick Add Form */}
            {showAddNote && (
              <form onSubmit={handleAddNote} className="mb-4 p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Task title (e.g. Audit API rate limits)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                  required
                />
                <input
                  type="text"
                  value={newNoteDesc}
                  onChange={(e) => setNewNoteDesc(e.target.value)}
                  placeholder="Task context or reminder..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddNote(false)} className="text-[11px] h-7">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-gold-500 text-obsidian font-semibold text-[11px] h-7">
                    Save Task
                  </Button>
                </div>
              </form>
            )}

            {/* Checklist Items */}
            <div className="space-y-3">
              {notes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleNote(item.id)}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <button
                    type="button"
                    aria-label="Toggle task completion"
                    className={`size-5 rounded-full border mt-0.5 flex items-center justify-center transition-all ${
                      item.completed
                        ? 'bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-500/20'
                        : 'border-muted-foreground/40 group-hover:border-foreground'
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="size-3.5 stroke-[3]" />}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`font-medium text-xs text-foreground transition-all ${
                        item.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
