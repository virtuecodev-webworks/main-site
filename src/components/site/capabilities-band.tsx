'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowRight, ArrowUpRight, Star, LayoutGrid, List, Quote } from 'lucide-react'
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
  image: string
  summary: string
  tags: string[]
  metric: { label: string; value: string }
}

const LIVE_BUILDS: LiveBuild[] = [
  {
    client: 'Aurum Capital',
    discipline: 'Custom Website & Portal',
    phase: 'Live & Ready to Explore',
    progress: 100,
    ships: 'View Case Study ↗',
    showcaseSlug: 'aurum-capital-platform',
    image: '/work/aurum-hero.jpg',
    summary: 'Institutional private banking OS with encrypted treasury portal and real-time asset analytics.',
    tags: ['Next.js 15', 'TypeScript', 'Supabase', 'Tailwind'],
    metric: { label: 'Speed Score', value: '100/100' },
  },
  {
    client: 'Maison Finery',
    discipline: 'Luxury Online Store',
    phase: 'Global Multi-Currency Checkout',
    progress: 96,
    ships: 'View Case Study ↗',
    showcaseSlug: 'finery-commerce',
    image: '/work/finery-hero.jpg',
    summary: 'Editorial e-commerce experience with multi-currency checkout, dynamic lookbook, and 0.4s transitions.',
    tags: ['Headless Shopify', 'Next.js', 'Stripe', 'Animation'],
    metric: { label: 'Checkout', value: '+42% Conv.' },
  },
  {
    client: 'The Meridian Review',
    discipline: 'Digital Publication & Audio',
    phase: 'Final Quality Review',
    progress: 98,
    ships: 'View Case Study ↗',
    showcaseSlug: 'meridian-editorial',
    image: '/work/meridian-hero.jpg',
    summary: 'Cultural journalism publication featuring full reader mode, continuous audio narration, and member access.',
    tags: ['Next.js App Router', 'Audio Stream', 'Edge CDN'],
    metric: { label: 'Load Time', value: '0.38s' },
  },
  {
    client: 'Kinetix AI Cloud',
    discipline: 'Product & Pricing Website',
    phase: 'Interactive Calculator Live',
    progress: 92,
    ships: 'View Case Study ↗',
    showcaseSlug: 'kinetix-ai-cloud',
    image: '/work/kinetix-hero.jpg',
    summary: 'Enterprise compute platform featuring an interactive GPU pricing calculator and automated capacity reservation.',
    tags: ['Next.js', 'Interactive Tools', 'Tailwind', 'Stripe'],
    metric: { label: 'Availability', value: '99.99%' },
  },
]

interface TestimonialItem {
  quote: string
  author: string
  role: string
  company: string
  avatar: string
  projectSlug: string
  projectLabel: string
  verifiedBadge: string
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
    projectSlug: 'aurum-capital-platform',
    projectLabel: 'Aurum Capital Platform',
    verifiedBadge: 'Institutional Banking OS',
    reverse: false,
  },
  {
    quote:
      'No middlemen or delays. Working directly with the senior team building our online store saved us six weeks and doubled our checkout completion.',
    author: 'Elena Rostova',
    role: 'Head of Digital',
    company: 'Maison Finery',
    avatar: '/work/finery-hero.jpg',
    projectSlug: 'finery-commerce',
    projectLabel: 'Maison Finery Store',
    verifiedBadge: 'Luxury E-Commerce',
    reverse: true,
  },
  {
    quote:
      'Our new publication site cut our team’s publishing time in half and made reading on mobile effortless for our subscribers.',
    author: 'David Okafor',
    role: 'Editorial Director',
    company: 'Meridian Media',
    avatar: '/work/meridian-hero.jpg',
    projectSlug: 'meridian-editorial',
    projectLabel: 'The Meridian Review',
    verifiedBadge: 'Digital Media & Audio',
    reverse: false,
  },
  {
    quote:
      'Clear weekly updates and a fixed budget meant we always knew what was launching each week. Calm, dependable execution from day one.',
    author: 'Hannah Lindqvist',
    role: 'Founder',
    company: 'Northline Studio',
    avatar: '/work/northline-hero.jpg',
    projectSlug: 'northline-blueprint',
    projectLabel: 'Northline Architecture',
    verifiedBadge: 'Design Architecture',
    reverse: true,
  },
]

function ParallaxCardImage({ src, alt }: { src: string; alt: string }) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['-6%', '6%'],
  )

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="pointer-events-none absolute -inset-y-6 inset-x-0 z-0"
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="work_image object-cover transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105"
      />
    </motion.div>
  )
}

/**
 * Vantra Section 5: "What we are building right now." (`section#live.section_live`)
 */
