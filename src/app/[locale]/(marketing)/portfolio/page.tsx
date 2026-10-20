import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { PhotoBand } from '@/components/site/photo-band'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
import { ProjectFolders } from '@/components/site/project-folders'
import { CtaBand } from '@/components/site/cta-band'
import { getPublishedProjects } from '@/lib/supabase/queries'
import { PLACEHOLDER_PROJECTS, toProjectCard } from '@/lib/portfolio'
import { PHOTOS } from '@/lib/photos'
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
  const tPhotos = await getTranslations('Photos')

  const published = await getPublishedProjects()
  const projects = published.length ? published.map(toProjectCard) : PLACEHOLDER_PROJECTS

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <PhotoBand
        src={PHOTOS.workBand}
        alt={tPhotos('work.alt')}
        caption={tPhotos('work.caption')}
        className="mt-16 sm:mt-20"
        priority
      />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <PortfolioGrid projects={projects} headingLevel={2} />
      </div>

      <div className="border-y border-border bg-muted/45">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <ProjectFolders />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <CtaBand />
      </div>
    </>
  )
}
