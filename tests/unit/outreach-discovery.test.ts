import { describe, expect, it, vi } from 'vitest'
import { discoverBusinesses, resolveDiscoveryProvider } from '@/lib/outreach/discovery'
import type { OutreachCriteriaSnapshot } from '@/lib/outreach/types'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const baseCriteria: OutreachCriteriaSnapshot = {
  industries: ['bakery'],
  locations: ['Austin, TX'],
  keywords: ['artisan'],
  discovery_provider: 'auto',
  min_issue_score: 30,
}

describe('resolveDiscoveryProvider', () => {
  it('prefers google_places then serper then osm when provider is auto', () => {
    expect(
      resolveDiscoveryProvider('auto', {
        GOOGLE_PLACES_API_KEY: 'gp-key',
        SERPER_API_KEY: 'serper-key',
      }),
    ).toBe('google_places')

    expect(
      resolveDiscoveryProvider('auto', {
        GOOGLE_PLACES_API_KEY: '   ',
        SERPER_API_KEY: 'serper-key',
      }),
    ).toBe('serper')

    expect(
      resolveDiscoveryProvider('auto', {
        GOOGLE_PLACES_API_KEY: '',
        SERPER_API_KEY: '  ',
      }),
    ).toBe('osm')
  })

  it('respects explicit provider selection regardless of env keys', () => {
    expect(
      resolveDiscoveryProvider('osm', {
        GOOGLE_PLACES_API_KEY: 'gp-key',
      }),
    ).toBe('osm')
  })
})