export function LiveStudioTracker({ className }: { className?: string }) {
  const t = useTranslations('Capabilities')
  const tLive = useTranslations('Home.live')
  const [viewMode, setViewMode] = React.useState<'cards' | 'list'>('cards')

  return (
    <section
      id="live"
      aria-labelledby="live-heading"
      className={cn('section_live padding-global padding-section', className)}
    >
      <div className="container-max">
        <div className="section_header flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-8">
          <div>
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;{tLive('eyebrow')}&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 id="live-heading" className="heading-style-h2 mt-2">
              {tLive('title')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              {tLive('subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode Toggle Pill */}
            <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all duration-200',
                  viewMode === 'cards'
                    ? 'bg-primary text-[#0a0a0a] font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label="View as Cards"
              >
                <LayoutGrid className="size-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all duration-200',
                  viewMode === 'list'
                    ? 'bg-primary text-[#0a0a0a] font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label="View as Table List"
              >
                <List className="size-3.5" />
                <span>Table</span>
              </button>
            </div>

            <div className="hidden sm:block">
              <VisitorAvailability />
            </div>
          </div>
        </div>

        {/* Dynamic View: Cards Grid vs Table List */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4">
            {LIVE_BUILDS.map((item) => (
              <article
                key={item.client}
                className="work_card group relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl bg-[#0a0a0a]"
              >
                {/* Scroll-linked parallax cover image with hover zoom */}
                <ParallaxCardImage src={item.image} alt={item.client} />

                {/* Subtle dark vignette for legibility */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]/85 transition-opacity duration-500 group-hover:from-[#0a0a0a]/70"
                />

                {/* Primary stretch link to case study */}
                <Link
                  href={`/portfolio/${item.showcaseSlug}`}
                  aria-label={`${item.client} — case study`}
                  className="absolute inset-0 z-10"
                />

                {/* Vantra Top-Left Hover-Expanding Frosted Panel (`.work_panel`) */}
                <div className="work_panel pointer-events-none absolute top-4 left-4 z-20 flex max-h-[5.25rem] w-[84%] flex-col justify-between overflow-hidden rounded-xl border border-[#f5f4f024] bg-[#0a0a0a7a] p-4 text-[#f5f4f0] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:max-h-[14.5rem] group-hover:w-[calc(100%-2rem)] sm:top-5 sm:left-5 sm:w-[65%] sm:group-hover:w-[calc(100%-2.5rem)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="work_client truncate font-display text-base font-semibold tracking-[-0.02em] text-[#f5f4f0] sm:text-lg">
                        {item.client}
                      </h3>
                      <p className="work_tag mt-0.5 truncate text-xs text-[#f5f4f0]/65">
                        {item.discipline}
                      </p>
                    </div>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#f5f4f0] transition-transform duration-300 group-hover:bg-primary group-hover:text-[#0a0a0a]">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>

                  {/* Hidden CTA / Summary / Progress Row revealed on hover */}
                  <div className="work_cta-wrap mt-3 flex flex-col justify-between gap-2.5 border-t border-[#f5f4f024] pt-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#f5f4f0]/75">
                      {item.summary}
                    </p>

                    {/* Progress Bar inside expanding frosted panel */}
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#f5f4f0]/65 font-medium">{item.phase}</span>
                        <span className="font-mono font-bold text-primary">{item.progress}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <span className="label-mono-xs text-primary pt-0.5">
                      Read Case Study ↗
                    </span>
                  </div>
                </div>

                {/* Bottom Floating Tech Tags & Live Status Pill */}
                <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex flex-wrap items-end justify-between gap-2 sm:inset-x-5 sm:bottom-5">
                  <ul className="hidden flex-wrap gap-1.5 sm:flex">
                    {item.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-md border border-[#f5f4f024] bg-[#0a0a0a75] px-2.5 py-1 text-xs font-medium text-[#f5f4f0]/85 backdrop-blur-xs"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f5f4f024] bg-[#0a0a0a80] px-3 py-1 text-[11px] font-semibold text-[#f5f4f0] backdrop-blur-md">
                      <span
                        className={cn(
                          'size-1.5 rounded-full',
                          item.progress === 100 ? 'bg-emerald-400' : 'bg-gold-400 animate-pulse',
                        )}
                      />
                      <span>{item.progress === 100 ? '100% Shipped' : `${item.progress}% In Progress`}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary sm:hidden">
                      Case Study ↗
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="live_list border-t border-border mt-4">
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
        )}

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

  const [testimonialIndex, setTestimonialIndex] = React.useState(0)
  const [direction, setDirection] = React.useState<1 | -1>(1)

  const handleNext = () => {
    setDirection(1)
    setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }

  const handleDragEnd = (_e: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -35) {
      handleNext()
    } else if (info.offset.x > 35) {
      handlePrev()
    }
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
          <div className="section_header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-8">
            <div>
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;Verified Client Feedback&nbsp;&nbsp;&nbsp; )
              </span>
              <h2 id="testimonials-heading" className="heading-style-h2 mt-2">
                What clients say back.
              </h2>
            </div>
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
                  onClick={handlePrev}
                  aria-label="Previous testimonial"
                  className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:border-primary hover:text-primary active:scale-95"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next testimonial"
                  className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all hover:border-primary hover:text-primary active:scale-95"
                >
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Testimonial Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left 4 Columns: Vantra Dark Aggregate Score Card (`.testimonial_card.is-score`) */}
            <article className="lg:col-span-4 flex flex-col justify-between rounded-[24px] bg-[#0a0a0a] p-8 text-[#f5f4f0] shadow-xl border border-white/10 min-h-[360px] lg:min-h-[440px]">
              <div>
                <div className="flex items-baseline gap-1 font-display">
                  <span className="text-6xl font-bold tracking-[-0.03em] text-[#f5f4f0] sm:text-7xl">
                    4.9
                  </span>
                  <span className="text-2xl text-[#f5f4f0]/40 font-semibold">/5</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#f5f4f0]/70">
                  We have delivered custom websites and online stores that help ambitious businesses grow with confidence.
                </p>

                {/* Star Row */}
                <div className="flex items-center gap-1.5 mt-5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-primary text-primary" />
                  ))}
                  <span className="text-xs font-semibold text-[#f5f4f0]/80 ml-2">Perfect 5.0 Rating</span>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center pl-2">
                    {TESTIMONIALS.map((tItem) => (
                      <div
                        key={tItem.author}
                        className="-ml-2.5 size-10 overflow-hidden rounded-full border-2 border-[#0a0a0a] bg-[#1b1b1e]"
                      >
                        <Image
                          src={tItem.avatar}
                          alt={tItem.author}
                          width={40}
                          height={40}
                          className="size-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Interactive card counter and dots */}
                  <div className="flex items-center gap-1.5">
                    {TESTIMONIALS.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setDirection(idx > testimonialIndex ? 1 : -1)
                          setTestimonialIndex(idx)
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          idx === testimonialIndex ? 'w-6 bg-primary' : 'w-2 bg-white/20 hover:bg-white/40',
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#f5f4f0]/60">
                  <span>Trusted by clients worldwide</span>
                  <span className="font-mono text-primary font-semibold">
                    0{testimonialIndex + 1} / 0{TESTIMONIALS.length}
                  </span>
                </div>
              </div>
            </article>

            {/* Right 8 Columns: Dynamic Swipeable Testimonial Card */}
            <div className="lg:col-span-8 relative min-h-[360px] lg:min-h-[440px] overflow-hidden flex flex-col">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.article
                  key={testimonialIndex}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({
                      x: dir > 0 ? 90 : -90,
                      opacity: 0,
                      scale: 0.98,
                    }),
                    center: {
                      x: 0,
                      opacity: 1,
                      scale: 1,
                      transition: {
                        x: { type: 'spring', stiffness: 340, damping: 30 },
                        opacity: { duration: 0.22 },
                      },
                    },
                    exit: (dir: number) => ({
                      x: dir > 0 ? -90 : 90,
                      opacity: 0,
                      scale: 0.98,
                      transition: {
                        x: { type: 'spring', stiffness: 340, damping: 30 },
                        opacity: { duration: 0.18 },
                      },
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="group relative flex size-full flex-1 cursor-grab active:cursor-grabbing flex-col justify-between rounded-[24px] border border-border bg-card p-8 sm:p-10 shadow-sm hover:border-gold-500/40 hover:shadow-xl transition-all duration-300 select-none"
                >
                  {/* Watermark Quote Icon */}
                  <div className="pointer-events-none absolute right-8 top-8 opacity-10 dark:opacity-15">
                    <Quote className="size-24 text-primary" />
                  </div>

                  {/* Top Client Bio Row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                      <div className="size-14 shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-muted shadow-xs">
                        <Image
                          src={TESTIMONIALS[testimonialIndex].avatar}
                          alt={TESTIMONIALS[testimonialIndex].author}
                          width={56}
                          height={56}
                          className="size-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground">
                          {TESTIMONIALS[testimonialIndex].author}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {TESTIMONIALS[testimonialIndex].role}, {TESTIMONIALS[testimonialIndex].company}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-700 dark:text-gold-300">
                        {TESTIMONIALS[testimonialIndex].verifiedBadge}
                      </span>
                      <div className="hidden sm:flex items-center gap-0.5 text-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quote Body */}
                  <div className="my-auto py-6 sm:py-8">
                    <blockquote className="font-display text-xl sm:text-2xl lg:text-[1.7rem] leading-relaxed font-semibold tracking-[-0.015em] text-foreground">
                      &ldquo;{TESTIMONIALS[testimonialIndex].quote}&rdquo;
                    </blockquote>
                  </div>

                  {/* Bottom Footer Action & Swipe Hint */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                    <Link
                      href={`/portfolio/${TESTIMONIALS[testimonialIndex].projectSlug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:text-foreground group/link"
                    >
                      <span>Explore {TESTIMONIALS[testimonialIndex].projectLabel}</span>
                      <ArrowUpRight className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="hidden sm:inline">Drag or swipe left/right</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="Previous testimonial"
                        >
                          <ArrowLeft className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="size-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          aria-label="Next testimonial"
                        >
                          <ArrowRight className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
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
