import type { Metadata } from 'next'
import Image from 'next/image'
import { CalendarClock, Clock, Mail, MessageCircle } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { ContactForm } from '@/components/site/contact-form'
import { Faq } from '@/components/site/faq'
import { Reveal } from '@/components/motion/reveal'
import { Button } from '@/components/ui/button'
import { AGENCY, WHATSAPP_DIGITS } from '@/lib/constants'
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
    path: '/contact',
    namespace: 'Contact',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Contact')
  const tBooking = await getTranslations('Booking')
  const tPhotos = await getTranslations('Photos')

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
        <Reveal>
          <aside className="flex flex-col gap-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elevation-1">
              <Image
                src={PHOTOS.contact}
                alt={tPhotos('contact.alt')}
                width={900}
                height={640}
                sizes="(max-width: 1024px) 100vw, 420px"
                className="h-[190px] w-full object-cover sm:h-[230px]"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">{t('directEmail')}</h2>
              <a
                href={`mailto:${AGENCY.email}`}
                className="mt-4 inline-flex min-h-6 items-center gap-3 text-[15px] font-medium text-gold-700 underline-offset-4 hover:underline dark:text-gold-400"
              >
                <Mail className="size-4" aria-hidden />
                {AGENCY.email}
              </a>
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-8 text-sm">
              <span className="flex items-center gap-3 text-muted-foreground">
                <Clock className="size-4 shrink-0 text-gold-600" aria-hidden />
                {t('responseNote')}
              </span>
            </div>

            <div className="border-t border-border pt-8">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5 shrink-0" aria-hidden>
                  <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-emerald-500" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gold-700 uppercase dark:text-gold-400">
                  Global Availability
                </h3>
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Available Anytime
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                We work flexibly with clients and founders across all global timezones. Message us anytime, 24/7.
              </p>
            </div>
          </aside>
        </Reveal>

        <Reveal delay={0.08}>
          <ContactForm />
        </Reveal>
      </div>

      {/* Booking + what happens next */}
      <section id="book" className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-50 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-gold-700 uppercase dark:bg-gold-500/12 dark:text-gold-300">
                <CalendarClock className="size-3.5" aria-hidden />
                Always Available
              </span>
              <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{t('bookingTitle')}</h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                {tBooking('body')}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <a href={`mailto:${AGENCY.email}?subject=Intro%20call`}>{tBooking('cta')}</a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={`https://wa.me/${WHATSAPP_DIGITS}`} target="_blank" rel="noreferrer noopener">
                    <MessageCircle className="size-4" aria-hidden />
                    {tBooking('noteCta')}
                  </a>
                </Button>
              </div>

              <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-muted-foreground">
                {tBooking('note')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="surface flex h-full flex-col gap-6 p-6 sm:p-8">
              <h3 className="text-lg font-semibold">{t('next.title')}</h3>

              <ol className="flex flex-col gap-6">
                {(['step1', 'step2', 'step3'] as const).map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span
                      aria-hidden
                      className="font-sans grid size-9 shrink-0 place-items-center rounded-full border border-gold-500/40 text-[13px] font-bold text-gold-700 dark:text-gold-300"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex flex-col gap-1.5">
                      <span className="text-[15px] font-semibold">{t(`next.${step}Title`)}</span>
                      <span className="text-[13.5px] leading-relaxed text-muted-foreground">
                        {t(`next.${step}Body`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <p className="mt-auto border-t border-border pt-5 text-[12.5px] text-muted-foreground">
                {t('responseNote')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="py-20 sm:py-24">
        <div className="mb-12">
          <p className="font-sans text-center text-[11px] font-semibold tracking-[0.18em] text-gold-700 uppercase dark:text-gold-400">
            {t('beforeYouWrite')}
          </p>
        </div>
        <Faq withHeading={false} />
      </div>
    </>
  )
}
