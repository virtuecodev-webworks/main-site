'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Search,
  CheckCircle2,
  ArrowRight,
  Monitor,
  Database,
} from 'lucide-react'
import { AmbientBackground } from '@/components/brand/ambient-background'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

interface ArchitectureLayer {
  id: string
  number: string
  name: string
  kicker: string
  businessBenefit: string
  techSummary: string
  deliverables: string[]
  icon: React.ComponentType<{ className?: string }>
}

const LAYERS: ArchitectureLayer[] = [
  {
    id: 'layer-ui',
    number: '01',
    name: 'Visual Design & Customer Experience',
    kicker: 'First Impressions',
    businessBenefit:
      'Turn casual visitors into paying clients. Your layout is custom-designed with clear call-to-actions, high-contrast typography, and intuitive mobile navigation so visitors never get confused.',
    techSummary: 'Custom design in Questrial, mobile-first responsive grid, WCAG AAA accessibility.',
    deliverables: [
      'Tailored brand identity & layout',
      'Flawless on phone, tablet & desktop',
      'Clean forms with instant input validation',
      'Light & dark mode support',
    ],
    icon: Monitor,
  },
  {
    id: 'layer-engine',
    number: '02',
    name: 'Ultra-Fast Frontend Engine',
    kicker: 'Sub-Second Speed',
    businessBenefit:
      '53% of mobile visitors leave a site if it takes longer than 3 seconds to load. We build on Next.js 16 so pages open in milliseconds without jarring screen flickers.',
    techSummary: 'React Server Components, hybrid static pre-rendering, minimal JavaScript payload.',
    deliverables: [
      'Loads in under 1 second worldwide',
      'Instant page flips without reloading',
      'Zero bloated WordPress theme builders',
      'Optimized images delivered in WebP/AVIF',
    ],
    icon: Zap,
  },
  {
    id: 'layer-db',
    number: '03',
    name: 'Secure Database & Client Logins',
    kicker: 'Data Protection',
    businessBenefit:
      'Keep your customer data, bookings, and user accounts completely safe with enterprise-level encryption and passwordless login options.',
    techSummary: 'Supabase PostgreSQL database, Row-Level Security (RLS), OAuth & Magic Link auth.',
    deliverables: [
      'Encrypted user authentication',
      'Private customer portals & dashboards',
      'Automated database backups',
      'GDPR & CCPA compliant data handling',
    ],
    icon: Database,
  },
  {
    id: 'layer-pay',
    number: '04',
    name: 'Global Checkout & Payment Processing',
    kicker: 'Revenue Automation',
    businessBenefit:
      'Collect money directly from clients in USD ($). Supports Apple Pay, Google Pay, and all major international credit cards with automatic receipts.',
    techSummary: 'Stripe API integration, PCI-DSS Level 1 compliance, automated webhook reconciliation.',
    deliverables: [
      'One-click Apple Pay & Google Pay',
      'Fixed package checkout & invoicing',
      'Automatic payment confirmation emails',
      'Zero middleman transaction holds',
    ],
    icon: CreditCard,
  },
  {
    id: 'layer-seo',
    number: '05',
    name: 'Google SEO & Global Edge Delivery',
    kicker: 'Visibility & Traffic',
    businessBenefit:
      'Help high-paying customers find you on Google. Every page is structured with search engine tags, rich social preview cards, and global edge caching.',
    techSummary: 'JSON-LD schema markup, automated XML sitemaps, 100/100 Core Web Vitals score.',
    deliverables: [
      '100/100 Google Lighthouse score',
      'Automatic Google indexing & schema',
      'Crisp social media share previews',
      'Worldwide CDN edge server delivery',
    ],
    icon: Search,
  },
]

export function WebsiteAnatomy() {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(0)
  const activeLayer = LAYERS[selectedLayerIndex]

  return (
    <section className="relative isolate overflow-hidden py-24 px-5 sm:px-8 border-t border-border bg-card/40 font-sans">
      {/* Ambient background animation */}
      <AmbientBackground size="xl" speed={160} align="top-right" opacity={0.6} />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Heading with Simple, Clear Language */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-semibold text-foreground mb-4">
            <Layers className="size-3.5 text-primary" />
            <span>The Anatomy of a Modern Website</span>
            <span className="text-border">/</span>
            <span className="text-muted-foreground">What You Actually Get</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Every Layer. Engineered to Win Customers.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            We don&apos;t just paste templates together. Here is how your website is built from the ground up to load fast, protect your data, and turn casual visitors into paying clients.
          </p>
        </div>

        {/* Interactive Exploded Architecture Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Visual Exploded Layers Stack */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 mb-1">
              Click any layer to inspect:
            </span>

            {LAYERS.map((layer, index) => {
              const isSelected = selectedLayerIndex === index
              const Icon = layer.icon

              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayerIndex(index)}
                  className={`group relative rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary/80 bg-card shadow-lg ring-1 ring-primary/40 -translate-x-1 sm:-translate-x-2'
                      : 'border-border/80 bg-muted/30 hover:border-border hover:bg-muted/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex size-10 items-center justify-center rounded-xl border text-sm font-bold transition-colors ${
                          isSelected
                            ? 'border-primary/40 bg-primary/10 text-primary'
                            : 'border-border bg-card text-muted-foreground group-hover:text-foreground'
                        }`}
                      >
                        {layer.number}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary/90 uppercase tracking-wide">
                            {layer.kicker}
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-foreground">
                          {layer.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Icon
                        className={`size-5 transition-colors ${
                          isSelected ? 'text-primary' : 'text-muted-foreground/60'
                        }`}
                      />
                      <ArrowRight
                        className={`size-4 transition-transform ${
                          isSelected
                            ? 'text-primary translate-x-1'
                            : 'text-muted-foreground/40 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Detailed Layer Breakdown & Business Value */}
          <div className="lg:col-span-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLayer.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden"
              >
                {/* Layer Badge & Number */}
                <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                      Layer {activeLayer.number} / 05
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activeLayer.kicker}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" /> Included in all packages
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                  {activeLayer.name}
                </h3>

                {/* Business Benefit Callout (Plain English) */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-6">
                  <span className="text-xs font-bold uppercase tracking-wide text-primary block mb-1">
                    Why this matters for your business:
                  </span>
                  <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                    {activeLayer.businessBenefit}
                  </p>
                </div>

                {/* Deliverables Checklist */}
                <div className="space-y-3 mb-6">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    What we build into this layer:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeLayer.deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs sm:text-[13px] text-muted-foreground"
                      >
                        <CheckCircle2 className="size-4 text-emerald shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Under the hood technical note */}
                <div className="border-t border-border/60 pt-4 text-xs text-muted-foreground/80 flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] truncate">
                    Stack: {activeLayer.techSummary}
                  </span>
                  <Button asChild variant="gold" size="sm" className="shrink-0">
                    <Link href="/#services-catalog">
                      <span>Choose a Plan</span>
                      <ArrowRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
