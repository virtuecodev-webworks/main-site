'use client'

import * as React from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

/*
 * Registered once at module scope, guarded because this file is evaluated on
 * the server during the RSC pass as well as in the browser.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

export interface TimelineItem {
  /** Stable key, also used to build the per-item selectors. */
  id: string
  /** The short heading for the step — "We talk". */
  label: string
  /** One or two plain sentences. */
  content: string
}

export interface TimelineProps {
  eyebrow?: string
  title: string
  subtitle?: string
  imageUrl: string
  imageAlt: string
  items: TimelineItem[]
  className?: string
}

/**
 * Journey timeline.
 *
 * Adapted from a scrollytelling timeline component to fit this studio's rules:
 *
 *  - **Flat, not glowing.** The rail, the dots and the stems are all the single
 *    brand gold; there is no coloured shadow, bloom or gradient fill anywhere.
 *  - **No invented history.** The original data model was `year` + `month`,
 *    which would have meant fabricating a company timeline for a studio founded
 *    in 2024. The model is now `label` + `content`, so the same visual language
 *    carries the five real stages of a project instead.
 *  - **N items, not seven.** Positions, the slide distance and the section
 *    height are all derived from `items.length`.
 *  - **A lighter mobile path.** Pinning a horizontal track for ~4 screens of
 *    scroll is unpleasant on a phone, so below `lg` this renders a plain
 *    vertical list with the same content and no scroll-jacking. GSAP only ever
 *    initialises inside `matchMedia`, so the pinned machinery never runs where
 *    it isn't shown.
 *  - **Reduced motion is honoured** by bailing out of every animation and
 *    setting the final state directly.
 */
