import 'server-only'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://virtuecowebworks.solutions'

export interface CrawledPage {
  url: string
  title: string
  description: string
  lastModified?: string
  section: string
}

/**
 * Crawl the live sitemap and extract recently-updated pages with metadata.
 * Falls back to curated pages if sitemap is unreachable.
 */
export async function crawlSiteContent(): Promise<CrawledPage[]> {
  try {
    const sitemapUrl = `${SITE_URL}/sitemap.xml`
    const res = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'VCW-Newsletter-Bot/1.0' },
      next: { revalidate: 0 },
    })

    if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`)

    const xml = await res.text()
    const urls = parseSitemapUrls(xml)

    // Fetch metadata for each page (in parallel, max 8)
    const pages = await Promise.allSettled(
      urls.slice(0, 8).map((url) => fetchPageMeta(url))
    )

    const crawled = pages
      .filter((r): r is PromiseFulfilledResult<CrawledPage> => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((p) => p.title && p.description)

    return crawled.length > 0 ? crawled : getFallbackPages()
  } catch (err) {
    console.error('[site-crawler] Failed, using fallback pages:', err)
    return getFallbackPages()
  }
}

function parseSitemapUrls(xml: string): string[] {
  const matches = xml.match(/<loc>(.*?)<\/loc>/g) ?? []
  return matches
    .map((m) => m.replace(/<\/?loc>/g, '').trim())
    .filter((url) => {
      // Skip non-English duplicates and API routes
      const u = new URL(url)
      const segments = u.pathname.split('/').filter(Boolean)
      const hasLocalePrefix = ['fr', 'es', 'de', 'ar'].includes(segments[0])
      return !hasLocalePrefix && !url.includes('/api/')
    })
}

async function fetchPageMeta(url: string): Promise<CrawledPage> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'VCW-Newsletter-Bot/1.0' },
    signal: AbortSignal.timeout(5000),
    next: { revalidate: 0 },
  })

  const html = await res.text()

  const title =
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() ??
    'Untitled'

  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim() ??
    ''

  const pathname = new URL(url).pathname
  const section = pathname.split('/').filter(Boolean)[0] ?? 'home'

  return { url, title, description, section }
}

function getFallbackPages(): CrawledPage[] {
  return [
    {
      url: `${SITE_URL}/services`,
      title: 'Bespoke Web Engineering Services',
      description: 'From high-performance marketing sites to multi-locale client portals, Virtue & Co. engineers custom solutions with guaranteed fixed pricing and delivery timelines.',
      section: 'services',
    },
    {
      url: `${SITE_URL}/portfolio`,
      title: 'Client Portfolio — Engineered for Performance',
      description: 'Browse case studies of real businesses that have transformed their digital presence, speed, and revenue through bespoke web engineering.',
      section: 'portfolio',
    },
    {
      url: `${SITE_URL}/contact`,
      title: 'Start Your Project',
      description: 'Book a free senior engineer consultation. Receive a fully scoped proposal with itemised deliverables, timeline, and a guaranteed fixed price within 48 hours.',
      section: 'contact',
    },
  ]
}
