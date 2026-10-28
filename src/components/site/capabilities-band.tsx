'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VisitorAvailability } from './visitor-availability'
import { PROMISES } from '@/lib/studio'
import { PHOTOS } from '@/lib/photos'
import { cn } from '@/lib/utils'

interface LiveBuild {
  client: string
  discipline: string
  phase: string
  progress: number
  ships: string
  showcaseSlug: string
}

const LIVE_BUILDS: LiveBuild[] = [
  {
    client: 'Aurum Capital',
    discipline: 'Custom Website & Client Portal',
    phase: 'Live & Ready to Explore',
    progress: 100,
    ships: 'View Case Study ↗',
    showcaseSlug: 'aurum-capital-platform',
  },
  {
    client: 'Maison Finery',
    discipline: 'Luxury Online Store',
    phase: 'Global Multi-Currency Checkout',
    progress: 96,
    ships: 'View Case Study ↗',
    showcaseSlug: 'finery-commerce',
  },
  {
    client: 'The Meridian Review',
    discipline: 'Digital Publication & Audio',
    phase: 'Final Quality Review',
    progress: 98,
    ships: 'View Case Study ↗',
    showcaseSlug: 'meridian-editorial',
  },
  {
    client: 'Kinetix AI Cloud',
    discipline: 'Product & Pricing Website',
    phase: 'Interactive Calculator Live',
    progress: 92,
    ships: 'View Case Study ↗',
    showcaseSlug: 'kinetix-ai-cloud',
  },
]

interface TestimonialItem {
  quote: string
  author: string
  role: string
  company: string
  avatar: string
  reverse?: boolean
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'Virtue & Co. launched our new website on the exact day promised. Clear fixed price, fast on every phone, and we own everything.',
    author: 'Marcus Vance',
    role: 'Managing Partner',
    company: 'Aurum Capital',
    avatar: '/work/aurum-hero.jpg',
    reverse: false,
  },
  {
    quote:
      'No middlemen or delays. Working directly with the senior team building our online store saved us six weeks and doubled our checkout completion.',
    author: 'Elena Rostova',
    role: 'Head of Digital',
    company: 'Maison Finery',
    avatar: '/work/finery-hero.jpg',
    reverse: true,
  },
  {
    quote:
      'Our new publication site cut our team’s publishing time in half and made reading on mobile effortless for our subscribers.',
    author: 'David Okafor',
    role: 'Editorial Director',
    company: 'Meridian Media',
    avatar: '/work/meridian-hero.jpg',
    reverse: false,
  },
  {
    quote:
      'Clear weekly updates and a fixed budget meant we always knew what was launching each week. Calm, dependable execution from day one.',
    author: 'Hannah Lindqvist',
    role: 'Founder',
    company: 'Northline Studio',
    avatar: '/work/northline-hero.jpg',
    reverse: true,
  },
]

/**
 * Vantra Section 5: "In the studio right now." (`section#live.section_live`)
 */
