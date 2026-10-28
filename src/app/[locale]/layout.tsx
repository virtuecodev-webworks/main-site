import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Instrument_Sans, Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, getDirection, localeMeta, type AppLocale } from '@/i18n/routing'
import { RouteProgress } from '@/components/site/route-progress'
import { DesignStyles } from '@/components/design/design-styles'
import { ThemeScript } from '@/components/theme/theme-script'
import { Toaster } from '@/components/ui/sonner'
import { derivePalette } from '@/lib/design/palette'
import { getSiteDesign } from '@/lib/design/read'
import { organizationJsonLd } from '@/lib/seo'
import { absoluteUrl } from '@/lib/utils'
import { AGENCY } from '@/lib/constants'
import '../globals.css'

/**
 * Root layout, owned by the `[locale]` segment.
 *
 * Vantra Studio typography pairing:
 *   - `Instrument Sans` (`--font-instrument-sans`) for body, UI, buttons, and `.label-mono` tags.
 *   - `Inter` (`--font-inter`) for display headings (H0 through H6).
 *   - `Gropled` (`--font-gropled`) retained for wordmark / optional brand display use.
 */
const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

const gropled = localFont({
  src: '../../../public/fonts/gropled-bold.otf',
  variable: '--font-gropled',
  display: 'swap',
  weight: '700',
  style: 'normal',
  fallback: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  adjustFontFallback: false,
})

/**
 * Browser chrome follows the design's own surfaces, so a themed site does not
 * keep a white address bar above a dark page.
 */
export async function generateViewport(): Promise<Viewport> {
  const palette = derivePalette(await getSiteDesign())

  return {
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: palette.light.background },
      { media: '(prefers-color-scheme: dark)', color: palette.dark.background },
    ],
    width: 'device-width',
    initialScale: 1,
  }
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
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  const googleVerification =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
    process.env.GOOGLE_SITE_VERIFICATION ||
    undefined

  const bingVerification =
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
    process.env.BING_SITE_VERIFICATION ||
    undefined

  return {
    metadataBase: new URL(absoluteUrl('/')),
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    applicationName: AGENCY.name,
    authors: [{ name: AGENCY.name }],
    creator: AGENCY.name,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '32x32' },
        { url: '/brand/favicon.svg', type: 'image/svg+xml' },
        { url: '/brand/logo.svg', type: 'image/svg+xml' },
        { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
    },
    verification: {
      google: googleVerification,
      other: bingVerification ? { 'msvalidate.01': [bingVerification] } : undefined,
    },
    openGraph: {
      type: 'website',
      siteName: AGENCY.name,
      locale: localeMeta[locale as AppLocale]?.tag ?? 'en_US',
      images: [
        {
          url: absoluteUrl('/brand/logo-mark.png'),
          width: 1200,
          height: 630,
          alt: `${AGENCY.name} - Digital Architecture Studio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [absoluteUrl('/brand/logo-mark.png')],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  await getTranslations({ locale, namespace: 'Brand' })
  const design = await getSiteDesign()

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${instrumentSans.variable} ${inter.variable} ${gropled.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-dvh max-w-full overflow-x-clip bg-background font-sans text-foreground antialiased">
        <DesignStyles design={design} />
        <ThemeScript />
        <NextIntlClientProvider locale={locale}>
          <RouteProgress />
          {children}
          <Toaster />
        </NextIntlClientProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }}
        />
      </body>
    </html>
  )
}
