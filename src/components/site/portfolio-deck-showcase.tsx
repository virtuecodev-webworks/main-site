'use client'

import * as React from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Layers, LayoutGrid } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import TumbleDeckShowcase, {
  type TumbleCard,
  type TumbleDeckHandle,
} from '@/components/ui/tumble-deck-showcase'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
import { VantraButton } from '@/components/ui/vantra-button'
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/constants'
import { PHOTOS } from '@/lib/photos'
import type { ProjectCard } from '@/lib/portfolio'
import { cn } from '@/lib/utils'

type Filter = 'all' | ProjectCategory

const FALLBACK_COVERS = [
  PHOTOS.workBand,
  PHOTOS.services,
  PHOTOS.collaboration,
  PHOTOS.studio,
  PHOTOS.process,
]

export interface PortfolioDeckShowcaseProps {
  projects: ProjectCard[]
  className?: string
  headingLevel?: 2 | 3
  /** Show category filter tabs (used on `/portfolio`). */
  showFilters?: boolean
  /** Allow switching between 3D Tumble Deck and classic 2-column Grid (used on `/portfolio`). */
  showViewToggle?: boolean
}

export function PortfolioDeckShowcase({
  projects,
  className,
  headingLevel = 3,
  showFilters = false,
  showViewToggle = false,
}: PortfolioDeckShowcaseProps) {
  const t = useTranslations('Portfolio')
  const [filter, setFilter] = React.useState<Filter>('all')
  const [viewMode, setViewMode] = React.useState<'deck' | 'grid'>('deck')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const deckRef = React.useRef<TumbleDeckHandle | null>(null)

  const available = React.useMemo(() => {
    const present = new Set(projects.map((project) => project.category))
    return PROJECT_CATEGORIES.filter((category) => present.has(category))
  }, [projects])

  const filters: Filter[] = ['all', ...available]

  const visible = React.useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)),
    [projects, filter],
  )

  const deckCards = React.useMemo<TumbleCard[]>(
    () =>
      visible.map((project, index) => {
        const src =
          project.coverUrl && !project.coverUrl.endsWith('.svg')
            ? project.coverUrl
            : FALLBACK_COVERS[index % FALLBACK_COVERS.length]
        return {
          src,
          alt: `${project.title} — ${t(`filters.${project.category}`)}`,
          title: project.title,
        }
      }),
    [visible, t],
  )

  const safeIndex = visible.length > 0 ? activeIndex % visible.length : 0
  const active = visible[safeIndex] ?? visible[0]
  const Heading: 'h2' | 'h3' = headingLevel === 2 ? 'h2' : 'h3'

  const handleFilterChange = (nextFilter: Filter) => {
    setFilter(nextFilter)
    setActiveIndex(0)
  }

  if (!projects.length) {
    return (
      <div className="surface grid place-items-center gap-3 px-6 py-20 text-center">
        <Layers className="size-7 text-primary" aria-hidden="true" />
        <p className="text-base font-medium">{t('empty')}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t('emptyAdminHint')}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {/* Optional Category Filter + Deck/Grid View Toggle Toolbar */}
      {(showFilters || showViewToggle) && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {showFilters && filters.length > 2 ? (
            <div
              role="tablist"
              aria-label={t('title')}
              className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1"
            >
              {filters.map((value) => {
                const isSelected = filter === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => handleFilterChange(value)}
                    className={cn(
                      'cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium tracking-[0.02em] transition-all',
                      isSelected
                        ? 'bg-[#0a0a0a] text-[#f5f4f0] dark:bg-[#f5f4f0] dark:text-[#0a0a0a]'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t(`filters.${value}`)}
                  </button>
                )
              })}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <span className="label-mono hidden text-muted-foreground sm:inline">
              ( &nbsp;&nbsp;&nbsp;{t('resultCount', { count: visible.length })}&nbsp;&nbsp;&nbsp; )
            </span>

            {showViewToggle && (
              <div
                role="group"
                aria-label="Showcase layout"
                className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs"
              >
                <button
                  type="button"
                  aria-pressed={viewMode === 'deck'}
                  onClick={() => setViewMode('deck')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all duration-200',
                    viewMode === 'deck'
                      ? 'bg-primary font-semibold text-[#191308] shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Layers className="size-3.5" aria-hidden="true" />
                  <span>Deck</span>
                </button>
                <button
                  type="button"
                  aria-pressed={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all duration-200',
                    viewMode === 'grid'
                      ? 'bg-primary font-semibold text-[#191308] shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <LayoutGrid className="size-3.5" aria-hidden="true" />
                  <span>Grid</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <PortfolioGrid projects={visible} showFilters={false} headingLevel={headingLevel} />
      ) : (
        <div className="relative overflow-hidden rounded-[24px] border border-border bg-card shadow-elevation-2">
          {/* Ambient Virtue Gold floor glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                'radial-gradient(ellipse 68% 44% at 50% 60%, rgba(220, 170, 40, 0.16) 0%, transparent 72%)',
            }}
          />
          {/* Subtle architectural blueprint hairline grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />

          {/* Top HUD Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-7">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="label-mono text-primary tabular-nums">
                ( {String(safeIndex + 1).padStart(2, '0')} /{' '}
                {String(visible.length).padStart(2, '0')} )
              </span>
              {active && (
                <>
                  <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/12 px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-primary uppercase">
                    {active.kind === 'concept' ? 'Interactive Demo' : 'Client Project'}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t(`filters.${active.category}`)} · {active.year}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground md:inline">
                Scroll, drag, or click to flip
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => deckRef.current?.step(-1)}
                  aria-label="Previous website preview"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => deckRef.current?.step(1)}
                  aria-label="Next website preview"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* 3D Tumble Deck Stage */}
          <div className="relative z-10">
            <TumbleDeckShowcase
              deckRef={deckRef}
              cards={deckCards}
              height="clamp(360px, 58svh, 580px)"
              aspect={1.95}
              depth={Math.min(5, Math.max(2, deckCards.length - 1))}
              onActiveIndexChange={setActiveIndex}
              ariaLabel="Virtue & Co. website portfolio showcase"
            />
          </div>

          {/* Bottom Active Project Metadata & Action Strip */}
          {active && (
            <div className="relative z-10 border-t border-border/70 bg-background/65 px-5 py-5 backdrop-blur-md sm:px-7 sm:py-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div className="min-w-0 flex-1">
                  <Heading className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-2xl">
                    {active.title}
                  </Heading>
                  {active.summary && (
                    <p className="mt-1.5 max-w-2xl line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {active.summary}
                    </p>
                  )}
                  {active.techTags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {active.techTags.slice(0, 4).map((tag) => (
                        <li
                          key={tag}
                          className="rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                  <VantraButton href={`/portfolio/${active.slug}`} variant="gold" size="sm">
                    {active.kind === 'concept' ? 'Inspect Demo' : 'Read Case Study'}
                  </VantraButton>

                  {active.liveUrl && active.liveUrl !== 'hidden' ? (
                    active.liveUrl.startsWith('http') ? (
                      <a
                        href={active.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/60 hover:text-primary"
                      >
                        <span>Live Preview</span>
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </a>
                    ) : (
                      <Link
                        href={active.liveUrl}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/60 hover:text-primary"
                      >
                        <span>Live Preview</span>
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    )
                  ) : null}
                </div>
              </div>

              {/* Bottom Quick-Jump Progress Pills */}
              {visible.length > 1 && (
                <div
                  className="mt-5 flex items-center justify-center gap-1.5 border-t border-border/50 pt-4"
                  role="tablist"
                  aria-label="Select website preview"
                >
                  {visible.map((project, idx) => {
                    const current = idx === safeIndex
                    return (
                      <button
                        key={project.id}
                        type="button"
                        role="tab"
                        aria-selected={current}
                        aria-label={`Show ${project.title}`}
                        onClick={() => deckRef.current?.goTo(idx)}
                        className={cn(
                          'h-1.5 cursor-pointer rounded-full transition-all duration-300',
                          current
                            ? 'w-7 bg-primary'
                            : 'w-2 bg-foreground/20 hover:bg-foreground/45',
                        )}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
