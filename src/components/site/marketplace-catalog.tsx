'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Star,
  SlidersHorizontal,
  Bot,
  Layers,
} from 'lucide-react'
import {
  AGENCY_SERVICES,
  type AgencyServiceOffering,
  type PackageTier,
  type ServicePackage,
} from '@/lib/packages'
import type { ProjectCategory } from '@/lib/constants'
import { formatMoney } from '@/lib/utils'
import { PackageIntakeModal } from './package-intake-modal'

const CATEGORIES: { label: string; value: 'all' | ProjectCategory }[] = [
  { label: 'All Services', value: 'all' },
  { label: 'Custom Web Apps', value: 'custom' },
  { label: 'WordPress Dev', value: 'wordpress' },
  { label: 'Wix & No-Code', value: 'wix' },
  { label: 'E-Commerce & Shopify', value: 'ecommerce' },
]

interface CuratedSuggestion {
  id: string
  title: string
  category: ProjectCategory
  categoryLabel: string
  tier: PackageTier
  tierLabel: string
  priceUsd: number
  summary: string
  tags: string[]
  keywords: string[]
}

const AI_CURATED_KNOWLEDGE: CuratedSuggestion[] = [
  {
    id: 'nextjs-saas',
    title: 'Next.js & Supabase Full-Stack Architecture',
    category: 'custom',
    categoryLabel: 'Custom Web Apps',
    tier: 'business',
    tierLabel: 'Business Tier',
    priceUsd: 350,
    summary: 'Full-stack SSR with Supabase Auth, PostgreSQL schema, and admin dashboard back-office.',
    tags: ['Next.js 16', 'Supabase Auth', 'PostgreSQL', 'RBAC Security'],
    keywords: ['next', 'nextjs', 'react', 'supabase', 'auth', 'database', 'postgres', 'saas', 'app', 'dashboard', 'backend'],
  },
  {
    id: 'stripe-ecommerce',
    title: 'Global E-Commerce & Stripe Checkout Funnel',
    category: 'ecommerce',
    categoryLabel: 'E-Commerce & Shopify',
    tier: 'business',
    tierLabel: 'Growth Tier',
    priceUsd: 390,
    summary: 'Stripe, Apple Pay, multi-currency USD support, automated inventory and high conversion rate.',
    tags: ['Stripe Checkout', 'Apple Pay', 'Shopify Plus / Headless', 'Cart Recovery'],
    keywords: ['ecommerce', 'shop', 'store', 'shopify', 'stripe', 'cart', 'checkout', 'payment', 'apple pay', 'products'],
  },
  {
    id: 'wordpress-hardening',
    title: 'WordPress Speed, Security & Custom ACF Theme',
    category: 'wordpress',
    categoryLabel: 'WordPress Dev',
    tier: 'business',
    tierLabel: 'Business Pro',
    priceUsd: 260,
    summary: 'Handcrafted theme without bulky builders. Core Web Vitals optimization and malware hardening.',
    tags: ['ACF Pro', 'Zero-Bloat Theme', '100/100 Lighthouse', 'Security Audit'],
    keywords: ['wordpress', 'wp', 'theme', 'plugin', 'acf', 'elementor', 'woocommerce', 'security', 'malware', 'speed'],
  },
  {
    id: 'wix-migration',
    title: 'Figma to Responsive Wix Studio Architecture',
    category: 'wix',
    categoryLabel: 'Wix & No-Code',
    tier: 'business',
    tierLabel: 'Studio Complete',
    priceUsd: 220,
    summary: 'Fluid layout breakpoints, custom CSS interactions, SEO schema markup, and client editor training.',
    tags: ['Wix Studio', 'Figma to Web', 'Fluid Breakpoints', 'SEO Structured Data'],
    keywords: ['wix', 'wix studio', 'figma', 'design', 'nocode', 'no-code', 'responsive', 'landing', 'migration'],
  },
  {
    id: 'performance-audit',
    title: 'Core Web Vitals & Sub-Second Page Speed Boost',
    category: 'custom',
    categoryLabel: 'Custom Web Apps',
    tier: 'starter',
    tierLabel: 'Starter MVP',
    priceUsd: 120,
    summary: 'Image pipeline optimization, CDN edge caching, JavaScript payload reduction, and 100/100 score.',
    tags: ['100/100 Score', 'Lighthouse', 'Edge CDN', 'Core Web Vitals'],
    keywords: ['speed', 'performance', 'lighthouse', 'fast', 'slow', 'audit', 'core web vitals', 'optimization', 'cache'],
  },
  {
    id: 'api-webhooks',
    title: 'Custom API Gateway, Webhooks & Enterprise Workflows',
    category: 'custom',
    categoryLabel: 'Custom Web Apps',
    tier: 'enterprise',
    tierLabel: 'Enterprise Scale',
    priceUsd: 750,
    summary: 'Scalable REST/GraphQL endpoints, automated third-party webhooks, and asynchronous job queues.',
    tags: ['REST & GraphQL', 'Webhook Engine', 'Queue Processing', 'Enterprise SLA'],
    keywords: ['api', 'webhook', 'integration', 'crm', 'automation', 'backend', 'enterprise', 'sync', 'microservice'],
  },
]

