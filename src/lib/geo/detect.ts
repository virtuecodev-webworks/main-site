import type { AppLocale } from '@/i18n/routing'

/**
 * Server-side country detection.
 *
 * The only thing the server can know about a visitor's location is what the host
 * or CDN tells it, by header. This module reads those headers and nothing else —
 * it deliberately does **not** touch `cookies()`, so it works identically from the
 * proxy and from a route handler without making any page dynamic.
 */

/**
 * Headers that carry an IP-derived country, in priority order. Covers Vercel,
 * Cloudflare, Fly and the common generic reverse-proxy conventions, so this works
 * whether or not the site ends up on the host it was built against.
 */
const GEO_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'x-country-code',
  'x-geo-country',
  'x-client-country',
] as const

/** Sentinels meaning "unknown" and "Tor exit node" — never a real country. */
const GEO_SENTINELS = new Set(['XX', 'T1'])

/** Two-letter country from the request headers, or `null` when unavailable. */
export function countryFromHeaders(headerList: Headers): string | null {
  for (const name of GEO_HEADERS) {
    const raw = headerList.get(name)?.trim().toUpperCase()
    if (!raw) continue
    if (!/^[A-Z]{2}$/.test(raw)) continue
    if (GEO_SENTINELS.has(raw)) continue
    return raw
  }
  return null
}

/**
 * Maps an ISO 3166-1 alpha-2 country code to the studio's supported locales.
 *
 * Supported locales:
 * - 'fr': France, Belgium, Switzerland (Romandie), Monaco, Luxembourg, and Francophone Africa (SN, CI, CM, CD, etc.)
 * - 'es': Spain, Mexico, Argentina, Colombia, Chile, Peru, and Hispanic America
 * - 'de': Germany, Austria, Switzerland, Liechtenstein
 * - 'ar': Saudi Arabia, UAE, Egypt, Qatar, Kuwait, Morocco, Algeria, etc.
 * - 'en': UK, US, Nigeria, Canada, Australia, and fallback for all other countries
 */
export function localeFromCountry(country: string | null | undefined): AppLocale {
  if (!country) return 'en'
  const c = country.toUpperCase()

  // Arabic-speaking countries
  if (['SA', 'AE', 'EG', 'QA', 'KW', 'OM', 'BH', 'IQ', 'JO', 'LB', 'MA', 'DZ', 'TN', 'LY', 'SD', 'YE', 'PS', 'SY'].includes(c)) {
    return 'ar'
  }

  // French-speaking countries
  if (['FR', 'BE', 'MC', 'LU', 'SN', 'CI', 'CM', 'CD', 'CG', 'GA', 'GN', 'ML', 'NE', 'BF', 'TG', 'BJ', 'MG', 'HT'].includes(c)) {
    return 'fr'
  }

  // Spanish-speaking countries
  if (['ES', 'MX', 'CO', 'AR', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ'].includes(c)) {
    return 'es'
  }

  // German-speaking countries
  if (['DE', 'AT', 'LI', 'CH'].includes(c)) {
    return 'de'
  }

  return 'en'
}
