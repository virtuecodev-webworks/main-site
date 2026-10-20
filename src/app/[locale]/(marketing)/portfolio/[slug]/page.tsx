import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { DeviceMockup } from '@/components/site/device-mockup'
import { getProjectBySlug, getPublishedProjects } from '@/lib/supabase/queries'
import { PLACEHOLDER_PROJECTS, toProjectCard, type ProjectCard } from '@/lib/portfolio'
import { publicMediaUrl } from '@/lib/supabase/env'
import { CATEGORY_STYLES } from '@/lib/studio'
import { locales } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/supabase/types'
import type { ProjectCategory } from '@/lib/constants'

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    PLACEHOLDER_PROJECTS.map((project) => ({ locale, slug: project.slug })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const path = `/portfolio/${slug}`

  const project = await getProjectBySlug(slug)
  const placeholder = project ? null : PLACEHOLDER_PROJECTS.find((entry) => entry.slug === slug)

  const base = await buildPageMetadata({
    locale,
    path,
    namespace: 'Portfolio',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
    type: 'article',
  })

  if (project) {
    return { ...base, title: project.title, description: project.summary ?? base.description }
  }
  if (placeholder) {
    return {
      ...base,
      title: placeholder.title,
      description: placeholder.summary ?? base.description,
    }
  }
  return base
}

/** Only Supabase-hosted covers go through the optimiser; local SVGs render as-is. */
function isOptimisable(url: string | null) {
  if (!url) return false
  return /^https:\/\/[^/]+\.supabase\.(co|in)\/storage\/v1\/object\/public\//.test(url)
}

interface CaseStudyView {
  slug: string
  title: string
  client: string | null
  summary: string | null
  category: ProjectCategory
  techTags: string[]
  liveUrl: string | null
  coverUrl: string | null
  gallery: string[]
  year: string
  paragraphs: string[]
}

/**
 * Factual placeholder bodies for demo projects. Written to describe what was
 * built without inventing metrics, percentages or client quotes.
 */
const PLACEHOLDER_BODIES: Record<string, string[]> = {
  'aurum-capital-platform': [
    "A multi-currency investor portal for a private capital firm. Investors sign in to a dashboard that shows their holdings, subscription documents and the latest reporting, while the firm's team manages onboarding from the same system.",
    'We built the front end on Next.js with TypeScript and Tailwind CSS, and used Supabase for authentication, row-level-secured data and file storage. Onboarding is a guided flow with server-side validation, and every document is stored against the investor record it belongs to.',
    'Reporting is generated from structured data rather than uploaded spreadsheets, so a new quarterly statement flows straight through to the dashboard once it is published.',
  ],
  'finery-commerce': [
    "A headless commerce replatform for a fashion retailer selling in several currencies. The storefront renders on Next.js and talks to a commerce layer through a typed API, with Flutterwave handling multi-currency checkout.",
    "Inventory syncs from the retailer's operations system so the catalogue stays accurate without manual edits, and order confirmations are sent through Resend. The checkout was rebuilt around fewer steps and clearer delivery information.",
    "Payments are recorded against a reference we generate, and webhooks reconcile each transaction so the retailer's records match what was actually settled.",
  ],
  'meridian-editorial': [
    'An editorial platform for a newsroom that publishes several times a day. We built a block-based WordPress theme with custom post types for articles, authors and series, so editors assemble layouts from patterns instead of fighting a page builder.',
    'Editorial workflows cover drafting, review and scheduling, and the theme ships with performance and security hardening as standard. Images are sized and served responsively, and archive pages are paginated without heavy queries.',
    'The result is a publishing tool the newsroom can run without a developer on call for every story.',
  ],
  'northline-studio': [
    'A launch site for a design studio, built in Wix Studio with Velo powering the interactive pieces. The studio wanted to publish campaigns and update pricing themselves without waiting on development time.',
    'We set up a responsive design system, wired CMS collections for projects and pricing, and added booking logic that checks availability before confirming a slot. SEO metadata, schema and analytics were configured before launch.',
    'Content, domains and accounts were handed over with documentation so the studio can keep shipping updates on their own.',
  ],
}

