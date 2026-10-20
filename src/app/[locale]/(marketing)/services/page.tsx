import type { Metadata } from 'next'
import { ArrowRight, Check } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { PageHero } from '@/components/site/page-hero'
import { PhotoBand } from '@/components/site/photo-band'
import { StartingPrice } from '@/components/site/starting-price'
import { ProjectEstimator } from '@/components/site/project-estimator'
import { CtaBand } from '@/components/site/cta-band'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/motion/reveal'
import { SERVICES } from '@/lib/studio'
import { PHOTOS } from '@/lib/photos'
import { buildPageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPageMetadata({
    locale,
    path: '/services',
    namespace: 'Services',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Services')
  const tCommon = await getTranslations('Common')
  const tPhotos = await getTranslations('Photos')

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <PhotoBand
        src={PHOTOS.services}
        alt={tPhotos('services.alt')}
        caption={tPhotos('services.caption')}
        className="mt-16 sm:mt-20"
        priority
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-20 px-5 py-20 sm:px-8 sm:py-24">
        {SERVICES.map((service, index) => {
          const Icon = service.icon
          const features = (t.raw(`items.${service.key}.features`) as string[]) ?? []
          const flipped = index % 2 === 1

          return (
            <section
              key={service.key}
              id={service.key}
              className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal className={cn(flipped && 'lg:order-2')}>
                <div className="flex flex-col items-start">
                  <span
                    className={cn(
                      'grid size-14 place-items-center rounded-2xl ring-1 ring-inset ring-black/[0.04] dark:ring-white/10',
                      service.accent,
                    )}
                  >
                    <Icon className="size-6" strokeWidth={1.7} />
                  </span>

                  <span className="mt-6 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                    {String(index + 1).padStart(2, '0')} - {t('eyebrow')}
                  </span>

                  <h2 className="mt-3 text-2xl leading-tight font-semibold sm:text-3xl">
                    {t(`items.${service.key}.title`)}
                  </h2>

                  <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                    {t(`items.${service.key}.description`)}
                  </p>

                  <ul className="mt-7 flex flex-wrap gap-1.5">
                    {service.stack.map((tech) => (
                      <li key={tech}>
                        <Badge variant="outline">{tech}</Badge>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Button asChild variant="gold" size="lg">
                      {/* "Learn more" alone is not descriptive — for a search
                          engine, and for anyone hearing a list of four identical
                          links. The service name is appended as visually hidden
                          text so the phrase that is actually read out and indexed
                          is "Learn more: Custom Websites", while the button stays
                          short. The visible words remain a prefix of the
                          accessible name, which keeps WCAG 2.5.3 satisfied. */}
                      <Link href="/contact">
                        {tCommon('learnMore')}
                        <span className="sr-only">: {t(`items.${service.key}.title`)}</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1} className={cn(flipped && 'lg:order-1')}>
                <div className="surface p-7 shadow-elevation-1 sm:p-8">
                  <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gold-700 uppercase dark:text-gold-400">
                    {t('deliverables')}
                  </h3>
                  <ul className="mt-6 space-y-4">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-gold-500/14 text-gold-700 dark:text-gold-300">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        <span className="text-[14px] leading-relaxed text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </section>
          )
        })}
      </div>

      {/* Interactive Project Cost Estimator */}
      <section className="border-t border-border bg-muted/20 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-14 text-center">
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              Interactive Scoping
            </span>
            <h2 className="mt-2 font-sans text-3xl font-bold sm:text-4xl text-foreground">
              Calculate Your Project Investment
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-sm text-muted-foreground">
              Transparent, scope-anchored estimates tailored to your stack, timeline, and capabilities.
            </p>
          </div>
          <ProjectEstimator />
        </div>
      </section>

      <section className="border-t border-border bg-muted/45">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <StartingPrice />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <CtaBand />
      </div>
    </>
  )
}
