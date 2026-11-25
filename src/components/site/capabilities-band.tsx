'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, LayoutGrid, List } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { VisitorAvailability } from './visitor-availability'
import { PROMISES } from '@/lib/studio'
import { PHOTOS } from '@/lib/photos'
import { cn } from '@/lib/utils'

interface ShowcaseDemoItem {
  title: string
  discipline: string
  focus: string
  showcaseSlug: string
  image: string
  summary: string
  tags: string[]
}

const SHOWCASE_DEMOS: ShowcaseDemoItem[] = [
  {
    title: 'Aurum Treasury UI',
    discipline: 'Fintech Dashboard Concept',
    focus: 'Interactive Demo',
    showcaseSlug: 'aurum-capital-platform',
    image: '/work/aurum-hero.jpg',
    summary:
      'Interactive concept demonstrating treasury allocation calculators, transfer previews, and card-control toggles.',
    tags: ['Interactive Demo', 'Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    title: 'Maison Finery Store',
    discipline: 'Multi-Currency Storefront Concept',
    focus: 'Interactive Demo',
    showcaseSlug: 'finery-commerce',
    image: '/work/finery-hero.jpg',
    summary:
      'Editorial e-commerce prototype featuring 4-currency formatting, product quick-view modal, and a live slide-out bag.',
    tags: ['Interactive Demo', 'Multi-Currency', 'Cart Drawer', 'Responsive'],
  },
  {
    title: 'The Meridian Review',
    discipline: 'Digital Publication Concept',
    focus: 'Interactive Demo',
    showcaseSlug: 'meridian-editorial',
    image: '/work/meridian-hero.jpg',
    summary:
      'Journalism publication prototype with a full-article reader modal, docked audio player UI, and category filtering.',
    tags: ['Interactive Demo', 'Editorial UI', 'Audio Player', 'Reader Modal'],
  },
  {
    title: 'Kinetix AI Cloud',
    discipline: 'Developer Console Concept',
    focus: 'Interactive Demo',
    showcaseSlug: 'kinetix-ai-cloud',
    image: '/work/kinetix-hero.jpg',
    summary:
      'Developer platform concept with an interactive GPU cluster cost calculator, playground UI, and copyable SDK tabs.',
    tags: ['Interactive Demo', 'Cost Calculator', 'SDK Tabs', 'Tailwind'],
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
 * Interactive Studio Demos Showcase (`section#live.section_live`)
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
            <div
              role="group"
              aria-label="Layout view"
              className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs"
            >
              <button
                type="button"
                aria-pressed={viewMode === 'cards'}
                onClick={() => setViewMode('cards')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all duration-200',
                  viewMode === 'cards'
                    ? 'bg-primary text-[#0a0a0a] font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <LayoutGrid className="size-3.5" aria-hidden="true" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all duration-200',
                  viewMode === 'list'
                    ? 'bg-primary text-[#0a0a0a] font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <List className="size-3.5" aria-hidden="true" />
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
            {SHOWCASE_DEMOS.map((item) => (
              <article
                key={item.showcaseSlug}
                className="work_card group relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl bg-[#0a0a0a]"
              >
                <ParallaxCardImage src={item.image} alt={`${item.title} — ${item.discipline}`} />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]/85 transition-opacity duration-500 group-hover:from-[#0a0a0a]/70"
                />

                <Link
                  href={`/portfolio/${item.showcaseSlug}`}
                  aria-label={`${item.title} — interactive concept demo`}
                  className="absolute inset-0 z-10"
                />

                <div className="work_panel pointer-events-none absolute top-4 start-4 z-20 flex max-h-[5.75rem] w-[84%] flex-col justify-between overflow-hidden rounded-xl border border-[#f5f4f024] bg-[#0a0a0a99] p-4 text-[#f5f4f0] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:max-h-[14.5rem] group-hover:w-[calc(100%-2rem)] sm:top-5 sm:start-5 sm:w-[66%] sm:group-hover:w-[calc(100%-2.5rem)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="mb-1 inline-flex items-center rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary uppercase">
                        {item.focus}
                      </span>
                      <h3 className="work_client truncate font-display text-base font-semibold tracking-[-0.02em] text-[#f5f4f0] sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="work_tag mt-0.5 truncate text-xs text-[#f5f4f0]/65">
                        {item.discipline}
                      </p>
                    </div>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#f5f4f0] transition-transform duration-300 group-hover:bg-primary group-hover:text-[#0a0a0a]">
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="work_cta-wrap mt-3 flex flex-col justify-between gap-2.5 border-t border-[#f5f4f024] pt-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#f5f4f0]/75">
                      {item.summary}
                    </p>
                    <span className="label-mono-xs text-primary pt-0.5">
                      Inspect Concept Demo ↗
                    </span>
                  </div>
                </div>

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

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary sm:hidden">
                    Explore Demo ↗
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="live_list border-t border-border mt-4">
            {SHOWCASE_DEMOS.map((item) => (
              <Link
                key={item.showcaseSlug}
                href={`/portfolio/${item.showcaseSlug}`}
                className="live_row group grid grid-cols-1 items-center gap-6 border-b border-border py-7 transition-colors hover:bg-foreground/[0.025] sm:py-8 lg:grid-cols-2"
              >
                <div className="flex items-center gap-3">
                  <h3 className="live_client heading-style-h3 transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <ArrowUpRight className="size-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary group-hover:opacity-100" aria-hidden="true" />
                </div>

                <div className="live_details grid grid-cols-1 items-center gap-5 sm:grid-cols-3">
                  <div className="live_discipline text-xs font-medium tracking-[0.04em] text-muted-foreground uppercase">
                    {item.discipline}
                  </div>

                  <div className="text-xs font-medium text-muted-foreground">
                    <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {item.focus}
                    </span>
                  </div>

                  <div className="live_ships text-xs font-medium text-primary sm:text-end">
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
 * Our Standards Banner (`section#culture`)
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

  return (
    <div className={cn('space-y-4', className)}>
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
    </div>
  )
}

/** Backwards-compatible export for pages importing `CapabilitiesBand`. */
export function CapabilitiesBand({ className }: { className?: string }) {
  return <LiveStudioTracker className={className} />
}
