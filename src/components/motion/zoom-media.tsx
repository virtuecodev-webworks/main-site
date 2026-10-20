'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

export interface ZoomMediaProps {
  src: string
  alt: string
  eyebrow?: string
  /** Set in the display face, directly on the photograph. */
  title: string
  body?: string
  className?: string
  /** Rendered under the copy — usually a button or a link. */
  children?: React.ReactNode
  /** Above-the-fold bands opt in so the image is not lazy-loaded. */
  priority?: boolean
  /**
   * How far the photograph travels. `1.12` means it starts 12% larger than the
   * frame, settles to true size through the middle and pushes back out as it
   * leaves — a continuous move rather than a one-shot pop.
   */
  intensity?: number
  align?: 'start' | 'center'
}

/**
 * Full-bleed photograph with the copy set on top of it.
 *
 * The image is scaled and nudged by scroll position through Framer Motion's
 * `useScroll`/`useTransform`, which are the same primitives the rest of the site
 * already animates with. Two deliberate choices:
 *
 *  - the overlay is a **flat** charcoal wash rather than a gradient scrim, so
 *    the treatment stays inside the brand's no-gradients rule;
 *  - `prefers-reduced-motion` removes the transform entirely instead of
 *    shortening it, so the band is a still photograph for those readers.
 */
export function ZoomMedia({
  src,
  alt,
  eyebrow,
  title,
  body,
  className,
  children,
  priority = false,
  intensity = 0.12,
  align = 'start',
}: ZoomMediaProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1 + intensity, 1, 1 + intensity * 0.7],
  )
  const y = useTransform(scrollYProgress, [0, 1], ['-3%', '3%'])

  const centered = align === 'center'

  return (
    <div
      ref={ref}
      className={cn(
        'relative isolate flex min-h-[68vh] items-center overflow-hidden rounded-3xl border border-border sm:min-h-[76vh]',
        className,
      )}
    >
      <motion.div
        aria-hidden
        style={reduced ? undefined : { scale, y }}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Flat wash — no gradient, no colour cast. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-ink-950/58" />

      <div
        className={cn(
          'mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-16 sm:px-10 sm:py-20',
          centered ? 'items-center text-center' : 'items-start text-left',
        )}
      >
        {eyebrow ? (
          <Reveal immediate>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-white/85 uppercase">
              <span className="size-1.5 rounded-full bg-gold-400" aria-hidden />
              {eyebrow}
            </span>
          </Reveal>
        ) : null}

        <Reveal immediate delay={0.06}>
          <h2
            className={cn(
              'font-display max-w-3xl text-[2rem] leading-[1.06] font-bold text-white sm:text-[2.75rem] lg:text-[3.25rem]',
              centered && 'mx-auto',
            )}
          >
            {title}
          </h2>
        </Reveal>

        {body ? (
          <Reveal immediate delay={0.12}>
            <p
              className={cn(
                'max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-base',
                centered && 'mx-auto',
              )}
            >
              {body}
            </p>
          </Reveal>
        ) : null}

        {children ? (
          <Reveal immediate delay={0.18}>
            <div className="mt-2 flex flex-wrap gap-3">{children}</div>
          </Reveal>
        ) : null}
      </div>
    </div>
  )
}
