import type { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ServiceShowcase } from '@/components/site/service-showcase'
import { MarketplaceCatalog } from '@/components/site/marketplace-catalog'
import { ProjectEstimator } from '@/components/site/project-estimator'
import { Faq } from '@/components/site/faq'
import { CtaBand } from '@/components/site/cta-band'
import { VantraButton } from '@/components/ui/vantra-button'
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
  const tPhotos = await getTranslations('Photos')

  return (
    <>
      {/* 1. Vantra Rounded Services Hero (`section.section_services-hero`) */}
      <section className="section_services-hero relative m-2 flex min-h-[74vh] flex-col justify-between overflow-hidden rounded-[20px] bg-[#0a0a0a] p-5 text-[#f5f4f0] sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={PHOTOS.services}
            alt={tPhotos('services.alt')}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.28) 42%, rgba(10,10,10,0.94) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-between pt-14 sm:pt-2">
          <span className="label-mono text-primary">
            ( &nbsp;&nbsp;&nbsp;{t('eyebrow')}&nbsp;&nbsp;&nbsp; )
          </span>
          <span className="label-mono hidden text-[#f5f4f0]/65 sm:inline">
            ( &nbsp;&nbsp;&nbsp;Fixed Prices · Guaranteed Timelines&nbsp;&nbsp;&nbsp; )
          </span>
        </div>

        <div className="relative z-10 mt-auto pt-20">
          <h1 className="heading-style-h0 max-w-[14ch] text-balance text-[#f5f4f0]">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-[#f5f4f0]/75 sm:text-lg">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <VantraButton href="#services-catalog" variant="gold">
              See packages &amp; pricing
            </VantraButton>
            <VantraButton href="#estimator" variant="light">
              Calculate project cost
            </VantraButton>
          </div>
        </div>
      </section>

      {/* 2. Vantra Four Ways We Can Help Horizontal Slider */}
      <section className="padding-global padding-section">
        <div className="container-max">
          <div className="section_header">
            <h2 className="heading-style-h2">Four ways we can help.</h2>
            <div className="section_meta">
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;What We Build&nbsp;&nbsp;&nbsp; )
              </span>
              <span className="text-muted-foreground">Designed and built end-to-end</span>
            </div>
          </div>

          <ServiceShowcase />
        </div>
      </section>

      {/* 3. Fixed-Price Package Catalog (`#services-catalog`) */}
      <div className="border-t border-border">
        <MarketplaceCatalog />
      </div>

      {/* 4. Interactive Project Cost Estimator (`#estimator`) */}
      <section
        id="estimator"
        className="padding-global padding-section scroll-mt-20 border-t border-border"
      >
        <div className="container-max">
          <div className="section_header">
            <div>
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;Instant Quote&nbsp;&nbsp;&nbsp; )
              </span>
              <h2 className="heading-style-h2 mt-3">
                Estimate your project budget.
              </h2>
            </div>
            <div className="section_meta max-w-sm">
              <span className="label-mono text-foreground">Simple Scope Calculator</span>
              <span className="text-muted-foreground">
                Pick what you need and see an instant, transparent price estimate before you even reach out.
              </span>
            </div>
          </div>

          <ProjectEstimator />
        </div>
      </section>

      {/* 5. FAQ Section */}
      <Faq className="padding-section border-t border-border" />

      {/* 6. Pre-Footer Full-Screen CTA */}
      <CtaBand className="mt-8" />
    </>
  )
}
