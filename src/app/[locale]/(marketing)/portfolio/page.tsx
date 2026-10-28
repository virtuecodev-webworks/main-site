import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
import { StudioShowreelBand } from '@/components/site/studio-showreel-band'
import { ProjectFolders } from '@/components/site/project-folders'
import { CtaBand } from '@/components/site/cta-band'
import { getPublishedProjects } from '@/lib/supabase/queries'
import { mergeWithShowcaseProjects, toProjectCard } from '@/lib/portfolio'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPageMetadata({
    locale,
    path: '/portfolio',
    namespace: 'Portfolio',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Portfolio')

  const published = await getPublishedProjects()
  const projects = mergeWithShowcaseProjects(published.map(toProjectCard))

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        subtitle={t('subtitle')}
        align="center"
      />

      <section className="padding-global pb-20 sm:pb-28">
        <div className="container-max">
          <PortfolioGrid projects={projects} headingLevel={2} floatingFilter />
        </div>
      </section>

      {/* Cinematic Studio Showreel Section */}
      <StudioShowreelBand
        className="border-t border-border"
        eyebrow="Production Reel · 30 Seconds"
        title="Experience our client builds in motion."
        subtitle="See how fluid animations, fast state management, and bespoke typography deliver real commercial traction."
      />

      <section className="padding-global padding-section border-t border-border">
        <div className="container-max">
          <ProjectFolders />
        </div>
      </section>

      <CtaBand className="mt-8" />
    </>
  )
}
