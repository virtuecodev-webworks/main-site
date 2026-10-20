import 'server-only'

import { cookies, headers } from 'next/headers'
import { COUNTRY_COOKIE, DEFAULT_COUNTRY, GEO_COOKIE, findCountry, type Country } from './countries'
import { countryFromHeaders } from './detect'

/**
 * The visitor's country as a server-rendered page sees it.
 *
 * Marketing pages resolve the region in the browser so they can stay static.
 * The portal and the console cannot — they already read the session cookie on
 * every request — so they read the same two sources in the same order:
 *
 *   1. `vcw:country`, an explicit choice the visitor made
 *   2. `vcw:geo`, what the host's geo headers said last time the browser asked
 *   3. the geo headers directly, for a first request with nothing cached yet
 *   4. `DEFAULT_COUNTRY`, so the answer is never null
 *
 * One difference from the client path worth stating: a country supplied by a
 * request header is trusted here for the single response that carries it, and is
 * never written to a cookie from the server. Persisting it is the browser's job.
 */
export async function resolveServerCountry(): Promise<Country> {
  const jar = await cookies()

  const chosen = findCountry(jar.get(COUNTRY_COOKIE)?.value)
  if (chosen) return chosen

  const cached = findCountry(jar.get(GEO_COOKIE)?.value)
  if (cached) return cached

  const detected = countryFromHeaders(await headers())
  const fromHeader = detected ? findCountry(detected) : null
  if (fromHeader) return fromHeader

  return findCountry(DEFAULT_COUNTRY)!
}
