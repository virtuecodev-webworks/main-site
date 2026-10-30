import { ArrowUpRight, Globe, Mail, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { VirtueWordmark } from '@/components/brand/virtue-wordmark'
import { CountrySwitcher } from './country-switcher'
import { LanguageSwitcher } from './language-switcher'
import { NewsletterForm } from './newsletter-form'
import { AGENCY } from '@/lib/constants'
import { FOOTER_LEGAL, PRIMARY_NAV, SERVICES } from '@/lib/studio'

export async function SiteFooter() {
  const t = await getTranslations('Footer')
  const tNav = await getTranslations('Nav')
  const tRegion = await getTranslations('Region')
  const tServices = await getTranslations('Services')
  const year = new Date().getFullYear()

  return (
    <footer className="footer relative z-10 -mt-6 overflow-hidden rounded-t-[20px] border-t border-[#f5f4f01f] bg-[#0a0a0a] px-5 pt-20 pb-12 text-[#f5f4f0] sm:px-10 sm:pt-24">
      <div className="container-max">
        {/* Top 12-Col Architectural Grid */}
        <div className="footer_top grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Left 6 Columns: Brand Lockup, Newsletter & Direct Contact */}
          <div className="flex flex-col justify-between lg:col-span-6">
            <div>
              <VirtueWordmark tone="invert" size="lg" />
              <p className="mt-6 max-w-[40ch] text-[15px] leading-relaxed text-[#f5f4f0]/65">
                {t('blurb')}
              </p>

              {/* Newsletter Capture */}
              <div className="footer_newsletter mt-10 max-w-md">
                <div className="label-mono text-primary">
                  ( &nbsp;&nbsp;&nbsp;{t('newsletter')}&nbsp;&nbsp;&nbsp; )
                </div>
                <NewsletterForm tone="invert" source="footer" className="mt-4" />
              </div>
            </div>

            {/* Direct Studio Coordinates (Single Canonical Email + Phone) */}
            <div className="mt-12 grid grid-cols-1 gap-4 border-t border-[#f5f4f01f] pt-6 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="label-mono-xs text-[#f5f4f0]/45">Direct Enquiries</span>
                <a
                  href={`mailto:${AGENCY.email}`}
                  className="inline-flex items-center gap-2 font-medium text-[#f5f4f0] transition-colors hover:text-primary"
                >
                  <Mail className="size-3.5 text-primary" aria-hidden="true" />
                  <span>{AGENCY.email}</span>
                </a>
                <a
                  href={`tel:${AGENCY.phone}`}
                  className="inline-flex items-center gap-2 text-[#f5f4f0]/75 transition-colors hover:text-primary"
                >
                  <Phone className="size-3.5 text-primary" aria-hidden="true" />
                  <span>{AGENCY.phone}</span>
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <span className="label-mono-xs text-[#f5f4f0]/45">Operations</span>
                <span className="inline-flex items-center gap-2 text-[#f5f4f0]/75">
                  <Globe className="size-3.5 text-primary" aria-hidden="true" />
                  <span>{t('worldwide')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right 6 Columns: Display Index Links & Practice/Region Columns */}
          <div className="footer_nav grid grid-cols-1 gap-12 sm:grid-cols-2 lg:col-span-6">
            {/* Large 2.25rem Display Navigation Stack */}
            <div>
              <span className="label-mono text-[#f5f4f0]/45">
                ( &nbsp;&nbsp;&nbsp;{t('explore')}&nbsp;&nbsp;&nbsp; )
              </span>
              <ul className="mt-6 flex flex-col gap-2.5">
                {PRIMARY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="footer_nav-link group inline-flex items-center gap-2 font-display text-2xl leading-[1.12] font-semibold tracking-[-0.03em] text-[#f5f4f0] transition-colors hover:text-primary sm:text-[2.15rem]"
                    >
                      <span>{tNav(item.labelKey)}</span>
                      <ArrowUpRight className="size-5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 text-primary" />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/payment"
                    className="footer_nav-link group inline-flex items-center gap-2 font-display text-2xl leading-[1.12] font-semibold tracking-[-0.03em] text-[#f5f4f0]/80 transition-colors hover:text-primary sm:text-[2.15rem]"
                  >
                    <span>{tNav('payment')}</span>
                    <ArrowUpRight className="size-5 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 text-primary" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Practices, Client Portal & Regional Controls */}
            <div className="flex flex-col justify-between gap-10">
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <span className="label-mono text-[#f5f4f0]/45">
                    ( &nbsp;&nbsp;&nbsp;{t('services')}&nbsp;&nbsp;&nbsp; )
                  </span>
                  <ul className="mt-4 flex flex-col gap-2 text-sm">
                    {SERVICES.map((service) => (
                      <li key={service.key}>
                        <Link
                          href={`/services#${service.key}`}
                          className="inline-flex min-h-6 items-center text-[#f5f4f0]/65 transition-colors hover:text-[#f5f4f0]"
                        >
                          {tServices(`items.${service.key}.title`)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="label-mono text-[#f5f4f0]/45">
                    ( &nbsp;&nbsp;&nbsp;Client Access&nbsp;&nbsp;&nbsp; )
                  </span>
                  <ul className="mt-4 flex flex-col gap-2 text-sm">
                    <li>
                      <Link
                        href="/contact"
                        className="inline-flex min-h-6 items-center text-[#f5f4f0]/65 transition-colors hover:text-[#f5f4f0]"
                      >
                        {tNav('quote')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/portal"
                        className="inline-flex min-h-6 items-center text-[#f5f4f0]/65 transition-colors hover:text-[#f5f4f0]"
                      >
                        Client Portal
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/login"
                        className="inline-flex min-h-6 items-center text-[#f5f4f0]/65 transition-colors hover:text-[#f5f4f0]"
                      >
                        {tNav('login')}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Region & Language */}
              <div className="space-y-4 border-t border-[#f5f4f01f] pt-6">
                <div>
                  <span className="label-mono-xs text-[#f5f4f0]/45">{tRegion('label')}</span>
                  <div className="mt-1.5">
                    <CountrySwitcher variant="full" label={tRegion('label')} />
                  </div>
                </div>
                <div>
                  <span className="label-mono-xs text-[#f5f4f0]/45">{t('availableIn')}</span>
                  <LanguageSwitcher
                    label={tNav('changeLanguage')}
                    variant="inline"
                    className="mt-1.5 [&_button]:text-[#f5f4f0]/70 [&_button:hover]:text-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="footer_bottom mt-20 flex flex-col gap-4 border-t border-[#f5f4f01f] pt-8 text-xs text-[#f5f4f0]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {AGENCY.name}. {t('rights')}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {FOOTER_LEGAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-6 items-center transition-colors hover:text-[#f5f4f0]"
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
