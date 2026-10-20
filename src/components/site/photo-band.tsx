import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface PhotoBandProps {
  src: string
  alt: string
  caption?: string
  className?: string
  /** Set on the one band that should not lazy-load (above the fold). */
  priority?: boolean
  /** Height preset — `wide` for full-bleed editorial bands, `tall` for heroes. */
  size?: 'wide' | 'tall'
}

/**
 * Full-width editorial photograph.
 *
 * One flat frame, a hairline border and a surface step — no gradient scrims or
 * overlays, so the photograph carries the section on its own. Used across the
 * inner marketing pages so every page has real imagery rather than icon-only
 * sections.
 */
export function PhotoBand({
  src,
  alt,
  caption,
  className,
  priority = false,
  size = 'wide',
}: PhotoBandProps) {
  return (
    <figure className={cn('mx-auto w-full max-w-7xl px-5 sm:px-8', className)}>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elevation-2">
        <Image
          src={src}
          alt={alt}
          width={2000}
          height={1000}
          priority={priority}
          sizes="(max-width: 1280px) 100vw, 1200px"
          className={cn(
            'w-full object-cover',
            size === 'tall' ? 'h-[280px] sm:h-[380px] lg:h-[460px]' : 'h-[220px] sm:h-[300px] lg:h-[380px]',
          )}
        />
      </div>

      {caption ? (
        <figcaption className="mt-3.5 text-center text-[12.5px] text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