export function Timeline({
  eyebrow,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  items,
  className,
}: TimelineProps) {
  const rootRef = React.useRef<HTMLElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const railRef = React.useRef<HTMLDivElement>(null)

  // Extra scroll the pinned section consumes, in viewport heights. Derived from
  // the number of steps so a longer journey simply scrolls a little further.
  const pinHeightVh = items.length * 70 + 80

  React.useEffect(() => {
    const root = rootRef.current
    const track = trackRef.current
    const rail = railRef.current
    if (!root || !track || !rail) return

    const mm = gsap.matchMedia()

    mm.add(
      // Only ever matches when the pinned desktop layout is the one on screen:
      // wide enough, and the reader has not asked for reduced motion. Both
      // conditions are mirrored in the class names below, so GSAP never runs
      // against markup CSS has hidden.
      '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      () => {
        const splits: SplitText[] = []
        const created: ScrollTrigger[] = []
        const ctx = gsap.context(() => {
          // The rail draws across the whole pinned scroll.
          gsap.fromTo(
            rail,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
              },
            },
          )

          // The track slides left, travelling exactly as far as its overflow.
          gsap.fromTo(
            track,
            { xPercent: 0 },
            {
              xPercent: () => {
                const overflow = track.scrollWidth - window.innerWidth
                return overflow <= 0 ? 0 : -100 * (overflow / track.scrollWidth)
              },
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          )

          // Each step gets its own scrubbed beat: the stem grows, the dot pops,
          // then the copy lifts out from behind a line mask.
          const span = 62
          const start = 5
          const step = span / items.length

          items.forEach((item, index) => {
            const from = start + index * step
            const to = from + step * 0.9

            const titleSplit = new SplitText(`.tl-title-${item.id}`, {
              type: 'lines',
              mask: 'lines',
            })
            const bodySplit = new SplitText(`.tl-body-${item.id}`, {
              type: 'lines',
              mask: 'lines',
              // SplitText's default marks the split lines `aria-hidden` and puts
              // the whole sentence in an `aria-label` on the target. That label is
              // prohibited on a `<p>` (role=paragraph cannot be named), so
              // axe-core fails the page. `none` leaves the line fragments
              // readable and adds no attributes at all.
              aria: 'none',
            })
            splits.push(titleSplit, bodySplit)

            const timeline = gsap.timeline({
              scrollTrigger: {
                trigger: root,
                start: `${from}% 30%`,
                end: `${to}% 50%`,
                scrub: true,
              },
            })

            created.push(timeline.scrollTrigger as ScrollTrigger)

            timeline
              .fromTo(
                `.tl-stem-${item.id}`,
                { scaleY: 0 },
                { scaleY: 1, duration: 0.4, ease: 'none' },
              )
              .fromTo(
                `.tl-dot-${item.id}`,
                { scale: 0 },
                { scale: 1, duration: 0.4, ease: 'none' },
                '<',
              )
              .fromTo(
                titleSplit.lines,
                { yPercent: 110 },
                { yPercent: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' },
                '<0.1',
              )
              .fromTo(
                bodySplit.lines,
                { yPercent: 110 },
                { yPercent: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out' },
                '<0.06',
              )
          })
        }, root)

        // Web fonts land after first paint; line boxes change with them, so the
        // trigger positions have to be measured again once they settle.
        let cancelled = false
        void document.fonts?.ready.then(() => {
          if (!cancelled) ScrollTrigger.refresh()
        })

        return () => {
          cancelled = true
          created.forEach((trigger) => trigger.kill())
          splits.forEach((split) => split.revert())
          ctx.revert()
        }
      },
    )

    return () => mm.revert()
  }, [items])

  return (
    <div className={cn(className)}>
      {/* ---------------------------------------------------------------- */}
      {/* Desktop: pinned horizontal scrollytelling                          */}
      {/* ---------------------------------------------------------------- */}
      <section
        ref={rootRef}
        className="relative hidden lg:motion-safe:block"
        style={{ height: `${pinHeightVh}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div
            ref={trackRef}
            data-timeline-track
            className="flex h-full items-center gap-[5vw] pl-[6vw] will-change-transform"
          >
            {/* Heading + photograph */}
            <div className="flex w-[34vw] max-w-[520px] shrink-0 flex-col gap-7">
              <div className="flex flex-col gap-4">
                {eyebrow ? (
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-500/30 bg-gold-50 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-gold-800 uppercase dark:bg-gold-500/12 dark:text-gold-300">
                    <span className="size-1.5 rounded-full bg-gold-500" aria-hidden />
                    {eyebrow}
                  </span>
                ) : null}
                <h2 className="text-4xl leading-[1.08] font-bold xl:text-[3rem]">{title}</h2>
                {subtitle ? (
                  <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <div className="relative h-[26vh] min-h-[150px] overflow-hidden rounded-3xl border border-border bg-card">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  sizes="34vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* The rail and its steps */}
            <div className="relative flex h-[76vh] shrink-0 items-center">
              <div
                aria-hidden
                className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-border"
              />
              <div
                ref={railRef}
                data-timeline-rail
                aria-hidden
                className="absolute top-1/2 right-0 left-0 h-px origin-left -translate-y-1/2 bg-primary"
              />

              <ol className="relative flex items-center gap-[6vw] pl-[3vw] pr-[10vw]">
                {items.map((item, index) => {
                  const above = index % 2 === 0

                  return (
                    <li
                      key={item.id}
                      className="relative h-[76vh] w-[22vw] max-w-[330px] shrink-0"
                    >
                      {/* Node on the rail */}
                      <span
                        aria-hidden
                        className={cn(
                          'tl-dot-' + item.id,
                          'absolute top-1/2 left-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary',
                        )}
                      />

                      {/* Stem connecting the node to the copy */}
                      <span
                        aria-hidden
                        className={cn(
                          'tl-stem-' + item.id,
                          'absolute left-0 h-[76px] w-px bg-primary',
                          above ? 'bottom-1/2 origin-bottom' : 'top-1/2 origin-top',
                        )}
                      />

                      {/* Copy, alternating above and below the rail */}
                      <div
                        className={cn(
                          'absolute left-0 w-full',
                          above ? 'bottom-[calc(50%+76px)]' : 'top-[calc(50%+76px)]',
                        )}
                      >
                        <h3
                          className={cn(
                            'tl-title-' + item.id,
                            'font-display text-2xl leading-tight font-bold xl:text-[1.75rem]',
                          )}
                        >
                          {item.label}
                        </h3>
                        <p
                          className={cn(
                            'tl-body-' + item.id,
                            'mt-3 text-[14.5px] leading-relaxed text-muted-foreground',
                          )}
                        >
                          {item.content}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile: the same steps as a plain vertical list                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-20 sm:py-24 lg:motion-safe:hidden">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <div className="flex flex-col gap-4">
            {eyebrow ? (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-500/30 bg-gold-50 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-gold-800 uppercase dark:bg-gold-500/12 dark:text-gold-300">
                <span className="size-1.5 rounded-full bg-gold-500" aria-hidden />
                {eyebrow}
              </span>
            ) : null}
            <h2 className="text-[1.75rem] leading-[1.12] font-bold text-balance sm:text-3xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={1200}
              height={900}
              sizes="(max-width: 640px) 100vw, 640px"
              className="h-[210px] w-full object-cover sm:h-[260px]"
            />
          </div>

          <ol className="relative mt-10 flex flex-col gap-8">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-[15px] w-px bg-border"
            />
            {items.map((item, index) => (
              <li key={item.id} className="relative flex gap-5">
                <Reveal delay={index * 0.05} className="relative z-10 shrink-0">
                  <span className="font-display grid size-8 place-items-center rounded-full border border-gold-500/50 bg-background text-[12px] font-bold text-gold-700 dark:text-gold-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </Reveal>

                <Reveal delay={index * 0.05 + 0.04} className="pt-0.5">
                  <h3 className="text-lg leading-tight font-semibold">{item.label}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                    {item.content}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  )
}

export default Timeline
