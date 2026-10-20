import type { CurrencyCode } from '@/lib/constants'

/**
 * The country registry.
 *
 * One row per country we show in the switcher: its ISO code, the currency we can
 * actually **settle** in for that country, and a representative IANA timezone.
 *
 * Two deliberate constraints:
 *
 *  1. `currency` is never "the local currency of that country". It is the
 *     settlement currency — one of NGN/USD/GBP/EUR, the four Flutterwave will
 *     charge in. A visitor in Japan is shown USD because that is a price we can
 *     genuinely invoice. Showing them yen would mean inventing an FX rate and a
 *     number we cannot honour.
 *
 *  2. `timezone` is only a server-side fallback for rendering times when the
 *     browser has not told us its zone yet. The browser's own zone is always
 *     preferred, because it is the one the person actually lives in.
 */
export interface Country {
  /** ISO 3166-1 alpha-2. */
  code: string
  /** One of the four settlement currencies. */
  currency: CurrencyCode
  /** Representative IANA zone. */
  timezone: string
}

type Row = readonly [code: string, currency: CurrencyCode, timezone: string]

const TABLE: readonly Row[] = [
  // Africa
  ['NG', 'USD', 'Africa/Lagos'],
  ['GH', 'USD', 'Africa/Accra'],
  ['KE', 'USD', 'Africa/Nairobi'],
  ['ZA', 'USD', 'Africa/Johannesburg'],
  ['EG', 'USD', 'Africa/Cairo'],
  ['MA', 'USD', 'Africa/Casablanca'],
  ['DZ', 'USD', 'Africa/Algiers'],
  ['TN', 'USD', 'Africa/Tunis'],
  ['ET', 'USD', 'Africa/Addis_Ababa'],
  ['TZ', 'USD', 'Africa/Dar_es_Salaam'],
  ['UG', 'USD', 'Africa/Kampala'],
  ['RW', 'USD', 'Africa/Kigali'],
  ['CM', 'USD', 'Africa/Douala'],
  ['CI', 'USD', 'Africa/Abidjan'],
  ['SN', 'USD', 'Africa/Dakar'],
  ['ZM', 'USD', 'Africa/Lusaka'],
  ['ZW', 'USD', 'Africa/Harare'],
  ['BW', 'USD', 'Africa/Gaborone'],
  ['NA', 'USD', 'Africa/Windhoek'],
  ['MZ', 'USD', 'Africa/Maputo'],
  ['AO', 'USD', 'Africa/Luanda'],
  ['MU', 'USD', 'Indian/Mauritius'],

  // North America
  ['US', 'USD', 'America/New_York'],
  ['CA', 'USD', 'America/Toronto'],
  ['MX', 'USD', 'America/Mexico_City'],
  ['CR', 'USD', 'America/Costa_Rica'],
  ['PA', 'USD', 'America/Panama'],
  ['DO', 'USD', 'America/Santo_Domingo'],
  ['JM', 'USD', 'America/Jamaica'],
  ['TT', 'USD', 'America/Port_of_Spain'],
  ['GT', 'USD', 'America/Guatemala'],

  // South America
  ['BR', 'USD', 'America/Sao_Paulo'],
  ['AR', 'USD', 'America/Argentina/Buenos_Aires'],
  ['CL', 'USD', 'America/Santiago'],
  ['CO', 'USD', 'America/Bogota'],
  ['PE', 'USD', 'America/Lima'],
  ['VE', 'USD', 'America/Caracas'],
  ['EC', 'USD', 'America/Guayaquil'],
  ['UY', 'USD', 'America/Montevideo'],
  ['PY', 'USD', 'America/Asuncion'],
  ['BO', 'USD', 'America/La_Paz'],

  // Europe — the euro area settles in EUR
  ['GB', 'GBP', 'Europe/London'],
  ['IE', 'EUR', 'Europe/Dublin'],
  ['FR', 'EUR', 'Europe/Paris'],
  ['DE', 'EUR', 'Europe/Berlin'],
  ['NL', 'EUR', 'Europe/Amsterdam'],
  ['BE', 'EUR', 'Europe/Brussels'],
  ['LU', 'EUR', 'Europe/Luxembourg'],
  ['AT', 'EUR', 'Europe/Vienna'],
  ['ES', 'EUR', 'Europe/Madrid'],
  ['PT', 'EUR', 'Europe/Lisbon'],
  ['IT', 'EUR', 'Europe/Rome'],
  ['GR', 'EUR', 'Europe/Athens'],
  ['FI', 'EUR', 'Europe/Helsinki'],
  ['EE', 'EUR', 'Europe/Tallinn'],
  ['LV', 'EUR', 'Europe/Riga'],
  ['LT', 'EUR', 'Europe/Vilnius'],
  ['SK', 'EUR', 'Europe/Bratislava'],
  ['SI', 'EUR', 'Europe/Ljubljana'],
  ['HR', 'EUR', 'Europe/Zagreb'],
  ['MT', 'EUR', 'Europe/Malta'],
  ['CY', 'EUR', 'Asia/Nicosia'],
  // Non-euro Europe
  ['CH', 'USD', 'Europe/Zurich'],
  ['NO', 'USD', 'Europe/Oslo'],
  ['SE', 'USD', 'Europe/Stockholm'],
  ['DK', 'USD', 'Europe/Copenhagen'],
  ['IS', 'USD', 'Atlantic/Reykjavik'],
  ['PL', 'USD', 'Europe/Warsaw'],
  ['CZ', 'USD', 'Europe/Prague'],
  ['RO', 'USD', 'Europe/Bucharest'],
  ['HU', 'USD', 'Europe/Budapest'],
  ['BG', 'USD', 'Europe/Sofia'],
  ['RS', 'USD', 'Europe/Belgrade'],
  ['UA', 'USD', 'Europe/Kyiv'],
  ['RU', 'USD', 'Europe/Moscow'],

  // Middle East
  ['AE', 'USD', 'Asia/Dubai'],
  ['SA', 'USD', 'Asia/Riyadh'],
  ['QA', 'USD', 'Asia/Qatar'],
  ['KW', 'USD', 'Asia/Kuwait'],
  ['BH', 'USD', 'Asia/Bahrain'],
  ['OM', 'USD', 'Asia/Muscat'],
  ['JO', 'USD', 'Asia/Amman'],
  ['LB', 'USD', 'Asia/Beirut'],
  ['IL', 'USD', 'Asia/Jerusalem'],
  ['TR', 'USD', 'Europe/Istanbul'],

  // Asia
  ['IN', 'USD', 'Asia/Kolkata'],
  ['PK', 'USD', 'Asia/Karachi'],
  ['BD', 'USD', 'Asia/Dhaka'],
  ['LK', 'USD', 'Asia/Colombo'],
  ['NP', 'USD', 'Asia/Kathmandu'],
  ['CN', 'USD', 'Asia/Shanghai'],
  ['JP', 'USD', 'Asia/Tokyo'],
  ['KR', 'USD', 'Asia/Seoul'],
  ['TW', 'USD', 'Asia/Taipei'],
  ['HK', 'USD', 'Asia/Hong_Kong'],
  ['SG', 'USD', 'Asia/Singapore'],
  ['MY', 'USD', 'Asia/Kuala_Lumpur'],
  ['ID', 'USD', 'Asia/Jakarta'],
  ['PH', 'USD', 'Asia/Manila'],
  ['TH', 'USD', 'Asia/Bangkok'],
  ['VN', 'USD', 'Asia/Ho_Chi_Minh'],
  ['KZ', 'USD', 'Asia/Almaty'],
  ['UZ', 'USD', 'Asia/Tashkent'],
  ['AZ', 'USD', 'Asia/Baku'],
  ['GE', 'USD', 'Asia/Tbilisi'],

  // Oceania
  ['AU', 'USD', 'Australia/Sydney'],
  ['NZ', 'USD', 'Pacific/Auckland'],
]

