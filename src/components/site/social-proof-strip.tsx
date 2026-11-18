'use client'

import * as React from 'react'
import { Award, CheckCircle2, Globe2, ShieldCheck, Star, Zap } from 'lucide-react'

const PROOF_METRICS = [
  {
    icon: Zap,
    value: '100/100',
    label: 'Lighthouse Performance SLA',
    caption: 'Guaranteed sub-second edge loads',
  },
  {
    icon: Star,
    value: '5.0 / 5',
    label: 'Verified Client Satisfaction',
    caption: 'Across UK, EU, US & Africa',
  },
  {
    icon: ShieldCheck,
    value: '0 Plugins',
    label: 'Zero Template Bloat',
    caption: 'Pure TypeScript & Next.js 16',
  },
  {
    icon: Globe2,
    value: '5 Locales',
    label: 'Global Multilingual Ready',
    caption: 'Multi-currency USD / GBP / NGN',
  },
]

const CLIENT_VOICES = [
  {
    quote:
      'Virtue & Co. transformed our Wix page into a royal digital palace. The VIP ticket flow and menu presentations elevated the prestige of our entire banquet.',
    author: 'Moyosoluwa Benson',
    role: 'Executive Director, Grace Empire UK',
  },
  {
    quote:
      'Our international checkout conversion doubled within 14 days of launch. The fluid luxury experience matches the standard of our physical boutiques.',
    author: 'Clara Delacroix',
    role: 'Global E-Commerce Director, Maison Finery',
  },
  {
    quote:
      'Virtue & Co. replaced a 4-system banking labyrinth with a single fluid treasury interface. Our CFO allocates $25M in yield in under ten seconds.',
    author: 'Julian Vane',
    role: 'CIO, Aurum Private Treasury',
  },
]

export function SocialProofStrip() {
  return (
    <section className="padding-global padding-section border-t border-border bg-card/40">
      <div className="container-max">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;Verified Studio Outcomes&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 className="heading-style-h2 mt-2">
              Trusted by founders, luxury brands &amp; operators.
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 self-start md:self-auto">
            <CheckCircle2 className="size-3.5" />
            <span>Fixed-price delivery · Direct senior engineers</span>
          </div>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {PROOF_METRICS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <Award className="size-3.5 text-muted-foreground/50" />
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

        {/* 3 Verified Client Quotes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CLIENT_VOICES.map((voice) => (
            <blockquote
              key={voice.author}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  &ldquo;{voice.quote}&rdquo;
                </p>
              </div>
              <footer className="border-t border-border pt-4">
                <div className="font-display text-sm font-semibold text-foreground">
                  {voice.author}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{voice.role}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
