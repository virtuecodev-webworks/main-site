import { Globe, Mail, MessageCircle, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { CountrySwitcher } from './country-switcher'
import { LanguageSwitcher } from './language-switcher'
import { NewsletterForm } from './newsletter-form'
import { Separator } from '@/components/ui/separator'
import { AGENCY, WHATSAPP_DIGITS } from '@/lib/constants'
import { FOOTER_LEGAL, PRIMARY_NAV, SERVICES } from '@/lib/studio'

export async function SiteFooter() {
  const t = await getTranslations('Footer')
  const tNav = await getTranslations('Nav')
  const tRegion = await getTranslations('Region')
  const tCommon = await getTranslations('Common')
  const tServices = await getTranslations('Services')
  const year = new Date().getFullYear()

  /**
   * Every footer link gets a 24px minimum height. At the default text size the
   * line box is ~17px, which is under the WCAG 2.5.8 target-size floor — fine for
   * a link inside a paragraph, not fine for a standalone list item.
   */
  const linkClass = 'inline-flex min-h-6 items-center transition-colors hover:text-gold-400'

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-ink-950 text-ink-200">
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <VirtueWordmark tone="invert" size="lg" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-400">{t('blurb')}</p>

            {/* `flex-col` rather than `space-y`: the anchors are `inline-flex`
                for their tap target, so as plain blocks they would sit on one
                line. */}
            <div className="mt-7 flex flex-col gap-3 text-sm">
              <a
                href={`mailto:${AGENCY.email}`}
                className={`gap-3 text-ink-300 ${linkClass}`}
              >
                <Mail className="size-4 shrink-0 text-gold-500" aria-hidden />
                {AGENCY.email}
              </a>
              <a
                href={`mailto:${AGENCY.fallbackEmail}`}
                className={`gap-3 text-ink-300 ${linkClass}`}
              >
                <Mail className="size-4 shrink-0 text-gold-500" aria-hidden />
                {AGENCY.fallbackEmail}
              </a>
              <a
                href={`tel:${AGENCY.phone}`}
                className={`gap-3 text-ink-300 ${linkClass}`}
              >
                <Phone className="size-4 shrink-0 text-gold-500" aria-hidden />
                {AGENCY.phone}
              </a>
              <span className="flex items-center gap-3 text-ink-400">
                <Globe className="size-4 shrink-0 text-gold-500" aria-hidden />
                {t('worldwide')}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gold-400 uppercase">
              {t('explore')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`text-ink-300 ${linkClass}`}>
                    {tNav(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gold-400 uppercase">
              {t('services')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {SERVICES.map((service) => (
                <li key={service.key}>
                  <Link href={`/services#${service.key}`} className={`text-ink-300 ${linkClass}`}>
                    {tServices(`items.${service.key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.2em] text-gold-400 uppercase">
              {t('contact')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/contact" className={`text-ink-300 ${linkClass}`}>
                  {tNav('quote')}
                </Link>
              </li>
              <li>
                <Link href="/payment" className={`text-ink-300 ${linkClass}`}>
                  {tNav('payment')}
                </Link>
              </li>
              <li>
                <Link href="/login" className={`text-ink-300 ${linkClass}`}>
                  {tNav('login')}
                </Link>
              </li>
            </ul>

            <h3 className="mt-8 text-[11px] font-semibold tracking-[0.2em] text-gold-400 uppercase">
              {t('newsletter')}
            </h3>
            <NewsletterForm tone="invert" source="footer" className="mt-4 max-w-sm" />

            <h3 className="mt-8 text-[11px] font-semibold tracking-[0.2em] text-gold-400 uppercase">
              {tRegion('label')}
            </h3>
            <div className="mt-4">
              <CountrySwitcher variant="full" label={tRegion('label')} />
            </div>

            <h3 className="mt-8 text-[11px] font-semibold tracking-[0.2em] text-gold-400 uppercase">
              {t('availableIn')}
            </h3>
            <LanguageSwitcher
              label={tNav('changeLanguage')}
              variant="inline"
              className="mt-4 [&_button]:text-ink-300 [&_button:hover]:text-gold-400"
            />
          </div>
        </div>

        <Separator className="my-10 bg-ink-800" />

        <div className="flex flex-col gap-6 text-[13px] text-ink-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {AGENCY.name}. {t('rights')}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[11px] font-semibold tracking-[0.2em] text-ink-300 uppercase">
              {t('legal')}
            </span>
            {FOOTER_LEGAL.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