export const COUNTRIES: readonly Country[] = TABLE.map(([code, currency, timezone]) => ({
  code,
  currency,
  timezone,
}))

const BY_CODE = new Map(COUNTRIES.map((country) => [country.code, country]))

/**
 * The fallback when we have no geo signal and no explicit choice.
 *
 * Deliberately neutral: the site is published for a worldwide audience, so a
 * visitor we cannot place is shown plain USD pricing rather than one market's
 * currency. The studio's own timezone never leaks into this default.
 */
export const DEFAULT_COUNTRY = 'US'

/**
 * Cookie holding the visitor's explicit country choice. Written by the browser,
 * so it must stay readable to JavaScript.
 */
export const COUNTRY_COOKIE = 'vcw:country'

/**
 * Cookie caching the country we detected from IP headers, so the lookup happens
 * once per visitor rather than on every page view.
 */
export const GEO_COOKIE = 'vcw:geo'

/** Cookie lifetime: a year. Long enough to be useful, short enough to expire. */
export const REGION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isSupportedCountry(code: string): boolean {
  return BY_CODE.has(code.toUpperCase())
}

export function findCountry(code: string | null | undefined): Country | null {
  if (!code) return null
  return BY_CODE.get(code.toUpperCase()) ?? null
}

/**
 * Country name in the reader's language.
 *
 * `Intl.DisplayNames` ships with every modern runtime, so the switcher needs no
 * translation catalogue for ~110 country names — and they stay correct as the
 * ICU data updates.
 */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

/** Countries sorted by their localised name, ready for the switcher. */
export function listCountries(locale: string): Country[] {
  return [...COUNTRIES].sort((a, b) =>
    countryName(a.code, locale).localeCompare(countryName(b.code, locale), locale),
  )
}
