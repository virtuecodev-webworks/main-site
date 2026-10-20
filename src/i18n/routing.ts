import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'fr', 'es', 'de', 'ar'] as const
export type AppLocale = (typeof locales)[number]

export interface LocaleMeta {
  /** Name of the language in that language. */
  label: string
  /** Name in English, used for `hreflang` descriptions. */
  english: string
  /** BCP-47 tag used for Intl formatting (language-first, neutral region). */
  tag: string
  region: string
  dir: 'ltr' | 'rtl'
}

export const localeMeta: Record<AppLocale, LocaleMeta> = {
  en: { label: 'English', english: 'English', tag: 'en-US', region: 'US', dir: 'ltr' },
  fr: { label: 'Français', english: 'French', tag: 'fr-FR', region: 'FR', dir: 'ltr' },
  es: { label: 'Español', english: 'Spanish', tag: 'es-ES', region: 'ES', dir: 'ltr' },
  de: { label: 'Deutsch', english: 'German', tag: 'de-DE', region: 'DE', dir: 'ltr' },
  ar: { label: 'العربية', english: 'Arabic', tag: 'ar-EG', region: 'EG', dir: 'rtl' },
}

export function getDirection(locale: string): 'ltr' | 'rtl' {
  return (localeMeta as Record<string, LocaleMeta>)[locale]?.dir ?? 'ltr'
}

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  /**
   * Every locale gets an explicit prefix (`/en`, `/fr`, `/ar`). Predictable
   * hreflang generation, and `/` redirects to the default locale via the proxy.
   */
  localePrefix: 'always',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
  },
})
