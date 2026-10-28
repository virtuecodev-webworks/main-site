import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { Reveal } from '@/components/motion/reveal'
import { VantraButton } from '@/components/ui/vantra-button'
import { buildPageMetadata } from '@/lib/seo'
import { routing } from '@/i18n/routing'

interface LegalSection {
  heading: string
  body: string
}

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
    path: '/privacy',
    namespace: 'Legal.privacy',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const tLegal = await getTranslations('Legal')
  const t = await getTranslations('Legal.privacy')

  const sections = (t.raw('sections') as LegalSection[]) ?? []

  return (
    <>
      <PageHero eyebrow="Legal" title={t('title')} subtitle={t('intro')} />

      <section className="padding-global padding-section">
        <div className="container-max">
          <div className="grid grid-cols-1 gap-12 border-t border-border pt-12 lg:grid-cols-12 lg:items-start">
            {/* Left Vantra Sticky Rail */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
              <div>
                <span className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;Privacy Standard&nbsp;&nbsp;&nbsp; )
                </span>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  {tLegal('updated')}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-sm font-semibold text-foreground">
                  Plain-English Summary
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  We only collect the information you share with us to reply to your project enquiry or deliver your website. We never sell your data.
                </p>
                <div className="mt-5">
                  <VantraButton href="/contact" variant="dark" className="w-full justify-between">
                    Questions? Contact us
                  </VantraButton>
                </div>
              </div>
            </aside>

            {/* Right Clause List */}
            <article className="lg:col-span-8">
              <div className="divide-y divide-border rounded-[20px] border border-border bg-card px-6 sm:px-10">
                {sections.map((section, index) => (
                  <Reveal key={section.heading} delay={Math.min(index * 0.04, 0.24)}>
                    <section className="py-8 sm:py-10">
                      <div className="flex items-baseline gap-4">
                        <span className="label-mono-xs text-primary">
                          ( &nbsp;{String(index + 1).padStart(2, '0')}&nbsp; )
                        </span>
                        <h2 className="heading-style-h4 text-foreground">
                          {section.heading}
                        </h2>
                      </div>
                      <p className="mt-3.5 text-[15px] leading-relaxed text-muted-foreground">
                        {section.body}
                      </p>
                    </section>
                  </Reveal>
                ))}
              </div>

              <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                {tLegal('contactNote')}
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
