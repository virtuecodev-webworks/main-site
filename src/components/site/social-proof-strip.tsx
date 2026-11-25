'use client'

import * as React from 'react'
import { CheckCircle2, Clock, Code2, Globe2, ShieldCheck, Users } from 'lucide-react'
import { LaunchBadge } from '@/components/site/launch-badge'

const STUDIO_STANDARDS = [
  {
    icon: Users,
    value: '1 : 1',
    label: 'Direct Senior Engineers',
    caption: 'No account managers or outsourced handoffs',
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Source Code Ownership',
    caption: 'Domain, codebase, and accounts belong to you',
  },
  {
    icon: Code2,
    value: '90+ CWV',
    label: 'Core Web Vitals Target',
    caption: 'Clean TypeScript & semantic HTML',
  },
  {
    icon: Globe2,
    value: '5 Locales',
    label: 'Multilingual & Multi-Currency',
    caption: 'Settles in USD, GBP, EUR & NGN',
  },
]

const DELIVERY_CONDITIONS = [
  {
    title: 'Fixed-Scope Pricing',
    body: 'Every project begins with a written scope and fixed price before work starts. Additions outside the agreed brief are quoted separately and only proceed with your approval.',
    tag: 'Written quote upfront',
  },
  {
    title: 'Performance & Accessibility Targets',
    body: 'We engineer every custom page for 90+ Lighthouse Performance and Accessibility scores on delivered markup, excluding unoptimized third-party scripts or embeds added post-handover.',
    tag: 'Measured before launch',
  },
  {
    title: 'Timeline & 30-Day Support',
    body: 'Delivery timelines start once scope, deposit, and required brand content are received. Every launch includes 30 days of free bug-fix support for delivered work.',
    tag: '30-day warranty',
  },
]

export function SocialProofStrip() {
  return (
    <section className="padding-global padding-section border-t border-border bg-card/40">
      <div className="container-max">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;Studio Commitments &amp; Standards&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 className="heading-style-h2 mt-2">
              Clear terms, measurable targets, and direct engineering.
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 self-start md:self-auto">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            <span>Fixed-price delivery · Direct senior team</span>
          </div>
        </div>

        {/* 4 Studio Standards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {STUDIO_STANDARDS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <Clock className="size-3.5 text-muted-foreground/50" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {item.value}
                  </p>
                  <p className="text-xs font-semibold text-foreground mt-1">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.caption}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Official Public Launch Record & Verification Banner */}
        <div className="mb-8">
          <LaunchBadge theme="auto" variant="card" showLiveBeacon />
        </div>

        {/* 3 Transparent Delivery Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DELIVERY_CONDITIONS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-2.5">
                <span className="label-mono-xs text-primary">{item.tag}</span>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
