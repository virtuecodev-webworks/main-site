'use client'

import * as React from 'react'
import { Sparkles, Send, Eye, RefreshCw, CheckCircle2, AlertCircle, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VirtueSpinner } from '@/components/brand/virtue-spinner'
import { toast } from 'sonner'
import type { NewsletterDispatch } from '@/lib/supabase/types'

interface NewsletterConsoleProps {
  subscribersCount: number
  dispatchesCount: number
  recentDispatches: NewsletterDispatch[]
}

export function NewsletterConsole({
  subscribersCount: initialSubscribers,
  dispatchesCount: initialCount,
  recentDispatches: initialDispatches,
}: NewsletterConsoleProps) {
  const [subscribersCount] = React.useState(initialSubscribers)
  const [dispatches, setDispatches] = React.useState<NewsletterDispatch[]>(initialDispatches)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'auto' | 'custom'>('auto')

  // Custom dispatch state
  const [customTitle, setCustomTitle] = React.useState('')
  const [customSubtitle, setCustomSubtitle] = React.useState('')
  const [customContent, setCustomContent] = React.useState('')
  const [customCtaText, setCustomCtaText] = React.useState('Explore Services')
  const [customCtaUrl, setCustomCtaUrl] = React.useState('https://virtuecowebworks.solutions/services')
  const [isSendingCustom, setIsSendingCustom] = React.useState(false)

  // Trigger Autonomous AI Dispatch
  async function triggerAutoDispatch() {
    if (!confirm(`Are you sure you want to trigger the autonomous AI crawler and dispatch to ${subscribersCount} active subscribers now?`)) {
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
        // Refresh page to see new dispatch in table
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

    if (!confirm(`Send custom newsletter to ${subscribersCount} subscribers?`)) {
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

  return (
    <div className="flex flex-col gap-8">
      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="size-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-600 dark:text-gold-400">
            <Users className="size-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Subscribers</p>
            <p className="text-2xl font-bold">{subscribersCount}</p>
          </div>
        </div>

        <div className="surface p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Send className="size-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Dispatched</p>
            <p className="text-2xl font-bold">{initialCount}</p>
          </div>
        </div>

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
          <div className="flex items-center gap-2">
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
              <span>Template Preview: <code>Newsletter Dispatch</code></span>
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
                Autonomous Website Scanner & Gemini Synthesizer
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The autonomous engine automatically fetches updated sitemaps, analyzes recently shipped case studies and web engineering services, extracts core technical takeaways, and synthesizes an executive editorial issue using Gemini 2.0. It runs automatically every Monday at 08:00 UTC, or you can trigger an immediate dispatch below.
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
                    Trigger Autonomous Crawl &amp; Send Now
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
                Send to {subscribersCount} Active Subscribers
              </Button>
            </div>
          </form>
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
