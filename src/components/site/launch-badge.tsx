/* eslint-disable @next/next/no-img-element */
import * as React from 'react'
import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LaunchBadgeProps {
  /**
   * Theme mode:
   * - 'auto': Renders both light & dark SVGs using CSS `dark:hidden` / `hidden dark:block`,
   *           automatically matching the user's active theme with zero layout shift.
   * - 'dark': Forces the dark theme SVG (for always-dark containers like Hero and Footer).
   * - 'light': Forces the light theme SVG.
   */
  theme?: 'auto' | 'dark' | 'light'
  /**
   * Visual presentation variant:
   * - 'default': Sleek standalone badge link with subtle hover elevation and focus ring.
   * - 'hero': Polished dark-mode lockup tailored for the hero action cluster with micro-glass surround.
   * - 'card': Full featured social proof card with pulsing verified beacon and descriptive caption.
   * - 'compact': Minimalist drop-in badge link without outer surrounding card.
   */
  variant?: 'default' | 'hero' | 'card' | 'compact'
  className?: string
  showLiveBeacon?: boolean
}

const LAUNCH_RECORD_URL = 'https://websitelaunches.com/site/virtuecowebworks.solutions'
const LIGHT_BADGE_SRC = 'https://websitelaunches.com/badge/virtuecowebworks.solutions.svg'
const DARK_BADGE_SRC = 'https://websitelaunches.com/badge/virtuecowebworks.solutions.svg?theme=dark'
const BADGE_ALT = 'Established online - Public launch record'

export function LaunchBadge({
  theme = 'auto',
  variant = 'default',
  className,
  showLiveBeacon = false,
}: LaunchBadgeProps) {
  const renderBadgeImages = () => {
    if (theme === 'dark') {
      return (
        <img
          src={DARK_BADGE_SRC}
          alt={BADGE_ALT}
          width={255}
          height={55}
          loading="lazy"
          className="h-[46px] w-auto max-w-[255px] rounded-lg transition-transform duration-300 group-hover:scale-[1.02] sm:h-[50px] md:h-[55px]"
        />
      )
    }

    if (theme === 'light') {
      return (
        <img
          src={LIGHT_BADGE_SRC}
          alt={BADGE_ALT}
          width={255}
          height={55}
          loading="lazy"
          className="h-[46px] w-auto max-w-[255px] rounded-lg transition-transform duration-300 group-hover:scale-[1.02] sm:h-[50px] md:h-[55px]"
        />
      )
    }

    // Auto: Render both; let Tailwind CSS toggle visibility instantly without flash
    return (
      <>
        <img
          src={LIGHT_BADGE_SRC}
          alt={BADGE_ALT}
          width={255}
          height={55}
          loading="lazy"
          className="block h-[46px] w-auto max-w-[255px] rounded-lg transition-transform duration-300 group-hover:scale-[1.02] dark:hidden sm:h-[50px] md:h-[55px]"
        />
        <img
          src={DARK_BADGE_SRC}
          alt={BADGE_ALT}
          width={255}
          height={55}
          loading="lazy"
          className="hidden h-[46px] w-auto max-w-[255px] rounded-lg transition-transform duration-300 group-hover:scale-[1.02] dark:block sm:h-[50px] md:h-[55px]"
        />
      </>
    )
  }

  // Hero variant: luxury frosted surround for dark background
  if (variant === 'hero') {
    return (
      <div
        className={cn(
          'group relative inline-flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-white/[0.08] hover:shadow-[0_0_24px_rgba(220,170,40,0.18)]',
          className
        )}
      >
        <a
          href={LAUNCH_RECORD_URL}
          target="_blank"
          rel="noopener"
          title="Virtue & Co. Webworks · Verified Public Launch Record on WebsiteLaunches.com"
          className="flex items-center"
        >
          {renderBadgeImages()}
        </a>
      </div>
    )
  }

  // Card variant: rich social proof display with beacon
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'group flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-sm sm:flex-row sm:items-center',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary shrink-0">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground tracking-tight">
                Public Launch Record
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified Active
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Official registration and provenance on WebsiteLaunches.com
            </p>
          </div>
        </div>

        <a
          href={LAUNCH_RECORD_URL}
          target="_blank"
          rel="noopener"
          title="View public launch record for virtuecowebworks.solutions"
          className="shrink-0 transition-transform duration-300 active:scale-95"
        >
          {renderBadgeImages()}
        </a>
      </div>
    )
  }

  // Default & compact variant
  return (
    <div className={cn('group relative inline-flex items-center gap-2', className)}>
      {showLiveBeacon && (
        <span
          className="size-2 rounded-full bg-emerald-500 animate-pulse"
          title="Verified Online"
        />
      )}
      <a
        href={LAUNCH_RECORD_URL}
        target="_blank"
        rel="noopener"
        title="Established online - Public launch record"
        className="block transition-transform duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
      >
        {renderBadgeImages()}
      </a>
    </div>
  )
}
