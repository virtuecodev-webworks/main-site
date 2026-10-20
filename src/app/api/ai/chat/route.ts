import { NextResponse } from 'next/server'
import { AGENCY } from '@/lib/constants'
import { AGENCY_SERVICES } from '@/lib/packages'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const STUDIO_SYSTEM_PROMPT = `
You are the Virtue & Co. Webworks Senior AI Advisor.
Virtue & Co. Webworks (virtuecowebworks.solutions) is a productized web engineering studio and verified digital agency.
Our mission: Deliver high-performance, bespoke web development on fixed turnaround times with zero freelance middlemen.

Core Service Offerings & Packages (USD $ Only):
1. Custom Next.js 16 Web Applications:
   - Starter ($120, 5 days delivery): High-converting MVP or single-page app, Tailwind v4, 100/100 Lighthouse performance.
   - Business ($350, 10 days delivery): Full multi-page web platform, database & CMS integration, auth portal.
   - Enterprise ($750, 21 days delivery): Full SaaS architecture, multi-tenant database, real-time collaboration.

2. WordPress Core & Performance:
   - Starter ($95, 3 days delivery): Speed audit, Core Web Vitals optimization, database cleanup.
   - Business ($260, 7 days delivery): Custom lightweight theme, Gutenberg block development, zero bloat.
   - Enterprise ($550, 14 days delivery): Headless WordPress with Next.js frontend, WooCommerce integration.

3. Wix & No-Code Modernization:
   - Starter ($80, 4 days delivery): Wix site performance audit & UX optimization.
   - Business ($220, 8 days delivery): Full rebuild of Wix site into custom Next.js 16 web app.
   - Enterprise ($450, 15 days delivery): Complex multi-page Wix migration with custom CMS and dynamic data.

4. E-Commerce & Shopify Storefronts:
   - Starter ($160, 5 days delivery): Conversion-focused single product or boutique store setup.
   - Business ($390, 10 days delivery): Custom Shopify liquid theme or headless Next.js storefront with cart & checkout.
   - Enterprise ($790, 20 days delivery): Enterprise e-commerce with inventory sync, CRM, and global edge CDN.

Key Studio Guarantees:
- 100/100 Lighthouse performance SLA.
- Direct collaboration with senior engineers.
- Live milestone tracking in the Client Portal (/portal).
- Fixed prices in USD ($). No hidden hourly billings.
- Email: ${AGENCY.email} (or ${AGENCY.fallbackEmail})
- Website: https://${AGENCY.domain}

Instructions:
- Keep answers concise, confident, professional, and clear.
- Recommend the best package when asked about projects.
- Encourage users to click "Order Package" in the Services catalog or visit /contact for custom quotes.
`.trim()

function fallbackStudioResponse(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('price') || q.includes('cost') || q.includes('package') || q.includes('how much')) {
    return 'Our services are standardized into 3 accessible, transparent USD packages:\n\n' +
      '• **Custom Next.js Web Apps**: $120 (Starter) | $350 (Business) | $750 (Enterprise)\n' +
      '• **WordPress Development**: $95 (Starter) | $260 (Business) | $550 (Enterprise)\n' +
      '• **Wix Modernization**: $80 (Starter) | $220 (Business) | $450 (Enterprise)\n' +
      '• **Shopify E-Commerce**: $160 (Starter) | $390 (Business) | $790 (Enterprise)\n\n' +
      'You can explore feature breakdowns and order directly from our Services Catalog on the homepage!'
  }

  if (q.includes('timeline') || q.includes('how long') || q.includes('turnaround') || q.includes('delivery')) {
    return 'Every package has a guaranteed fixed delivery timeline:\n\n' +
      '• **Starter tiers**: 3 to 5 business days.\n' +
      '• **Business tiers**: 7 to 10 business days.\n' +
      '• **Enterprise tiers**: 14 to 21 business days.\n\n' +
      'Once submitted, you receive a live project reference (e.g. VCW-2026-XXXXXX) to monitor engineering progress in your Client Portal.'
  }

  if (q.includes('wix') || q.includes('migrate') || q.includes('rebuild')) {
    return 'Yes! We specialize in migrating slow or rigid Wix sites into high-speed Next.js 16 web applications. Our $250 Business tier handles a complete 1:1 rebuild with sub-second page loads, responsive mobile UI, and 100/100 Lighthouse scores.'
  }

  if (q.includes('order') || q.includes('hire') || q.includes('start') || q.includes('begin')) {
    return 'To start a project:\n\n1. Select your preferred tier in the **Services Catalog** on our homepage.\n2. Click **Order Package** to open the 3-step project brief.\n3. Fill in your project goals and contact details — our senior engineering team begins work immediately upon receipt!'
  }

  if (q.includes('contact') || q.includes('email') || q.includes('call') || q.includes('custom')) {
    return `For custom architecture or enterprise scopes outside our standard packages, you can reach our engineering leads directly at **${AGENCY.email}** or submit a custom inquiry on our Contact page (/contact).`
  }

  return 'Virtue & Co. Webworks delivers bespoke web applications, WordPress speed engineering, Wix rebuilds, and Shopify storefronts with fixed delivery guarantees. How can we help your business today? Feel free to ask about our packages, timelines, or tech stack!'
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required.' }, { status: 400 })
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
    const apiKey = process.env.GEMINI_API_KEY

    // If Gemini API Key is configured, query Gemini 1.5 Flash
    if (apiKey && !apiKey.startsWith('AIzaSy_fake') && apiKey.length > 20) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
        
        const contents = [
          { role: 'user', parts: [{ text: STUDIO_SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood. I am the Virtue & Co. Webworks Studio AI Advisor. Ready.' }] },
          ...messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
        ]

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        })

        if (geminiRes.ok) {
          const data = await geminiRes.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            return NextResponse.json({ reply: text })
          }
        }
      } catch (geminiError) {
        console.warn('[gemini-api] fallback to studio knowledge base:', geminiError)
      }
    }

    // Fallback: intelligent studio rule engine
    const reply = fallbackStudioResponse(lastUserMessage)
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[ai-chat-error]', error)
    return NextResponse.json(
      { reply: 'Our studio engineers are available to review your requirements directly. Please feel free to check our services catalog or contact us at virtueco.dev@gmail.com.' },
      { status: 200 }
    )
  }
}
