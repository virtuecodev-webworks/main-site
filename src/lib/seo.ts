import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { routing, localeMeta, type AppLocale } from '@/i18n/routing'
import { absoluteUrl } from '@/lib/utils'
import { AGENCY } from '@/lib/constants'

interface PageMetadataOptions {
  locale: string
  /** Path WITHOUT the locale prefix, e.g. `/services`. */
  path: string
  /** Key inside the `Metadata` namespace for the page title. */
  titleKey?: string
  /** Key inside the `Metadata` namespace for the description. */
  descriptionKey?: string
  namespace?: string
  type?: 'website' | 'article'
}

/**
 * Builds canonical + hreflang + OpenGraph metadata for a localised page.
 * Centralised so every route stays consistent as locales are added.
 */
export async function buildPageMetadata({
  locale,
  path,
  titleKey = 'title',
  descriptionKey = 'description',
  namespace = 'Metadata',
  type = 'website',
}: PageMetadataOptions): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace })
  const tMeta = await getTranslations({ locale, namespace: 'Metadata' })

  const title = t(titleKey)
  const description = t(descriptionKey)
  const suffix = path === '/' ? '' : path

  /**
   * The root title already names the brand, and the layout's title template
   * appends "· Virtue & Co. Webworks" to everything else. Marking the home page
   * absolute is what stops it reading "Virtue & Co. … · Virtue & Co. …".
   */
  const isRoot = path === '/'
  const socialTitle = isRoot ? title : `${title} · ${AGENCY.name}`

  const languages = routing.locales.reduce<Record<string, string>>((acc, code) => {
    acc[code] = absoluteUrl(`/${code}${suffix}`)
    return acc
  }, {})
  languages['x-default'] = absoluteUrl(`/${routing.defaultLocale}${suffix}`)

  return {
    title: isRoot ? { absolute: title } : title,
    description,
    keywords: tMeta('keywords').split(',').map((keyword) => keyword.trim()),
    alternates: {
      canonical: absoluteUrl(`/${locale}${suffix}`),
      languages,
    },
    openGraph: {
      type,
      title: socialTitle,
      description,
      url: absoluteUrl(`/${locale}${suffix}`),
      siteName: AGENCY.name,
      locale: localeMeta[locale as AppLocale]?.tag ?? 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
  }
}

/** Organization + WebSite JSON-LD, injected once in the locale layout. */
export function organizationJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': absoluteUrl('/#organization'),
        name: AGENCY.name,
        alternateName: AGENCY.shortName,
        description:
          'A web studio building fast, good-looking websites and online stores - custom builds, WordPress, Wix and payment integrations.',
        email: AGENCY.email,
        url: absoluteUrl(`/${locale}`),
        foundingDate: String(AGENCY.founded),
        areaServed: 'Worldwide',
        knowsAbout: [
          'Next.js',
          'React',
          'TypeScript',
          'WordPress',
          'Wix Studio',
          'E-commerce',
          'Stripe',
          'Supabase',
        ],
        priceRange: '$$',
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: AGENCY.name,
        url: absoluteUrl(`/${locale}`),
        inLanguage: locale,
        publisher: { '@id': absoluteUrl('/#organization') },
      },
    ],
  }
}
