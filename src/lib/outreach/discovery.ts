import 'server-only'

import type {
  DiscoveredBusiness,
  DiscoveryProvider,
  OutreachCriteriaSnapshot,
} from './types'

export interface DiscoveryOptions {
  maxCandidates?: number
  timeoutMs?: number
  fetchFn?: typeof fetch
  env?: Record<string, string | undefined>
}

interface NominatimResult {
  boundingbox?: [string, string, string, string]
  display_name?: string
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation' | string
  id: number
  lat?: number
  lon?: number
  center?: { lat?: number; lon?: number }
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements?: OverpassElement[]
}

interface GooglePlacesResponse {
  places?: Array<{
    id?: string
    displayName?: { text?: string }
    formattedAddress?: string
    websiteUri?: string
    nationalPhoneNumber?: string
    internationalPhoneNumber?: string
    types?: string[]
  }>
}

interface SerperPlacesResponse {
  places?: Array<{
    position?: number
    title?: string
    address?: string
    phoneNumber?: string
    website?: string
    rating?: number
    ratingCount?: number
    category?: string
    cid?: string
    placeId?: string
  }>
}

const DEFAULT_MAX_CANDIDATES = 25
const MAX_ALLOWED_CANDIDATES = 50
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_QUERY_PAIRS = 12
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

export function resolveDiscoveryProvider(
  requested: DiscoveryProvider,
  env: Record<string, string | undefined> = process.env,
): Exclude<DiscoveryProvider, 'auto'> {
  if (requested !== 'auto') {
    return requested
  }

  const googleKey = env.GOOGLE_PLACES_API_KEY?.trim()
  if (googleKey) {
    return 'google_places'
  }

  const serperKey = env.SERPER_API_KEY?.trim()
  if (serperKey) {
    return 'serper'
  }

  return 'osm'
}

function cleanStringList(values: readonly string[] | undefined): string[] {
  if (!values) return []
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of values) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lower = trimmed.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    result.push(trimmed)
  }

  return result
}

function clampCandidates(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_MAX_CANDIDATES
  }
  return Math.min(MAX_ALLOWED_CANDIDATES, Math.max(1, Math.round(value)))
}

function normalizeCandidateWebsite(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed || /\s/.test(trimmed)) return null

  if (/^(mailto|tel|sms|javascript|data|ftp):/i.test(trimmed)) {
    return null
  }

  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : trimmed.startsWith('//')
      ? `https:${trimmed}`
      : trimmed.includes('.')
        ? `https://${trimmed}`
        : ''

  if (!withScheme) return null

  try {
    const parsed = new URL(withScheme)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

function sanitizeDiscoveryEmail(raw: string | null | undefined): string | null {
  if (!raw) return null
  const cleaned = raw.trim().toLowerCase()
  if (!cleaned || cleaned.length > 180 || !EMAIL_PATTERN.test(cleaned)) {
    return null
  }
  return cleaned
}

function escapeOverpassRegex(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|"]/g, '\\$&')
}

function buildOverpassFilters(
  industry: string,
  keywords: string[],
  bbox: string,
): string[] {
  const combined = [industry, ...keywords].join(' ').toLowerCase()
  const clauses: string[] = []

  if (/\b(restaurant|cafe|coffee|bakery|bar|food|diner|bistro|catering|pizza)\b/.test(combined)) {
    clauses.push(`nwr["amenity"~"restaurant|cafe|bakery|bar|fast_food"](${bbox});`)
  }
  if (/\b(clinic|dental|dentist|medical|doctor|pharmacy|health|wellness|hospital)\b/.test(combined)) {
    clauses.push(`nwr["amenity"~"clinic|dentist|doctors|pharmacy"](${bbox});`)
    clauses.push(`nwr["healthcare"](${bbox});`)
  }
  if (/\b(salon|beauty|barber|spa|hair|nail)\b/.test(combined)) {
    clauses.push(`nwr["shop"~"hairdresser|beauty"](${bbox});`)
  }
  if (/\b(law|legal|attorney|accounting|accountant|agency|consulting|real estate|insurance|architect)\b/.test(combined)) {
    clauses.push(`nwr["office"](${bbox});`)
  }
  if (/\b(plumber|plumbing|electrician|contractor|repair|carpenter|hvac|auto|mechanic)\b/.test(combined)) {
    clauses.push(`nwr["craft"](${bbox});`)
  }
  if (/\b(hotel|lodging|hospitality|inn|resort|guest house)\b/.test(combined)) {
    clauses.push(`nwr["tourism"~"hotel|guest_house|motel"](${bbox});`)
  }
  if (/\b(shop|store|retail|boutique|bakery|florist|jewel|clothing|fashion)\b/.test(combined)) {
    clauses.push(`nwr["shop"](${bbox});`)
  }

  const terms = [industry, ...keywords.slice(0, 2)]
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .map(escapeOverpassRegex)

  if (terms.length > 0) {
    const regex = terms.join('|')
    clauses.push(`nwr["name"~"${regex}",i](${bbox});`)
  }

  if (clauses.length === 0) {
    clauses.push(`nwr["shop"](${bbox});`)
    clauses.push(`nwr["amenity"~"restaurant|cafe|clinic|dentist"](${bbox});`)
  }

  return Array.from(new Set(clauses))
}

function formatOsmAddress(tags: Record<string, string>, fallbackLocation: string): string {
  const streetLine = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ').trim()
  const parts = [
    streetLine,
    tags['addr:city'],
    tags['addr:state'],
    tags['addr:postcode'],
  ]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))

  return parts.length > 0 ? parts.join(', ') : fallbackLocation
}

