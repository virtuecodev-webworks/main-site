import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Questrial, Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, getDirection, localeMeta, type AppLocale } from '@/i18n/routing'
import { BrandLoader } from '@/components/site/brand-loader'
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
 * There is deliberately no `src/app/layout.tsx`: every route in this app is
 * localised, so `[locale]` is the one place that renders `<html>`/`<body>`.
 */
const questrial = Questrial({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-questrial',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

/**
 * Gropled — the brand display face, self-hosted from `public/fonts`.
 *
 * Three facts about this face shape decisions elsewhere in the codebase, so they
 * are recorded here rather than rediscovered later:
 *
 *   1. **One weight only.** The file is Bold (700) with no variable axes and no
 *      italic. Display text is therefore pinned to 700, and the wordmark's
 *      ampersand is an upright gold glyph rather than an italic one.
 *   2. **A deliberately small glyph set.** Read straight off the font's own
 *      `cmap`: Latin and Cyrillic complete; Arabic absent; and a handful of
 *      symbols missing — the ellipsis, arrows, `<`, `¿`, `ß`, `œ`, `™` and `₦`.
 *      Anything Gropled cannot draw falls to the next family in the stack, which
 *      is why Inter is pinned as the first fallback below.
 *   3. **Self-hosted, not fetched.** No third-party font request at runtime, and
 *      the same file drives the site, the social card and the preloader video.
 *
 * `fallback` is where the rest of the display stack lives, because Inter has to
 * outrank the generic families in `--font-display` to ever be reached. Putting the
 * site's own body face directly after the display face means a stray `<` or `¿`
 * in a headline is drawn in Inter — on-brand — rather than in whatever the
 * browser's default happens to be. `adjustFontFallback` is off for the same
 * reason: the metric-adjusted face it generates would sit *ahead* of Inter and win
 * those glyphs. Gropled is local and preloaded, so there is no swap to protect
 * against anyway. Arabic is unaffected: neither Gropled nor Inter carries it, so
 * RTL headings correctly resolve to a system Arabic face.
 */
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

  return {
    metadataBase: new URL(absoluteUrl('/')),
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    applicationName: AGENCY.name,
    authors: [{ name: AGENCY.name }],
    creator: AGENCY.name,
    icons: { icon: '/brand/logo.svg', apple: '/brand/logo.svg' },
    openGraph: {
      type: 'website',
      siteName: AGENCY.name,
      locale: localeMeta[locale as AppLocale]?.tag ?? 'en_US',
    },
    twitter: { card: 'summary_large_image' },
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

  // Enables static rendering for this locale segment.
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'Brand' })
  // One cached read, shared with `generateViewport`, and revalidated by the
  // design actions rather than re-fetched per request.
  const design = await getSiteDesign()

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${questrial.variable} ${inter.variable} ${gropled.variable} max-w-full overflow-x-clip`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Questrial&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh max-w-full overflow-x-clip bg-background font-sans text-foreground antialiased">
        <DesignStyles design={design} />
        <ThemeScript />
        <NextIntlClientProvider locale={locale}>
          <BrandLoader label={t('loaderLabel')} />
          <RouteProgress />
          {children}
          <Toaster />
        </NextIntlClientProvider>

        <script
          type="application/ld+json"
          // JSON-LD is authored from constants only — no user input is interpolated.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }}
        />
      </body>
    </html>
  )
}
