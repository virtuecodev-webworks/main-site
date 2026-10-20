'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Search, ShieldCheck, Star, Sparkles, CheckCircle2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { TiltedGridHero } from '@/components/ui/tilted-grid-hero'
import { PHOTOS } from '@/lib/photos'

const POPULAR_TAGS = [
  { label: 'Next.js 16 Web Apps', category: 'custom' },
  { label: 'WordPress Core & Speed', category: 'wordpress' },
  { label: 'Wix to Custom Rebuild', category: 'wix' },
  { label: 'Shopify Storefronts', category: 'ecommerce' },
]

const HERO_IMAGES = [
  { src: PHOTOS.hero, alt: 'Virtue & Co. Modern Web Application' },
  { src: PHOTOS.services, alt: 'Enterprise Architecture & Cloud UI' },
  { src: PHOTOS.workBand, alt: 'High Performance Frontend Interface' },
  { src: PHOTOS.collaboration, alt: 'Direct Engineering Consultation' },
  { src: PHOTOS.studio, alt: 'Productized Software Delivery' },
  { src: PHOTOS.heroAlt, alt: 'Next-Generation Web Application' },
]

export function Hero() {
  const [query, setQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const target = document.getElementById('services-catalog')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="relative isolate overflow-hidden border-b border-border bg-background font-sans max-w-full">
      {/* Subtle clean grid backdrop without superglowing blobs */}
      <div
        aria-hidden
        className="grid-backdrop pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)]"
      />

      {/* Ambient Architectural Wireframe Monogram Logo in background */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.035] dark:opacity-[0.06] overflow-hidden max-w-full"
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="size-[340px] sm:size-[520px] md:size-[780px] shrink-0"
        >
          <svg viewBox="0 0 96 96" className="w-full h-full stroke-foreground fill-none">
            <circle cx="48" cy="48" r="46" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="48" cy="48" r="36" strokeWidth="0.5" opacity="0.3" />
            <rect x="12" y="12" width="72" height="72" rx="16" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.3" />
            <path d="M 25 31 L 48 68 L 71 31" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 35 49 L 48 29 L 61 49" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 30 29 L 66 29" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-12 sm:px-8 lg:pt-20 lg:pb-16 text-center">
        {/* Eyebrow Pill */}
        <Reveal immediate>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-foreground/20">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Productized Studio</span>
            <span className="text-border">/</span>
            <span className="font-semibold text-foreground">Direct Senior Engineering</span>
          </div>
        </Reveal>

        {/* Main Headline - Simple, elegant Questrial */}
        <Reveal immediate delay={0.05}>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-balance max-w-4xl mx-auto leading-[1.12]">
            Find the right web service for your company,{' '}
            <span className="text-primary">
              delivered on a fixed timeline.
            </span>
          </h1>
        </Reveal>

        {/* Subtitle */}
        <Reveal immediate delay={0.09}>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground text-balance max-w-3xl mx-auto font-normal">
            Virtue &amp; Co. Webworks delivers production-grade custom web applications, high-speed WordPress builds, Wix modernizations, and Shopify e-commerce. Fixed prices, dedicated trackers, and zero freelancer middlemen.
          </p>
        </Reveal>

        {/* Quick Search & Explore Bar */}
        <Reveal immediate delay={0.14}>
          <form
            onSubmit={handleSearchSubmit}
            className="mt-9 mx-auto max-w-2xl flex flex-col sm:flex-row items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5"
          >
            <div className="flex-1 flex items-center gap-3 px-3 w-full">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What service do you need? (e.g., Next.js MVP, WordPress redesign, Wix speed...)"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
              />
            </div>
            <a
              href="#services-catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity shrink-0"
            >
              <span>Explore Packages</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </form>
        </Reveal>

        {/* Quick Tag Pills */}
        <Reveal immediate delay={0.18}>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Popular:</span>
            {POPULAR_TAGS.map((tag) => (
              <a
                key={tag.label}
                href="#services-catalog"
                className="rounded-full border border-border/80 bg-muted/40 px-3 py-1 font-medium hover:border-primary/50 hover:bg-muted transition-colors text-foreground/90"
              >
                {tag.label}
              </a>
            ))}
          </div>
        </Reveal>

        {/* Trust metrics */}
        <Reveal immediate delay={0.22}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-500" />
                ))}
              </div>
              <strong className="text-foreground">5.0 / 5.0</strong>
              <span>Client Satisfaction</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100% Code Quality Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Dedicated Live Portal Tracker</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* 21st.dev 3D Curved Cylindrical Image Band */}
      <div className="relative w-full max-w-7xl mx-auto pb-10 px-4 sm:px-6 overflow-hidden">
        <TiltedGridHero
          images={HERO_IMAGES}
          tileHeight={32}
          aspectRatio={16 / 10}
          curve={65}
          speed={3.5}
          fade={18}
          className="h-[360px] sm:h-[420px] md:h-[480px] w-full overflow-hidden"
        />
      </div>
    </div>
  )
}
