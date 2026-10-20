import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { PageHero } from '@/components/site/page-hero'
import { PaymentForm } from '@/components/site/payment-form'
import { buildPageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildPageMetadata({
    locale,
    path: '/payment',
    namespace: 'Payment',
    titleKey: 'metaTitle',
    descriptionKey: 'metaDescription',
  })
}

export default async function PaymentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Payment')

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <PaymentForm />
      </div>
    </>
  )
}
