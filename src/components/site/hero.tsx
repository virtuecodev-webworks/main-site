'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Star, CheckCircle2, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { FloatingPaths } from '@/components/ui/background-paths'

const POPULAR_TAGS = [
  { label: 'Website Design', href: '/services#custom' },
  { label: 'Website Redesign', href: '/services#wordpress' },
  { label: 'Online Stores', href: '/services#ecommerce' },
  { label: 'Wix & WordPress', href: '/services#wix' },
]

export function Hero() {
  const headlineWords = ['Websites', 'designed', 'to', 'grow', 'your', 'business.']

  return (
    <div className="relative isolate min-h-[75vh] sm:min-h-[82vh] flex items-center justify-center overflow-hidden border-b border-border bg-background font-sans max-w-full">
      {/* Floating Animated Kinetic Vector Paths (Light + Dark mode, GPU accelerated) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden transform-gpu will-change-transform" aria-hidden="true">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:py-24 text-center">
        {/* Eyebrow Pill */}
        <Reveal immediate>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-gold-600 uppercase dark:text-gold-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Fixed Prices</span>
            <span className="text-border">/</span>
            <span>Guaranteed Deadlines</span>
            <span className="text-border">/</span>
            <span>Zero Agency Fluff</span>
          </div>
        </Reveal>

        {/* Smooth High-Performance Animated Headline */}
        <h1 className="mt-8 text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground text-balance max-w-4xl mx-auto leading-[1.1]">
          {headlineWords.map((word, wordIndex) => (
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: wordIndex * 0.08,
                duration: 0.5,
                ease: [0.2, 0, 0, 1],
              }}
              className="inline-block mr-2 sm:mr-3.5 last:mr-0"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Simple, Non-Technical Subtitle */}
        <Reveal immediate delay={0.12}>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto font-normal leading-relaxed">
            We build and redesign fast, modern websites, online stores, and web apps for businesses worldwide. You always get a clear plan, fixed pricing before we start, and direct contact with senior developers.
          </p>
        </Reveal>

        {/* Action Buttons */}
        <Reveal immediate delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="gold" size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-gold-500/15">
              <Link href="/contact">
                <span>Start Your Project</span>
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-7 py-6 text-base">
              <Link href="/services">
                <span>Explore Services &amp; Pricing</span>
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* Quick Service Tags */}
        <Reveal immediate delay={0.22}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Services:</span>
            {POPULAR_TAGS.map((tag) => (
              <Link
                key={tag.label}
                href={tag.href}
                className="rounded-full border border-border/80 bg-muted/40 px-3.5 py-1 font-medium hover:border-gold-500/50 hover:bg-muted transition-colors text-foreground/90"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Trust Badges */}
        <Reveal immediate delay={0.26}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-muted-foreground border-t border-border/60 pt-8">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-500" />
                ))}
              </div>
              <strong className="text-foreground">5.0 Star Rating</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>100% Code Ownership</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-gold-500" />
              <span>Direct Client Portal</span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
