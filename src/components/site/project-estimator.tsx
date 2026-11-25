'use client'

import * as React from 'react'
import { Check, Clock, ArrowRight, Zap } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { useRegion } from '@/components/site/region-provider'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { BorderBeam } from '@/components/ui/border-beam'
import type { CurrencyCode } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'

interface ProjectType {
  id: string
  title: string
  desc: string
  baseUsd: number
  timeline: string
}

const CURRENCY_MULTIPLIER: Record<CurrencyCode, number> = {
  USD: 1,
  GBP: 0.8,
  EUR: 0.92,
  NGN: 1500,
}

function convertFromUsd(usd: number, currency: CurrencyCode): number {
  const rate = CURRENCY_MULTIPLIER[currency] ?? 1
  const raw = usd * rate
  if (currency === 'NGN') return Math.round(raw / 1000) * 1000
  return Math.round(raw)
}

const PROJECT_TYPES: ProjectType[] = [
  {
    id: 'landing',
    title: 'High-Impact Landing Page',
    desc: 'Bespoke responsive layout, 90+ Core Web Vitals optimization target, interactive UI & lead capture.',
    baseUsd: 150,
    timeline: '5–8 business days',
  },
  {
    id: 'corporate',
    title: 'Multi-Page Brand Experience',
    desc: 'Complete studio presence (5–10 pages), service breakdowns, portfolio showcase & team pages.',
    baseUsd: 450,
    timeline: '2–3 weeks',
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce / Payment Hub',
    desc: 'Product catalog, Stripe/card checkout, webhook order ledger & inventory management.',
    baseUsd: 650,
    timeline: '3–4 weeks',
  },
  {
    id: 'custom-app',
    title: 'Full-Stack Next.js Web App',
    desc: 'Authentication, Supabase Postgres RLS, client portal dashboard, APIs, and custom workflows.',
    baseUsd: 950,
    timeline: '4–6 weeks',
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
  { id: 'motion', name: 'Custom Motion & Micro-Interactions', usd: 150, desc: 'Smooth GSAP & Framer Motion interactive reveals.' },
  { id: 'auth', name: 'Client Portal & Authentication', usd: 200, desc: 'Dedicated client area with order progression.' },
]

export function ProjectEstimator() {
  const locale = useLocale()
  const { currency } = useRegion()
  const [selectedType, setSelectedType] = React.useState<string>('corporate')
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>(['cms', 'motion'])
  const [expressTimeline, setExpressTimeline] = React.useState(false)

  const currentType = PROJECT_TYPES.find((t) => t.id === selectedType) || PROJECT_TYPES[0]

  const basePriceUsd = currentType.baseUsd
  const addonsTotalUsd = selectedAddons.reduce((sum, addonId) => {
    const addon = ADDONS.find((a) => a.id === addonId)
    return addon ? sum + addon.usd : sum
  }, 0)

  const subtotalUsd = basePriceUsd + addonsTotalUsd
  const finalTotalUsd = expressTimeline ? Math.round(subtotalUsd * 1.25) : subtotalUsd

  const baseDisplay = convertFromUsd(basePriceUsd, currency)
  const finalDisplay = convertFromUsd(finalTotalUsd, currency)
  const subtotalDisplay = convertFromUsd(subtotalUsd, currency)
  const priorityDisplay = Math.max(0, finalDisplay - subtotalDisplay)

  const fmt = (amount: number) => formatMoney(amount, currency, locale, { decimals: false })

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

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
            <div
              role="radiogroup"
              aria-label="Project Scope"
              className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {PROJECT_TYPES.map((type) => {
                const isSelected = selectedType === type.id
                return (
                  <button
                    key={type.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedType(type.id)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-4 text-start transition-all ${
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
                          <span
                            aria-hidden="true"
                            className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
                          >
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
                        <Clock className="size-3" aria-hidden="true" /> {type.timeline}
                      </span>
                      <span className="font-semibold text-foreground tabular-nums">
                        From {fmt(convertFromUsd(type.baseUsd, currency))}
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
                  <button
                    key={addon.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleAddon(addon.id)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3.5 text-start transition-all ${
                      isChecked
                        ? 'border-primary/60 bg-primary/5'
                        : 'border-border bg-card hover:bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background'
                        }`}
                      >
                        {isChecked && <Check className="size-3.5" />}
                      </span>
                      <div>
                        <span className="block text-xs font-semibold text-foreground">{addon.name}</span>
                        <span className="block text-[11px] text-muted-foreground">{addon.desc}</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-medium text-foreground tabular-nums">
                      +{fmt(convertFromUsd(addon.usd, currency))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 3: Timeline Expedited Delivery */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" aria-hidden="true" />
                  Express Priority Delivery
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Cuts delivery window by ~40% with dedicated sprint focus (+25%).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={expressTimeline}
                aria-label="Express Priority Delivery"
                onClick={() => setExpressTimeline(!expressTimeline)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  expressTimeline ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                    expressTimeline ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Live Estimate Summary Card */}
        <div className="lg:sticky lg:top-24">
          <SpotlightCard className="relative flex flex-col justify-between border-primary/40 bg-card shadow-xl">
            <BorderBeam size={220} duration={10} colorFrom="#E8C84A" colorTo="#B8922A" />

            <div className="space-y-6">
              <div className="border-b border-border/80 pb-4">
                <span className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                  Transparent Estimate
                </span>
                <h3 className="mt-1 font-sans text-xl font-bold text-foreground">
                  {currentType.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Estimated Delivery: {expressTimeline ? 'Accelerated Priority' : currentType.timeline}
                </p>
              </div>

              {/* Line items breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Architecture</span>
                  <span className="font-mono text-foreground tabular-nums">
                    {fmt(baseDisplay)}
                  </span>
                </div>

                {selectedAddons.map((addonId) => {
                  const addon = ADDONS.find((a) => a.id === addonId)
                  if (!addon) return null
                  return (
                    <div key={addonId} className="flex justify-between text-muted-foreground">
                      <span>+ {addon.name}</span>
                      <span className="font-mono text-foreground tabular-nums">
                        {fmt(convertFromUsd(addon.usd, currency))}
                      </span>
                    </div>
                  )
                })}

                {expressTimeline && (
                  <div className="flex justify-between text-primary">
                    <span>+ Priority Sprint (25%)</span>
                    <span className="font-mono font-medium tabular-nums">
                      +{fmt(priorityDisplay)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total display */}
              <div className="rounded-xl border border-border/80 bg-background/80 p-4">
                <div className="text-[11px] font-medium text-muted-foreground uppercase">
                  Estimated Investment ({currency})
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-sans text-4xl font-bold text-foreground tabular-nums">
                    {fmt(finalDisplay)}
                  </span>
                  <span className="text-xs text-muted-foreground">indicative quote</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Includes 90+ Core Web Vitals optimization target, responsive UI, and 100% IP handover.
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
                      budget: finalDisplay,
                      currency,
                    },
                  }}
                >
                  <span>Request this Quote</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>

              <p className="text-center text-[10.5px] leading-relaxed text-muted-foreground">
                Timelines start after scope sign-off and content handover; performance targets apply to delivered pages excluding unoptimized third-party embeds.
              </p>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  )
}
