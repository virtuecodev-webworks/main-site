'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCheck, Clock, RefreshCw, ShieldCheck } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useRegion } from '@/components/site/region-provider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TimelineContent } from '@/components/ui/timeline-animation'
import { AnimatedPrice } from '@/components/ui/animated-price'
import {
  AGENCY_SERVICES,
  type AgencyServiceOffering,
  type PackageTier,
  type ServicePackage,
} from '@/lib/packages'
import type { CurrencyCode, ProjectCategory } from '@/lib/constants'
import { cn, formatMoney } from '@/lib/utils'
import { PackageIntakeModal } from './package-intake-modal'

const SERVICE_TABS: { label: string; value: ProjectCategory }[] = [
  { label: 'Custom Web Apps', value: 'custom' },
  { label: 'Online Stores', value: 'ecommerce' },
  { label: 'WordPress CMS', value: 'wordpress' },
  { label: 'Wix Studio', value: 'wix' },
]

const TIER_ORDER: PackageTier[] = ['starter', 'business', 'enterprise']

const TIER_INCLUDES_HEADING: Record<PackageTier, string> = {
  starter: 'Starter includes:',
  business: 'Everything in Starter, plus:',
  enterprise: 'Everything in Business, plus:',
}

const UPFRONT_DISCOUNT_PERCENT = 15

function packageBasePrice(pkg: ServicePackage, currency: CurrencyCode): number {
  if (currency === 'NGN') return pkg.priceNgn
  if (currency === 'GBP') return Math.round(pkg.priceUsd * 0.8)
  if (currency === 'EUR') return Math.round(pkg.priceUsd * 0.92)
  return pkg.priceUsd
}

function applyUpfrontDiscount(base: number, currency: CurrencyCode): number {
  const discounted = base * (1 - UPFRONT_DISCOUNT_PERCENT / 100)
  return currency === 'NGN'
    ? Math.round(discounted / 1000) * 1000
    : Math.round(discounted)
}

