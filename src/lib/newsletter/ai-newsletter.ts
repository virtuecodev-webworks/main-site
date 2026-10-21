import 'server-only'

import { sendEmail } from '@/lib/email'
import { newsletterEmail, type NewsletterIssue } from '@/lib/email/templates'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const CURATED_NEWSLETTER_ISSUES: NewsletterIssue[] = [
  {
    title: 'Why 1-Second Page Delays Cut Online Inquiries by 20%',
    subtitle: 'What every business owner needs to know about website speed and mobile bounce rates.',
    date: 'October 2026',
    readTime: '3 min read',
    contentHtml: `
      <p style="margin:0 0 14px;">Most small business websites are bogged down by oversized images, heavy third-party tracking scripts, and outdated CMS plugins. While your site might seem to load okay on high-speed office WiFi, mobile visitors on cellular connections experience frustrating pauses.</p>
      <p style="margin:0 0 14px;"><strong>The data is clear:</strong> Google research shows that when a mobile page load time increases from 1 second to 3 seconds, the probability of a visitor leaving spikes by 32%. By 5 seconds, that number leaps to 90%.</p>
      <div style="background:#F4F4F5;border-left:4px solid #C5A059;padding:12px 18px;margin:18px 0;border-radius:4px;">
        <strong style="color:#18181B;">3 Quick Speed Upgrades You Can Do This Week:</strong>
        <ol style="margin:8px 0 0;padding-left:20px;color:#3F3F46;">
          <li>Convert all PNG/JPEG images into modern <code>WebP</code> or <code>AVIF</code> format.</li>
          <li>Remove inactive analytics trackers, chat widgets, and plugins that run on initial page load.</li>
          <li>Deploy behind a global content delivery network (CDN) like Vercel or Cloudflare.</li>
        </ol>
      </div>
      <p style="margin:0 0 14px;">At Virtue &amp; Co., every website we ship scores 95–100/100 on Google PageSpeed. If your site feels sluggish, reply to this email for a free 5-point performance audit.</p>
    `,
    contentText: `Most small business websites are bogged down by oversized images, heavy tracking scripts, and outdated plugins. Google data shows that 1 to 3 second delays increase visitor bounce rate by 32%.
    
3 Quick Speed Upgrades You Can Do This Week:
1. Convert images to modern WebP or AVIF.
2. Remove inactive plugins and unneeded trackers.
3. Serve your assets from a global edge CDN.

At Virtue & Co., every website we engineer scores 95-100 on Google PageSpeed. Reply to this email for a free performance audit.`,
    ctaText: 'Request a Free Speed Audit',
    ctaUrl: 'https://virtuecowebworks.solutions/contact',
  },
  {
    title: 'The Real Cost of Slow Checkouts in E-Commerce',
    subtitle: 'How frictionless payment routing and localized currencies lift international checkout completion.',
    date: 'November 2026',
    readTime: '4 min read',
    contentHtml: `
      <p style="margin:0 0 14px;">Cart abandonment isn't just a marketing problem — in over 40% of cases, it's a technical checkout friction problem.</p>
      <p style="margin:0 0 14px;">When international clients see foreign currencies or encounter cards failing due to fraud filters that don't recognize local banking methods (such as Apple Pay, Verve, or direct bank transfer), they abandon their purchase and never return.</p>
      <p style="margin:0 0 14px;">By providing localized currency settlement (USD, GBP, EUR, NGN) and clear instant receipts, our storefront clients experience an immediate 18–27% lift in completed customer purchases.</p>
    `,
    contentText: `Cart abandonment is frequently a technical checkout friction problem. When clients can't pay in their local currency or lack one-click Apple Pay, they drop off. Localized checkout settlement increases completion by up to 27%.`,
    ctaText: 'Explore Online Store Packages',
    ctaUrl: 'https://virtuecowebworks.solutions/services#ecommerce',
  },
  {
    title: 'Why Fixed-Price Scoping Beats Hourly Billing Every Time',
    subtitle: 'How upfront transparency protects founders from runaway agency invoices.',
    date: 'December 2026',
    readTime: '3 min read',
    contentHtml: `
      <p style="margin:0 0 14px;">Traditional agencies love hourly billing because the client bears all the risk. When a project hits technical roadblocks or takes longer than estimated, the agency simply invoices for more hours.</p>
      <p style="margin:0 0 14px;">Virtue &amp; Co. operates strictly on guaranteed fixed pricing. Before any code is written, you receive an itemized scope of work with a single, binding price and a fixed delivery deadline. If something takes longer, that's our responsibility — not yours.</p>
    `,
    contentText: `Traditional agencies love hourly billing because clients absorb all the financial risk. Virtue & Co. operates strictly on guaranteed fixed pricing with agreed deliverables and timelines.`,
    ctaText: 'Get a Fixed-Price Quote',
    ctaUrl: 'https://virtuecowebworks.solutions/contact',
  },
]

export function getNewsletterIssue(issueIndex = 0): NewsletterIssue {
  return CURATED_NEWSLETTER_ISSUES[issueIndex % CURATED_NEWSLETTER_ISSUES.length]
}

export async function dispatchNewsletter({
  recipientEmails,
  issueIndex = 0,
}: {
  recipientEmails: string[]
  issueIndex?: number
}) {
  const issue = getNewsletterIssue(issueIndex)
  const rendered = await newsletterEmail(issue)

  const results = await Promise.allSettled(
    recipientEmails.map((to) =>
      sendEmail({
        to,
        email: rendered,
      }),
    ),
  )

  const successful = results.filter((r) => r.status === 'fulfilled' && r.value.ok).length

  return {
    total: recipientEmails.length,
    sent: successful,
    failed: recipientEmails.length - successful,
    issueTitle: issue.title,
  }
}
