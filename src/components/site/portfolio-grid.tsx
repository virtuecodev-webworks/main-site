'use client'

import * as React from 'react'
import Image from 'next/image'
import { ArrowUpRight, ExternalLink, Eye, Layers } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Reveal } from '@/components/motion/reveal'
import { PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/constants'
import { CATEGORY_STYLES } from '@/lib/studio'
import type { ProjectCard } from '@/lib/portfolio'
import { cn } from '@/lib/utils'

type Filter = 'all' | ProjectCategory

export interface PortfolioGridProps {
  projects: ProjectCard[]
  /** Categories that actually have work, so empty filters are hidden. */
  className?: string
  /**
   * Heading level for each project title: `2` on the portfolio index, where the
   * tiles are the page content and sit under the page `h1`; `3` (default) when
   * the grid is inside a section that already owns an `h2`.
   */
  headingLevel?: 2 | 3
}

/** Only Supabase-hosted covers go through the optimiser; others render as-is. */
function isOptimisable(url: string | null) {
  if (!url) return false
  return /^https:\/\/[^/]+\.supabase\.(co|in)\/storage\/v1\/object\/public\//.test(url)
}

export function PortfolioGrid({ projects, className, headingLevel = 3 }: PortfolioGridProps) {
  const t = useTranslations('Portfolio')
  const tCommon = useTranslations('Common')
  const [preview, setPreview] = React.useState<ProjectCard | null>(null)
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

  if (!projects.length) {
    return (
      <div className="surface grid place-items-center gap-3 px-6 py-20 text-center">
        <Layers className="size-7 text-gold-500" />
        <p className="text-base font-medium">{t('empty')}</p>
        <p className="max-w-md text-sm text-muted-foreground">{t('emptyAdminHint')}</p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList aria-label={t('title')}>
            {filters.map((value) => (
              <TabsTrigger key={value} value={value}>
                {t(`filters.${value}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          <p className="text-[13px] text-muted-foreground">
            {t('resultCount', { count: visible.length })}
          </p>
        </div>

        {filters.map((value) => (
          <TabsContent key={value} value={value} className="mt-0">
            <ProjectTiles
              projects={value === 'all' ? projects : projects.filter((p) => p.category === value)}
              onPreview={setPreview}
              headingLevel={headingLevel}
            />
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={preview !== null} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-4xl p-4 sm:p-5">
          <DialogHeader className="px-1">
            <DialogTitle>{t('preview')}</DialogTitle>
            <DialogDescription>
              {preview?.title} · {t('previewHint')}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            {preview?.liveUrl ? (
              <iframe
                title={`${t('preview')} - ${preview.title}`}
                src={preview.liveUrl}
                className="h-[62vh] w-full bg-white"
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            ) : (
              <div className="grid h-64 place-items-center text-sm text-muted-foreground">
                {t('empty')}
              </div>
            )}
          </div>

          {preview?.liveUrl ? (
            <div className="flex justify-end px-1">
              <Button asChild variant="outline" size="sm">
                <a href={preview.liveUrl} target="_blank" rel="noreferrer noopener">
                  {tCommon('visitSite')}
                  <ArrowUpRight className="size-3.5" />
                </a>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProjectTiles({
  projects,
  onPreview,
  headingLevel,
}: {
  projects: ProjectCard[]
  onPreview: (project: ProjectCard) => void
  headingLevel: 2 | 3
}) {
  const t = useTranslations('Portfolio')
  const tCommon = useTranslations('Common')
  const Heading: 'h2' | 'h3' = headingLevel === 2 ? 'h2' : 'h3'

  if (!projects.length) {
    return (
      <div className="surface grid place-items-center px-6 py-16 text-center text-sm text-muted-foreground">
        {t('empty')}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project, index) => (
        <Reveal key={project.id} delay={index * 0.06}>
          <article className="group surface flex h-full flex-col overflow-hidden p-0 shadow-elevation-1 transition-all duration-400 hover:-translate-y-1 hover:border-gold-300 hover:shadow-elevation-3">
            <div className="relative aspect-16/10 overflow-hidden border-b border-border bg-ink-950">
              {project.coverUrl ? (
                <Image
                  src={project.coverUrl}
                  alt={project.title}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  unoptimized={!isOptimisable(project.coverUrl)}
                  className="object-cover transition-transform duration-700 ease-[var(--ease-emphasized)] group-hover:scale-[1.04]"
                />
              ) : (
                <div
                  aria-hidden
                  className="grid size-full place-items-center bg-ink-900"
                >
                  <span className="gold-text font-display text-5xl font-bold opacity-80">
                    {project.title.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-ink-950/85 to-transparent p-3.5">
                <Badge className={cn('border', CATEGORY_STYLES[project.category])}>
                  {t(`filters.${project.category}`)}
                </Badge>
                {project.featured ? (
                  <Badge variant="gold">{tCommon('featured')}</Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <Heading className="text-base leading-snug font-semibold">
                  {project.title}
                </Heading>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {project.year}
                </span>
              </div>

              {project.client ? (
                <p className="mt-1 text-[12px] tracking-[0.1em] text-muted-foreground uppercase">
                  {t('client')}: {project.client}
                </p>
              ) : null}

              {project.summary ? (
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {project.summary}
                </p>
              ) : null}

              {project.techTags.length ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {project.techTags.slice(0, 5).map((tag) => (
                    <li key={tag}>
                      <Badge variant="outline">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-auto flex items-center gap-2 pt-5">
                <Button
                  type="button"
                  variant="subtle"
                  size="sm"
                  className="flex-1"
                  onClick={() => onPreview(project)}
                >
                  <Eye className="size-3.5" />
                  {t('preview')}
                </Button>
                {project.liveUrl ? (
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={project.liveUrl} target="_blank" rel="noreferrer noopener">
                      <ExternalLink className="size-3.5" />
                      {t('viewLive')}
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  )
}
