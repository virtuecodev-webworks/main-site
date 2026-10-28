import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/motion/reveal'
import { VantraButton } from '@/components/ui/vantra-button'
import { AGENCY } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Vantra Studio full-screen pre-footer CTA (`section.section_careers`).
 * Paired with `SiteFooter`'s `-mt-6 rounded-t-[20px]` overlap.
 */
export async function CtaBand({ className }: { className?: string }) {
  const t = await getTranslations('Home.cta')

  return (
    <Reveal className={cn('w-full', className)}>
      <section className="section_careers relative isolate flex min-h-[76vh] flex-col justify-between overflow-hidden rounded-t-[20px] bg-[#0a0a0a] px-5 py-16 text-[#f5f4f0] sm:rounded-t-3xl sm:px-10 sm:py-24">
        {/* Atmospheric architectural backdrop & vignette */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(85% 90% at 78% 18%, rgba(220, 170, 40, 0.22) 0%, rgba(220, 170, 40, 0.04) 48%, rgba(10, 10, 10, 0.96) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(245,244,240,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,244,240,0.16) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        {/* Top Meta Bar */}
        <div className="container-max relative z-10 flex w-full flex-wrap items-center justify-between gap-4 border-b border-[#f5f4f01f] pb-6">
          <span className="label-mono text-primary">( &nbsp;&nbsp;&nbsp;{t('eyebrow')}&nbsp;&nbsp;&nbsp; )</span>
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_12px_rgba(220,170,40,0.85)]" />
            <span className="label-mono text-[#f5f4f0]/75">
              {t('status')}
            </span>
          </div>
          <a
            href={`mailto:${AGENCY.email}`}
            className="label-mono text-[#f5f4f0]/65 transition-colors hover:text-primary"
          >
            {AGENCY.email}
          </a>
        </div>

        {/* Bottom Giant Headline + Slot-Machine Actions */}
        <div className="container-max careers_content relative z-10 mt-20 flex w-full flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-4xl">
            <h2 className="heading-style-h0 text-balance text-[#f5f4f0]">
              {t('title')}
            </h2>
            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-[#f5f4f0]/70 sm:text-lg">
              {t('subtitle')}
            </p>
          </div>

          <div className="careers_actions flex flex-wrap items-center gap-3 shrink-0">
            <VantraButton href="/contact" variant="gold">
              {t('primary')}
            </VantraButton>
            <VantraButton
              href={`mailto:${AGENCY.email}?subject=Project%20enquiry`}
              external
              variant="light"
            >
              {t('secondary')}
            </VantraButton>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