function buildCaseStudy(
  project: Project | null,
  placeholder: ProjectCard | null,
): CaseStudyView | null {
  if (project) {
    const gallery = (project.gallery_paths ?? [])
      .map((path) => publicMediaUrl(path))
      .filter((url): url is string => Boolean(url))

    return {
      slug: project.slug,
      title: project.title,
      client: project.client,
      summary: project.summary,
      category: project.category,
      techTags: project.tech_tags ?? [],
      liveUrl: project.live_url,
      coverUrl: publicMediaUrl(project.cover_image_path),
      gallery,
      year: new Date(project.created_at).getFullYear().toString(),
      paragraphs: (project.description ?? '')
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    }
  }

  if (!placeholder) return null

  // Placeholder projects only ship a single local cover, so the gallery reuses
  // the existing local cover SVGs instead of inventing new asset paths.
  const gallery = Array.from(
    new Set(
      [placeholder.coverUrl, ...PLACEHOLDER_PROJECTS.map((entry) => entry.coverUrl)].filter(
        (url): url is string => Boolean(url),
      ),
    ),
  )

  return {
    slug: placeholder.slug,
    title: placeholder.title,
    client: placeholder.client,
    summary: placeholder.summary,
    category: placeholder.category,
    techTags: placeholder.techTags,
    liveUrl: placeholder.liveUrl,
    coverUrl: placeholder.coverUrl,
    gallery,
    year: placeholder.year,
    paragraphs: PLACEHOLDER_BODIES[placeholder.slug] ?? [],
  }
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-[14px] text-ink-700 dark:text-ink-200">{children}</dd>
    </div>
  )
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const supabaseProject = await getProjectBySlug(slug)
  const placeholder = supabaseProject
    ? null
    : (PLACEHOLDER_PROJECTS.find((entry) => entry.slug === slug) ?? null)

  const study = buildCaseStudy(supabaseProject, placeholder)
  if (!study) notFound()

  const t = await getTranslations('CaseStudy')
  const tPortfolio = await getTranslations('Portfolio')
  const tServices = await getTranslations('Services')

  const role = tServices(`items.${study.category}.title`)

  const published = await getPublishedProjects()
  const cards: ProjectCard[] = published.length ? published.map(toProjectCard) : PLACEHOLDER_PROJECTS

  let next: ProjectCard | null = null
  if (cards.length > 1) {
    const index = cards.findIndex((card) => card.slug === study.slug)
    next = index === -1 ? cards[0] : cards[(index + 1) % cards.length]
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-[12.5px] text-muted-foreground transition-colors hover:text-gold-700"
        >
          <ArrowLeft className="size-3.5" />
          {t('back')}
        </Link>

        <div className="mt-8 flex flex-col gap-5">
          <Badge className={cn('border', CATEGORY_STYLES[study.category])}>
            {tPortfolio(`filters.${study.category}`)}
          </Badge>

          <Reveal immediate>
            <h1 className="max-w-4xl text-[2rem] leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-[3rem]">
              {study.title}
            </h1>
          </Reveal>

          {study.summary ? (
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {study.summary}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-5 sm:px-8">
        <DeviceMockup
          desktopSrc={study.coverUrl ?? undefined}
          mobileSrc={study.gallery?.[0] ?? study.coverUrl ?? undefined}
          alt={study.title}
          url={study.liveUrl}
        />
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-16">
          <dl className="grid h-fit grid-cols-2 gap-x-8 gap-y-7 lg:grid-cols-1">
            <MetaItem label={t('client')}>{study.client ?? '-'}</MetaItem>
            <MetaItem label={t('year')}>{study.year}</MetaItem>
            <MetaItem label={t('role')}>{role}</MetaItem>
            <MetaItem label={t('stack')}>
              {study.techTags.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {study.techTags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="outline">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                '-'
              )}
            </MetaItem>
          </dl>

          <div className="flex max-w-2xl flex-col gap-5 text-[15.5px] leading-[1.85] text-ink-700 dark:text-ink-200">
            {study.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        {study.liveUrl ? (
          <div className="mt-14">
            <Button asChild variant="gold" size="lg">
              <a href={study.liveUrl} target="_blank" rel="noreferrer noopener">
                {t('visit')}
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          </div>
        ) : null}
      </div>

      {study.gallery.length > 1 ? (
        <section className="border-t border-border bg-muted/45">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <h2 className="text-[11px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
              {t('gallery')}
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {study.gallery.map((imageUrl, index) => (
                <Reveal key={imageUrl} delay={index * 0.06}>
                  <div className="relative aspect-16/10 overflow-hidden rounded-xl border border-border bg-ink-950">
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      unoptimized={!isOptimisable(imageUrl)}
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {next ? (
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <Link
            href={`/portfolio/${next.slug}`}
            className="group surface flex flex-col gap-4 p-8 shadow-elevation-1 transition-all duration-400 hover:-translate-y-1 hover:border-gold-300 hover:shadow-elevation-3 sm:flex-row sm:items-center sm:justify-between sm:p-10"
          >
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {t('next')}
              </span>
              <span className="text-xl font-semibold sm:text-2xl">{next.title}</span>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border text-ink-500 transition-colors duration-300 group-hover:border-gold-400 group-hover:bg-gold-50 group-hover:text-gold-700 dark:text-ink-400 dark:group-hover:bg-gold-500/12 dark:group-hover:text-gold-300">
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      ) : null}
    </>
  )
}
