import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CookieConsent } from '@/components/site/cookie-consent'
import { AiAssistant } from '@/components/site/ai-assistant'
import { PageTransition } from '@/components/motion/page-transition'
import { RegionProvider } from '@/components/site/region-provider'
import { NewsletterPopup } from '@/components/site/newsletter-popup'

/**
 * Marketing shell: public header, footer and the route transition.
 *
 * The cookie notice and the Studio AI assistant live here rather than in the root
 * layout so they never appear over the dashboard or the sign-in screen.
 *
 * Deliberately does not read the session or cookies — keeping them out of this
 * layout is what lets the marketing pages be statically rendered. The visitor's
 * country is resolved in the browser by `RegionProvider` instead.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RegionProvider>
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <AiAssistant />
        <CookieConsent />
        <NewsletterPopup />
      </div>
    </RegionProvider>
  )
}
