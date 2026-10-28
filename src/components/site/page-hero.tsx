import type * as React from 'react'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

export interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
  align?: 'start' | 'center'
}

/**
 * Vantra Studio inner page header.
 * Features `.label-mono` parenthetical eyebrow, `.heading-style-h1`, and clears the floating pill navbar.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
  className,
  align = 'start',
}: PageHeroProps) {
  const centered = align === 'center'

  return (
    <section
      className={cn(
        'padding-global pt-28 pb-12 sm:pt-36 sm:pb-16',
        className,
      )}
    >
      <div
        className={cn(
          'container-max flex flex-col border-b border-border pb-12 sm:pb-16',
          centered ? 'items-center text-center' : 'items-start text-left',
        )}
      >
        {eyebrow ? (
          <Reveal immediate>
            <span className="label-mono text-primary">
              ( &nbsp;&nbsp;&nbsp;{eyebrow}&nbsp;&nbsp;&nbsp; )
            </span>
          </Reveal>
        ) : null}

        <Reveal delay={0.06} immediate>
          <h1
            className={cn(
              'heading-style-h1 mt-4 text-balance text-foreground',
              centered ? 'mx-auto max-w-[16ch]' : 'max-w-[16ch]',
            )}
          >
            {title}
          </h1>
        </Reveal>

        {subtitle ? (
          <Reveal delay={0.12} immediate>
            <p
              className={cn(
                'mt-6 max-w-[54ch] text-base leading-relaxed text-muted-foreground sm:text-lg',
                centered && 'mx-auto',
              )}
            >
              {subtitle}
            </p>
          </Reveal>
        ) : null}

        {children}
      </div>
    </section>
  )
}
