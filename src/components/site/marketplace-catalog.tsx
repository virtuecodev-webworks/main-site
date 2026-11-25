'use client'

import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRegion } from '@/components/site/region-provider'
import {
  AGENCY_SERVICES,
  type AgencyServiceOffering,
  type PackageTier,
  type ServicePackage,
} from '@/lib/packages'
import type { CurrencyCode, ProjectCategory } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'
import { PackageIntakeModal } from './package-intake-modal'

const CATEGORIES: { label: string; value: 'all' | ProjectCategory }[] = [
  { label: 'All Packages', value: 'all' },
  { label: 'Custom Websites', value: 'custom' },
  { label: 'WordPress', value: 'wordpress' },
  { label: 'Wix Studio', value: 'wix' },
  { label: 'Online Stores', value: 'ecommerce' },
]

function packagePrice(pkg: ServicePackage, currency: CurrencyCode): number {
  if (currency === 'NGN') return pkg.priceNgn
  if (currency === 'GBP') return Math.round(pkg.priceUsd * 0.8)
  if (currency === 'EUR') return Math.round(pkg.priceUsd * 0.92)
  return pkg.priceUsd
}

export function MarketplaceCatalog() {
  const locale = useLocale()
  const { currency } = useRegion()
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProjectCategory>('all')

  const [selectedTiers, setSelectedTiers] = useState<Record<string, PackageTier>>({
    custom: 'business',
    wordpress: 'business',
    wix: 'business',
    ecommerce: 'business',
  })

  const [activeModal, setActiveModal] = useState<{
    service: AgencyServiceOffering
    pkg: ServicePackage
  } | null>(null)

  const filteredServices = useMemo(() => {
    return AGENCY_SERVICES.filter((svc) => {
      return selectedCategory === 'all' || svc.category === selectedCategory
    })
  }, [selectedCategory])

  const setTierForService = (category: string, tier: PackageTier) => {
    setSelectedTiers((prev) => ({ ...prev, [category]: tier }))
  }

  const handleOrderClick = (service: AgencyServiceOffering, tier: PackageTier) => {
    const pkg = service.packages[tier]
    setActiveModal({ service, pkg })
  }

  return (
    <section id="services-catalog" className="padding-global padding-section font-sans scroll-mt-20">
      <div className="container-max">
        {/* Vantra Section Header */}
        <div className="section_header">
          <div>
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;Fixed-Price Packages&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 className="heading-style-h2 mt-3 max-w-[18ch]">
              Clear pricing. Agreed launch dates.
            </h2>
          </div>
          <div className="section_meta max-w-sm">
            <span className="label-mono text-foreground">No Hidden Fees · Direct Senior Team</span>
            <span className="text-muted-foreground">
              Choose a package tier below to see exact deliverables, delivery windows, and fixed pricing in {currency}.
            </span>
          </div>
        </div>

        {/* Clean Category Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter service packages"
          className="mb-10 flex flex-wrap items-center gap-2"
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-foreground text-background shadow-sm'
                    : 'border border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredServices.map((svc, idx) => {
            const currentTier = selectedTiers[svc.category] || 'business'
            const currentPkg = svc.packages[currentTier]
            const price = packagePrice(currentPkg, currency)
            const num = String(idx + 1).padStart(3, '0')

            return (
              <div
                key={svc.category}
                id={`service-${svc.category}`}
                className="flex scroll-mt-24 flex-col rounded-[22px] border border-border bg-card p-6 transition-colors hover:border-primary/50 sm:p-8"
              >
                {/* Top service header */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <span className="label-mono-xs text-primary">
                      ( &nbsp;&nbsp;{num} · {svc.badge}&nbsp;&nbsp; )
                    </span>
                    <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">
                      {svc.title}
                    </h3>
                  </div>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  {svc.headline}
                </p>

                {/* Tier Switcher Tabs */}
                <div
                  role="tablist"
                  aria-label={`${svc.title} tiers`}
                  className="mb-6 grid grid-cols-3 gap-1 rounded-xl border border-border bg-background/60 p-1 text-xs font-semibold"
                >
                  {(['starter', 'business', 'enterprise'] as PackageTier[]).map((tier) => {
                    const active = currentTier === tier
                    return (
                      <button
                        key={tier}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setTierForService(svc.category, tier)}
                        className={`rounded-lg py-2 capitalize transition-all ${
                          active
                            ? 'bg-foreground font-bold text-background shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tier}
                      </button>
                    )
                  })}
                </div>

                {/* Selected Package Details Box */}
                <div className="mb-6 flex flex-1 flex-col justify-between rounded-2xl border border-border/80 bg-background/50 p-6">
                  <div>
                    <div className="mb-2 flex items-baseline justify-between gap-2">
                      <span className="font-display text-base font-semibold text-foreground">
                        {currentPkg.name}
                      </span>
                      <div className="text-end">
                        <span className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl tabular-nums">
                          {formatMoney(price, currency, locale, { decimals: false })}
                        </span>
                      </div>
                    </div>
                    <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
                      {currentPkg.tagline}
                    </p>

                    {/* Timeline and Revisions */}
                    <div className="mb-5 flex items-center gap-6 border-y border-border/60 py-3 text-xs font-medium text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>{currentPkg.deliveryDays} Business Days</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>{currentPkg.revisions} Revisions</span>
                      </div>
                    </div>

                    {/* Feature Checklist */}
                    <ul className="mb-6 space-y-2.5 text-xs text-muted-foreground">
                      {currentPkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="text-foreground/90">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Order CTA button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleOrderClick(svc, currentTier)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-95"
                    >
                      <span>Select {currentPkg.name}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Bottom Trust Note */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                    <span>Fixed scope · 100% ownership on launch</span>
                  </div>
                  <Link
                    href={{
                      pathname: '/contact',
                      query: { service: svc.category, tier: currentTier },
                    }}
                    className="font-medium hover:text-foreground hover:underline"
                  >
                    Need something custom?
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Interactive Modal */}
        {activeModal && (
          <PackageIntakeModal
            isOpen={Boolean(activeModal)}
            onClose={() => setActiveModal(null)}
            service={activeModal.service}
            pkg={activeModal.pkg}
            currency={currency}
          />
        )}
      </div>
    </section>
  )
}