describe('discoverBusinesses', () => {
  it('queries OSM Nominatim and Overpass, maps bbox and tags, and skips nameless elements', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse([
          {
            boundingbox: ['30.10', '30.50', '-97.90', '-97.60'],
            display_name: 'Austin, Texas',
          },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          elements: [
            {
              type: 'node',
              id: 123,
              lat: 30.26,
              lon: -97.74,
              tags: {
                name: 'Harbor Bakery',
                'contact:website': 'harborbakery.example.com',
                'contact:email': 'Hello@HarborBakery.com',
                'contact:phone': '+1 512-555-0199',
                'addr:housenumber': '101',
                'addr:street': 'Congress Ave',
                'addr:city': 'Austin',
                'addr:state': 'TX',
              },
            },
            {
              type: 'node',
              id: 124,
              tags: {
                amenity: 'bakery',
              },
            },
          ],
        }),
      )

    const results = await discoverBusinesses(baseCriteria, {
      fetchFn: fetchMock,
      env: {},
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [nomUrl, nomInit] = fetchMock.mock.calls[0]
    expect(String(nomUrl)).toContain('nominatim.openstreetmap.org/search')
    expect((nomInit?.headers as Record<string, string>)['User-Agent']).toContain(
      'VirtueCoWebworksOutreach',
    )

    const [overpassUrl, overpassInit] = fetchMock.mock.calls[1]
    expect(String(overpassUrl)).toBe('https://overpass-api.de/api/interpreter')
    const decodedBody = decodeURIComponent(String(overpassInit?.body))
    // Overpass bbox order must be (south,west,north,east)
    expect(decodedBody).toContain('(30.1,-97.9,30.5,-97.6)')

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      businessName: 'Harbor Bakery',
      industry: 'bakery',
      location: '101 Congress Ave, Austin, TX',
      websiteUrl: 'https://harborbakery.example.com/',
      contactEmail: 'hello@harborbakery.com',
      phone: '+1 512-555-0199',
      sourceProvider: 'osm',
      sourceExternalId: 'osm:node:123',
    })
  })

  it('uses Google Places API New when configured', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        places: [
          {
            id: 'place_abc',
            displayName: { text: 'Crest Dental Studio' },
            formattedAddress: '200 Main St, Austin, TX',
            websiteUri: 'https://crestdental.example',
            nationalPhoneNumber: '(512) 555-0100',
          },
        ],
      }),
    )

    const results = await discoverBusinesses(
      { ...baseCriteria, industries: ['dentist'], discovery_provider: 'google_places' },
      {
        fetchFn: fetchMock,
        env: { GOOGLE_PLACES_API_KEY: 'test-google-key' },
      },
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('https://places.googleapis.com/v1/places:searchText')
    const headers = init?.headers as Record<string, string>
    expect(headers['X-Goog-Api-Key']).toBe('test-google-key')
    expect(headers['X-Goog-FieldMask']).toContain('places.websiteUri')

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      businessName: 'Crest Dental Studio',
      websiteUrl: 'https://crestdental.example/',
      location: '200 Main St, Austin, TX',
      phone: '(512) 555-0100',
      sourceProvider: 'google_places',
      sourceExternalId: 'place_abc',
    })
  })

  it('uses Serper Places API when configured', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      jsonResponse({
        places: [
          {
            title: 'Beacon Plumbing',
            address: '55 Oak Rd, Dallas, TX',
            phoneNumber: '214-555-0144',
            website: 'http://beaconplumbing.example',
            cid: 'cid-99',
            category: 'Plumber',
          },
        ],
      }),
    )

    const results = await discoverBusinesses(
      { ...baseCriteria, industries: ['plumber'], locations: ['Dallas, TX'], discovery_provider: 'serper' },
      {
        fetchFn: fetchMock,
        env: { SERPER_API_KEY: 'test-serper-key' },
      },
    )

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toBe('https://google.serper.dev/places')
    expect((init?.headers as Record<string, string>)['X-API-KEY']).toBe('test-serper-key')
    expect(results[0]).toMatchObject({
      businessName: 'Beacon Plumbing',
      industry: 'Plumber',
      location: '55 Oak Rd, Dallas, TX',
      websiteUrl: 'http://beaconplumbing.example/',
      sourceProvider: 'serper',
      sourceExternalId: 'cid-99',
    })
  })

  it('throws descriptive error when explicit paid provider key is missing', async () => {
    await expect(
      discoverBusinesses(
        { ...baseCriteria, discovery_provider: 'google_places' },
        { env: {} },
      ),
    ).rejects.toThrow(/GOOGLE_PLACES_API_KEY/)

    await expect(
      discoverBusinesses(
        { ...baseCriteria, discovery_provider: 'serper' },
        { env: {} },
      ),
    ).rejects.toThrow(/SERPER_API_KEY/)
  })

  it('returns empty array when locations or targeting terms are empty', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    expect(
      await discoverBusinesses(
        { ...baseCriteria, locations: [] },
        { fetchFn: fetchMock, env: {} },
      ),
    ).toEqual([])
    expect(
      await discoverBusinesses(
        { ...baseCriteria, industries: [], keywords: [] },
        { fetchFn: fetchMock, env: {} },
      ),
    ).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('tolerates partial query failure across pairs, deduplicates, and enforces maxCandidates cap', async () => {
    const fetchMock = vi.fn<typeof fetch>()
    // Pair 1 fails
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'quota' }, 500))
    // Pair 2 succeeds with 3 items including duplicate
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        places: [
          { title: 'Shop One', website: 'https://one.example', cid: '1' },
          { title: 'Shop One Dup', website: 'https://one.example', cid: '1' },
          { title: 'Shop Two', website: 'https://two.example', cid: '2' },
          { title: 'Shop Three', website: 'https://three.example', cid: '3' },
        ],
      }),
    )

    const results = await discoverBusinesses(
      {
        industries: ['cafe', 'bakery'],
        locations: ['Austin, TX'],
        keywords: [],
        discovery_provider: 'serper',
        min_issue_score: 30,
      },
      {
        fetchFn: fetchMock,
        env: { SERPER_API_KEY: 'test-serper-key' },
        maxCandidates: 2,
      },
    )

    expect(results).toHaveLength(2)
    expect(results.map((r) => r.businessName)).toEqual(['Shop One', 'Shop Two'])
  })
})
