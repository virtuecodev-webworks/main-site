import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { SiteHeader } from '@/components/site/site-header'
import { VantraButton } from '@/components/ui/vantra-button'
import { VisitorAvailability } from '@/components/site/visitor-availability'

/**
 * Vantra Studio `.section_error` Custom 404 Page:
 *   - Inset rounded full-viewport dark container (`m-2 min-h-[calc(100dvh-1rem)] rounded-[20px] bg-[#0a0a0a] text-[#f5f4f0]`)
 *   - Atmospheric background media with deep charcoal scrim
 *   - Parenthetical `.label-mono` `( 404 — Page not found )`
 *   - Giant `.heading-style-h0` headline + clear reassuring copy
 *   - Dual-row slot-machine `VantraButton` actions (`Back to home` + `Explore live websites`)
 */
export default async function NotFound() {
  const t = await getTranslations('NotFound')
  const tCommon = await getTranslations('Common')

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />

      <main className="p-2">
        <section
          aria-labelledby="error-404-heading"
          className="section_error relative flex min-h-[calc(100dvh-1rem)] flex-col justify-between overflow-hidden rounded-[20px] bg-[#0a0a0a] pt-28 pb-10 text-[#f5f4f0] sm:pt-32 sm:pb-12"
        >
          {/* Atmospheric background image & Vantra dark gradient scrim */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src="/work/aurum-hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center opacity-28 mix-blend-luminosity"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(220,170,40,0.16),transparent_48%),linear-gradient(180deg,rgba(10,10,10,0.65)_0%,rgba(10,10,10,0.88)_60%,#0a0a0a_100%)]"
            />
          </div>

          {/* Top subtle status bar */}
          <div className="padding-global relative z-10 w-full">
            <div className="container-max flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
              <span className="label-mono text-white/55">
                ( &nbsp;&nbsp;&nbsp;404 — Page not found&nbsp;&nbsp;&nbsp; )
              </span>
              <VisitorAvailability variant="pill" />
            </div>
          </div>

          {/* Center Vantra `.error_inner` */}
          <div className="padding-global relative z-10 my-auto w-full py-12">
            <div className="container-max">
              <div className="error_inner flex max-w-3xl flex-col items-start gap-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                    Error 404
                  </span>
                </div>

                <h1
                  id="error-404-heading"
                  className="heading-style-h0 text-balance text-[#f5f4f0]"
                >
                  {t('title') || 'This page has moved or no longer exists.'}
                </h1>

                <p className="error_text max-w-xl text-base leading-relaxed text-[#f5f4f0]/68 sm:text-lg">
                  {t('body') ||
                    'The link you followed may be outdated, or the address may have been typed incorrectly. Head back to our homepage or explore our live client websites below.'}
                </p>

                <div className="error_actions flex flex-wrap items-center gap-3 pt-2">
                  <VantraButton href="/" variant="gold">
                    {tCommon('backHome')}
                  </VantraButton>
                  <VantraButton href="/portfolio" variant="light">
                    Explore live websites
                  </VantraButton>
                  <VantraButton href="/contact" variant="ghost">
                    Contact studio
                  </VantraButton>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom quick directory strip */}
          <div className="padding-global relative z-10 w-full">
            <div className="container-max flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
              <span>Virtue &amp; Co. Webworks — Senior Web Design &amp; Engineering Studio</span>
              <div className="flex flex-wrap items-center gap-6">
                <a href="/services" className="transition-colors hover:text-primary">
                  Services &amp; Pricing
                </a>
                <a href="/portfolio" className="transition-colors hover:text-primary">
                  Selected Work
                </a>
                <a href="/about" className="transition-colors hover:text-primary">
                  About Us
                </a>
                <a href="/contact" className="transition-colors hover:text-primary">
                  Start a Project
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
