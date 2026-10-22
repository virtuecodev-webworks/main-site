import { ArrowRight, CalendarClock } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/motion/reveal'
import { BorderBeam } from '@/components/ui/border-beam'
import { AmbientBackground } from '@/components/brand/ambient-background'
import { AGENCY } from '@/lib/constants'
import { cn } from '@/lib/utils'

/** Full-width closing call to action, reused on the home and services pages. */
export async function CtaBand({ className }: { className?: string }) {
  const t = await getTranslations('Home.cta')

  return (
    <Reveal className={className}>
      <section className="relative isolate overflow-hidden rounded-3xl border border-ink-800 bg-ink-950 px-6 py-14 text-white shadow-2xl sm:px-12 lg:py-16">
        <BorderBeam size={320} duration={16} colorFrom="#E8C84A" colorTo="#B8922A" />
        <AmbientBackground size="lg" speed={140} align="top-right" opacity={0.5} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(70% 100% at 50% 0%, #000 0%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(70% 100% at 50% 0%, #000 0%, transparent 80%)',
          }}
        />

        <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl leading-tight font-semibold text-balance sm:text-3xl lg:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-300">{t('subtitle')}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href="/contact">
                {t('primary')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 text-white hover:border-gold-400/60 hover:bg-white/10 hover:text-white"
            >
              <a href={`mailto:${AGENCY.email}?subject=Project%20enquiry`}>
                <CalendarClock className="size-4" />
                {t('secondary')}
              </a>
            </Button>
          </div>
        </div>

        <p className={cn('relative mt-10 text-[12px] tracking-[0.14em] text-ink-400 uppercase')}>
          {AGENCY.email}
        </p>
      </section>
    </Reveal>
  )
}