const QUICK_TOPICS = [
  'Next.js 15 & Supabase',
  'Stripe Apple Pay Store',
  'WordPress ACF & Security',
  'Figma to Wix Studio',
  '100/100 Lighthouse',
]

export function MarketplaceCatalog() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProjectCategory>('all')
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const currency = 'USD'

  // Close suggestions when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSuggestionsOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Selected package tier per service card: service.category -> PackageTier
  const [selectedTiers, setSelectedTiers] = useState<Record<string, PackageTier>>({
    custom: 'business',
    wordpress: 'business',
    wix: 'business',
    ecommerce: 'business',
  })

  // Modal State
  const [activeModal, setActiveModal] = useState<{
    service: AgencyServiceOffering
    pkg: ServicePackage
  } | null>(null)

  const curatedMatches = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return AI_CURATED_KNOWLEDGE.slice(0, 4)

    return AI_CURATED_KNOWLEDGE.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.keywords.some((k) => k.includes(q) || q.includes(k))
      )
    })
  }, [search])

  const filteredServices = useMemo(() => {
    return AGENCY_SERVICES.filter((svc) => {
      const matchesCategory =
        selectedCategory === 'all' || svc.category === selectedCategory
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        svc.title.toLowerCase().includes(q) ||
        svc.headline.toLowerCase().includes(q) ||
        svc.shortDesc.toLowerCase().includes(q) ||
        Object.values(svc.packages).some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.features.some((f) => f.toLowerCase().includes(q)),
        )
      return matchesCategory && matchesSearch
    })
  }, [search, selectedCategory])

  const setTierForService = (category: string, tier: PackageTier) => {
    setSelectedTiers((prev) => ({ ...prev, [category]: tier }))
  }

  const handleOrderClick = (service: AgencyServiceOffering, tier: PackageTier) => {
    const pkg = service.packages[tier]
    setActiveModal({ service, pkg })
  }

  const applyCuratedSuggestion = (suggestion: CuratedSuggestion) => {
    setSelectedCategory(suggestion.category)
    setSelectedTiers((prev) => ({ ...prev, [suggestion.category]: suggestion.tier }))
    setSearch('')
    setIsSuggestionsOpen(false)

    // Smooth scroll to card
    setTimeout(() => {
      const el = document.getElementById(`service-${suggestion.category}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  const triggerAiDrawer = (promptText?: string) => {
    setIsSuggestionsOpen(false)
    window.dispatchEvent(
      new CustomEvent('open-virtue-ai', {
        detail: {
          prompt: promptText || (search ? `I need a recommendation for: ${search}` : undefined),
        },
      }),
    )
  }

  return (
    <section id="services-catalog" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-medium text-foreground mb-4">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>Productized Studio Packages</span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">Fixed USD Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Clear Packages. Guaranteed Delivery. Direct Agency Execution.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          No bidding wars or unreliable freelance marketplaces. Choose a standardized tier, submit your brief, and work directly with Virtue &amp; Co. senior engineers.
        </p>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="mb-10 space-y-4">
        <div ref={searchContainerRef} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onFocus={() => setIsSuggestionsOpen(true)}
              onChange={(e) => {
                setSearch(e.target.value)
                setIsSuggestionsOpen(true)
              }}
              placeholder="Search by any keyword (e.g., auth, speed, Stripe, Wix, Next.js, API)..."
              className="w-full rounded-2xl border border-border bg-card/90 backdrop-blur-sm pl-12 pr-20 py-3.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-sans"
            />
            {search ? (
              <button
                onClick={() => {
                  setSearch('')
                  setIsSuggestionsOpen(false)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            ) : (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground/70 hidden sm:inline-block">
                AI Curated
              </span>
            )}
          </div>

          {/* AI-Curated Keyword Suggestions Popover */}
          <AnimatePresence>
            {isSuggestionsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-4 shadow-2xl text-left font-sans"
              >
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold tracking-wide uppercase text-foreground">
                      {search.trim() ? `AI Suggestions for "${search}"` : 'AI-Curated Recommendations'}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {curatedMatches.length} matching {curatedMatches.length === 1 ? 'solution' : 'solutions'}
                  </span>
                </div>

                {/* Quick Topic Chips (when search is empty or short) */}
                {!search.trim() && (
                  <div className="pt-3 pb-2">
                    <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
                      Popular Architectural Pathways:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => {
                            setSearch(topic)
                          }}
                          className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Curated Suggestion Items */}
                <div className="divide-y divide-border/40 max-h-80 overflow-y-auto mt-2 pr-1">
                  {curatedMatches.length > 0 ? (
                    curatedMatches.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => applyCuratedSuggestion(item)}
                        className="py-3 px-2 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </span>
                            <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {item.categoryLabel}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.summary}
                          </p>
                          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded bg-muted px-2 py-0.5 text-[10px] text-foreground/80 font-mono"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-bold text-foreground">
                            {formatMoney(item.priceUsd, 'USD')}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {item.tierLabel}
                          </div>
                          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                            <span>Select</span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No standardized packages matched &quot;{search}&quot;.
                    </div>
                  )}
                </div>

                {/* Popover Footer - Direct AI Consultation */}
                <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-3 bg-muted/20 -mx-4 -mb-4 p-3.5 rounded-b-2xl">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      Need a custom stack or enterprise scope?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerAiDrawer()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:opacity-90 transition-opacity shrink-0"
                  >
                    <span>Ask Studio AI</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                selectedCategory === cat.value
                  ? 'bg-foreground text-background shadow-md'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-card/50">
          <p className="text-sm text-muted-foreground">
            No service packages matched your query. Looking for something custom?
          </p>
          <a
            href="/contact"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Request a Custom Scope &amp; Quote <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredServices.map((svc) => {
            const currentTier = selectedTiers[svc.category] || 'business'
            const currentPkg = svc.packages[currentTier]
            const price = currentPkg.priceUsd

            return (
              <div
                key={svc.category}
                id={`service-${svc.category}`}
                className="flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden scroll-mt-24"
              >
                {/* Top service header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                      {svc.badge}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {svc.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>5.0</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {svc.headline}
                </p>

                {/* Tier Switcher Tabs */}
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1 mb-6 text-xs font-semibold">
                  {(['starter', 'business', 'enterprise'] as PackageTier[]).map((tier) => {
                    const active = currentTier === tier
                    return (
                      <button
                        key={tier}
                        onClick={() => setTierForService(svc.category, tier)}
                        className={`rounded-lg py-2 capitalize transition-all ${
                          active
                            ? 'bg-card text-foreground shadow-sm font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tier}
                      </button>
                    )
                  })}
                </div>

                {/* Selected Package Details Box */}
                <div className="flex-1 flex flex-col justify-between rounded-2xl border border-border/80 bg-muted/20 p-6 mb-6">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <span className="text-base font-bold text-foreground">
                        {currentPkg.name}
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-foreground">
                          {formatMoney(price, currency, 'en-US', { decimals: false })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-5">
                      {currentPkg.tagline}
                    </p>

                    {/* Timeline and Revisions */}
                    <div className="flex items-center gap-6 border-y border-border/60 py-3 mb-5 text-xs text-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{currentPkg.deliveryDays} Days Delivery</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className="h-4 w-4 text-primary" />
                        <span>{currentPkg.revisions} Revisions</span>
                      </div>
                    </div>

                    {/* Feature Checklist */}
                    <ul className="space-y-2.5 mb-6 text-xs text-muted-foreground">
                      {currentPkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-foreground/90">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Order CTA button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleOrderClick(svc, currentTier)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
                    >
                      <span>Order {currentPkg.name}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Trust Note */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Virtue SLA &amp; Code Quality Guarantee</span>
                  </div>
                  <a
                    href={`/contact?service=${svc.category}&tier=${currentTier}`}
                    className="font-medium hover:text-foreground hover:underline"
                  >
                    Custom requirements?
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
    </section>
  )
}
