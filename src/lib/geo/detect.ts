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
