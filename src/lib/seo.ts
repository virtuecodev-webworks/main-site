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
 * Builds canonical + hreflang + OpenGraph + Verification metadata for a localised page.
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

  const isRoot = path === '/'
  const socialTitle = isRoot ? title : `${title} · ${AGENCY.name}`

  const languages = routing.locales.reduce<Record<string, string>>((acc, code) => {
    acc[code] = absoluteUrl(`/${code}${suffix}`)
    return acc
  }, {})
  languages['x-default'] = absoluteUrl(`/${routing.defaultLocale}${suffix}`)

  const googleVerification =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
    process.env.GOOGLE_SITE_VERIFICATION ||
    undefined

  const bingVerification =
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
    process.env.BING_SITE_VERIFICATION ||
    undefined

  return {
    title: isRoot ? { absolute: title } : title,
    description,
    keywords: tMeta('keywords').split(',').map((keyword) => keyword.trim()),
    verification: {
      google: googleVerification,
      other: bingVerification ? { 'msvalidate.01': [bingVerification] } : undefined,
    },
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
      images: [
        {
          url: absoluteUrl('/brand/logo-mark.png'),
          width: 1200,
          height: 630,
          alt: `${AGENCY.name} - Web Engineering Studio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [absoluteUrl('/brand/logo-mark.png')],
    },
  }
}

/**
 * Comprehensive Commercial Structured Data (Schema.org):
 * Combines ProfessionalService, WebSite, OfferCatalog (with starting pricing),
 * and FAQPage for Google Rich Snippets & Knowledge Graph.
 */
export function organizationJsonLd(locale: string) {
  const canonicalUrl = absoluteUrl(`/${locale}`)
  const logoUrl = absoluteUrl('/brand/logo-mark.png')

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfessionalService',
        '@id': absoluteUrl('/#organization'),
        name: AGENCY.name,
        alternateName: [AGENCY.shortName, 'Virtue & Co.'],
        slogan: 'Websites Built For Real Growth. Shipped On A Fixed Timeline.',
        description:
          'A senior digital architecture studio engineering custom Next.js web applications, e-commerce storefronts, and WordPress platforms for founders and scaling businesses worldwide.',
        url: canonicalUrl,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
          caption: AGENCY.name,
        },
        image: logoUrl,
        email: AGENCY.email,
        telephone: AGENCY.phone,
        foundingDate: String(AGENCY.founded),
        priceRange: '$$',
        currenciesAccepted: 'USD, GBP, EUR, NGN',
        paymentAccepted: 'Credit Card, Debit Card, Bank Transfer, Apple Pay, Google Pay',
        areaServed: {
          '@type': 'GeoShape',
          name: 'Worldwide',
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            email: AGENCY.email,
            contactType: 'customer support',
            availableLanguage: ['English', 'French', 'German', 'Spanish', 'Arabic'],
          },
          {
            '@type': 'ContactPoint',
            email: AGENCY.fallbackEmail,
            contactType: 'consultation & discovery',
            availableLanguage: ['English'],
          },
        ],
        knowsAbout: [
          'Next.js 16',
          'React 19',
          'TypeScript',
          'Supabase',
          'E-Commerce Development',
          'Tailwind CSS',
          'WordPress Development',
          'Wix Studio Engineering',
          '100/100 Lighthouse Performance Optimization',
          'Payment Gateway Integration (Stripe, Flutterwave)',
        ],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Web Engineering & Digital Architecture Packages',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Custom Next.js & React Web Apps',
                description:
                  'Bespoke, high-performance web applications built from scratch with Next.js and Supabase. Tailored for SaaS products, interactive portals, and custom web tools.',
              },
              price: '120.00',
              priceCurrency: 'USD',
              priceValidUntil: '2027-12-31',
              availability: 'https://schema.org/InStock',
              url: absoluteUrl(`/${locale}/services#custom`),
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'E-Commerce & Digital Storefronts',
                description:
                  'High-converting online shops with bank-grade checkout, automated customer receipt dispatch, inventory management, and fast mobile navigation.',
              },
              price: '160.00',
              priceCurrency: 'USD',
              priceValidUntil: '2027-12-31',
              availability: 'https://schema.org/InStock',
              url: absoluteUrl(`/${locale}/services#ecommerce`),
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'WordPress Development & Headless CMS',
                description:
                  'Modern, clean WordPress architectures configured for business credibility, fast load times, and easy visual content editing.',
              },
              price: '95.00',
              priceCurrency: 'USD',
              priceValidUntil: '2027-12-31',
              availability: 'https://schema.org/InStock',
              url: absoluteUrl(`/${locale}/services#wordpress`),
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Wix Studio Design & Engineering',
                description:
                  'Polished, custom Wix Studio websites built with responsive fluid layouts, custom micro-interactions, and built-in lead capture.',
              },
              price: '80.00',
              priceCurrency: 'USD',
              priceValidUntil: '2027-12-31',
              availability: 'https://schema.org/InStock',
              url: absoluteUrl(`/${locale}/services#wix`),
            },
          ],
        },
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: AGENCY.name,
        url: canonicalUrl,
        inLanguage: locale,
        publisher: { '@id': absoluteUrl('/#organization') },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${canonicalUrl}/portfolio?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': absoluteUrl('/#faq'),
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How much does custom web development cost at Virtue & Co. Webworks?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our web design and development packages start at accessible fixed rates: Custom Next.js web applications start at $120, E-Commerce storefronts start at $160, WordPress architectures start at $95, and Wix Studio designs start at $80. Every project receives a detailed scope and one binding price before work begins.',
            },
          },
          {
            '@type': 'Question',
            name: 'How long does a website take to build and launch?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Starter websites are delivered in 5 to 10 working days, business tier platforms in 10 to 18 working days, and enterprise web applications within 20 to 30 working days. We ship on fixed timelines agreed upon before kickoff.',
            },
          },
          {
            '@type': 'Question',
            name: 'Do I own 100% of the code and digital assets?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Upon final delivery, full ownership of the codebase, GitHub repository, database schemas, and creative assets is transferred directly to your team with zero vendor lock-in or recurring proprietary studio fees.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I edit and update my website content without coding?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Every website is built with a clean, intuitive content management interface (or connected headless CMS) so you can update text, images, blog posts, and products yourself with ease.',
            },
          },
          {
            '@type': 'Question',
            name: 'What payment methods and currencies do you accept?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We accept global debit and credit cards (Visa, Mastercard, Verve), Bank Transfers, USSD, Apple Pay, and Google Pay across USD, GBP, EUR, and NGN currencies with bank-grade 256-bit encryption.',
            },
          },
        ],
      },
    ],
  }
}

/** Breadcrumbs structured data generator for individual route hierarchies. */
export function breadcrumbsJsonLd(
  items: Array<{ name: string; path: string }>,
  locale: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(`/${locale}${item.path === '/' ? '' : item.path}`),
    })),
  }
}
