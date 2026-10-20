'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TechItem {
  name: string
  category?: string
  icon?: string
}

export const TECH_STACK: TechItem[] = [
  { name: 'Next.js 16 (App Router)', category: 'Framework' },
  { name: 'React 19 Server Components', category: 'Library' },
  { name: 'TypeScript 6', category: 'Language' },
  { name: 'Tailwind CSS v4', category: 'Styling' },
  { name: 'Supabase Postgres & RLS', category: 'Database' },
  { name: 'Framer Motion', category: 'Animation' },
  { name: 'Remotion Video', category: 'Motion' },
  { name: 'Stripe & Apple Pay', category: 'Fintech' },
  { name: 'Resend Transactional Email', category: 'Infrastructure' },
  { name: 'Turbopack Bundler', category: 'Tooling' },
  { name: 'Vercel Edge Network', category: 'Deployment' },
  { name: 'GSAP Physics', category: 'Animation' },
]

export interface TechMarqueeProps {
  className?: string
  reverse?: boolean
  items?: TechItem[]
}

/**
 * 21st.dev Infinite Marquee showcasing agency tech competencies.
 * Features edge fade masks, pause-on-hover, and subtle micro-borders.
 */
export function TechMarquee({
  className,
  reverse = false,
  items = TECH_STACK,
}: TechMarqueeProps) {
  return (
    <div
      className={cn(
        'group relative flex overflow-hidden p-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around gap-4 py-2',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          'group-hover:[animation-play-state:paused]',
        )}
      >
        {items.concat(items).map((tech, index) => (
          <div
            key={`${tech.name}-${index}`}
            className="flex items-center gap-2.5 rounded-full border border-border/80 bg-muted/40 px-4 py-1.5 backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-muted/80"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-sans text-xs font-medium tracking-wide text-foreground">
              {tech.name}
            </span>
            {tech.category ? (
              <span className="rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {tech.category}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around gap-4 py-2',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          'group-hover:[animation-play-state:paused]',
        )}
      >
        {items.concat(items).map((tech, index) => (
          <div
            key={`dup-${tech.name}-${index}`}
            className="flex items-center gap-2.5 rounded-full border border-border/80 bg-muted/40 px-4 py-1.5 backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-muted/80"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="font-sans text-xs font-medium tracking-wide text-foreground">
              {tech.name}
            </span>
            {tech.category ? (
              <span className="rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {tech.category}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
