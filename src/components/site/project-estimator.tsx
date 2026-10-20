'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Check,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { BorderBeam } from '@/components/ui/border-beam'

interface ProjectType {
  id: string
  title: string
  desc: string
  baseUsd: number
  timeline: string
}

const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'landing',
    title: 'High-Impact Landing Page',
    desc: 'Bespoke design, fast 100/100 Lighthouse score, interactive 21st.dev elements & lead capture.',
    baseUsd: 150,
    timeline: '5-8 business days',
  },
  {
    id: 'corporate',
    title: 'Multi-Page Brand Experience',
    desc: 'Complete studio presence (5-10 pages), service breakdowns, portfolio showcase & team pages.',
    baseUsd: 450,
    timeline: '2-3 weeks',
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce / Payment Hub',
    desc: 'Product catalog, Stripe/card checkout, webhook order ledger & inventory management.',
    baseUsd: 650,
    timeline: '3-4 weeks',
  },
  {
    id: 'custom-app',
    title: 'Full-Stack Next.js Web App',
    desc: 'Authentication, Supabase Postgres RLS, client portal dashboard, APIs, and custom workflows.',
    baseUsd: 950,
    timeline: '4-6 weeks',
  },
]

interface Addon {
  id: string
  name: string
  usd: number
  desc: string
}

const ADDONS: Addon[] = [
  { id: 'cms', name: 'Self-Serve CMS & Blog', usd: 100, desc: 'Manage articles, case studies & updates easily.' },
  { id: 'i18n', name: 'Multi-Language (i18n + RTL)', usd: 120, desc: '5 languages including Arabic RTL support.' },
  { id: 'payments', name: 'Payment Gateway Integration', usd: 100, desc: 'Stripe & card global checkout integration.' },
  { id: 'motion', name: 'Cinematic 21st.dev Motion', usd: 150, desc: 'Smooth GSAP & Framer Motion interactive reveals.' },
  { id: 'auth', name: 'Client Portal & Authentication', usd: 200, desc: 'Dedicated client area with order progression.' },
]

export function ProjectEstimator() {
  const [selectedType, setSelectedType] = React.useState<string>('corporate')
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>(['cms', 'motion'])
  const [expressTimeline, setExpressTimeline] = React.useState(false)

  const currentType = PROJECT_TYPES.find((t) => t.id === selectedType) || PROJECT_TYPES[0]

  const basePrice = currentType.baseUsd

  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = ADDONS.find((a) => a.id === addonId)
    if (!addon) return sum
    return sum + addon.usd
  }, 0)

  const subtotal = basePrice + addonsTotal
  const finalTotal = expressTimeline ? Math.round(subtotal * 1.25) : subtotal

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const currencySymbol = '$'
  const displayCurrency = 'USD'

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        {/* Configuration Columns */}
        <div className="space-y-8">
          {/* Step 1: Project Type */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <h3 className="font-sans text-lg font-bold text-foreground">
                Select Project Scope
              </h3>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PROJECT_TYPES.map((type) => {
                const isSelected = selectedType === type.id
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground text-sm">
                          {type.title}
                        </span>
                        {isSelected && (
                          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {type.desc}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" /> {type.timeline}
                      </span>
                      <span className="font-semibold text-foreground">
                        From ${type.baseUsd}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Add-on Capabilities */}
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <h3 className="font-sans text-lg font-bold text-foreground">
                Add Specialized Capabilities
              </h3>
            </div>
            <div className="mt-4 space-y-2.5">
              {ADDONS.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id)
                return (
                  <label
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                      isChecked
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border bg-card hover:bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-5 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background'
                        }`}
                      >
                        {isChecked && <Check className="size-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{addon.name}</p>
                        <p className="text-[11px] text-muted-foreground">{addon.desc}</p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-medium text-foreground">
                      +${addon.usd}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Step 3: Timeline Expedited Delivery */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" />
                  Express Priority Delivery
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Cuts delivery window by ~40% with dedicated sprint focus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpressTimeline(!expressTimeline)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  expressTimeline ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    expressTimeline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Live Estimate Summary Card */}
        <div className="lg:sticky lg:top-24">
          <SpotlightCard className="relative flex flex-col justify-between border-primary/40 bg-card shadow-xl">
            <BorderBeam size={220} duration={10} colorFrom="#dcaa28" colorTo="#14a06c" />

            <div className="space-y-6">
              <div className="border-b border-border/80 pb-4">
                <span className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                  Transparent Estimate
                </span>
                <h4 className="mt-1 font-sans text-xl font-bold text-foreground">
                  {currentType.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Estimated Delivery: {expressTimeline ? 'Accelerated Priority' : currentType.timeline}
                </p>
              </div>

              {/* Line items breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Architecture</span>
                  <span className="font-mono text-foreground">
                    {currencySymbol}
                    {basePrice.toLocaleString()}
                  </span>
                </div>

                {selectedAddons.map((addonId) => {
                  const addon = ADDONS.find((a) => a.id === addonId)
                  if (!addon) return null
                  const price = addon.usd
                  return (
                    <div key={addonId} className="flex justify-between text-muted-foreground">
                      <span>+ {addon.name}</span>
                      <span className="font-mono text-foreground">
                        {currencySymbol}
                        {price.toLocaleString()}
                      </span>
                    </div>
                  )
                })}

                {expressTimeline && (
                  <div className="flex justify-between text-primary">
                    <span>+ Priority Sprint (25%)</span>
                    <span className="font-mono font-medium">
                      +{currencySymbol}
                      {(finalTotal - subtotal).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Total display */}
              <div className="rounded-xl border border-border/80 bg-background/80 p-4">
                <div className="text-[11px] font-medium text-muted-foreground uppercase">
                  Estimated Investment ({displayCurrency})
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-sans text-4xl font-bold text-foreground">
                    {currencySymbol}
                    {finalTotal.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">fixed quote ready</span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Includes 100/100 Lighthouse SLA, responsive engineering, and full IP handover.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button asChild variant="gold" size="lg" className="w-full justify-between">
                <Link
                  href={{
                    pathname: '/contact',
                    query: {
                      plan: currentType.id,
                      budget: finalTotal,
                      currency: displayCurrency,
                    },
                  }}
                >
                  <span>Lock in this Project Quote</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <p className="text-center text-[10px] text-muted-foreground">
                No commitment required. Scope is confirmed during discovery.
              </p>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  )
}
