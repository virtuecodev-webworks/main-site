'use client'

import * as React from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

function ScrubChar({
  char,
  progress,
  range,
}: {
  char: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return (
    <motion.span style={{ opacity }} className="transition-colors">
      {char}
    </motion.span>
  )
}

export function QuoteMarquee({ className }: { className?: string }) {
  const t = useTranslations('Home.statement')
  const statementText = t('text')
  const pillars = (t.raw('pillars') as string[]) ?? []

  const containerRef = React.useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.82', 'end 0.38'],
  })
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 26,
    restDelta: 0.001,
  })

  const words = React.useMemo(() => statementText.split(' '), [statementText])
  const totalChars = statementText.length

  let charCursor = 0

  return (
    <section
      ref={containerRef}
      aria-label={t('eyebrow')}
      className={cn(
        'section_statement relative flex min-h-[76vh] flex-col justify-between gap-20 py-28 sm:py-40',
        className,
      )}
    >
      <div className="padding-global my-auto">
        <div className="container-max">
          <div className="statement_wrap mx-auto flex max-w-[54rem] flex-col items-center gap-6 text-center">
            <span className="label-mono text-muted-foreground">
              ( &nbsp;&nbsp;&nbsp;{t('eyebrow')}&nbsp;&nbsp;&nbsp; )
            </span>

            <p className="statement_text font-display text-[clamp(1.75rem,2.875vw,2.875rem)] leading-[1.2] font-semibold tracking-[-0.025em] text-foreground">
              {words.map((word, wordIndex) => {
                const wordChars = word.split('')
                const wordElement = (
                  <span key={`${word}-${wordIndex}`} className="mr-[0.26em] inline-block">
                    {wordChars.map((char, cIdx) => {
                      const index = charCursor++
                      const start = index / totalChars
                      const end = Math.min(1, start + 3 / totalChars)
                      return (
                        <ScrubChar
                          key={`${wordIndex}-${cIdx}`}
                          char={char}
                          progress={smoothProgress}
                          range={[start, end]}
                        />
                      )
                    })}
                  </span>
                )
                charCursor++ // account for space
                return wordElement
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Centered Statement Marquee with Edge Fade Cover */}
      {pillars.length > 0 && (
        <div className="padding-global">
          <div className="container-max">
            <div className="statement_marquee relative mx-auto w-full overflow-hidden py-4 md:w-[76%] [mask-image:linear-gradient(90deg,transparent,#000_18%,#000_82%,transparent)]">
              <div className="statement_track flex w-max items-center gap-12 pr-12 animate-marquee">
                {[...pillars, ...pillars].map((pillar, idx) => (
                  <div
                    key={`${pillar}-${idx}`}
                    aria-hidden={idx >= pillars.length}
                    className="flex shrink-0 items-center gap-12"
                  >
                    <span className="font-display text-base font-medium tracking-[-0.015em] text-foreground/65 sm:text-lg">
                      {pillar}
                    </span>
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full bg-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

