import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildFallbackPitch, generatePitch } from '@/lib/outreach/pitch-generator'
import { renderOutreachPitchEmail } from '@/lib/email/templates'
import type { DiscoveredBusiness, SiteEvaluationResult } from '@/lib/outreach/types'

const mockSendMail = vi.fn()

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}))

const sampleBusiness: DiscoveredBusiness = {
  businessName: 'Harbor Bakery',
  industry: 'bakery',
  location: 'Austin, TX',
  websiteUrl: 'http://harborbakery.example',
  contactEmail: 'hello@harborbakery.example',
  sourceProvider: 'seed',
}

const sampleEvaluation: SiteEvaluationResult = {
  hasWebsite: true,
  qualified: true,
  issueScore: 65,
  issues: [
    {
      code: 'no_https',
      label: 'Site is not served over HTTPS',
      severity: 'high',
      points: 25,
      detail: 'http://harborbakery.example',
    },
    {
      code: 'missing_viewport',
      label: 'Missing mobile viewport meta tag',
      severity: 'high',
      points: 25,
    },
    {
      code: 'legacy_builder',
      label: 'Outdated design or legacy website builder footprint',
      severity: 'medium',
      points: 25,
      detail: 'Outdated copyright year (2018)',
    },
  ],
  extractedEmail: 'hello@harborbakery.example',
  httpStatus: 200,
  ttfbMs: 320,
  finalUrl: 'http://harborbakery.example',
  title: 'Harbor Bakery',
}

afterEach(() => {
  vi.unstubAllEnvs()
  mockSendMail.mockReset()
})

describe('generatePitch', () => {
  it('calls Gemini REST API with E2E-compatible prompt and parses fenced JSON', async () => {
    const geminiPayload = {
      subject: "quick question regarding Harbor Bakery's client inquiries",
      headline: "Optimizing Harbor Bakery's mobile inquiry flow",
      greeting: 'Hi Harbor Bakery team,',
      opening: "I was recently reviewing Harbor Bakery's online presence and noticed friction points where prospective clients drop off before reaching out.",
      auditBullets: [
        'Security warnings appear when visitors land on your site, creating hesitation for clients looking to order.',
        'The viewing experience on modern mobile devices requires zooming or horizontal scrolling.',
      ],
      recommendedPackage: 'Bespoke Web Engineering & Mobile Experience Overhaul',
      ctaText: "Reply 'Yes' for Custom Breakdown",
      closing: 'Before our team puts together a custom visual breakdown and prototype, are you open to partnering with an outside engineering studio to upgrade this?\n\nIf you are, simply reply directly to this email with a quick "yes".\n\nWarm regards,\nGlory Adeniran · Lead Client Strategist\nVirtue & Co. Webworks',
    }

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: `\`\`\`json\n${JSON.stringify(geminiPayload)}\n\`\`\`` }],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await generatePitch(sampleBusiness, sampleEvaluation, {
      apiKey: 'AIzaSyMockE2ETestKey1234567890abcdef',
      model: 'gemini-2.0-flash',
      fetchImpl: fetchMock,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/v1beta/models/gemini-2.0-flash:generateContent')
    expect(init?.signal).toBeDefined()

    const body = JSON.parse(String(init?.body)) as {
      contents: Array<{ parts: Array<{ text: string }> }>
    }
    const promptText = body.contents[0].parts[0].text
    expect(promptText).toContain('Business Name: Harbor Bakery')
    expect(promptText.includes('contentHtml') && promptText.includes('contentText')).toBe(false)

    expect(result).toEqual({
      ...geminiPayload,
      model: 'gemini-2.0-flash',
    })
  })

  it('falls back deterministically when key is missing/fake or Gemini fails/malforms', async () => {
    const fetchMock = vi.fn<typeof fetch>()

    const noKeyPitch = await generatePitch(sampleBusiness, sampleEvaluation, {
      apiKey: '',
      fetchImpl: fetchMock,
    })
    expect(noKeyPitch.model).toBe('deterministic-fallback')
    expect(fetchMock).not.toHaveBeenCalled()

    const fakeKeyPitch = await generatePitch(sampleBusiness, sampleEvaluation, {
      apiKey: 'AIzaSy_fake_12345678901234567890',
      fetchImpl: fetchMock,
    })
    expect(fakeKeyPitch.model).toBe('deterministic-fallback')
    expect(fetchMock).not.toHaveBeenCalled()

    // HTTP 429
    fetchMock.mockResolvedValueOnce(new Response('rate limited', { status: 429 }))
    const rateLimited = await generatePitch(sampleBusiness, sampleEvaluation, {
      apiKey: 'AIzaSyMockE2ETestKey1234567890abcdef',
      fetchImpl: fetchMock,
    })
    expect(rateLimited.model).toBe('deterministic-fallback')

    // Malformed JSON
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Sure! Here is JSON: {broken_json' }] } }],
        }),
        { status: 200 },
      ),
    )
    const malformed = await generatePitch(sampleBusiness, sampleEvaluation, {
      apiKey: 'AIzaSyMockE2ETestKey1234567890abcdef',
      fetchImpl: fetchMock,
    })
    expect(malformed.model).toBe('deterministic-fallback')

    // Zod schema validation failure (empty auditBullets)
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      subject: 'Valid subject',
                      headline: 'Valid headline',
                      greeting: 'Hi team,',
                      opening: 'This opening is long enough to pass min length.',
                      auditBullets: [],
                      recommendedPackage: 'Starter ($120)',
                      ctaText: 'Book Call',
                      closing: 'Regards',
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200 },
      ),
    )
    const invalidSchema = await generatePitch(sampleBusiness, sampleEvaluation, {
      apiKey: 'AIzaSyMockE2ETestKey1234567890abcdef',
      fetchImpl: fetchMock,
    })
    expect(invalidSchema.model).toBe('deterministic-fallback')
  })
})