async function discoverViaOsm(params: {
  industry: string
  location: string
  keywords: string[]
  limit: number
  timeoutMs: number
  fetchFn: typeof fetch
}): Promise<DiscoveredBusiness[]> {
  const { industry, location, keywords, limit, timeoutMs, fetchFn } = params

  const nomTimeout = Math.min(timeoutMs, 4000)
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`
  const nomRes = await fetchFn(nominatimUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'VirtueCoWebworksOutreach/1.0 (+https://virtuecowebworks.solutions)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(nomTimeout),
  })

  if (!nomRes.ok) {
    throw new Error(`Nominatim lookup failed (${nomRes.status}) for "${location}"`)
  }

  const nomData = (await nomRes.json()) as NominatimResult[]
  const first = Array.isArray(nomData) ? nomData[0] : undefined
  const rawBox = first?.boundingbox

  if (!rawBox || rawBox.length !== 4) {
    return []
  }

  // Nominatim returns [south, north, west, east]; Overpass expects (south, west, north, east)
  const south = Number(rawBox[0])
  const north = Number(rawBox[1])
  const west = Number(rawBox[2])
  const east = Number(rawBox[3])

  if (![south, north, west, east].every((n) => Number.isFinite(n))) {
    return []
  }

  const bbox = `${south},${west},${north},${east}`
  const filterClauses = buildOverpassFilters(industry, keywords, bbox)
  const overpassTimeoutSec = Math.max(3, Math.min(6, Math.ceil(nomTimeout / 1000)))
  const ql = `[out:json][timeout:${overpassTimeoutSec}];(${filterClauses.join('')});out center tags ${limit};`

  const overpassRes = await fetchFn('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'VirtueCoWebworksOutreach/1.0 (+https://virtuecowebworks.solutions)',
      Accept: 'application/json',
    },
    body: `data=${encodeURIComponent(ql)}`,
    signal: AbortSignal.timeout(nomTimeout),
  })

  if (!overpassRes.ok) {
    throw new Error(`Overpass query failed (${overpassRes.status}) for "${location}"`)
  }

  const overpassData = (await overpassRes.json()) as OverpassResponse
  const elements = Array.isArray(overpassData.elements) ? overpassData.elements : []
  const results: DiscoveredBusiness[] = []

  for (const el of elements) {
    const tags = el.tags ?? {}
    const name = tags.name?.trim()
    if (!name) continue

    const rawWebsite = tags.website ?? tags['contact:website'] ?? tags.url ?? null
    const rawEmail = tags.email ?? tags['contact:email'] ?? null
    const rawPhone = tags.phone ?? tags['contact:phone'] ?? null

    results.push({
      businessName: name,
      industry,
      location: formatOsmAddress(tags, location),
      websiteUrl: normalizeCandidateWebsite(rawWebsite),
      contactEmail: sanitizeDiscoveryEmail(rawEmail),
      phone: rawPhone?.trim() || null,
      sourceProvider: 'osm',
      sourceExternalId: `osm:${el.type}:${el.id}`,
      rawMetadata: {
        type: el.type,
        id: el.id,
        lat: el.lat ?? el.center?.lat ?? null,
        lon: el.lon ?? el.center?.lon ?? null,
        tags,
      },
    })
  }

  return results
}

async function discoverViaGooglePlaces(params: {
  apiKey: string
  industry: string
  location: string
  keywords: string[]
  limit: number
  timeoutMs: number
  fetchFn: typeof fetch
}): Promise<DiscoveredBusiness[]> {
  const { apiKey, industry, location, keywords, limit, timeoutMs, fetchFn } = params
  const textQuery = [industry, ...keywords.slice(0, 3), location].filter(Boolean).join(' ')

  const res = await fetchFn('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.types',
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: Math.min(20, limit),
    }),
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!res.ok) {
    throw new Error(`Google Places searchText failed (${res.status})`)
  }

  const data = (await res.json()) as GooglePlacesResponse
  const places = Array.isArray(data.places) ? data.places : []
  const results: DiscoveredBusiness[] = []

  for (const place of places) {
    const name = place.displayName?.text?.trim()
    if (!name) continue

    results.push({
      businessName: name,
      industry,
      location: place.formattedAddress?.trim() || location,
      websiteUrl: normalizeCandidateWebsite(place.websiteUri),
      contactEmail: null,
      phone: place.nationalPhoneNumber?.trim() || place.internationalPhoneNumber?.trim() || null,
      sourceProvider: 'google_places',
      sourceExternalId: place.id?.trim() || null,
      rawMetadata: place as Record<string, unknown>,
    })
  }

  return results
}

async function discoverViaSerper(params: {
  apiKey: string
  industry: string
  location: string
  keywords: string[]
  timeoutMs: number
  fetchFn: typeof fetch
}): Promise<DiscoveredBusiness[]> {
  const { apiKey, industry, location, keywords, timeoutMs, fetchFn } = params
  const q = [industry, ...keywords.slice(0, 3), location].filter(Boolean).join(' ')

  const res = await fetchFn('https://google.serper.dev/places', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify({ q }),
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!res.ok) {
    throw new Error(`Serper places search failed (${res.status})`)
  }

  const data = (await res.json()) as SerperPlacesResponse
  const places = Array.isArray(data.places) ? data.places : []
  const results: DiscoveredBusiness[] = []

  for (const item of places) {
    const name = item.title?.trim()
    if (!name) continue

    results.push({
      businessName: name,
      industry: item.category?.trim() || industry,
      location: item.address?.trim() || location,
      websiteUrl: normalizeCandidateWebsite(item.website),
      contactEmail: null,
      phone: item.phoneNumber?.trim() || null,
      sourceProvider: 'serper',
      sourceExternalId: item.cid?.trim() || item.placeId?.trim() || null,
      rawMetadata: item as Record<string, unknown>,
    })
  }

  return results
}

function buildInBatchKey(candidate: DiscoveredBusiness): string {
  if (candidate.sourceExternalId) {
    return `ext:${candidate.sourceProvider}:${candidate.sourceExternalId}`
  }

  const normalizedName = candidate.businessName.trim().toLowerCase().replace(/\s+/g, ' ')
  if (candidate.websiteUrl) {
    try {
      const host = new URL(candidate.websiteUrl).hostname.toLowerCase().replace(/^www\./, '')
      return `name_host:${normalizedName}::${host}`
    } catch {
      // fall through
    }
  }

  const normalizedLocation = (candidate.location ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  return `name_loc:${normalizedName}::${normalizedLocation}`
}

export async function discoverBusinesses(
  criteria: OutreachCriteriaSnapshot,
  options?: DiscoveryOptions,
): Promise<DiscoveredBusiness[]> {
  const env = options?.env ?? process.env
  const maxCandidates = clampCandidates(options?.maxCandidates)
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const fetchFn = options?.fetchFn ?? globalThis.fetch

  const provider = resolveDiscoveryProvider(criteria.discovery_provider, env)
  const googleKey = env.GOOGLE_PLACES_API_KEY?.trim()
  const serperKey = env.SERPER_API_KEY?.trim()

  if (provider === 'google_places' && !googleKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is required when discovery_provider is "google_places"')
  }
  if (provider === 'serper' && !serperKey) {
    throw new Error('SERPER_API_KEY is required when discovery_provider is "serper"')
  }

  const industries = cleanStringList(criteria.industries)
  const locations = cleanStringList(criteria.locations)
  const keywords = cleanStringList(criteria.keywords)

  if (locations.length === 0) {
    return []
  }

  const queryIndustries =
    industries.length > 0 ? industries : keywords.length > 0 ? keywords.slice(0, 3) : []

  if (queryIndustries.length === 0) {
    return []
  }

  const pairs: Array<{ industry: string; location: string }> = []
  for (const location of locations) {
    for (const industry of queryIndustries) {
      pairs.push({ industry, location })
      if (pairs.length >= MAX_QUERY_PAIRS) break
    }
    if (pairs.length >= MAX_QUERY_PAIRS) break
  }

  const collected: DiscoveredBusiness[] = []
  const seenKeys = new Set<string>()
  const errors: unknown[] = []
  let consecutiveOsmErrors = 0

  for (const pair of pairs) {
    if (collected.length >= maxCandidates) break
    if (provider === 'osm' && consecutiveOsmErrors >= 2) {
      console.warn('[outreach/discovery] Aborting OSM early after 2 consecutive failures')
      break
    }
    const remaining = maxCandidates - collected.length

    try {
      let batch: DiscoveredBusiness[] = []

      if (provider === 'google_places') {
        batch = await discoverViaGooglePlaces({
          apiKey: googleKey!,
          industry: pair.industry,
          location: pair.location,
          keywords,
          limit: remaining,
          timeoutMs,
          fetchFn,
        })
      } else if (provider === 'serper') {
        batch = await discoverViaSerper({
          apiKey: serperKey!,
          industry: pair.industry,
          location: pair.location,
          keywords,
          timeoutMs,
          fetchFn,
        })
      } else {
        batch = await discoverViaOsm({
          industry: pair.industry,
          location: pair.location,
          keywords,
          limit: remaining,
          timeoutMs,
          fetchFn,
        })
      }

      consecutiveOsmErrors = 0

      for (const candidate of batch) {
        const key = buildInBatchKey(candidate)
        if (seenKeys.has(key)) continue
        seenKeys.add(key)
        collected.push(candidate)
        if (collected.length >= maxCandidates) break
      }
    } catch (err) {
      consecutiveOsmErrors++
      console.warn(
        `[outreach/discovery] ${provider} query failed for "${pair.industry}" in "${pair.location}":`,
        err instanceof Error ? err.message : err,
      )
      errors.push(err)
    }
  }

  if (collected.length === 0 && errors.length > 0 && errors.length === pairs.length) {
    const firstErr = errors[0]
    throw firstErr instanceof Error ? firstErr : new Error('All discovery queries failed')
  }

  return collected.slice(0, maxCandidates)
}
