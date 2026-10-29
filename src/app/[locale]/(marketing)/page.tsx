import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Hero } from '@/components/site/hero'
import { QuoteMarquee } from '@/components/site/quote-marquee'
import { LiveStudioTracker } from '@/components/site/capabilities-band'
import { ServiceShowcase } from '@/components/site/service-showcase'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
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

  const featured = await getFeaturedProjects(4)

  // Show only 2 flagship projects on the homepage to avoid clutter
  const projects = mergeWithShowcaseProjects(featured.map(toProjectCard)).slice(0, 2)

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

          <PortfolioGrid projects={projects} showFilters={false} />

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
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-gold-500 active:scale-95 shrink-0"
            >
              <span>Explore All Projects (6+)</span>
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Live Build Tracker */}
      <LiveStudioTracker />

      {/* 5. Services Showcase */}
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

      {/* 6. FAQ */}
      <Faq className="padding-section" />

      {/* 7. Pre-Footer Full-Screen CTA */}
      <CtaBand className="mt-8" />
    </>
  )
}
