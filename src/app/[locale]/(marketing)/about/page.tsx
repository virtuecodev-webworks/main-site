import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowRight, Check } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { PageHero } from '@/components/site/page-hero'
import { SectionHeading } from '@/components/site/section-heading'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { PHOTOS } from '@/lib/photos'
import { buildPageMetadata } from '@/lib/seo'
import { routing } from '@/i18n/routing'

/** Fixed display order for the four working principles in the message catalogue. */
const PRINCIPLES = ['senior', 'fast', 'clear', 'owned'] as const

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPageMetadata({
    locale,
    path: '/about',
    namespace: 'About',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('About')

  const capabilities = (t.raw('capabilities.items') as string[]) ?? []

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('intro')} />

      {/* Why we started — editorial two-column block. */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading title={t('story.title')} />
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {t('story.body')}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card shadow-elevation-2">
              <Image
                src={PHOTOS.studio}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Full-width photographic band with a short caption. */}
      <figure className="border-y border-border">
        <div className="relative aspect-[16/9] w-full bg-muted sm:aspect-[21/9]">
          <Image
            src={PHOTOS.collaboration}
            alt={t('bandAlt')}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mx-auto max-w-7xl px-5 py-6 text-[13px] leading-relaxed text-muted-foreground sm:px-8">
          {t('bandCaption')}
        </figcaption>
      </figure>

      {/* How we work — four numbered principle cards. */}
      <section className="border-b border-border bg-muted/45">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <SectionHeading eyebrow={t('eyebrow')} title={t('principles.title')} />

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {PRINCIPLES.map((key, index) => (
              <Reveal key={key} delay={index * 0.08}>
                <div className="surface h-full p-7 shadow-elevation-1">
                  <span className="font-sans grid size-11 place-items-center rounded-full border border-gold-500/40 bg-background text-[13px] font-bold text-gold-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-sans mt-6 text-lg font-semibold">
                    {t(`principles.items.${key}.title`)}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-muted-foreground">
                    {t(`principles.items.${key}.body`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Where we are strongest — two-column checklist. */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading title={t('capabilities.title')} />

        <ul className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {capabilities.map((item) => (
            <li key={item} className="flex items-start gap-3 border-t border-border pt-5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-gold-500/40 bg-gold-50 text-gold-700 dark:bg-gold-500/12 dark:text-gold-300">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-[14.5px] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing call to action. */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="surface p-8 shadow-elevation-2 sm:p-12">
            <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="font-sans text-2xl leading-tight font-semibold text-balance sm:text-3xl">
                  {t('cta.title')}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  {t('cta.body')}
                </p>
              </div>

              <Button asChild variant="gold" size="lg" className="shrink-0">
                <Link href="/contact">
                  {t('cta.button')}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
