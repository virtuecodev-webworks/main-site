import { cn } from '@/lib/utils'
import { Reveal } from '@/components/motion/reveal'

export interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'start'
  className?: string
  pill?: boolean
}

/** Vantra Studio section header: `.label-mono` parenthetical eyebrow -> `.heading-style-h2` -> subtitle. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'start',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col',
        centered ? 'items-center text-center' : 'items-start text-left',
        className,
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
        <h2
          className={cn(
            'heading-style-h2 mt-3 text-balance text-foreground',
            centered && 'mx-auto max-w-3xl',
          )}
        >
          {title}
        </h2>
      </Reveal>

      {subtitle ? (
        <Reveal delay={0.12} immediate>
          <p
            className={cn(
              'mt-4 text-[15px] leading-relaxed text-muted-foreground sm:text-base',
              centered ? 'mx-auto max-w-2xl' : 'max-w-2xl',
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  )
}
