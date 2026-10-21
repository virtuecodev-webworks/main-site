'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Star, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'

export function Hero() {
  const t = useTranslations('Home.hero')
  const tServices = useTranslations('Services')

  const valuePromises = [
    t('strip.fixed'),
    t('strip.deadlines'),
    t('strip.fluff'),
    t('strip.senior'),
  ]

  const popularTags = [
    { label: tServices('items.custom.title'), href: '/services#custom' },
    { label: tServices('items.wordpress.title'), href: '/services#wordpress' },
    { label: tServices('items.ecommerce.title'), href: '/services#ecommerce' },
    { label: tServices('items.wix.title'), href: '/services#wix' },
  ]

  return (
    <div className="relative isolate min-h-[75vh] sm:min-h-[82vh] flex items-center justify-center overflow-hidden border-b border-border bg-background font-sans max-w-full">
      {/* Natural Ambient Organic Glow (Composited on GPU, 120 FPS, Syncs with Light & Dark Mode) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden -z-10"
        aria-hidden="true"
      >
        {/* Core Atmospheric Bloom (Soft radiant sapphire + warm studio gold accent) */}
        <div
          className="absolute inset-0 opacity-80 dark:opacity-100 transition-opacity duration-700
            bg-[radial-gradient(ellipse_at_50%_18%,rgba(59,130,246,0.15)_0%,rgba(37,99,235,0.06)_40%,transparent_72%),radial-gradient(ellipse_at_18%_38%,rgba(220,170,40,0.10)_0%,transparent_52%),radial-gradient(ellipse_at_82%_32%,rgba(20,160,108,0.08)_0%,transparent_52%)]
            dark:bg-[radial-gradient(ellipse_at_50%_18%,rgba(59,130,246,0.28)_0%,rgba(37,99,235,0.14)_35%,transparent_72%),radial-gradient(ellipse_at_18%_38%,rgba(220,170,40,0.16)_0%,transparent_52%),radial-gradient(ellipse_at_82%_32%,rgba(20,160,108,0.12)_0%,transparent_52%)]"
        />

        {/* Soft Ambient Depth Vignette (seamless blend with background surface) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_82%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:py-24 text-center">
        {/* Value Promises Strip: Sleek static creative pill on mobile (0% CPU, 0% skip), slow ambient ticker on desktop */}
        <Reveal immediate>
          {/* Mobile: Creative, sleek static pill badge */}
          <div className="flex sm:hidden justify-center mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 dark:bg-card/50 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground backdrop-blur-sm shadow-xs">
              <span className="relative flex size-1.5 shrink-0">
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-foreground/90 font-medium">{t('strip.fixed')}</span>
              <span className="text-border">·</span>
              <span>{t('strip.deadlines')}</span>
              <span className="text-border">·</span>
              <span className="text-emerald-500 font-semibold">{t('strip.fluff')}</span>
            </div>
          </div>

          {/* Tablet & Desktop: Refined horizontal motion strip */}
          <div className="hidden sm:flex justify-center mx-auto">
            <div className="inline-flex items-center gap-2 max-w-[420px] overflow-hidden rounded-full border border-border/70 bg-card/40 dark:bg-card/30 px-2.5 py-1 text-[10.5px] font-medium tracking-wider text-muted-foreground backdrop-blur-sm shadow-xs">
              <span className="relative flex size-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              <div className="relative overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <motion.div
                  className="flex shrink-0 items-center gap-3 whitespace-nowrap uppercase text-[10.5px]"
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                    duration: 20,
                  }}
                >
                  {[...valuePromises, ...valuePromises].map((item, idx) => (
                    <React.Fragment key={`ticker-1-${idx}`}>
                      <span className="text-muted-foreground/90">{item}</span>
                      <span className="text-border">/</span>
                    </React.Fragment>
                  ))}
                  {[...valuePromises, ...valuePromises].map((item, idx) => (
                    <React.Fragment key={`ticker-2-${idx}`}>
                      <span className="text-muted-foreground/90">{item}</span>
                      <span className="text-border">/</span>
                    </React.Fragment>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Clean, High-Performance Animated Headline (Supports LTR and RTL naturally) */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
          className="mt-8 text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground text-balance max-w-4xl mx-auto leading-[1.15]"
        >
          {t('title')}
        </motion.h1>

        {/* Subtitle */}
        <Reveal immediate delay={0.12}>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto font-normal leading-relaxed">
            {t('subtitle')}
          </p>
        </Reveal>

        {/* Action Buttons */}
        <Reveal immediate delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild variant="gold" size="lg" className="rounded-full px-8 py-6 text-base shadow-lg shadow-gold-500/15">
              <Link href="/contact">
                <span>{t('primaryCta')}</span>
                <ArrowRight className="size-4 ml-2 rtl:rotate-180 rtl:mr-2 rtl:ml-0" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-7 py-6 text-base">
              <Link href="/services">
                <span>{t('secondaryCta')}</span>
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* Quick Service Tags */}
        <Reveal immediate delay={0.22}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{t('servicesLabel')}:</span>
            {popularTags.map((tag) => (
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

        {/* Social Proof / Trust Indicators */}
        <Reveal immediate delay={0.28}>
          <div className="mt-12 pt-8 border-t border-border/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">{t('badges.rating')}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>{t('badges.ownership')}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="size-4 text-gold-500" />
              <span>{t('badges.portal')}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
