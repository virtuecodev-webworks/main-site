import * as React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowUpRight, Mail, Phone, Video } from 'lucide-react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { ContactForm } from '@/components/site/contact-form'
import { Faq } from '@/components/site/faq'
import { CtaBand } from '@/components/site/cta-band'
import { VisitorAvailability } from '@/components/site/visitor-availability'
import { VantraButton } from '@/components/ui/vantra-button'
import { AGENCY, GOOGLE_MEET_MAILTO } from '@/lib/constants'
import { PHOTOS } from '@/lib/photos'
import { OFFICE_HOURS } from '@/lib/studio'
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
    <div className="flex flex-col">
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      {/* 1. Vantra 2-Column Direct Contact Cards (Top on Desktop, Follows Form on Mobile) */}
      <section className="order-2 lg:order-1 padding-global pt-4 pb-12 lg:pt-0 lg:pb-12">
        <div className="container-max">
          <div className="direct_grid grid grid-cols-1 gap-2 md:grid-cols-2">
            {/* Direct Email Card */}
            <a
              href={`mailto:${AGENCY.email}`}
              className="direct_card group flex flex-col justify-between rounded-[20px] border border-border bg-card p-7 transition-colors hover:border-primary/60 sm:p-9"
            >
              <div className="flex items-center justify-between">
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;{t('directEmail')}&nbsp;&nbsp;&nbsp; )
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-[#0a0a0a]">
                  <Mail className="size-4" />
                </span>
              </div>

              <div className="mt-12">
                <div className="font-display text-xl font-semibold tracking-[-0.03em] text-foreground transition-colors group-hover:text-primary sm:text-3xl break-all">
                  {AGENCY.email}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t('responseNote')}</p>
              </div>
            </a>

            {/* Direct Phone & Video Discovery Card */}
            <div className="direct_card flex flex-col justify-between rounded-[20px] bg-[#0a0a0a] p-7 text-[#f5f4f0] sm:p-9">
              <div className="flex items-center justify-between">
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;Direct Line &amp; Discovery&nbsp;&nbsp;&nbsp; )
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-[#f5f4f024] bg-white/5 text-primary">
                  <Phone className="size-4" />
                </span>
              </div>

              <div className="mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <a
                    href={`tel:${AGENCY.phone}`}
                    className="font-display text-2xl font-semibold tracking-[-0.03em] text-[#f5f4f0] transition-colors hover:text-primary sm:text-3xl"
                  >
                    {AGENCY.phone}
                  </a>
                  <div className="mt-2.5">
                    <VisitorAvailability variant="pill" />
                  </div>
                </div>

                <a
                  href={GOOGLE_MEET_MAILTO}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90 shrink-0"
                >
                  <Video className="size-3.5" />
                  <span>Google Meet</span>
                  <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Vantra Enquiry Section (Form Comes First on Mobile) */}
      <section className="order-1 lg:order-2 padding-global pt-6 pb-12 lg:pt-0 lg:padding-section">
        <div className="container-max">
          <div className="enquiry_wrapper grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            {/* Left 5 Columns on Desktop: Visual, Hours & What Happens Next (Order-2 on Mobile) */}
            <aside className="order-2 lg:order-1 flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-5">
              <div className="overflow-hidden rounded-[20px] border border-border bg-card">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={PHOTOS.contact}
                    alt={tPhotos('contact.alt')}
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="label-mono-xs text-primary">Direct Operations</span>
                  </div>
                  <h2 className="heading-style-h4 mt-2 text-foreground">
                    {t('bookingTitle')}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {tBooking('body')}
                  </p>

                  <div className="mt-4">
                    <VisitorAvailability variant="card" />
                  </div>

                  <dl className="mt-4 divide-y divide-border border-t border-border text-xs">
                    {OFFICE_HOURS.map((row) => (
                      <div key={row.key} className="flex items-center justify-between py-2.5">
                        <dt className="text-muted-foreground capitalize">{row.key}</dt>
                        <dd className="font-mono text-foreground">{row.time} Local Desk</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* 3-Step Process Box */}
              <div className="rounded-[20px] border border-border bg-card p-6 sm:p-7">
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;{t('next.title')}&nbsp;&nbsp;&nbsp; )
                </span>
                <ol className="mt-6 flex flex-col gap-5">
                  {(['step1', 'step2', 'step3'] as const).map((step, index) => (
                    <li key={step} className="flex gap-4 border-t border-border pt-4 first:border-t-0 first:pt-0">
                      <span className="label-mono-xs mt-1 text-primary">
                        0{index + 1}
                      </span>
                      <div>
                        <div className="font-display text-sm font-semibold text-foreground">
                          {t(`next.${step}Title`)}
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {t(`next.${step}Body`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            {/* Right 7 Columns on Desktop: Vantra Contact Form (Order-1 on Mobile: Displays First) */}
            <div className="order-1 lg:order-2 lg:col-span-7">
              <React.Suspense fallback={<div className="h-[640px] rounded-[20px] border border-border bg-card animate-pulse" />}>
                <ContactForm />
              </React.Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FAQ & Pre-Footer CTA */}
      <div className="order-3">
        <Faq className="padding-section border-t border-border" />
        <CtaBand className="mt-8" />
      </div>
    </div>
  )
}
