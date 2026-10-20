import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { countryFromHeaders } from '@/lib/geo/detect'
import { findCountry } from '@/lib/geo/countries'

/**
 * `GET /api/region`
 *
 * Resolves the visitor's country from the host's geo headers. The browser asks
 * once, caches the answer in a cookie, and never asks again — which is what lets
 * every marketing page stay statically rendered while still being region-aware.
 *
 * The response is `no-store`: it is per-visitor by definition and would be a
 * cache-poisoning hazard if anything in front of it ever cached it.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const headerList = await headers()
  const code = countryFromHeaders(headerList)
  const country = code ? findCountry(code) : null

  return NextResponse.json(
    {
      country: country?.code ?? null,
      currency: country?.currency ?? null,
      timezone: country?.timezone ?? null,
      /** False when the host supplied no geo header at all. */
      detected: country !== null,
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}
