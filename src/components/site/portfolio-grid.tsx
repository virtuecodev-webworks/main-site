'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight, Layers } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/motion/reveal'
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/constants'
import { PHOTOS } from '@/lib/photos'
import type { ProjectCard } from '@/lib/portfolio'
import { cn } from '@/lib/utils'

type Filter = 'all' | ProjectCategory

export interface PortfolioGridProps {
  projects: ProjectCard[]
  className?: string
  headingLevel?: 2 | 3
  /** Show category filter controls (default: true). */
  showFilters?: boolean
  /** Render the filter bar as Vantra's fixed bottom frosted pill (used on `/portfolio`). */
  floatingFilter?: boolean
}

const FALLBACK_COVERS = [
  PHOTOS.workBand,
  PHOTOS.services,
  PHOTOS.collaboration,
  PHOTOS.studio,
  PHOTOS.process,
]

function isOptimisable(src: string): boolean {
  if (src.startsWith('/media/')) return true
  if (src.startsWith('/work/')) return true
  if (src.startsWith('http://') || src.startsWith('https://')) return true
  return false
}

function ParallaxCoverImage({ src, alt }: { src: string; alt: string }) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['-7%', '7%'],
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
        unoptimized={!isOptimisable(src)}
        className="work_image object-cover transition-transform duration-700 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:scale-105"
      />
    </motion.div>
  )
}

export function PortfolioGrid({
  projects,
  className,
  headingLevel = 3,
  showFilters = true,
  floatingFilter = false,
}: PortfolioGridProps) {
  const t = useTranslations('Portfolio')
  const [filter, setFilter] = React.useState<Filter>('all')

  const available = React.useMemo(() => {
    const present = new Set(projects.map((project) => project.category))
    return PROJECT_CATEGORIES.filter((category) => present.has(category))
  }, [projects])

  const filters: Filter[] = ['all', ...available]

  const visible = React.useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter],
  )

  const Heading: 'h2' | 'h3' = headingLevel === 2 ? 'h2' : 'h3'

  if (!projects.length) {
    return (
      <div className="surface grid place-items-center gap-3 px-6 py-20 text-center">
        <Layers className="size-7 text-primary" />
        <p className="text-base font-medium">{t('empty')}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t('emptyAdminHint')}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Inline Filter Header (when not using the floating bottom pill) */}
      {showFilters && !floatingFilter && filters.length > 2 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label={t('title')}
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1"
          >
            {filters.map((value) => {
              const active = filter === value
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(value)}
                  className={cn(
                    'rounded-lg px-3.5 py-1.5 text-xs font-medium tracking-[0.02em] transition-all',
                    active
                      ? 'bg-[#0a0a0a] text-[#f5f4f0] dark:bg-[#f5f4f0] dark:text-[#0a0a0a]'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t(`filters.${value}`)}
                </button>
              )
            })}
          </div>

          <p className="label-mono text-muted-foreground">
            ( &nbsp;&nbsp;&nbsp;{t('resultCount', { count: visible.length })}&nbsp;&nbsp;&nbsp; )
          </p>
        </div>
      )}

      {/* Vantra 2-Column Square Work Grid (`.work_grid`) */}
      <div className="work_grid grid grid-cols-1 gap-2 md:grid-cols-2">
        {visible.map((project, index) => {
          const coverSrc =
            project.coverUrl && !project.coverUrl.endsWith('.svg')
              ? project.coverUrl
              : FALLBACK_COVERS[index % FALLBACK_COVERS.length]

          return (
            <Reveal key={project.id} delay={index * 0.06}>
              <article className="work_card group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#0a0a0a] sm:aspect-square">
                {/* Scroll-linked parallax cover image with 1.05 hover scale */}
                <ParallaxCoverImage src={coverSrc} alt={project.title} />

                {/* Subtle dark vignette for legibility */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/45 via-transparent to-[#0a0a0a]/85 transition-opacity duration-500 group-hover:from-[#0a0a0a]/65"
                />

                {/* Primary stretch link to case study */}
                <Link
                  href={`/portfolio/${project.slug}`}
                  aria-label={`${project.title} — case study`}
                  className="absolute inset-0 z-10"
                />

                {/* Vantra Top-Left Hover-Expanding Frosted Panel (`.work_panel`) */}
                <div className="work_panel pointer-events-none absolute top-4 left-4 z-20 flex max-h-[5.25rem] w-[82%] flex-col justify-between overflow-hidden rounded-xl border border-[#f5f4f024] bg-[#0a0a0a7a] p-4 text-[#f5f4f0] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.215,0.61,0.355,1)] group-hover:max-h-[12rem] group-hover:w-[calc(100%-2rem)] sm:top-5 sm:left-5 sm:w-[62%] sm:group-hover:w-[calc(100%-2.5rem)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Heading className="work_client truncate font-display text-base font-semibold tracking-[-0.02em] text-[#f5f4f0] sm:text-lg">
                        {project.client ?? project.title}
                      </Heading>
                      <p className="work_tag mt-0.5 truncate text-xs text-[#f5f4f0]/65">
                        {t(`filters.${project.category}`)} · {project.year}
                      </p>
                    </div>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#f5f4f0] transition-transform duration-300 group-hover:bg-primary group-hover:text-[#0a0a0a]">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>

                  {/* Hidden CTA / Summary Row revealed on hover */}
                  <div className="work_cta-wrap mt-3 flex flex-col justify-between gap-2 border-t border-[#f5f4f024] pt-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {project.summary && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-[#f5f4f0]/75">
                        {project.summary}
                      </p>
                    )}
                    <span className="label-mono-xs text-primary">
                      Read Case Study ↗
                    </span>
                  </div>
                </div>

                {/* Bottom Tags */}
                <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex flex-wrap items-end justify-between gap-2 sm:inset-x-5 sm:bottom-5">
                  <ul className="hidden flex-wrap gap-1.5 sm:flex">
                    {project.techTags.slice(0, 3).map((tag) => (
                      <li
                        key={tag}
                        className="rounded-md border border-[#f5f4f024] bg-[#0a0a0a75] px-2.5 py-1 text-xs font-medium text-[#f5f4f0]/85 backdrop-blur-xs"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary sm:hidden">
                    Case Study ↗
                  </span>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>

      {/* Vantra Fixed Bottom Frosted Filter Bar (`.filter_bar`) for `/portfolio` */}
      {showFilters && floatingFilter && filters.length > 1 && (
        <div className="filter_bar fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
          <div
            role="tablist"
            aria-label={t('title')}
            className="flex items-center gap-1 rounded-xl border border-[#f5f4f029] bg-[#0a0a0ad9] p-1.5 text-[#f5f4f0] shadow-2xl backdrop-blur-md"
          >
            {filters.map((value) => {
              const active = filter === value
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(value)}
                  className={cn(
                    'filter_btn rounded-lg px-3.5 py-2 text-xs font-medium tracking-[0.02em] whitespace-nowrap transition-all',
                    active
                      ? 'bg-[#f5f4f0] text-[#0a0a0a]'
                      : 'text-[#f5f4f0]/65 hover:text-[#f5f4f0]',
                  )}
                >
                  {t(`filters.${value}`)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