describe('buildFallbackPitch', () => {
  it('tailors capability and bullets for businesses without a website vs retail/e-commerce without quoting prices', () => {
    const noSitePitch = buildFallbackPitch(
      {
        businessName: 'Apex Consulting',
        industry: 'consulting',
        location: 'Dallas, TX',
        websiteUrl: null,
        sourceProvider: 'osm',
      },
      {
        hasWebsite: false,
        qualified: true,
        issueScore: 90,
        issues: [{ code: 'no_website', label: 'No website URL listed', severity: 'critical', points: 90 }],
        extractedEmail: null,
        httpStatus: null,
        ttfbMs: null,
        finalUrl: null,
        title: null,
      },
    )
    expect(noSitePitch.subject).toBe("quick question regarding Apex Consulting's online presence")
    expect(noSitePitch.recommendedPackage).toContain('Custom Brand Web Presence')
    expect(noSitePitch.recommendedPackage).not.toContain('$')
    expect(noSitePitch.auditBullets[0]).toContain('Apex Consulting')
    expect(noSitePitch.closing).toContain('Glory Adeniran · Lead Client Strategist')
    expect(noSitePitch.closing).not.toContain('simply reply directly')

    const ecomPitch = buildFallbackPitch(
      {
        businessName: 'Velvet Boutique',
        industry: 'retail store',
        location: 'Lagos',
        websiteUrl: 'https://velvet.example',
        sourceProvider: 'osm',
      },
      sampleEvaluation,
    )
    expect(ecomPitch.subject).toBe("quick question regarding Velvet Boutique's client inquiries")
    expect(ecomPitch.recommendedPackage).toBe('Bespoke E-Commerce Architecture & Conversion Optimization')
    expect(ecomPitch.recommendedPackage).not.toContain('$')
    expect(ecomPitch.auditBullets.join(' ')).not.toMatch(/\bms\b|ttfb|copyright \d{4}/i)
    expect(ecomPitch.closing).toContain('Glory Adeniran · Lead Client Strategist')
    expect(ecomPitch.closing).not.toContain('simply reply directly')
  })
})

describe('renderOutreachPitchEmail & sendEmail header pass-through', () => {
  it('renders escaped HTML and structured plaintext with [DRY RUN] prefix without double-prefixing', async () => {
    const pitch = buildFallbackPitch(sampleBusiness, sampleEvaluation)
    pitch.headline = 'Redesign <script>alert(1)</script> Audit'

    const rendered = await renderOutreachPitchEmail({
      pitch,
      businessName: 'Harbor <Bakery>',
      websiteUrl: 'http://harborbakery.example',
      unsubscribeUrl: 'https://virtuecowebworks.solutions/api/outreach/unsubscribe?email=a%40b.com&token=tok',
      isDryRun: true,
    })

    expect(rendered.subject.startsWith('[DRY RUN] ')).toBe(true)
    expect(rendered.html).not.toContain('<script>alert(1)</script>')
    expect(rendered.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(rendered.html).toContain('Dry-Run Test Preview')
    expect(rendered.text).toContain('Unsubscribe: https://virtuecowebworks.solutions/api/outreach/unsubscribe')

    const alreadyPrefixed = await renderOutreachPitchEmail({
      pitch: { ...pitch, subject: '[DRY RUN] Existing subject' },
      businessName: 'Harbor Bakery',
      unsubscribeUrl: 'https://virtuecowebworks.solutions/api/outreach/unsubscribe?email=a%40b.com&token=tok',
      isDryRun: true,
    })
    expect(alreadyPrefixed.subject).toBe('[DRY RUN] Existing subject')
  })

  it('forwards optional headers like List-Unsubscribe to nodemailer sendMail', async () => {
    vi.stubEnv('BREVO_SMTP_HOST', 'smtp-relay.brevo.com')
    vi.stubEnv('BREVO_SMTP_LOGIN', 'user@brevo.test')
    vi.stubEnv('BREVO_SMTP_KEY', 'secret-key')
    mockSendMail.mockResolvedValueOnce({ messageId: '<msg-1@brevo.test>' })

    const { sendEmail } = await import('@/lib/email')
    const result = await sendEmail({
      to: 'lead@acme.example',
      email: { subject: 'Hello', html: '<p>Hi</p>', text: 'Hi' },
      headers: {
        'List-Unsubscribe': '<https://virtuecowebworks.solutions/api/outreach/unsubscribe?email=lead%40acme.example&token=abc>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    expect(result).toEqual({ ok: true, id: '<msg-1@brevo.test>' })
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'lead@acme.example',
        headers: {
          'List-Unsubscribe': '<https://virtuecowebworks.solutions/api/outreach/unsubscribe?email=lead%40acme.example&token=abc>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    )
  })
})
