import { cn } from '@/lib/utils'
import { Reveal } from '@/components/motion/reveal'

export interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  /** `center` for feature sections, `start` for editorial layouts. */
  align?: 'center' | 'start'
  className?: string
  /** Render the eyebrow as a gold pill with a leading dot. */
  pill?: boolean
}

/** Consistent Material-3 section header: eyebrow → title → supporting line. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'start',
  className,
  pill = true,
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
          {pill ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-50 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-gold-800 uppercase dark:bg-gold-500/12 dark:text-gold-300">
              <span className="size-1.5 rounded-full bg-gold-500" aria-hidden />
              {eyebrow}
            </span>
          ) : (
            <span className="text-[11px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
              {eyebrow}
            </span>
          )}
        </Reveal>
      ) : null}

      <Reveal delay={0.06} immediate>
        <h2
          className={cn(
            'mt-5 text-2xl sm:text-4xl lg:text-[2.75rem] leading-[1.12] font-semibold tracking-tight text-foreground',
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
