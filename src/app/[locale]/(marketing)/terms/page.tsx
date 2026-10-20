import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { Reveal } from '@/components/motion/reveal'
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
    path: '/terms',
    namespace: 'Legal.terms',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const tLegal = await getTranslations('Legal')
  const t = await getTranslations('Legal.terms')

  const sections = (t.raw('sections') as LegalSection[]) ?? []

  return (
    <>
      <PageHero title={t('title')} subtitle={t('intro')} />

      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          {tLegal('updated')}
        </p>

        <div className="mt-10 border-t border-border">
          {sections.map((section, index) => (
            <Reveal key={section.heading} delay={Math.min(index * 0.05, 0.3)}>
              <section className="border-b border-border py-8">
                <h2 className="font-sans flex items-baseline gap-3 text-lg font-semibold">
                  <span
                    aria-hidden
                    className="font-mono text-[12px] font-medium text-gold-700 dark:text-gold-400"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.heading}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {section.body}
                </p>
              </section>
            </Reveal>
          ))}
        </div>

        <p className="py-8 text-[14px] leading-relaxed text-muted-foreground">
          {tLegal('contactNote')}
        </p>
      </article>
    </>
  )
}
