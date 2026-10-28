import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Hero } from '@/components/site/hero'
import { QuoteMarquee } from '@/components/site/quote-marquee'
import {
  CultureAndTestimonials,
  LiveStudioTracker,
} from '@/components/site/capabilities-band'
import { ServiceShowcase } from '@/components/site/service-showcase'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
import { Faq } from '@/components/site/faq'
import { JournalSection } from '@/components/site/journal-section'
import { CtaBand } from '@/components/site/cta-band'
import { VantraButton } from '@/components/ui/vantra-button'
import { getFeaturedProjects } from '@/lib/supabase/queries'
import { mergeWithShowcaseProjects, toProjectCard } from '@/lib/portfolio'
import { getPublishedPosts, toPostCard } from '@/lib/content'
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

  const [featured, rawPosts] = await Promise.all([
    getFeaturedProjects(4),
    getPublishedPosts(),
  ])

  const projects = mergeWithShowcaseProjects(featured.map(toProjectCard)).slice(0, 4)

  const posts = rawPosts.map(toPostCard)

  return (
    <>
      {/* 1. Vantra Full-Bleed Rounded Hero (`section.section_hero`) */}
      <Hero />

      {/* 2. Vantra Statement & Marquee (`section.section_statement`) */}
      <QuoteMarquee />

      {/* 3. Vantra Selected Work 2-Column Square Grid (`section#work.section_work`) */}
      <section id="work" className="section_work padding-global padding-section">
        <div className="container-max">
          <div className="section_header">
            <h2 className="heading-style-h2">{t('work.title')}</h2>
            <div className="flex items-center gap-6">
              <div className="section_meta hidden sm:flex">
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;{t('work.eyebrow')}&nbsp;&nbsp;&nbsp; )
                </span>
                <span className="text-muted-foreground">{t('work.subtitle')}</span>
              </div>
              <VantraButton href="/portfolio" variant="dark">
                {tCommon('viewAll')}
              </VantraButton>
            </div>
          </div>

          <PortfolioGrid projects={projects} showFilters={false} />
        </div>
      </section>

      {/* 4. Vantra "In the Studio Right Now" Live Build Tracker (`section#live.section_live`) */}
      <LiveStudioTracker />

      {/* 5. Vantra Services Horizontal Slider (`section#services.section_services`) */}
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

      {/* 6 & 7. Vantra Culture Reel (`section#culture`) & Testimonials Slider (`section#testimonials`) */}
      <CultureAndTestimonials />

      {/* 8. Vantra 2-Column Sticky FAQ (`section#faq.section_faq`) */}
      <Faq className="padding-section" />

      {/* 9. Vantra Journal Section (`section#journal.section_more-journal`) */}
      <JournalSection posts={posts} />

      {/* 10. Vantra Pre-Footer Full-Screen CTA (`section.section_careers`) */}
      <CtaBand className="mt-8" />
    </>
  )
}
