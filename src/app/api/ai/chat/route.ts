import { NextResponse } from 'next/server'
import { AGENCY } from '@/lib/constants'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const STUDIO_SYSTEM_PROMPT = `
You are the Virtue & Co. Webworks Senior AI Advisor.
Virtue & Co. Webworks (virtuecowebworks.solutions) is a productized web engineering studio and verified digital agency.
Our mission: Deliver high-performance, bespoke web development on fixed turnaround times with zero freelance middlemen.

Core Service Offerings & Packages (USD Base Pricing; settles in USD, GBP, EUR, or NGN):
1. Custom Next.js 16 Web Applications:
   - Starter ($150, 5 business days): Focused landing page or MVP, Tailwind v4, 90+ Core Web Vitals optimization target.
   - Business ($450, 14 business days): Full multi-page web platform, database & CMS integration, auth portal.
   - Enterprise ($950, 21 business days): Full-stack architecture, RLS database, client portal, workflow automation.

2. WordPress Core & Performance:
   - Starter ($150, 5 business days): Lightweight custom theme, Gutenberg block layout, SEO & caching setup.
   - Business ($350, 10 business days): Up to 7 custom layouts, custom post types, 90+ Core Web Vitals target.
   - Enterprise ($600, 18 business days): High-volume editorial or WooCommerce architecture with caching & staging.

3. Wix & No-Code Modernization:
   - Starter ($150, 5 business days): Custom Wix Studio responsive one-pager & lead capture setup.
   - Business ($300, 10 business days): 5-page Wix Studio presence with CMS collections & bookings.
   - Enterprise ($500, 14 business days): Wix Studio with Velo custom JavaScript logic & member portal.

4. E-Commerce & Multi-Currency Storefronts:
   - Starter ($250, 7 business days): Up to 15 products with card & Apple Pay checkout.
   - Business ($450, 14 business days): Multi-currency store (USD, GBP, EUR, NGN) with up to 60 products & coupons.
   - Enterprise ($650, 21 business days): Custom storefront with recurring billing, webhooks, and shipping rules.

Key Studio Standards:
- Core Web Vitals optimization (90+ target on delivered pages, excluding unoptimized third-party embeds).
- Direct collaboration with senior engineers.
- Live milestone tracking in the Client Portal (/portal).
- Written fixed-price quote upfront; timelines start after scope sign-off and content handover.
- Email: ${AGENCY.email} (or ${AGENCY.fallbackEmail})
- Website: https://${AGENCY.domain}

Instructions:
- Keep answers concise, confident, professional, and clear.
- Recommend the best package when asked about projects.
- Encourage users to click "Select" in the Services Catalog or visit /contact#quote-form for custom quotes.
`.trim()

function fallbackStudioResponse(query: string): string {
  const q = query.toLowerCase()

  if (q.includes('price') || q.includes('cost') || q.includes('package') || q.includes('how much')) {
    return 'Projects start at $150 USD (or equivalent in GBP, EUR, and NGN). Here is our standard package ladder:\n\n' +
      '• **Custom Next.js Web Apps**: $150 (Starter) | $450 (Business) | $950 (Enterprise)\n' +
      '• **WordPress Development**: $150 (Starter) | $350 (Business) | $600 (Enterprise)\n' +
      '• **Wix Studio Sites**: $150 (Starter) | $300 (Business) | $500 (Enterprise)\n' +
      '• **E-Commerce Stores**: $250 (Starter) | $450 (Business) | $650 (Enterprise)\n\n' +
      'You can explore feature breakdowns on /services or request an exact fixed quote at /contact#quote-form.'
  }

  if (q.includes('timeline') || q.includes('how long') || q.includes('turnaround') || q.includes('delivery')) {
    return 'Timelines start once scope and brand content are confirmed:\n\n' +
      '• **Starter tiers**: 5 to 7 business days.\n' +
      '• **Business tiers**: 10 to 14 business days.\n' +
      '• **Enterprise tiers**: 14 to 21 business days.\n\n' +
      'Every launch also includes 30 days of post-launch bug-fix support.'
  }

  if (q.includes('wix') || q.includes('migrate') || q.includes('rebuild')) {
    return 'Yes! We migrate slow or rigid Wix sites into custom Next.js 16 web applications (from $450 Business tier) or build clean Wix Studio sites (from $150 Starter tier), targeting 90+ Core Web Vitals on delivered pages.'
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
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`
        
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
