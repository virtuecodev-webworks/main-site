'use client'

import * as React from 'react'
import {
  Code2,
  Gauge,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  Cpu,
  ArrowUpRight,
  DollarSign,
} from 'lucide-react'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { TechMarquee } from '@/components/ui/tech-marquee'

export function BentoGrid() {
  const [activeTab, setActiveTab] = React.useState<'speed' | 'scale' | 'security'>('speed')

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 font-sans">
      {/* 1. Large Feature Card: 100% Lighthouse & Performance Engine */}
      <SpotlightCard className="relative overflow-hidden md:col-span-2">
        <BorderBeam size={280} duration={14} colorFrom="#E8C84A" colorTo="#B8922A" />
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="size-3.5" />
              <span>Built For Real Business Growth</span>
            </div>
            <h3 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Websites That Load Instantly So You Never Lose a Customer
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              If your site takes more than 2 seconds to load, over half your visitors leave. We optimize every image, script, and font so your pages open immediately on mobile and rank at the top of Google.
            </p>
          </div>

          <div className="flex gap-2 self-start rounded-lg border border-border bg-muted/30 p-1">
            {(['speed', 'scale', 'security'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'speed' ? 'Fast Loading' : tab === 'scale' ? 'High Traffic' : 'Encrypted'}
              </button>
            ))}
          </div>
        </div>

        {/* 100/100 Badges */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-background/60 p-4 text-center">
            <span className="font-sans text-3xl font-bold text-emerald">100%</span>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Speed Score
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/60 p-4 text-center">
            <span className="font-sans text-3xl font-bold text-emerald">100%</span>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Mobile Friendly
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/60 p-4 text-center">
            <span className="font-sans text-3xl font-bold text-emerald">100%</span>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Best Practices
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/60 p-4 text-center">
            <span className="font-sans text-3xl font-bold text-emerald">100%</span>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Google SEO Ready
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border/60 pt-4">
          <TechMarquee />
        </div>
      </SpotlightCard>

      {/* 2. Bespoke Brand Systems & Pure Questrial Typography */}
      <SpotlightCard className="flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-foreground">
              Modern, Trustworthy Design
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              First impressions decide whether a customer calls you or a competitor. We craft clean layouts in Questrial that make your business look established, credible, and premium.
            </p>
          </div>

          <div className="space-y-2.5 rounded-lg border border-border/70 bg-muted/30 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Readable Typography</span>
              <span className="font-semibold text-foreground">Clean Questrial</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Device Compatibility</span>
              <span className="font-semibold text-foreground">Phone, Tablet, Desktop</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Interface Harmony</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald">
                <CheckCircle2 className="size-3" /> Light &amp; Dark Ready
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4">
          <Button asChild variant="outline" size="sm" className="w-full justify-between">
            <Link href="/services">
              <span>Explore Services &amp; Packages</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </SpotlightCard>

      {/* 3. Standardized Fixed USD Pricing */}
      <SpotlightCard className="flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex size-10 items-center justify-center rounded-lg border border-emerald/20 bg-emerald/10 text-emerald">
            <DollarSign className="size-5" />
          </div>
          <div>
            <h3 className="font-sans text-xl font-bold text-foreground">
              Fixed Pricing — Zero Surprises
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No open-ended hourly billing or surprise invoices. You approve one clear price and delivery date before we start.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="rounded-lg border border-border/60 bg-background/50 p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground">Custom Web Apps</span>
              <p className="font-bold text-foreground mt-0.5">$120 – $750</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/50 p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground">WordPress Core</span>
              <p className="font-bold text-foreground mt-0.5">$95 – $550</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/50 p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground">Wix Studio</span>
              <p className="font-bold text-foreground mt-0.5">$80 – $450</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/50 p-2.5 text-center">
              <span className="text-[11px] text-muted-foreground">E-Commerce Store</span>
              <p className="font-bold text-foreground mt-0.5">$160 – $790</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4">
          <Button asChild variant="ghost" size="sm" className="w-full justify-between">
            <Link href="/#services-catalog">
              <span>View All Package Tiers</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </SpotlightCard>

      {/* 4. Client & Project Portal Workspace (2 cols) */}
      <SpotlightCard className="relative overflow-hidden md:col-span-2">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground">
              <ShieldCheck className="size-3.5 text-emerald" />
              <span>Full Visibility Every Day</span>
            </div>
            <h3 className="font-sans text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your Private Client Portal — Track Progress In Real Time
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Never wonder what your developers are doing. Every project comes with a private dashboard where you can review live preview builds, approve milestone stages, and chat directly with your senior engineers.
            </p>
          </div>

          <Button asChild variant="gold" size="sm" className="shrink-0">
            <Link href="/portal">
              <span>Client Portal</span>
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mock milestone progression bar */}
        <div className="mt-8 rounded-xl border border-border/80 bg-background/70 p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Project: Next.js Web App (VCW-2026-DEV001)</span>
            <span className="rounded bg-emerald/10 px-2 py-0.5 font-semibold text-emerald">
              Milestone 3 of 4: Polish &amp; Speed Optimization
            </span>
          </div>

          <div className="mt-4 relative h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-emerald" />
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="text-primary font-semibold">1. Plan &amp; Wireframe</div>
            <div className="text-primary font-semibold">2. UI Development</div>
            <div className="text-primary font-semibold">3. Speed &amp; Testing</div>
            <div className="text-muted-foreground">4. Launch &amp; Handover</div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  )
}
