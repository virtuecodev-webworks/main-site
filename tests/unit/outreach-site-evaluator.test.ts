import { describe, expect, it, vi } from 'vitest'
import {
  evaluateWebsite,
  extractPublicEmails,
  normalizeWebsiteUrl,
} from '@/lib/outreach/site-evaluator'
import { siteIssueSchema } from '@/lib/outreach/validation'
import type { DiscoveredBusiness } from '@/lib/outreach/types'

function makeBusiness(overrides: Partial<DiscoveredBusiness> = {}): DiscoveredBusiness {
  return {
    businessName: 'Harbor Bakery',
    industry: 'bakery',
    location: 'Austin, TX',
    websiteUrl: 'https://harborbakery.example',
    contactEmail: null,
    sourceProvider: 'seed',
    ...overrides,
  }
}

function htmlResponse(html: string, opts: { status?: number; url?: string } = {}): Response {
  const res = new Response(html, {
    status: opts.status ?? 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
  if (opts.url) {
    Object.defineProperty(res, 'url', { value: opts.url })
  }
  return res
}

describe('normalizeWebsiteUrl', () => {
  it('accepts valid URLs and rejects invalid or non-HTTP schemes', () => {
    expect(normalizeWebsiteUrl('harborbakery.com')).toBe('https://harborbakery.com/')
    expect(normalizeWebsiteUrl('http://example.org/about')).toBe('http://example.org/about')
    expect(normalizeWebsiteUrl('')).toBeNull()
    expect(normalizeWebsiteUrl('not a url')).toBeNull()
    expect(normalizeWebsiteUrl('ftp://files.example.com')).toBeNull()
    expect(normalizeWebsiteUrl('mailto:hello@example.com')).toBeNull()
  })
})

describe('evaluateWebsite', () => {
  it('flags missing or unparseable website URLs as no_website (score 90)', async () => {
    const fetchMock = vi.fn<typeof fetch>()

    for (const badUrl of [null, '', '   ', 'not-a-domain', 'ftp://bad.example']) {
      const result = await evaluateWebsite(
        makeBusiness({ websiteUrl: badUrl, contactEmail: 'Owner@HarborBakery.com' }),
        30,
        { fetchFn: fetchMock },
      )

      expect(result.hasWebsite).toBe(false)
      expect(result.issueScore).toBe(90)
      expect(result.qualified).toBe(true)
      expect(result.issues).toHaveLength(1)
      expect(result.issues[0].code).toBe('no_website')
      expect(result.extractedEmail).toBe('owner@harborbakery.com')
      expect(siteIssueSchema.safeParse(result.issues[0]).success).toBe(true)
    }

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('flags unreachable sites when fetch rejects or times out', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error('ETIMEDOUT'))
    let tick = 0
    const now = () => (tick++ === 0 ? 1000 : 2250)

    const result = await evaluateWebsite(makeBusiness(), 30, { fetchFn: fetchMock, now })

    expect(result.hasWebsite).toBe(true)
    expect(result.issueScore).toBe(80)
    expect(result.qualified).toBe(true)
    expect(result.ttfbMs).toBe(1250)
    expect(result.issues[0].code).toBe('unreachable')
    expect(siteIssueSchema.safeParse(result.issues[0]).success).toBe(true)
  })

  it('flags HTTP 4xx/5xx responses with http_error', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(htmlResponse('<html><body>Not Found</body></html>', { status: 404, url: 'https://harborbakery.example' }))

    const result = await evaluateWebsite(makeBusiness(), 30, {
      fetchFn: fetchMock,
      checkContactFallback: false,
    })

    expect(result.httpStatus).toBe(404)
    expect(result.issues.some((i) => i.code === 'http_error')).toBe(true)
    expect(result.qualified).toBe(true)
  })

  it('flags no_https when finalUrl stays HTTP, and does not flag when redirected to HTTPS', async () => {
    const healthyBody = `<html><head><title>Harbor Bakery</title><meta name="description" content="Fresh artisan bread daily in Austin Texas."><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${'Fresh bread and pastries baked daily in Austin. '.repeat(6)}</body></html>`

    const httpFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      htmlResponse(healthyBody, { status: 200, url: 'http://harborbakery.example/' }),
    )
    const httpRes = await evaluateWebsite(
      makeBusiness({ websiteUrl: 'http://harborbakery.example' }),
      20,
      { fetchFn: httpFetch, checkContactFallback: false, now: () => 100 },
    )
    expect(httpRes.issues.some((i) => i.code === 'no_https')).toBe(true)

    const redirectFetch = vi.fn<typeof fetch>().mockResolvedValueOnce(
      htmlResponse(healthyBody, { status: 200, url: 'https://harborbakery.example/' }),
    )
    const redirectRes = await evaluateWebsite(
      makeBusiness({ websiteUrl: 'http://harborbakery.example' }),
      20,
      { fetchFn: redirectFetch, checkContactFallback: false, now: () => 100 },
    )
    expect(redirectRes.issues.some((i) => i.code === 'no_https')).toBe(false)
    expect(redirectRes.issueScore).toBe(0)
    expect(redirectRes.qualified).toBe(false)
  })

  it('flags slow_ttfb when TTFB exceeds 2500ms', async () => {
    const healthyBody = `<html><head><title>Harbor Bakery</title><meta content="Fresh artisan bread daily in Austin." name="description"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${'Artisan sourdough and coffee in downtown Austin. '.repeat(5)}</body></html>`
    let call = 0
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      htmlResponse(healthyBody, { status: 200, url: 'https://harborbakery.example/' }),
    )

    const result = await evaluateWebsite(makeBusiness(), 15, {
      fetchFn: fetchMock,
      now: () => (call++ === 0 ? 1000 : 4200),
      checkContactFallback: false,
    })

    expect(result.ttfbMs).toBe(3200)
    expect(result.issues.map((i) => i.code)).toEqual(['slow_ttfb'])
    expect(result.qualified).toBe(true)
  })

  it('detects missing SEO meta, missing viewport, legacy builder, outdated copyright, and thin content', async () => {
    const legacyHtml = `
      <html>
        <head>
          <meta name="generator" content="Wix.com Website Builder" />
        </head>
        <body>
          <p>Under construction. © 2018 Harbor Bakery</p>
        </body>
      </html>
    `
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      htmlResponse(legacyHtml, { status: 200, url: 'https://harborbakery.wixsite.com/home' }),
    )

    const result = await evaluateWebsite(
      makeBusiness({ websiteUrl: 'https://harborbakery.wixsite.com/home' }),
      30,
      {
        fetchFn: fetchMock,
        now: () => Date.UTC(2026, 0, 1),
        currentYear: 2026,
        checkContactFallback: false,
      },
    )

    const codes = result.issues.map((i) => i.code)
    expect(codes).toContain('missing_title')
    expect(codes).toContain('missing_meta_description')
    expect(codes).toContain('missing_viewport')
    expect(codes).toContain('legacy_builder')
    expect(codes).toContain('thin_content')
    expect(result.issueScore).toBeGreaterThanOrEqual(30)
    expect(result.issueScore).toBeLessThanOrEqual(100)
    expect(result.qualified).toBe(true)

    const legacyIssue = result.issues.find((i) => i.code === 'legacy_builder')
    expect(legacyIssue?.detail).toContain('Outdated copyright year (2018)')

    for (const issue of result.issues) {
      expect(siteIssueSchema.safeParse(issue).success).toBe(true)
    }
  })

  it('filters noise emails and falls back to same-origin /contact page when homepage lacks an email', async () => {
    const homepageHtml = `
      <html>
        <head>
          <title>Harbor Bakery</title>
          <meta name="description" content="Fresh bread in Austin">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <img src="hero@2x.png" />
          <p>Do not email noreply@harborbakery.example or abc@sentry.io or foo@wixpress.com.</p>
          <a href="/contact-us">Contact</a>
          ${'Freshly baked sourdough and pastries in Austin. '.repeat(5)}
        </body>
      </html>
    `
    const contactHtml = `
      <html>
        <body>
          <a href="mailto:hello%40harborbakery.example">Email Us</a>
          <p>Or reach sales@externalpartner.com</p>
        </body>
      </html>
    `

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        htmlResponse(homepageHtml, { status: 200, url: 'https://harborbakery.example/' }),
      )
      .mockResolvedValueOnce(
        htmlResponse(contactHtml, { status: 200, url: 'https://harborbakery.example/contact-us' }),
      )

    const result = await evaluateWebsite(makeBusiness(), 30, {
      fetchFn: fetchMock,
      now: () => 1000,
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[1][0])).toBe('https://harborbakery.example/contact-us')
    expect(result.extractedEmail).toBe('hello@harborbakery.example')
  })

  it('extractPublicEmails prioritizes same-domain and contact prefixes over generic emails', () => {
    const html = `
      <p>support@other.com, admin@harborbakery.example, info@harborbakery.example, a1b2c3d4e5f6a1b2c3d4e5f6@harborbakery.example, test@example.com</p>
    `
    expect(extractPublicEmails(html, 'www.harborbakery.example')).toEqual([
      'info@harborbakery.example',
      'admin@harborbakery.example',
      'support@other.com',
    ])
  })

  it('extractPublicEmails extracts email from schema.org JSON-LD microdata', () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Luxury London Architects",
              "email": "contact@londonarchitects.example"
            }
          </script>
        </head>
      </html>
    `
    expect(extractPublicEmails(html, 'londonarchitects.example')).toEqual([
      'contact@londonarchitects.example',
    ])
  })
})
