import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Hero } from '@/components/site/hero'
import { QuoteMarquee } from '@/components/site/quote-marquee'
import { ServiceShowcase } from '@/components/site/service-showcase'
import { MarketplaceCatalog } from '@/components/site/marketplace-catalog'
import { PortfolioDeckShowcase } from '@/components/site/portfolio-deck-showcase'
import { SocialProofStrip } from '@/components/site/social-proof-strip'
import { ProjectEstimator } from '@/components/site/project-estimator'
import { Faq } from '@/components/site/faq'
import { CtaBand } from '@/components/site/cta-band'
import { VantraButton } from '@/components/ui/vantra-button'
import { getFeaturedProjects } from '@/lib/supabase/queries'
import { mergeWithShowcaseProjects, toProjectCard } from '@/lib/portfolio'
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

  const featured = await getFeaturedProjects(8)

  // Present all flagship & featured projects in the interactive 3D Tumble Deck
  const projects = mergeWithShowcaseProjects(featured.map(toProjectCard))

  return (
    <>
      {/* 1. Vantra Full-Bleed Rounded Hero */}
      <Hero />

      {/* 2. Vantra Statement & Marquee */}
      <QuoteMarquee />

      {/* 3. Selected Work — Clean 2-Project Showcase */}
      <section id="work" className="section_work padding-global padding-section">
        <div className="container-max">
          <div className="section_header">
            <div>
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;{t('work.eyebrow')}&nbsp;&nbsp;&nbsp; )
              </span>
              <h2 className="heading-style-h2 mt-2">{t('work.title')}</h2>
            </div>
            <div className="flex items-center gap-6">
              <span className="section_meta hidden text-sm text-muted-foreground sm:inline">
                {t('work.subtitle')}
              </span>
              <VantraButton href="/portfolio" variant="dark">
                {tCommon('viewAll')}
              </VantraButton>
            </div>
          </div>

          <PortfolioDeckShowcase projects={projects} />

          {/* Explicit callout to see all other projects */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <h3 className="font-display text-lg font-bold text-foreground">
                Looking for more production builds?
              </h3>
              <p className="text-sm text-muted-foreground">
                Explore our full catalog of web applications, luxury stores, and digital platforms.
              </p>
            </div>
            <VantraButton href="/portfolio" variant="dark" hoverLabel="6+ live builds" className="shrink-0">
              Explore All Projects
            </VantraButton>
          </div>
        </div>
      </section>

      {/* 4. Verified Client Outcomes & Social Proof */}
      <SocialProofStrip />

      {/* 7. Services Showcase */}
      <section id="services" className="section_services padding-global padding-section">
        <div className="container-max">
          <div className="section_header">
            <h2 className="heading-style-h2">{t('services.title')}</h2>
            <div className="flex items-center gap-6">
              <div className="section_meta hidden sm:flex">
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;{t('services.eyebrow')}&nbsp;&nbsp;&nbsp; )
                </span>
                <span className="text-muted-foreground">{t('services.subtitle')}</span>
              </div>
              <VantraButton href="/services#services-catalog" variant="dark">
                {t('services.cta')}
              </VantraButton>
            </div>
          </div>

          <ServiceShowcase />
        </div>
      </section>

      {/* 8. Transparent Fixed-Price Packages */}
      <div className="border-t border-border">
        <MarketplaceCatalog />
      </div>

      {/* 9. Live Interactive Price & Timeline Estimator */}
      <section className="padding-global padding-section border-t border-border">
        <div className="container-max">
          <ProjectEstimator />
        </div>
      </section>

      {/* 6. FAQ */}
      <Faq className="padding-section" />

      {/* 7. Pre-Footer Full-Screen CTA */}
      <CtaBand className="mt-8" />
    </>
  )
}
