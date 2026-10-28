import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CtaBand } from '@/components/site/cta-band'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
import { VantraButton } from '@/components/ui/vantra-button'
import { getProjectBySlug, getPublishedProjects } from '@/lib/supabase/queries'
import {
  CASE_STUDY_DETAILS,
  mergeWithShowcaseProjects,
  PLACEHOLDER_PROJECTS,
  toProjectCard,
  type ProjectCard,
} from '@/lib/portfolio'
import { PHOTOS } from '@/lib/photos'
import { locales } from '@/i18n/routing'
import { buildPageMetadata } from '@/lib/seo'

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    PLACEHOLDER_PROJECTS.map((project) => ({ locale, slug: project.slug })),
  )
}

async function resolveProject(slug: string): Promise<{
  card: ProjectCard
  description: string | null
} | null> {
  const dbRow = await getProjectBySlug(slug)
  if (dbRow) {
    return {
      card: toProjectCard(dbRow),
      description: dbRow.description,
    }
  }

  const placeholder = PLACEHOLDER_PROJECTS.find((p) => p.slug === slug)
  if (!placeholder) return null

  return {
    card: placeholder,
    description: placeholder.summary,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const resolved = await resolveProject(slug)
  const base = await buildPageMetadata({
    locale,
    path: `/portfolio/${slug}`,
    namespace: 'Portfolio',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })

  if (!resolved) return base
  return {
    ...base,
    title: `${resolved.card.title} — Case Study`,
    description: resolved.card.summary ?? base.description,
  }
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const resolved = await resolveProject(slug)
  if (!resolved) notFound()

  const { card: project } = resolved
  const caseDetails = CASE_STUDY_DETAILS[project.slug]
  const t = await getTranslations('Portfolio')

  const allPublished = await getPublishedProjects()
  const pool = mergeWithShowcaseProjects(allPublished.map(toProjectCard))
  const moreWork = pool.filter((p) => p.slug !== project.slug).slice(0, 2)

  const heroImage =
    project.coverUrl && !project.coverUrl.endsWith('.svg')
      ? project.coverUrl
      : PHOTOS.workBand

  const galleryImages: [string, string, string] = caseDetails?.galleryImages ?? [
    heroImage,
    PHOTOS.studio,
    PHOTOS.collaboration,
  ]

  const outcomes = caseDetails?.outcomes ?? [
    {
      title: 'Checkout & Conversion',
      text: 'Checkout completion up 24% on the same traffic, with friction collapsed into one seamless flow.',
      metric: '+24%',
    },
    {
      title: 'Delivery Speed',
      text: 'Brief to launch in eight weeks, designed and engineered in parallel rather than handed over at the end.',
      metric: '8 wks',
    },
    {
      title: 'System Architecture',
      text: 'One unified component library and design token set running every surface with zero drift.',
      metric: '99/100',
    },
    {
      title: 'Independent Handover',
      text: 'Campaigns and updates shipped autonomously by their own team with zero agency dependency.',
      metric: '0 redraws',
    },
  ]

  const quote = caseDetails?.clientQuote ?? {
    quote:
      'Virtue & Co. replaced our fragmented tools with a system our team actually loves to use. It transformed our commercial velocity.',
    author: 'Founding Partner',
    role: project.client ?? project.title,
  }

  return (
    <>
      {/* 1. Vantra Section Hero (`section_hero`) */}
      <section
        data-surface="dark"
        data-screen-label="Hero"
        className="section_hero relative m-2 flex min-h-[76vh] flex-col justify-between overflow-hidden rounded-[20px] bg-[#0a0a0a] p-5 text-[#f5f4f0] sm:p-12"
      >
        <div aria-hidden="true" className="hero_image pointer-events-none absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="image-cover object-cover opacity-45"
          />
          <div
            className="hero_scrim absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,10,10,0.6) 0%, rgba(10,10,10,0.3) 45%, rgba(10,10,10,0.95) 100%)',
            }}
          />
        </div>

        {/* Top Breadcrumb Bar */}
        <div className="relative z-10 flex items-center justify-between pt-14 sm:pt-2">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] text-[#f5f4f0]/75 uppercase transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Work</span>
          </Link>

          <span className="label-mono text-primary">
            ( &nbsp;&nbsp;&nbsp;{t(`filters.${project.category}`)} · {project.year}&nbsp;&nbsp;&nbsp; )
          </span>
        </div>

        {/* Bottom Hero Title & Summary */}
        <div className="relative z-10 mt-auto pt-24 pb-4">
          <div className="max-w-4xl">
            <h1 className="heading heading-style-h0 text-balance font-semibold text-[#f5f4f0]">
              {project.client ?? project.title}
            </h1>
            {project.summary && (
              <p className="mt-6 max-w-2xl text-base sm:text-xl leading-relaxed text-[#f5f4f0]/80 font-normal">
                {project.summary}
              </p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <VantraButton href={`/showcase/${project.slug}`} variant="gold">
                Open Live Interactive Site
              </VantraButton>
              <VantraButton href="/contact" variant="light">
                Start a Project
              </VantraButton>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Vantra Section Brief (`section_brief`) */}
      <section
        data-screen-label="Philosophy"
        className="section_brief padding-global padding-section"
      >
        <div className="container-max">
          <div className="section_content is-brief">
            {/* 2-Column Header Grid */}
            <div className="grid grid-cols-1 items-start gap-8 border-b border-border pb-12 sm:pb-16 md:grid-cols-12">
              <div className="md:col-span-4">
                <h2 className="heading heading-style-h2">The brief.</h2>
              </div>
              <div className="space-y-4 md:col-span-8">
                <p className="text-lg sm:text-xl font-medium leading-relaxed text-foreground/90">
                  {caseDetails?.challenge ??
                    'The client had fragmented digital surfaces, inconsistent brand touchpoints, and a legacy platform that no longer supported their growth ambitions.'}
                </p>
                <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                  {caseDetails?.solution ??
                    'We partnered directly with their team to rebuild the product surface as one coherent system — tokens, components, and production templates their team owns entirely.'}
                </p>
              </div>
            </div>

            {/* Case Gallery: Asymmetric 3-Frame Grid */}
            <div className="case-gallery mt-12 sm:mt-16 space-y-4">
              {/* Frame 1: Ultrawide Full-Width Editorial Visual */}
              <div className="case-gallery_frame is-wide relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-[#0a0a0a]">
                <Image
                  src={galleryImages[0]}
                  alt={`${project.title} overview`}
                  fill
                  sizes="100vw"
                  className="image-cover object-cover"
                />
              </div>

              {/* Frame 2 & 3: 2-Column Row (Vertical Frame + Wide Frame) */}
              <div className="case-gallery_row grid grid-cols-1 gap-4 md:grid-cols-12">
                <div className="case-gallery_frame relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[#0a0a0a] md:col-span-4">
                  <Image
                    src={galleryImages[1]}
                    alt={`${project.title} detail`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="image-cover object-cover"
                  />
                </div>
                <div className="case-gallery_frame is-wide relative aspect-[16/10] overflow-hidden rounded-[20px] bg-[#0a0a0a] md:col-span-8">
                  <Image
                    src={galleryImages[2]}
                    alt={`${project.title} architecture`}
                    fill
                    sizes="(min-width: 768px) 67vw, 100vw"
                    className="image-cover object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vantra Section Outcome (`section_outcome` — "What it did in market.") */}
      <section data-screen-label="Outcome" className="section_outcome">
        {/* Full-bleed media banner with scrim & H1 title */}
        <div className="case-outcome_media relative m-2 flex min-h-[380px] sm:min-h-[460px] items-center justify-center overflow-hidden rounded-[20px] bg-[#0a0a0a] text-[#f5f4f0]">
          <Image
            src={galleryImages[0]}
            alt=""
            fill
            className="image-cover object-cover opacity-35"
          />
          <div className="media_scrim absolute inset-0 bg-[#0a0a0a]/70" />
          <div className="case-outcome_content relative z-10 px-6 text-center">
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;Commercial Impact&nbsp;&nbsp;&nbsp; )
            </span>
            <h2 className="heading heading-style-h1 is-center mt-3 text-balance font-semibold text-[#f5f4f0]">
              What it did in market.
            </h2>
          </div>
        </div>

        {/* Outcome body with results header & 4 outcome rows */}
        <div className="padding-global padding-section">
          <div className="container-max">
            <div className="grid grid-cols-1 items-start gap-8 border-b border-border pb-10 md:grid-cols-12">
              <div className="md:col-span-4">
                <h2 className="heading heading-style-h2">The results.</h2>
              </div>
              <div className="md:col-span-8">
                <p className="text-base sm:text-lg text-muted-foreground">
                  Measured post-launch in live production, with their internal team running the system independently.
                </p>
              </div>
            </div>

            <div className="case-outcome_body mt-8 divide-y divide-border">
              {outcomes.map((row) => (
                <div
                  key={row.title}
                  className="case-outcome_row grid grid-cols-1 items-baseline gap-4 py-8 sm:py-10 sm:grid-cols-12 sm:items-center"
                >
                  <h3 className="heading-style-h4 sm:col-span-3 font-semibold text-foreground">
                    {row.title}
                  </h3>
                  <p className="case-outcome_text sm:col-span-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {row.text}
                  </p>
                  <div className="case-outcome_metric sm:col-span-3 sm:text-right font-display text-4xl sm:text-5xl font-semibold tracking-tight text-primary">
                    {row.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Vantra Section Quote (`section_quote` — "In their words") */}
      <section data-screen-label="Quote" className="section_quote padding-global pb-24">
        <div className="container-max">
          <div className="case-quote_grid grid grid-cols-1 items-center gap-8 rounded-[24px] border border-border bg-card p-6 sm:p-12 lg:grid-cols-12">
            {/* Left Column: Vertical Editorial Visual */}
            <div className="case-quote_media relative aspect-[4/5] max-h-[460px] w-full overflow-hidden rounded-[18px] bg-[#0a0a0a] lg:col-span-5">
              <Image
                src={galleryImages[1]}
                alt={`${project.title} editorial visual`}
                fill
                className="image-cover object-cover"
              />
            </div>

            {/* Right Column: Quote Content */}
            <div className="case-quote_body flex flex-col justify-between space-y-8 lg:col-span-7 lg:pl-6">
              <div className="case-quote_head flex items-center justify-between border-b border-border/60 pb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="text-primary">In their words</span>
                <span>Verified Client Review</span>
              </div>

              <blockquote className="font-display text-2xl sm:text-3xl font-medium leading-[1.28] tracking-tight text-foreground">
                &ldquo;{quote.quote}&rdquo;
              </blockquote>

              <div className="case-quote_foot flex items-center gap-4 pt-2">
                <div
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-display text-sm font-semibold tracking-wider text-primary shadow-sm"
                >
                  {quote.author
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="case-quote_identity">
                  <div className="case-quote_name text-base font-semibold text-foreground">
                    {quote.author}
                  </div>
                  <div className="section_meta-text text-xs text-muted-foreground">
                    {quote.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. More Selected Work */}
      {moreWork.length > 0 && (
        <section className="padding-global padding-section border-t border-border">
          <div className="container-max">
            <div className="section_header">
              <h2 className="heading-style-h2">More selected work.</h2>
              <VantraButton href="/portfolio" variant="dark">
                All projects
              </VantraButton>
            </div>
            <PortfolioGrid projects={moreWork} showFilters={false} />
          </div>
        </section>
      )}

      {/* 6. Pre-Footer Full CTA Band */}
      <CtaBand className="mt-8" />
    </>
  )
}
