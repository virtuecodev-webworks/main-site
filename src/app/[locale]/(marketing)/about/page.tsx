import type { Metadata } from 'next'
import Image from 'next/image'
import { Check } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CtaBand } from '@/components/site/cta-band'
import { VantraButton } from '@/components/ui/vantra-button'
import { Reveal } from '@/components/motion/reveal'
import { PHOTOS } from '@/lib/photos'
import { STATS } from '@/lib/studio'
import { buildPageMetadata } from '@/lib/seo'
import { routing } from '@/i18n/routing'

const PRINCIPLES = ['senior', 'fast', 'clear', 'owned'] as const

const STICKY_TOPS = [
  'lg:top-[5.5rem]',
  'lg:top-[8.5rem]',
  'lg:top-[11.5rem]',
  'lg:top-[14.5rem]',
] as const

const STUDIO_PRACTICES = [
  {
    role: 'Design & Brand Direction',
    lead: 'Senior Product Design',
    focus: 'Clear layouts, strong typography, and mobile-first user journeys that turn visitors into customers.',
    image: '/work/meridian-hero.jpg',
  },
  {
    role: 'Web & Store Engineering',
    lead: 'Full-Stack Architecture',
    focus: 'Fast, secure websites and online stores built in Next.js, WordPress, or Wix Studio with 100% ownership.',
    image: '/work/aurum-hero.jpg',
  },
  {
    role: 'Launch & Client Success',
    lead: 'Direct Studio Delivery',
    focus: 'Fixed milestones, weekly live previews, and 30 days of included post-launch support for complete peace of mind.',
    image: '/work/finery-hero.jpg',
  },
] as const

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
  const tHomeStats = await getTranslations('Home.stats')
  const capabilities = (t.raw('capabilities.items') as string[]) ?? []

  return (
    <>
      {/* 1. Vantra Rounded About Hero (`section.section_about-hero`) */}
      <section className="section_about-hero relative m-2 flex min-h-[76vh] flex-col justify-between overflow-hidden rounded-[20px] bg-[#0a0a0a] p-5 text-[#f5f4f0] sm:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={PHOTOS.collaboration}
            alt={t('bandAlt')}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.25) 40%, rgba(10,10,10,0.92) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-between pt-14 sm:pt-2">
          <span className="label-mono text-primary">
            ( &nbsp;&nbsp;&nbsp;{t('eyebrow')}&nbsp;&nbsp;&nbsp; )
          </span>
          <span className="label-mono hidden text-[#f5f4f0]/65 sm:inline">
            ( &nbsp;&nbsp;&nbsp;Direct Senior Team · Fixed Pricing&nbsp;&nbsp;&nbsp; )
          </span>
        </div>

        <div className="relative z-10 mt-auto max-w-5xl pt-20">
          <h1 className="heading-style-h0 text-balance text-[#f5f4f0]">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-[48ch] text-base leading-relaxed text-[#f5f4f0]/75 sm:text-lg">
            {t('intro')}
          </p>
        </div>
      </section>

      {/* 2. Vantra 5:2:5 Philosophy Strip (`section.section_philosophy`) */}
      <section className="section_philosophy padding-global padding-section">
        <div className="container-max">
          <div className="grid grid-cols-1 gap-10 border-t border-border pt-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="heading-style-h2 text-balance">{t('story.title')}</h2>
              </Reveal>
            </div>

            <div className="lg:col-span-2">
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;Our Story&nbsp;&nbsp;&nbsp; )
              </span>
            </div>

            <div className="space-y-8 lg:col-span-5">
              <Reveal delay={0.08}>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {t('story.body')}
                </p>
              </Reveal>

              <Reveal delay={0.14}>
                <figure className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={PHOTOS.studio}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 560px"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="border-t border-border px-5 py-3.5 text-xs text-muted-foreground">
                    {t('bandCaption')}
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Vantra "By the Numbers" Snapshot Section (`section.section_snapshot`) */}
      <section className="section_snapshot padding-global py-8">
        <div className="container-max">
          <div className="profile_panel overflow-hidden rounded-[20px] bg-[#0a0a0a] p-7 text-[#f5f4f0] sm:p-14">
            <div className="grid grid-cols-1 gap-10 border-b border-[#f5f4f01f] pb-12 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;By the numbers&nbsp;&nbsp;&nbsp; )
                </span>
                <h2 className="heading-style-h2 mt-3 max-w-[16ch] text-[#f5f4f0]">
                  Built for speed, clarity, and complete ownership.
                </h2>
              </div>
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end lg:col-span-5 lg:justify-end">
                <div className="text-left lg:text-right">
                  <div className="font-display text-[clamp(4rem,8vw,7.5rem)] leading-[0.9] font-semibold tracking-[-0.04em] text-primary">
                    100%
                  </div>
                  <span className="label-mono-xs mt-2 block text-[#f5f4f0]/65">
                    On-Schedule Project Handover
                  </span>
                </div>
              </div>
            </div>

            <dl className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STATS.map((stat, idx) => (
                <div
                  key={stat.key}
                  className="flex flex-col justify-between border-t border-[#f5f4f01f] pt-6"
                >
                  <span className="label-mono-xs text-[#f5f4f0]/50">0{idx + 1}</span>
                  <dd className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] text-[#f5f4f0] sm:text-5xl">
                    {stat.value}
                  </dd>
                  <dt className="mt-2.5 text-sm text-[#f5f4f0]/70">
                    {tHomeStats(stat.key)}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 4. Vantra Sticky-Stacking Core Values (`section.section_values`) */}
      <section className="section_values padding-global padding-section border-t border-border">
        <div className="container-max">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:sticky lg:top-24 lg:col-span-5">
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;How We Work&nbsp;&nbsp;&nbsp; )
              </span>
              <h2 className="heading-style-h2 mt-3 text-balance">
                {t('principles.title')}
              </h2>
              <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
                Four simple rules that make working with us calm, predictable, and rewarding.
              </p>
              <div className="mt-6">
                <VantraButton href="/contact" variant="gold">
                  {t('cta.button')}
                </VantraButton>
              </div>
            </div>

            <div className="values_list flex flex-col gap-6 lg:col-span-7">
              {PRINCIPLES.map((key, index) => {
                const num = String(index + 1).padStart(3, '0')
                return (
                  <article
                    key={key}
                    className={`values_card lg:sticky ${STICKY_TOPS[index]} rounded-[20px] border border-border bg-card p-8 shadow-elevation-2 sm:p-10`}
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
                      <span className="label-mono text-primary">
                        ( &nbsp;&nbsp;&nbsp;&nbsp;{num}&nbsp;&nbsp;&nbsp;&nbsp; )
                      </span>
                      <span className="label-mono-xs text-muted-foreground">
                        Virtue Standard
                      </span>
                    </div>

                    <h3 className="heading-style-h3 mt-8 text-foreground">
                      {t(`principles.items.${key}.title`)}
                    </h3>
                    <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-muted-foreground">
                      {t(`principles.items.${key}.body`)}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Vantra 3-Column Studio Practice Leads (`section.section_team`) */}
      <section className="section_team padding-global padding-section border-t border-border">
        <div className="container-max">
          <div className="section_header">
            <h2 className="heading-style-h2">Three disciplines, one unified team.</h2>
            <div className="section_meta">
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;Direct Collaboration&nbsp;&nbsp;&nbsp; )
              </span>
              <span className="text-muted-foreground">No middlemen or handoffs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STUDIO_PRACTICES.map((item, idx) => (
              <article
                key={item.role}
                className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={item.image}
                      alt={item.role}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="label-mono-xs text-primary">
                      ( &nbsp;&nbsp;0{idx + 1}&nbsp;&nbsp; )
                    </span>
                    <span className="label-mono-xs text-muted-foreground">{item.lead}</span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-foreground">
                    {item.role}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {item.focus}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. What Every Website Includes (`section.section_benchmarks`) */}
      <section className="section_benchmarks padding-global padding-section border-t border-border">
        <div className="container-max">
          <div className="section_header">
            <h2 className="heading-style-h2">{t('capabilities.title')}</h2>
            <div className="section_meta">
              <span className="label-mono text-primary">
                ( &nbsp;&nbsp;&nbsp;Included as Standard&nbsp;&nbsp;&nbsp; )
              </span>
              <span className="text-muted-foreground">Every project, every time</span>
            </div>
          </div>

          <ul className="grid grid-cols-1 border-t border-border md:grid-cols-2">
            {capabilities.map((item, idx) => (
              <li
                key={item}
                className="flex items-start justify-between gap-4 border-b border-border py-6 pr-4"
              >
                <div className="flex items-start gap-4">
                  <span className="label-mono-xs mt-1 text-muted-foreground">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[15px] leading-relaxed font-medium text-foreground">
                    {item}
                  </span>
                </div>
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3" strokeWidth={2.5} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Vantra Pre-Footer Full-Screen CTA */}
      <CtaBand className="mt-8" />
    </>
  )
}
