'use client'

import * as React from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  FileText,
  FolderGit2,
  Layers,
  MessageSquare,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { StatusBadge } from './order-view'
import { cn } from '@/lib/utils'
import type { Order } from '@/lib/supabase/types'

export interface ClientMobileDashboardProps {
  orders: Order[]
  unreadSummary: { byOrder: Record<string, number>; total: number }
  clientName: string | null
  clientEmail: string | null
  locale: string
  currency: string
}

export function ClientMobileDashboard({
  orders,
  unreadSummary,
  clientName,
  clientEmail,
  locale,
  currency,
}: ClientMobileDashboardProps) {
  const activeOrder =
    orders.find((o) => o.status === 'scoping' || o.status === 'review' || o.status === 'quoted') ??
    orders[0]

  return (
    <div className="flex flex-col gap-6 lg:hidden">
      {/* 1. HERO ACTIVE PROJECT CARD (Screen 1 Inspiration) */}
      {activeOrder ? (
        <div className="relative overflow-hidden rounded-[26px] border border-border bg-[#0a0a0a] p-6 text-[#f5f4f0] shadow-xl">
          {/* Subtle gold glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-gold-500/15 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="label-mono-xs text-primary">
                ( &nbsp;Active Production Build&nbsp; )
              </span>
              <StatusBadge status={activeOrder.status} />
            </div>

            <div>
              <p className="text-xs text-[#f5f4f0]/60 font-mono">Ref: {activeOrder.reference}</p>
              <h2 className="heading-style-h3 mt-1 font-bold text-[#f5f4f0] leading-snug">
                {activeOrder.title}
              </h2>
            </div>

            {/* 3 Quick Stat Pills (Directly matching Screen 1 from inspiration) */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.06] p-3 text-center border border-white/10">
              <div className="flex flex-col">
                <span className="text-[10.5px] text-[#f5f4f0]/60 uppercase tracking-wider">Status</span>
                <span className="font-display text-xs font-bold text-primary mt-0.5 capitalize">
                  {activeOrder.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-col border-x border-white/10">
                <span className="text-[10.5px] text-[#f5f4f0]/60 uppercase tracking-wider">Messages</span>
                <span className="font-display text-xs font-bold text-[#f5f4f0] mt-0.5">
                  {(unreadSummary.byOrder[activeOrder.id] ?? 0) > 0 ? (
                    <span className="text-primary font-extrabold">{unreadSummary.byOrder[activeOrder.id]} New</span>
                  ) : (
                    'All Caught Up'
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10.5px] text-[#f5f4f0]/60 uppercase tracking-wider">Currency</span>
                <span className="font-display text-xs font-bold text-[#f5f4f0] mt-0.5">
                  {activeOrder.currency}
                </span>
              </div>
            </div>

            {/* Action CTA */}
            <Link
              href={`/portal/orders/${activeOrder.reference}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-[#0a0a0a] shadow-md transition-transform active:scale-95"
            >
              <span>Open Project Discussion &amp; Spec</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-[26px] border border-border bg-card p-6 text-foreground shadow-sm">
          <span className="label-mono-xs text-primary">( &nbsp;Welcome to Virtue &amp; Co.&nbsp; )</span>
          <h2 className="heading-style-h3 mt-2 font-bold">Start Your First Custom Build</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Direct collaboration with senior engineers, guaranteed delivery timelines, and full code ownership.
          </p>
          <a
            href="#new-request"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
          >
            <span>Create Project Brief</span>
            <ArrowRight className="size-4" />
          </a>
        </div>
      )}

      {/* 2. QUICK ACTION CATEGORY TILES (2x2 Grid matching Screen 1 & Screen 3) */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-1">
          Quick Access
        </span>

        <div className="grid grid-cols-2 gap-3">
          {/* Discussion */}
          <Link
            href={activeOrder ? `/portal/orders/${activeOrder.reference}` : '#new-request'}
            className="group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="size-5" />
              </div>
              {(unreadSummary.total ?? 0) > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadSummary.total}
                </span>
              )}
            </div>
            <div>
              <p className="font-display text-sm font-bold text-foreground">Discussion</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Chat &amp; file attachments</p>
            </div>
          </Link>

          {/* Spec & Milestones */}
          <Link
            href={activeOrder ? `/portal/orders/${activeOrder.reference}` : '#new-request'}
            className="group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-foreground">Spec &amp; Scope</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Phases &amp; milestones</p>
            </div>
          </Link>

          {/* Instant Payment */}
          <Link
            href="/payment"
            className="group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-foreground">Instant Pay</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Milestone settlements</p>
            </div>
          </Link>

          {/* Portfolio Flagship Showcase */}
          <Link
            href="/portfolio"
            className="group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary active:scale-95"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderGit2 className="size-5" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-foreground">Flagship Work</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Explore live client sites</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
