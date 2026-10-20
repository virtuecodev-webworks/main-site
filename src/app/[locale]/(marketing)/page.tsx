import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Hero } from '@/components/site/hero'
import { MarketplaceCatalog } from '@/components/site/marketplace-catalog'
import { CapabilitiesBand } from '@/components/site/capabilities-band'
import { BentoGrid } from '@/components/site/bento-grid'
import { WebsiteAnatomy } from '@/components/site/website-anatomy'
import { AmbientBackground } from '@/components/brand/ambient-background'
import { SectionHeading } from '@/components/site/section-heading'
import { ServiceShowcase } from '@/components/site/service-showcase'
import { ProjectJourney } from '@/components/site/project-journey'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
import { Faq } from '@/components/site/faq'
import { CtaBand } from '@/components/site/cta-band'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { ZoomMedia } from '@/components/motion/zoom-media'
import { getFeaturedProjects } from '@/lib/supabase/queries'
import { PLACEHOLDER_PROJECTS, toProjectCard } from '@/lib/portfolio'
import { PHOTOS } from '@/lib/photos'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPageMetadata({ locale, path: '/' })
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Home')
  const tCommon = await getTranslations('Common')
  const tPhotos = await getTranslations('Photos')

  const featured = await getFeaturedProjects(3)
  const projects = featured.length
    ? featured.map(toProjectCard)
    : PLACEHOLDER_PROJECTS.filter((project) => project.featured).slice(0, 3)

  return (
    <>
      <Hero />

      <CapabilitiesBand />

      {/* Why Choose Us - Bento Grid with simple, clear benefit-driven language */}
      <section className="relative isolate mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <AmbientBackground size="lg" speed={140} align="left" opacity={0.5} />
        <SectionHeading
          eyebrow="Why Choose Virtue & Co."
          title="Websites Built For Real Growth, Speed, and Zero Headaches"
          subtitle="No confusing tech jargon. We build fast, reliable websites and web apps with fixed upfront pricing, guaranteed delivery timelines, and a private client dashboard to track every step."
        />
        <div className="mt-12">
          <BentoGrid />
        </div>
      </section>

      {/* Exploded Architecture: What You Actually Get Inside Every Build */}
      <WebsiteAnatomy />

      {/* Proof of Work — Live Shipped Projects */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={t('work.eyebrow')}
            title={t('work.title')}
            subtitle={t('work.subtitle')}
          />
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/portfolio">
              {tCommon('viewAll')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <PortfolioGrid projects={projects} className="mt-12" />
      </section>

      {/* How we work — the pinned horizontal timeline. */}
      <section className="border-y border-border bg-muted/45">
        <ProjectJourney />
      </section>

      {/* What we do — an interactive showcase rather than four static cards. */}
      <section className="relative isolate mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          subtitle={t('services.subtitle')}
        />
        <ServiceShowcase className="mt-12" />
        <Reveal className="mt-10">
          <Button asChild variant="outline" size="lg">
            <Link href="/services">
              {t('services.cta')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </section>

      {/* Copy set on a photograph that moves as you scroll. */}
      <section className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 sm:pt-24">
        <ZoomMedia
          src={PHOTOS.workBand}
          alt={tPhotos('work.alt')}
          eyebrow={t('band.eyebrow')}
          title={t('band.title')}
          body={t('band.body')}
        >
          <Button asChild variant="gold" size="lg">
            <Link href="/contact">
              {t('band.cta')}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </ZoomMedia>
      </section>

      {/* Standardized Packages, AI Search & Transparent Pricing */}
      <MarketplaceCatalog />

      <section className="border-t border-border bg-muted/45 py-20 sm:py-24">
        <Faq />
      </section>

      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <CtaBand />
      </div>
    </>
  )
}
