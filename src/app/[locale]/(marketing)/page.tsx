import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Hero } from '@/components/site/hero'
import { CapabilitiesBand } from '@/components/site/capabilities-band'
import { SectionHeading } from '@/components/site/section-heading'
import { ServiceShowcase } from '@/components/site/service-showcase'
import { PortfolioGrid } from '@/components/site/portfolio-grid'
import { Faq } from '@/components/site/faq'
import { CtaBand } from '@/components/site/cta-band'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { getFeaturedProjects } from '@/lib/supabase/queries'
import { PLACEHOLDER_PROJECTS, toProjectCard } from '@/lib/portfolio'
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

  const featured = await getFeaturedProjects(3)
  const projects = featured.length
    ? featured.map(toProjectCard)
    : PLACEHOLDER_PROJECTS.filter((project) => project.featured).slice(0, 3)

  return (
    <>
      <Hero />

      <CapabilitiesBand />

      {/* Services Showcase */}
      <section className="relative isolate mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          subtitle={t('services.subtitle')}
        />
        <ServiceShowcase className="mt-12" />
        <Reveal className="mt-10">
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/services">
              {t('services.cta')}
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </Reveal>
      </section>

      {/* Proof of Work — Featured Projects */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 border-t border-border">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={t('work.eyebrow')}
            title={t('work.title')}
            subtitle={t('work.subtitle')}
          />
          <Button asChild variant="ghost" size="sm" className="shrink-0">
            <Link href="/portfolio">
              {tCommon('viewAll')}
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
        <PortfolioGrid projects={projects} className="mt-12" />
      </section>

      {/* Frequently Asked Questions */}
      <section className="border-t border-border bg-muted/40 py-20 sm:py-24">
        <Faq />
      </section>

      {/* Final Call to Action */}
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <CtaBand />
      </div>
    </>
  )
}
