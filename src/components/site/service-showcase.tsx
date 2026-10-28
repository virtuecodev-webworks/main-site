'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Laptop,
  Layers,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { StartingPrice } from './starting-price'
import { SERVICES } from '@/lib/studio'
import { cn } from '@/lib/utils'

const SERVICE_META: Record<
  string,
  {
    slug: string
    badge: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  custom: {
    slug: 'aurum-capital-platform',
    badge: 'Custom Architecture',
    icon: Laptop,
  },
  wordpress: {
    slug: 'meridian-editorial',
    badge: 'Editorial & CMS',
    icon: Layers,
  },
  wix: {
    slug: 'northline-studio',
    badge: 'Rapid Launch',
    icon: Sparkles,
  },
  ecommerce: {
    slug: 'finery-commerce',
    badge: 'Digital Commerce',
    icon: ShoppingBag,
  },
}

function ServiceCard({
  service,
  index,
  title,
  summary,
  features,
}: {
  service: (typeof SERVICES)[number]
  index: number
  title: string
  summary: string
  features: string[]
}) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [mousePos, setMousePos] = React.useState({ x: 200, y: 200 })
  const cardRef = React.useRef<HTMLElement | null>(null)
  const num = String(index + 1).padStart(3, '0')
  const meta = SERVICE_META[service.key] ?? SERVICE_META.custom
  const IconComponent = meta.icon

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.article
      ref={cardRef}
      id={service.key}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="services_card group relative flex min-h-[22rem] w-[20rem] shrink-0 flex-col justify-between overflow-hidden rounded-[22px] border border-border/80 bg-card p-6 transition-colors duration-300 hover:border-primary/70 sm:min-h-[25rem] sm:w-[24rem] sm:p-7"
    >
      {/* Subtle Cursor-Following Gold Radial Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(220, 170, 40, 0.12), transparent 70%)`,
        }}
      />

      {/* Top Index & Badge */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <span className="label-mono text-muted-foreground transition-colors group-hover:text-primary">
          ( &nbsp;&nbsp;&nbsp;&nbsp;{num}&nbsp;&nbsp;&nbsp;&nbsp; )
        </span>
        <span className="label-mono-xs rounded-full border border-border bg-background/60 px-2.5 py-1 text-muted-foreground">
          {meta.badge}
        </span>
      </div>

      {/* Elegant Architectural Glyph Container */}
      <div className="services_glyph-wrap relative z-10 my-4 flex size-13 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:border-primary/60 group-hover:bg-primary/20">
        <IconComponent className="size-6 text-primary" />
      </div>

      {/* Service Details & Action Links */}
      <div className="services_card-bottom relative z-10 flex flex-col gap-4">
        <div>
          <h3 className="services_card-label font-display text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>
          <p className="services_card-text mt-2 text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        </div>

        {features.length > 0 && (
          <ul className="space-y-1.5 border-t border-border pt-3.5 text-xs text-muted-foreground">
            {features.slice(0, 3).map((feat) => (
              <li key={feat} className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="truncate text-foreground/80">{feat}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Dual Action Footer: View Case Study + View Packages */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          <Link
            href="/services#services-catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.04em] text-foreground uppercase transition-colors hover:text-primary"
          >
            <span>See Pricing</span>
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          <Link
            href={`/portfolio/${meta.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary"
          >
            <span>View Case Study</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

export function ServiceShowcase({ className }: { className?: string }) {
  const t = useTranslations('Services')
  const sliderRef = React.useRef<HTMLDivElement | null>(null)

  const scroll = (dir: 'prev' | 'next') => {
    if (!sliderRef.current) return
    sliderRef.current.scrollBy({
      left: dir === 'next' ? 440 : -440,
      behavior: 'smooth',
    })
  }

  return (
    <div className={cn('relative mt-8 sm:mt-12', className)}>
      {/* Slider Controls Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span>Slide to explore our 4 core practices</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('prev')}
            aria-label="Scroll services left"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('next')}
            aria-label="Scroll services right"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Slider Mask */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
      >
        {SERVICES.map((s, idx) => {
          const rawFeatures = (t.raw(`items.${s.key}.features`) as string[]) ?? []
          return (
            <ServiceCard
              key={s.key}
              service={s}
              index={idx}
              title={t(`items.${s.key}.title`)}
              summary={t(`items.${s.key}.summary`)}
              features={rawFeatures.slice(0, 3)}
            />
          )
        })}
      </div>

      {/* Starting Price Footer Anchor */}
      <div className="mt-8 border-t border-border pt-6">
        <StartingPrice />
      </div>
    </div>
  )
}