export function LiveStudioTracker({ className }: { className?: string }) {
  const t = useTranslations('Capabilities')
  const tLive = useTranslations('Home.live')

  return (
    <section
      id="live"
      aria-labelledby="live-heading"
      className={cn('section_live padding-global padding-section', className)}
    >
      <div className="container-max">
        <div className="section_header">
          <div>
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;{tLive('eyebrow')}&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 id="live-heading" className="heading-style-h2 mt-2">
              {tLive('title')}
            </h2>
          </div>
          <div className="section_meta">
            <VisitorAvailability />
          </div>
        </div>

        <div className="live_list border-t border-border">
          {LIVE_BUILDS.map((item) => (
            <Link
              key={item.client}
              href={`/portfolio/${item.showcaseSlug}`}
              className="live_row group grid grid-cols-1 items-center gap-6 border-b border-border py-7 transition-colors hover:bg-foreground/[0.025] sm:py-8 lg:grid-cols-2"
            >
              <div className="flex items-center gap-3">
                <h3 className="live_client heading-style-h3 transition-colors group-hover:text-primary">
                  {item.client}
                </h3>
                <ArrowUpRight className="size-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100" />
              </div>

              <div className="live_details grid grid-cols-1 items-center gap-5 sm:grid-cols-3">
                <div className="live_discipline text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">
                  {item.discipline}
                </div>

                <div className="live_progress flex flex-col gap-2">
                  <div className="live_progress-top flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.phase}</span>
                    <span className="font-semibold text-foreground">
                      {item.progress}%
                    </span>
                  </div>
                  <div className="live_track h-1 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="live_bar h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <div className="live_ships text-xs font-medium text-primary sm:text-right">
                  {tLive('viewCaseStudy')}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Operating Promises */}
        <dl className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((key, idx) => (
            <div key={key} className="border-t border-border pt-5">
              <span className="label-mono-xs text-primary">
                ( &nbsp;0{idx + 1}&nbsp; )
              </span>
              <dt className="mt-2 font-display text-base font-semibold tracking-[-0.02em] text-foreground">
                {t(`promises.${key}.title`)}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`promises.${key}.body`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/**
 * Section 7 & 8: Our Values Banner (`section#culture`) + Testimonials Slider (`section#testimonials`)
 */
export function CultureAndTestimonials({ className }: { className?: string }) {
  const tValues = useTranslations('Home.values')
  const reelContainerRef = React.useRef<HTMLDivElement | null>(null)
  const sliderRef = React.useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: reelContainerRef,
    offset: ['start end', 'center center'],
  })

  const smoothReelProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    restDelta: 0.001,
  })

  const reelScale = useTransform(
    smoothReelProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [0.94, 1],
  )

  const scrollSlider = (dir: 'prev' | 'next') => {
    if (!sliderRef.current) return
    const delta = dir === 'next' ? 420 : -420
    sliderRef.current.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Section 7: Our Standards Banner (Clean, Simple, Zero Video Controls) */}
      <section id="culture" className="section_culture padding-global padding-section">
        <div className="container-max">
          <div className="mx-auto max-w-3xl text-center">
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;{tValues('eyebrow')}&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 className="heading-style-h1 mt-4 text-balance">
              {tValues('title')}
            </h2>
          </div>

          <motion.div
            ref={reelContainerRef}
            style={{ scale: reelScale }}
            className="culture_video relative mt-10 aspect-[16/9] max-h-[580px] min-h-[340px] w-full overflow-hidden rounded-2xl bg-[#0a0a0a] text-[#f5f4f0] sm:mt-12"
          >
            <Image
              src={PHOTOS.studio}
              alt="Virtue & Co. Webworks craftsmanship"
              fill
              sizes="100vw"
              className="object-cover opacity-50"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/75"
            />

            {/* Clear, Simple Values Overlay */}
            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-12">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
                <span className="label-mono-xs text-white/80">
                  {tValues('services')}
                </span>
                <span className="label-mono-xs text-primary font-semibold">
                  {tValues('speed')}
                </span>
              </div>

              <div className="my-auto max-w-2xl py-6">
                <p className="font-display text-2xl leading-[1.12] font-semibold tracking-[-0.03em] text-[#f5f4f0] sm:text-4xl lg:text-[2.75rem]">
                  {tValues('title')}
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-white/10 pt-4 text-xs text-white/60">
                <span className="size-2 rounded-full bg-primary" />
                <span>Virtue &amp; Co. Webworks · Built for real business growth</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 8: Testimonials Slider (`section#testimonials.section_testimonials`) */}
      <section
        id="testimonials"
        aria-labelledby="testimonials-heading"
        className="section_testimonials padding-global padding-section overflow-hidden"
      >
        <div className="container-max">
          <div className="section_header">
            <h2 id="testimonials-heading" className="heading-style-h2">
              What clients say back.
            </h2>
            <div className="flex items-center gap-6">
              <div className="section_meta hidden sm:flex">
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;4.9 / 5&nbsp;&nbsp;&nbsp; )
                </span>
                <span className="text-muted-foreground">Across every project since 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollSlider('prev')}
                  aria-label="Previous testimonial"
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider('next')}
                  aria-label="Next testimonial"
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={sliderRef}
            className="testimonial_slider -mx-5 flex gap-2 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0"
          >
            {/* Card 1: Vantra Dark Aggregate Score Card (`.testimonial_card.is-score`) with Stacked Avatars */}
            <article className="testimonial_card is-score flex min-h-[26rem] w-[21rem] shrink-0 flex-col justify-between rounded-[20px] bg-[#0a0a0a] p-7 text-[#f5f4f0] sm:min-h-[28rem] sm:w-[24rem]">
              <div>
                <div className="flex items-baseline gap-1 font-display">
                  <span className="text-6xl font-semibold tracking-[-0.03em] text-[#f5f4f0] sm:text-7xl">
                    4.9
                  </span>
                  <span className="text-2xl text-[#f5f4f0]/40">/5</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#f5f4f0]/65">
                  We have delivered custom websites and online stores that help ambitious businesses grow with confidence.
                </p>
              </div>

              <div className="space-y-4 border-t border-[#f5f4f01f] pt-5">
                {/* Vantra `.testimonial_stack` Overlapping Avatars + Star Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="testimonial_stack flex items-center pl-2">
                    {TESTIMONIALS.map((tItem) => (
                      <div
                        key={tItem.author}
                        className="-ml-2.5 size-9 overflow-hidden rounded-full border-2 border-[#0a0a0a] bg-[#1b1b1e]"
                      >
                        <Image
                          src={tItem.avatar}
                          alt={tItem.author}
                          width={36}
                          height={36}
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <p className="text-xs font-medium text-[#f5f4f0]/75">
                  Trusted by clients worldwide
                </p>
              </div>
            </article>

            {/* Cards 2..5: Alternating Top-to-Bottom & Bottom-to-Top Quote Cards */}
            {TESTIMONIALS.map((item) => (
              <article
                key={item.author}
                className={cn(
                  'testimonial_card flex min-h-[26rem] w-[21rem] shrink-0 justify-between rounded-[20px] border border-border/70 bg-card p-7 text-foreground sm:min-h-[28rem] sm:w-[24rem]',
                  item.reverse ? 'flex-col-reverse' : 'flex-col',
                )}
              >
                <div
                  className={cn(
                    'flex items-center gap-3.5 border-border',
                    item.reverse ? 'border-t pt-4' : 'border-b pb-4',
                  )}
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                    <Image
                      src={item.avatar}
                      alt={item.author}
                      width={40}
                      height={40}
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-display text-sm font-semibold text-foreground">
                      {item.author}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.role}, {item.company}
                    </div>
                  </div>
                </div>

                <div className="my-auto py-4">
                  <blockquote className="text-base leading-relaxed font-medium text-foreground sm:text-[17px]">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

/** Backwards-compatible export for pages importing `CapabilitiesBand`. */
export function CapabilitiesBand({ className }: { className?: string }) {
  return <LiveStudioTracker className={className} />
}
