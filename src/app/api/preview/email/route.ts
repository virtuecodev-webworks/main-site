import { NextResponse, type NextRequest } from 'next/server'
import {
  signupOtpEmail,
  welcomeEmail,
  newsletterConfirmEmail,
  resetOtpEmail,
  paymentReceiptEmail,
  enquiryClientEmail,
  enquiryAdminEmail,
  newsletterEmail,
} from '@/lib/email/templates'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'signup'

  let email

  switch (type) {
    case 'signup':
      email = await signupOtpEmail({ code: '842 915', name: 'Alexander Wright' })
      break

    case 'welcome':
      email = await welcomeEmail({ name: 'Victoria Hastings' })
      break

    case 'newsletter-confirm':
      email = await newsletterConfirmEmail({ email: 'victoria@example.com' })
      break

    case 'reset':
      email = await resetOtpEmail({ code: '593 174', name: 'Alexander Wright' })
      break

    case 'receipt':
      email = await paymentReceiptEmail({
        reference: 'VCW-2026-9842',
        providerTxId: 'flw_tx_88192044',
        amount: 3500,
        currency: 'USD',
        customerName: 'Victoria Hastings',
        customerEmail: 'victoria@example.com',
        purpose: '50% Milestone Deposit — Bespoke Web Platform',
        paidAt: 'October 21, 2026 at 15:45 UTC',
      })
      break

    case 'enquiry-client':
      email = await enquiryClientEmail({
        id: 'mock-id',
        name: 'Harrison Sterling',
        email: 'harrison@sterlingcapital.com',
        phone: '+1 (555) 392-1084',
        company: 'Sterling Capital Partners',
        service: 'Custom Next.js Web Platform',
        budget: '$5,000 – $10,000',
        timeline: '4–6 weeks',
        message: 'We are expanding our wealth management advisory firm and need an ultra-fast, bespoke client portal and marketing site. Must support multi-language and secure client document upload.',
        locale: 'en',
        source: 'contact_page',
        status: 'new',
        notified_at: null,
        created_at: new Date().toISOString(),
      })
      break

    case 'enquiry-admin':
      email = await enquiryAdminEmail(
        {
          id: 'mock-id',
          name: 'Harrison Sterling',
          email: 'harrison@sterlingcapital.com',
          phone: '+1 (555) 392-1084',
          company: 'Sterling Capital Partners',
          service: 'Custom Next.js Web Platform',
          budget: '$5,000 – $10,000',
          timeline: '4–6 weeks',
          message: 'We need a bespoke multilingual client portal and marketing site with document upload. Fast delivery preferred.',
          locale: 'en',
          source: 'contact_page',
          status: 'new',
          notified_at: null,
          created_at: new Date().toISOString(),
        },
        'English (UK)',
      )
      break

    case 'newsletter':
      email = await newsletterEmail({
        title: 'Architecting for Zero-Layout-Shift in Next.js 16',
        subtitle: 'How precision CSS containment and server components eliminate visual instability and achieve a 100/100 Core Web Vitals score.',
        date: 'October 2026',
        readTime: '4 min',
        coverImageUrl: 'https://virtuecowebworks.solutions/media/photos/studio.jpg',
        contentHtml: `
          <p style="margin:0 0 16px;">
            Cumulative Layout Shift (CLS) remains the most insidious UX flaw in modern corporate websites. When fonts flash, images load asynchronously without reserved aspect ratios, or dynamic widgets nudge paragraph blocks downward, user engagement drops by up to 28%.
          </p>
          <div style="border-left:3px solid #D4AF37;padding:12px 18px;background:rgba(212,175,55,0.08);border-radius:0 8px 8px 0;margin:20px 0;font-size:14.5px;line-height:1.6;color:#CBD5E1;">
            <strong style="color:#D4AF37;">Key Engineering Takeaway:</strong> Pre-calculating bounding boxes on the server and serving strict CSS aspect-ratio placeholders prevents layout recalculation passes entirely.
          </div>
          <p style="margin:0 0 16px;">
            In our latest benchmark across 40 bespoke client builds, moving from generic third-party CMS architectures to clean Next.js 16 server components reduced first-contentful-paint from 1.8s down to 340ms.
          </p>
        `,
        ctaText: 'Explore Engineering Case Studies',
        ctaUrl: 'https://virtuecowebworks.solutions/portfolio',
      })
      break

    default:
      email = await signupOtpEmail({ code: '842 915', name: 'Alexander Wright' })
      break
  }

  return new NextResponse(email.html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}
