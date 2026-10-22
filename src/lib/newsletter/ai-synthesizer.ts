import 'server-only'

import type { CrawledPage } from './site-crawler'

const AGENCY_NAME = 'Virtue & Co. Webworks'
const AGENCY_DOMAIN = 'virtuecowebworks.solutions'

export interface SynthesizedNewsletter {
  title: string
  subtitle: string
  date: string
  readTime: string
  contentHtml: string
  contentText: string
  ctaText: string
  ctaUrl: string
  coverImageUrl?: string
}

/**
 * Use Gemini REST API to synthesize a professional newsletter from crawled site content.
 * Falls back to a curated template issue if the API key is not set or request fails.
 */
export async function synthesizeNewsletter(
  pages: CrawledPage[],
  issueNumber?: number
): Promise<SynthesizedNewsletter> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey.startsWith('AIzaSy_fake') || apiKey.length < 20) {
    console.warn('[ai-synthesizer] GEMINI_API_KEY not configured — using curated fallback')
    return getCuratedFallback(issueNumber)
  }

  const pageContext = pages
    .map((p, i) => `Page ${i + 1}: ${p.title}\nURL: ${p.url}\nDescription: ${p.description}`)
    .join('\n\n')

  const now = new Date()
  const monthYear = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const prompt = `
You are the editorial director of "${AGENCY_NAME}", a boutique web engineering and digital product studio.
Your task is to write a weekly editorial newsletter for business owners and founders — our ideal subscribers.

Today is ${monthYear}. We've scanned our website and found this content:

${pageContext}

Write a newsletter that:
1. Has a compelling, specific headline (not generic — tie it to a real business problem our audience faces)
2. Delivers ONE high-value insight or practical tip related to our services or the pages above
3. Uses a confident, authoritative-but-warm editorial voice — think Harvard Business Review meets Apple design philosophy
4. Is 180-250 words in the main body
5. Ends with a clear call to action linked to one of the pages above
6. Never sounds like marketing copy — it must feel like genuine editorial advice

Return ONLY valid JSON (no markdown code fences) matching this schema exactly:
{
  "title": "The newsletter article headline",
  "subtitle": "One sentence that teases the value inside (shown in email preview)",
  "ctaText": "2-5 word button label",
  "ctaUrl": "https://${AGENCY_DOMAIN}/...",
  "contentHtml": "The article body as HTML. Use <p> tags. You may use one <div> block quote for a key insight. Keep all inline styles minimal.",
  "contentText": "Plain text version of the article body"
}
`.trim()

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    })

    if (!res.ok) {
      throw new Error(`Gemini API returned ${res.status}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const json = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(json)

    return {
      title: parsed.title,
      subtitle: parsed.subtitle,
      date: monthYear,
      readTime: '3 min read',
      contentHtml: parsed.contentHtml,
      contentText: parsed.contentText,
      ctaText: parsed.ctaText,
      ctaUrl: parsed.ctaUrl,
    }
  } catch (err) {
    console.error('[ai-synthesizer] Gemini failed, using curated fallback:', err)
    return getCuratedFallback(issueNumber)
  }
}

function getCuratedFallback(issueNumber = 0): SynthesizedNewsletter {
  const now = new Date()
  const monthYear = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const issues: SynthesizedNewsletter[] = [
    {
      title: 'Why 1-Second Page Delays Cut Online Enquiries by 20%',
      subtitle: 'What every business owner needs to know about website speed and mobile bounce rates.',
      date: monthYear,
      readTime: '3 min read',
      contentHtml: `
        <p style="margin:0 0 14px;">Most small business websites are bogged down by oversized images, heavy third-party tracking scripts, and outdated CMS plugins. While your site might seem fast on office WiFi, mobile visitors on cellular connections experience frustrating pauses.</p>
        <p style="margin:0 0 14px;"><strong>The data is clear:</strong> Google research shows that when a mobile page load time increases from 1 second to 3 seconds, the probability of a visitor leaving spikes by 32%. By 5 seconds, that number leaps to 90%.</p>
        <div style="background:rgba(220,170,40,0.07);border-left:3px solid #DCAA28;padding:14px 18px;margin:18px 0;border-radius:0 8px 8px 0;">
          <strong style="color:#DCAA28;">Three speed upgrades you can action this week:</strong>
          <ol style="margin:10px 0 0;padding-left:20px;color:#94A3B8;">
            <li style="margin-bottom:6px;">Convert all PNG/JPEG images to modern WebP or AVIF format.</li>
            <li style="margin-bottom:6px;">Remove inactive analytics trackers, chat widgets, and unused plugins.</li>
            <li>Deploy behind a global CDN like Vercel Edge or Cloudflare.</li>
          </ol>
        </div>
        <p style="margin:0;">At ${AGENCY_NAME}, every website we ship scores 95–100 on Google PageSpeed Insights. Reply to this email for a free 5-point performance audit on your current site.</p>
      `,
      contentText: `Most small business websites are bogged down by oversized images, heavy tracking scripts, and outdated plugins. Google research shows that 1 to 3 second delays increase visitor bounce rate by 32%.\n\nThree speed upgrades:\n1. Convert images to WebP/AVIF\n2. Remove unused plugins and trackers\n3. Serve from a global edge CDN\n\nReply for a free performance audit.`,
      ctaText: 'Request a Free Audit',
      ctaUrl: `https://${AGENCY_DOMAIN}/contact`,
    },
    {
      title: 'The Hidden Cost of Hourly Billing in Agency Projects',
      subtitle: 'How guaranteed fixed-price scoping protects founders from runaway invoices.',
      date: monthYear,
      readTime: '3 min read',
      contentHtml: `
        <p style="margin:0 0 14px;">Traditional agencies love hourly billing because the client bears all the financial risk. When a project hits unexpected complexity, the agency invoices for more hours. You end up with an open-ended bill and no recourse.</p>
        <div style="background:rgba(212,175,55,0.08);border-left:3px solid #D4AF37;padding:14px 18px;margin:18px 0;border-radius:0 8px 8px 0;">
          <strong style="color:#D4AF37;">The ${AGENCY_NAME} difference:</strong> Before any code is written, you receive a fully itemised scope of work with a single, binding price and a fixed delivery deadline. If it takes longer, that's our responsibility — not yours.
        </div>
        <p style="margin:0;">This model aligns our incentives with yours: we ship fast and clean, because that's how we remain profitable — and you always know exactly what you're paying.</p>
      `,
      contentText: `Traditional agencies bill hourly — meaning you absorb all the financial risk. ${AGENCY_NAME} operates on guaranteed fixed pricing. Before code is written, you get an itemised scope with a binding price and delivery deadline.\n\nReady for a predictable project?`,
      ctaText: 'Get a Fixed-Price Quote',
      ctaUrl: `https://${AGENCY_DOMAIN}/contact`,
    },
  ]

  return issues[issueNumber % issues.length]
}
