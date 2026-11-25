import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
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
          <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong className="font-semibold text-foreground">Transparency note:</strong>{' '}
              Entries labelled <strong className="font-semibold text-primary">Interactive Demo</strong> are studio-built concept applications you can test live in your browser to evaluate our UI and engineering craft. Published client engagements link directly to their live production domains.
            </p>
          </div>
          <PortfolioGrid projects={projects} headingLevel={2} floatingFilter />
        </div>
      </section>

      <section className="padding-global padding-section border-t border-border">
        <div className="container-max">
          <ProjectFolders />
        </div>
      </section>

      <CtaBand className="mt-8" />
    </>
  )
}
