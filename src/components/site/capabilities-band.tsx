import { getTranslations } from 'next-intl/server'
import { PROMISES, SERVICES, TECH_STACK } from '@/lib/studio'
import { cn } from '@/lib/utils'

interface MarqueeProps {
  items: readonly string[]
  /** Scroll right-to-left (default) or left-to-right. */
  reverse?: boolean
  /** Render a small gold node after each item. */
  separator?: boolean
  className?: string
  itemClassName?: string
}

/**
 * A single seamless CSS marquee.
 *
 * The item list is duplicated and the track translates exactly -50%, so the
 * second copy lands precisely where the first began and the loop has no seam.
 * It runs before hydration, and the global reduced-motion override freezes it.
 */
function Marquee({ items, reverse, separator, className, itemClassName }: MarqueeProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-max items-center gap-9 pr-9',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
        )}
      >
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            aria-hidden={index >= items.length}
            className="flex shrink-0 items-center gap-9"
          >
            <span className={cn('whitespace-nowrap', itemClassName)}>{item}</span>
            {separator ? (
              <span className="size-1.5 shrink-0 rounded-full bg-gold-500/70" aria-hidden />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  )
}

export interface CapabilitiesBandProps {
  className?: string
}

/**
 * "What we build, and how we work" — the band that replaced the client roster.
 *
 * The studio is new, so a row of client logos would be a fabrication. This says
 * what is actually true instead: the disciplines, the tools, and four promises
 * about how engagements run. All of it is a statement of intent, not traction.
 */
export async function CapabilitiesBand({ className }: CapabilitiesBandProps) {
  const t = await getTranslations('Capabilities')
  const tServices = await getTranslations('Services')

  const disciplines = SERVICES.map((service) => tServices(`items.${service.key}.title`))

  return (
    <section
      aria-labelledby="capabilities-heading"
      className={cn('border-y border-border bg-muted/40', className)}
    >
      <p
        id="capabilities-heading"
        className="mx-auto max-w-7xl px-5 pt-10 text-center font-sans text-[11px] font-medium tracking-[0.28em] text-muted-foreground uppercase sm:px-8"
      >
        {t('heading')}
      </p>

      <Marquee
        items={disciplines}
        separator
        className="mt-7"
        itemClassName="font-display text-2xl font-semibold sm:text-3xl"
      />

      <Marquee
        items={TECH_STACK}
        reverse
        className="mt-7"
        itemClassName="font-mono text-[12.5px] tracking-[0.14em] text-muted-foreground uppercase"
      />

      <dl className="mx-auto grid max-w-7xl gap-x-8 gap-y-6 px-5 pt-10 pb-11 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {PROMISES.map((key) => (
          <div key={key} className="border-t border-border pt-4">
            <dt className="text-[13px] font-semibold">{t(`promises.${key}.title`)}</dt>
            <dd className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {t(`promises.${key}.body`)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
