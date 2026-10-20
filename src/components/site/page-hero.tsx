import type * as React from 'react'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

export interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

/** Dark editorial banner shared by every inner marketing page. */
export function PageHero({ eyebrow, title, subtitle, children, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b border-ink-800 bg-ink-950 text-white',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(70% 100% at 50% 0%, #000 0%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(70% 100% at 50% 0%, #000 0%, transparent 82%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
        {eyebrow ? (
          <Reveal immediate>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/12 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-gold-300 uppercase">
              <span className="size-1.5 rounded-full bg-gold-500" aria-hidden />
              {eyebrow}
            </span>
          </Reveal>
        ) : null}

        <Reveal delay={0.06} immediate>
          <h1 className="mt-6 max-w-3xl text-[2rem] leading-[1.1] font-semibold text-balance sm:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
        </Reveal>

        {subtitle ? (
          <Reveal delay={0.12} immediate>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-300 sm:text-base">
              {subtitle}
            </p>
          </Reveal>
        ) : null}

        {children}
      </div>
    </section>
  )
}
