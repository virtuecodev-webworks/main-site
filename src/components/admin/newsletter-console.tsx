'use client'

import * as React from 'react'
import {
  Sparkles,
  Send,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Users,
  UserPlus,
  UserCheck,
  Trash2,
  Search,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { toast } from 'sonner'
import type { NewsletterDispatch, NewsletterSubscriber } from '@/lib/supabase/types'

interface NewsletterConsoleProps {
  subscribersCount: number
  dispatchesCount: number
  recentDispatches: NewsletterDispatch[]
  initialSubscribersList?: NewsletterSubscriber[]
}

export function NewsletterConsole({
  subscribersCount: initialSubscribers,
  dispatchesCount: initialCount,
  recentDispatches: initialDispatches,
  initialSubscribersList = [],
}: NewsletterConsoleProps) {
  const [subscribersList, setSubscribersList] = React.useState<NewsletterSubscriber[]>(initialSubscribersList)
  const [dispatches, setDispatches] = React.useState<NewsletterDispatch[]>(initialDispatches)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'auto' | 'custom' | 'roster'>('auto')
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Subscriber roster controls
  const [rosterSearch, setRosterSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'unsubscribed'>('all')
  const [newEmail, setNewEmail] = React.useState('')
  const [isAddingSubscriber, setIsAddingSubscriber] = React.useState(false)
  const [isSyncingUsers, setIsSyncingUsers] = React.useState(false)
  const [isCleaningTest, setIsCleaningTest] = React.useState(false)

  // Custom dispatch state
  const [customTitle, setCustomTitle] = React.useState('')
  const [customSubtitle, setCustomSubtitle] = React.useState('')
  const [customContent, setCustomContent] = React.useState('')
  const [customCtaText, setCustomCtaText] = React.useState('Explore Services')
  const [customCtaUrl, setCustomCtaUrl] = React.useState('https://virtuecowebworks.solutions/services')
  const [isSendingCustom, setIsSendingCustom] = React.useState(false)

  const activeSubscribersCount = React.useMemo(() => {
    return subscribersList.filter((s) => s.status === 'active').length
  }, [subscribersList])

  // Fetch latest subscriber roster & counts from DB
  const refreshSubscribers = React.useCallback(async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch('/api/newsletter/subscribers')
      const data = await res.json()
      if (res.ok && data.ok) {
        setSubscribersList(data.subscribers)
      }
    } catch (err) {
      console.error('Failed to refresh subscribers:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Auto-fetch on mount so roster is guaranteed up to date with database
  React.useEffect(() => {
    refreshSubscribers()
  }, [refreshSubscribers])

  // Sync registered user accounts into newsletter subscribers
  async function handleSyncUsers() {
    setIsSyncingUsers(true)
    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_users' }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success(data.message || 'Users synced to newsletter')
        await refreshSubscribers()
      } else {
        toast.error(data.error || 'Failed to sync users')
      }
    } catch {
      toast.error('Network error during sync')
    } finally {
      setIsSyncingUsers(false)
    }
  }

  // Add single email subscriber
  async function handleAddSubscriber(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsAddingSubscriber(true)
    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', email: newEmail.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success(data.message || `Subscribed ${newEmail}`)
        setNewEmail('')
        await refreshSubscribers()
      } else {
        toast.error(data.error || 'Failed to add subscriber')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setIsAddingSubscriber(false)
    }
  }

  // Toggle subscriber status (active vs unsubscribed)
  async function handleToggleStatus(email: string, currentStatus: 'active' | 'unsubscribed') {
    const nextStatus = currentStatus === 'active' ? 'unsubscribed' : 'active'
    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, status: nextStatus }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success(`Updated status for ${email} to ${nextStatus}`)
        setSubscribersList((prev) =>
          prev.map((s) => (s.email === email ? { ...s, status: nextStatus } : s)),
        )
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch {
      toast.error('Network error')
    }
  }

  // Delete subscriber permanently
  async function handleDeleteSubscriber(email: string) {
    if (!confirm(`Are you sure you want to permanently remove ${email}?`)) {
      return
    }
    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success(`Removed ${email}`)
        setSubscribersList((prev) => prev.filter((s) => s.email !== email))
      } else {
        toast.error(data.error || 'Failed to remove')
      }
    } catch {
      toast.error('Network error')
    }
  }

  // Clean dummy @example.com test emails
  async function handleCleanTestEmails() {
    if (!confirm('Remove all dummy @example.com test addresses from subscribers?')) {
      return
    }
    setIsCleaningTest(true)
    try {
      const res = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean_test' }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success(data.message || 'Cleaned test emails')
        await refreshSubscribers()
      } else {
        toast.error(data.error || 'Failed to clean')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setIsCleaningTest(false)
    }
  }

  // Trigger Autonomous AI Dispatch
  async function triggerAutoDispatch() {
    if (
      !confirm(
        `Are you sure you want to trigger the autonomous AI crawler and dispatch to ${activeSubscribersCount} active subscribers now?`,
      )
    ) {
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/newsletter/auto-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: 'admin' }),
      })

      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success(`Newsletter dispatched! Sent: ${data.sent}, Failed: ${data.failed}`)
        window.location.reload()
      } else {
        toast.error(data.error || 'Dispatch failed')
      }
    } catch (err) {
      toast.error('Network error during dispatch')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // Send Custom Newsletter
  async function sendCustomNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (!customTitle || !customContent) {
      toast.error('Title and content are required')
      return
    }

    if (!confirm(`Send custom newsletter to ${activeSubscribersCount} active subscribers?`)) {
      return
    }

    setIsSendingCustom(true)
    try {
      const res = await fetch('/api/newsletter/auto-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTitle,
          subtitle: customSubtitle,
          contentHtml: `<p>${customContent.replace(/\n\n/g, '</p><p>')}</p>`,
          ctaText: customCtaText,
          ctaUrl: customCtaUrl,
          triggeredBy: 'admin',
        }),
      })

      const data = await res.json()
      if (res.ok && data.ok) {
        toast.success(`Custom newsletter dispatched! Sent: ${data.sent}`)
        window.location.reload()
      } else {
        toast.error(data.error || 'Failed to send')
      }
    } catch (err) {
      toast.error('Network error')
      console.error(err)
    } finally {
      setIsSendingCustom(false)
    }
  }

  // Filtered subscribers
  const filteredSubscribers = React.useMemo(() => {
    return subscribersList.filter((s) => {
      const matchesSearch =
        s.email.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        (s.source && s.source.toLowerCase().includes(rosterSearch.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [subscribersList, rosterSearch, statusFilter])

  return (
    <div className="flex flex-col gap-8">
      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Active Subscribers */}
        <div
          onClick={() => setActiveTab('roster')}
          className="surface p-5 rounded-2xl border border-border flex items-center justify-between cursor-pointer hover:border-gold-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-600 dark:text-gold-400 group-hover:scale-105 transition-transform">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Active Subscribers
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{activeSubscribersCount}</p>
                <span className="text-xs text-muted-foreground">({subscribersList.length} total)</span>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              refreshSubscribers()
            }}
            title="Refresh database subscriber count"
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted"
          >
            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin text-gold-500' : ''}`} />
          </button>
        </div>

        {/* Card 2: Total Dispatched */}
        <div className="surface p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Send className="size-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Dispatched</p>
            <p className="text-2xl font-bold">{initialCount}</p>
          </div>
        </div>

        {/* Card 3: Autonomous Cron */}
        <div className="surface p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="size-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Clock className="size-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Autonomous Cron</p>
            <p className="text-sm font-semibold text-foreground">Every Monday 08:00 UTC</p>
            <p className="text-[11px] text-muted-foreground">Automated Web Crawl + AI</p>
          </div>
        </div>
      </div>

      {/* ── Tabs & Actions ── */}
      <div className="surface p-6 rounded-2xl border border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('auto')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'auto'
                  ? 'bg-gold-500 text-obsidian shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Autonomous AI Mode
              </span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'custom'
                  ? 'bg-gold-500 text-obsidian shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Custom Dispatch
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'roster'
                  ? 'bg-gold-500 text-obsidian shadow-sm'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                Subscriber Roster ({activeSubscribersCount})
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(!previewOpen)}
              className="gap-2 text-xs"
            >
              <Eye className="size-3.5" />
              {previewOpen ? 'Hide Template Preview' : 'Preview Branded Template'}
            </Button>
          </div>
        </div>

        {/* Live Template Preview Frame */}
        {previewOpen && (
          <div className="mb-6 rounded-xl overflow-hidden border border-border bg-black/40 p-2">
            <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-b border-border/50">
              <span>
                Template Preview: <code>Newsletter Dispatch</code>
              </span>
              <a
                href="/api/preview/email?type=newsletter"
                target="_blank"
                rel="noreferrer"
                className="text-gold-500 hover:underline"
              >
                Open in new tab ↗
              </a>
            </div>
            <iframe
              src="/api/preview/email?type=newsletter"
              className="w-full h-[600px] rounded-lg bg-background"
              title="Newsletter Preview"
            />
          </div>
        )}

        {/* Tab 1: Autonomous AI */}
        {activeTab === 'auto' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/20">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1">
                <Sparkles className="size-4 text-gold-500" />
                Autonomous Website Scanner &amp; Gemini Synthesizer
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The autonomous engine automatically fetches updated sitemaps, analyzes recently shipped case studies
                and web engineering services, extracts core technical takeaways, and synthesizes an executive editorial
                issue using Gemini 2.0. It runs automatically every Monday at 08:00 UTC, or you can trigger an immediate
                dispatch below.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={triggerAutoDispatch}
                disabled={isGenerating}
                className="gap-2 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-obsidian font-semibold"
              >
                {isGenerating ? (
                  <>
                    <VirtueSpinner className="size-4" />
                    Scanning Site &amp; Synthesizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Trigger Autonomous Crawl &amp; Send to {activeSubscribersCount} Active Subscribers
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Dispatch */}
        {activeTab === 'custom' && (
          <form onSubmit={sendCustomNewsletter} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Issue Headline
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Architecting for Sub-100ms Interactions in Next.js 16"
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Subtitle / Preview Preheader
              </label>
              <input
                type="text"
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                placeholder="e.g. How precision CSS containment and edge rendering eliminate visual shift."
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Editorial Content (paragraphs separated by blank lines)
              </label>
              <textarea
                rows={6}
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Write your editorial dispatch body here..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 resize-y"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Call to Action Text
                </label>
                <input
                  type="text"
                  value={customCtaText}
                  onChange={(e) => setCustomCtaText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Call to Action Link URL
                </label>
                <input
                  type="url"
                  value={customCtaUrl}
                  onChange={(e) => setCustomCtaUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSendingCustom}
                className="gap-2 bg-gold-500 text-obsidian font-semibold hover:bg-gold-600"
              >
                {isSendingCustom ? <VirtueSpinner className="size-4" /> : <Send className="size-4" />}
                Send to {activeSubscribersCount} Active Subscribers
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Subscriber Roster */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            {/* Top Toolbar: Quick Add + Sync Actions */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-border">
              {/* Add Subscriber Form */}
              <form onSubmit={handleAddSubscriber} className="flex items-center gap-2 flex-1 max-w-md">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="flex-1 px-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                />
                <Button
                  type="submit"
                  disabled={isAddingSubscriber}
                  size="sm"
                  className="gap-1.5 bg-gold-500 text-obsidian font-semibold hover:bg-gold-600 text-xs shrink-0"
                >
                  {isAddingSubscriber ? <VirtueSpinner className="size-3.5" /> : <UserPlus className="size-3.5" />}
                  Add Subscriber
                </Button>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncUsers}
                  disabled={isSyncingUsers}
                  className="gap-1.5 text-xs"
                  title="Automatically register all client profiles and admin accounts as newsletter subscribers"
                >
                  {isSyncingUsers ? <VirtueSpinner className="size-3.5" /> : <UserCheck className="size-3.5 text-emerald-500" />}
                  Sync Registered Users
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCleanTestEmails}
                  disabled={isCleaningTest}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-rose-500"
                  title="Prune @example.com test records"
                >
                  {isCleaningTest ? <VirtueSpinner className="size-3.5" /> : <Trash2 className="size-3.5" />}
                  Clean Test Emails
                </Button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Filter by email or source..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-gold-500/40"
                />
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Filter className="size-3.5" /> View:
                </span>
                {(['all', 'active', 'unsubscribed'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setStatusFilter(mode)}
                    className={`px-2.5 py-1 rounded-lg capitalize text-xs font-medium transition-colors ${
                      statusFilter === mode ? 'bg-gold-500 text-obsidian' : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">Subscriber Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Origin / Source</th>
                    <th className="py-3 px-4">Date Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No subscribers found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          {item.email}
                          {item.email.includes('admin') || item.email.includes('virtueco') ? (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-gold-500/10 text-gold-600 dark:text-gold-400 font-sans font-semibold">
                              Admin
                            </span>
                          ) : item.email.includes('globalgraphics') ? (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-sans font-semibold">
                              Client
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(item.email, item.status)}
                            title="Click to toggle status"
                            className="cursor-pointer"
                          >
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize transition-colors ${
                                item.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                              }`}
                            >
                              ● {item.status}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground capitalize">
                          {item.source || 'website'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteSubscriber(item.email)}
                            title={`Delete ${item.email}`}
                            className="text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Dispatch History Table ── */}
      <div className="surface p-6 rounded-2xl border border-border">
        <h3 className="text-base font-semibold text-foreground mb-4">Past Dispatches</h3>

        {dispatches.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No newsletters have been dispatched yet. The scheduled cron will run next Monday at 08:00 UTC.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-3 px-4">Headline / Subject</th>
                  <th className="py-3 px-4">Trigger</th>
                  <th className="py-3 px-4">Sent At</th>
                  <th className="py-3 px-4 text-center">Delivered</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dispatches.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium max-w-xs truncate text-foreground">
                      {item.title}
                      <p className="text-xs text-muted-foreground truncate">{item.subject}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[11px] font-semibold">
                        {item.triggered_by === 'cron' ? '⏰ Auto Cron' : '👤 Manual Admin'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.sent_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs">
                      <span className="font-semibold text-emerald-500">{item.recipients_sent}</span>
                      <span className="text-muted-foreground"> / {item.recipients_total}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.recipients_failed === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                          <CheckCircle2 className="size-3.5" /> 100% Ok
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-medium">
                          <AlertCircle className="size-3.5" /> {item.recipients_failed} failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