function PricingSwitch({
  selected,
  onSwitch,
}: {
  selected: '0' | '1'
  onSwitch: (value: '0' | '1') => void
}) {
  return (
    <div className="flex justify-center">
      <div className="relative z-20 mx-auto flex w-fit rounded-full border border-border bg-card p-1 shadow-elevation-1">
        <button
          type="button"
          onClick={() => onSwitch('0')}
          aria-pressed={selected === '0'}
          className={cn(
            'relative z-10 h-10 w-fit cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors sm:h-12 sm:px-6 sm:py-2',
            selected === '0'
              ? 'font-semibold text-[#191308]'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {selected === '0' && (
            <motion.span
              layoutId="pricing-billing-switch"
              className="absolute inset-0 rounded-full border-2 border-primary bg-gradient-to-t from-gold-600 via-gold-500 to-gold-400 shadow-sm shadow-primary/35 sm:border-4"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">Milestone Split</span>
        </button>

        <button
          type="button"
          onClick={() => onSwitch('1')}
          aria-pressed={selected === '1'}
          className={cn(
            'relative z-10 h-10 w-fit shrink-0 cursor-pointer rounded-full px-4 py-1 text-sm font-medium transition-colors sm:h-12 sm:px-6 sm:py-2',
            selected === '1'
              ? 'font-semibold text-[#191308]'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {selected === '1' && (
            <motion.span
              layoutId="pricing-billing-switch"
              className="absolute inset-0 rounded-full border-2 border-primary bg-gradient-to-t from-gold-600 via-gold-500 to-gold-400 shadow-sm shadow-primary/35 sm:border-4"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            Pay Upfront
            <span className="rounded-full bg-gold-50 px-2 py-0.5 text-xs font-semibold text-[#191308] dark:bg-ink-900 dark:text-gold-300">
              Save {UPFRONT_DISCOUNT_PERCENT}%
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}

export function MarketplaceCatalog() {
  const locale = useLocale()
  const { currency } = useRegion()
  const pricingRef = useRef<HTMLElement>(null)

  const [billingMode, setBillingMode] = useState<'0' | '1'>('0')
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('custom')
  const [activeModal, setActiveModal] = useState<{
    service: AgencyServiceOffering
    pkg: ServicePackage
  } | null>(null)

  const isUpfront = billingMode === '1'
  const activeService =
    AGENCY_SERVICES.find((svc) => svc.category === selectedCategory) ?? AGENCY_SERVICES[0]

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.12,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    }),
    hidden: {
      filter: 'blur(8px)',
      y: -16,
      opacity: 0,
    },
  }

  return (
    <section
      id="services-catalog"
      ref={pricingRef}
      className="relative overflow-hidden bg-background px-4 py-20 font-sans scroll-mt-20 sm:py-28"
    >
      {/* Central Warm Gold Radial Glow Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-[8%] left-[8%] z-0 h-full w-[84%] opacity-45 dark:opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(220, 170, 40, 0.34) 0%, transparent 68%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Centered Header */}
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <TimelineContent
            as="div"
            animationNum={0}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="mb-3"
          >
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;Fixed-Price Packages&nbsp;&nbsp;&nbsp; )
            </span>
          </TimelineContent>

          <TimelineContent
            as="h2"
            animationNum={1}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="mb-4 font-display text-3xl font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Plans that work best for your{' '}
            <TimelineContent
              as="span"
              animationNum={2}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="inline-block rounded-xl border border-dashed border-primary bg-primary/15 px-3 py-0.5 capitalize text-foreground"
            >
              business
            </TimelineContent>
          </TimelineContent>

          <TimelineContent
            as="p"
            animationNum={3}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base"
          >
            Transparent fixed-price builds engineered by senior developers. Choose your stack and
            payment preference, priced live in {currency}.
          </TimelineContent>
        </div>

        {/* Billing Preference Switch */}
        <TimelineContent
          as="div"
          animationNum={4}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="mb-6"
        >
          <PricingSwitch selected={billingMode} onSwitch={setBillingMode} />
        </TimelineContent>

        {/* Service Practice Tabs */}
        <TimelineContent
          as="div"
          animationNum={5}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="mb-10 flex justify-center"
        >
          <div
            role="tablist"
            aria-label="Service discipline"
            className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-border bg-card/80 p-1.5 backdrop-blur-sm"
          >
            {SERVICE_TABS.map((tab) => {
              const active = selectedCategory === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(tab.value)}
                  className={cn(
                    'relative cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold transition-colors sm:text-sm',
                    active
                      ? 'text-background dark:text-[#0a0a0a]'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="pricing-service-tab"
                      className="absolute inset-0 rounded-xl bg-foreground shadow-sm"
                      transition={{ type: 'spring', stiffness: 460, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </TimelineContent>

        {/* 3-Column Pricing Cards */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-3">
          {TIER_ORDER.map((tier, index) => {
            const pkg = activeService.packages[tier]
            const basePrice = packageBasePrice(pkg, currency)
            const effectivePrice = isUpfront
              ? applyUpfrontDiscount(basePrice, currency)
              : basePrice
            const isPopular = Boolean(pkg.popular)

            return (
              <TimelineContent
                key={`${activeService.category}-${pkg.id}`}
                as="div"
                animationNum={4 + index}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="flex"
              >
                <Card
                  className={cn(
                    'relative flex w-full flex-col justify-between transition-all duration-300',
                    isPopular
                      ? 'border-primary/50 bg-gold-50/90 shadow-xl shadow-primary/10 ring-2 ring-primary dark:bg-[#1a160c]'
                      : 'border-border/80 bg-card hover:border-primary/40',
                  )}
                >
                  <div>
                    <CardHeader className="text-left">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                          {pkg.name}
                        </h3>
                        {isPopular && (
                          <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-[#191308] shadow-xs">
                            Popular
                          </span>
                        )}
                      </div>

                      <p className="mt-1 mb-4 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground">
                        {pkg.tagline}
                      </p>

                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <AnimatedPrice
                          value={effectivePrice}
                          currency={currency}
                          locale={locale}
                          className="font-display text-4xl font-semibold tracking-tight text-foreground"
                        />
                        <span className="text-sm text-muted-foreground">
                          /{isUpfront ? 'upfront' : 'fixed build'}
                        </span>
                        {isUpfront && (
                          <span className="ml-1 text-xs font-medium text-muted-foreground line-through tabular-nums">
                            {formatMoney(basePrice, currency, locale, { decimals: false })}
                          </span>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <button
                        type="button"
                        onClick={() => setActiveModal({ service: activeService, pkg })}
                        className={cn(
                          'mb-6 w-full cursor-pointer rounded-xl p-3.5 text-base font-semibold transition-all active:scale-[0.99] sm:text-lg',
                          isPopular
                            ? 'border border-gold-300/70 bg-gradient-to-t from-gold-600 via-gold-500 to-gold-400 text-[#191308] shadow-lg shadow-primary/30 hover:brightness-105'
                            : 'border border-ink-700 bg-gradient-to-t from-[#0a0a0a] to-[#262629] text-[#f5f4f0] shadow-lg shadow-black/20 hover:opacity-95 dark:border-ink-200 dark:from-[#e6e4dc] dark:to-[#ffffff] dark:text-[#0a0a0a]',
                        )}
                      >
                        Get started
                      </button>

                      {/* Key Engineering Specs */}
                      <ul className="space-y-2.5 py-4 text-sm font-semibold">
                        <li className="flex items-center">
                          <span className="mr-3 grid place-content-center text-foreground">
                            <Clock className="size-5 text-primary" aria-hidden="true" />
                          </span>
                          <span className="text-muted-foreground">
                            {pkg.deliveryDays} business days delivery
                          </span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-3 grid place-content-center text-foreground">
                            <RefreshCw className="size-5 text-primary" aria-hidden="true" />
                          </span>
                          <span className="text-muted-foreground">
                            {pkg.revisions} revision rounds included
                          </span>
                        </li>
                        <li className="flex items-center">
                          <span className="mr-3 grid place-content-center text-foreground">
                            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                          </span>
                          <span className="text-muted-foreground">
                            100% source code &amp; IP ownership
                          </span>
                        </li>
                      </ul>

                      {/* Deliverables Checklist */}
                      <div className="space-y-3 border-t border-border pt-4">
                        <h4 className="mb-3 text-base font-medium text-foreground">
                          {TIER_INCLUDES_HEADING[tier]}
                        </h4>
                        <ul className="space-y-2.5 font-medium">
                          {pkg.features.map((feature) => (
                            <li key={feature} className="flex items-start">
                              <span className="mt-0.5 mr-3 grid h-6 w-6 shrink-0 place-content-center rounded-full border border-primary/60 bg-primary/10">
                                <CheckCheck
                                  className="h-3.5 w-3.5 text-primary"
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="text-sm leading-snug text-muted-foreground">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </TimelineContent>
            )
          })}
        </div>

        {/* Bottom Trust & Custom Scope Link */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 px-6 py-4 text-xs text-muted-foreground backdrop-blur-sm sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>
              {activeService.title} · {activeService.deliveryTimeRange} · Fixed scope with zero
              lock-in.
            </span>
          </div>
          <Link
            href={{
              pathname: '/contact',
              query: { service: activeService.category },
            }}
            className="font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Need a bespoke enterprise scope? Request a custom quote →
          </Link>
        </div>

        {activeModal && (
          <PackageIntakeModal
            isOpen={Boolean(activeModal)}
            onClose={() => setActiveModal(null)}
            service={activeModal.service}
            pkg={activeModal.pkg}
            currency={currency}
            discountPercent={isUpfront ? UPFRONT_DISCOUNT_PERCENT : 0}
            billingLabel={
              isUpfront ? '100% Upfront (15% Savings)' : '50% Deposit / 50% Launch Milestone'
            }
          />
        )}
      </div>
    </section>
  )
}

export { MarketplaceCatalog as PricingSection }
