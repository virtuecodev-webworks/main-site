import {
  COUNTRIES,
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  GEO_COOKIE,
  REGION_COOKIE_MAX_AGE,
  findCountry,
  isSupportedCountry,
  type Country,
} from './countries'
import type { CurrencyCode } from '@/lib/constants'

/**
 * Browser-side region resolution.
 *
 * Everything here runs in the browser only (it touches `document.cookie` and
 * `fetch`), which is deliberate: it is what lets every marketing page stay
 * statically rendered while still adapting to the visitor's country.
 */

export type RegionSource = 'chosen' | 'detected' | 'default'

export interface RegionState {
  country: Country
  currency: CurrencyCode
  timezone: string
  /** How this region was arrived at — drives the UI copy in the switcher. */
  source: RegionSource
}

/**
 * What the server renders and what a first client paint uses. It is a real,
 * settleable region rather than a placeholder, so the fallback is never wrong in
 * a way that matters.
 */
export const FALLBACK_REGION: RegionState = (() => {
  const country = findCountry(DEFAULT_COUNTRY)!
  return { country, currency: country.currency, timezone: country.timezone, source: 'default' }
})()

const BY_TIMEZONE: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const country of COUNTRIES) {
    if (!map.has(country.timezone)) {
      map.set(country.timezone, country.code)
    }
  }
  const aliases: Record<string, string> = {
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Phoenix': 'US',
    'America/Anchorage': 'US',
    'Pacific/Honolulu': 'US',
    'America/Detroit': 'US',
    'America/Vancouver': 'CA',
    'America/Edmonton': 'CA',
    'America/Winnipeg': 'CA',
    'America/Halifax': 'CA',
    'America/Montreal': 'CA',
    'Australia/Melbourne': 'AU',
    'Australia/Brisbane': 'AU',
    'Australia/Perth': 'AU',
    'Asia/Calcutta': 'IN',
    'Asia/Saigon': 'VN',
    'Europe/Kiev': 'UA',
  }
  for (const [tz, code] of Object.entries(aliases)) {
    map.set(tz, code)
  }
  return map
})()

function inferCountryFromBrowser(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz) {
      const fromTz = BY_TIMEZONE.get(tz)
      if (fromTz && isSupportedCountry(fromTz)) return fromTz
    }
  } catch {
    /* Intl timezone unavailable */
  }

  try {
    const candidates = [
      ...(Array.isArray(navigator.languages) ? navigator.languages : []),
      navigator.language,
    ].filter(Boolean)
    for (const tag of candidates) {
      const parts = tag.split(/[-_]/)
      if (parts.length >= 2) {
        const region = parts[parts.length - 1]?.toUpperCase()
        if (region && /^[A-Z]{2}$/.test(region) && isSupportedCountry(region)) {
          return region
        }
      }
    }
  } catch {
    /* navigator unavailable */
  }

  return null
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const prefix = `${name}=`
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) return decodeURIComponent(trimmed.slice(prefix.length))
  }
  return null
}

function writeCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax${secure}`
}

export function buildRegion(code: string, source: RegionSource): RegionState {
  const country = findCountry(code)
  if (!country) return FALLBACK_REGION
  return { country, currency: country.currency, timezone: country.timezone, source }
}

/**
 * Synchronous read of a region the browser already knows about.
 */
export function readCachedRegion(): RegionState | null {
  const chosen = readCookie(COUNTRY_COOKIE)
  if (chosen && isSupportedCountry(chosen)) return buildRegion(chosen, 'chosen')

  const cached = readCookie(GEO_COOKIE)
  if (cached && isSupportedCountry(cached)) return buildRegion(cached, 'detected')

  return null
}

/**
 * Full resolution for when nothing is cached: IP geo header lookup first,
 * followed by browser timezone/locale inference if the host has no geo headers.
 */
export async function resolveRegion(): Promise<RegionState> {
  const cached = readCachedRegion()
  if (cached) return cached

  try {
    const response = await fetch('/api/region', { headers: { accept: 'application/json' } })
    if (response.ok) {
      const payload = (await response.json()) as { country?: string | null }
      if (payload.country && isSupportedCountry(payload.country)) {
        writeCookie(GEO_COOKIE, payload.country, REGION_COOKIE_MAX_AGE)
        return buildRegion(payload.country, 'detected')
      }
    }
  } catch {
    /* Offline, or the request was blocked. Try browser inference below. */
  }

  const inferred = inferCountryFromBrowser()
  if (inferred) {
    writeCookie(GEO_COOKIE, inferred, REGION_COOKIE_MAX_AGE)
    return buildRegion(inferred, 'detected')
  }

  return buildRegion(DEFAULT_COUNTRY, 'default')
}

/** Records an explicit choice. It wins over detection from then on. */
export function chooseCountry(code: string): RegionState {
  writeCookie(COUNTRY_COOKIE, code, REGION_COOKIE_MAX_AGE)
  return buildRegion(code, 'chosen')
}

/** Forgets the explicit choice and both caches, then re-detects. */
export async function forgetCountry(): Promise<RegionState> {
  writeCookie(COUNTRY_COOKIE, '', 0)
  writeCookie(GEO_COOKIE, '', 0)
  return resolveRegion()
}
