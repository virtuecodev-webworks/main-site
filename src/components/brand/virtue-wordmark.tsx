'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { WORDMARK } from '@/lib/brand/mark-geometry'
import { VirtueMark } from './virtue-mark'

export interface VirtueWordmarkProps {
  className?: string
  /** Render the tracked "WEBWORKS" line beneath the wordmark. */
  descriptor?: boolean
  /** `invert` swaps the descriptor and text to white/silver for dark panels. */
  tone?: 'default' | 'invert'
  /** Render the illustrated square monogram mark next to the wordmark. */
  showMark?: boolean
  /** Size variant */
  size?: 'default' | 'lg'
}

/**
 * The Virtue & Co. brand lockup.
 * Features the precision illustrated monogram logo icon + Questrial typography.
 */
export function VirtueWordmark({
  className,
  descriptor = true,
  tone = 'default',
  showMark = true,
  size = 'default',
}: VirtueWordmarkProps) {
  const isInvert = tone === 'invert'
  const isLg = size === 'lg'

  return (
    <span
      className={cn(
        'inline-flex items-center select-none font-sans',
        isLg ? 'gap-3 sm:gap-3.5' : 'gap-2.5 sm:gap-3',
        className,
      )}
    >
      {showMark && (
        <span
          className={cn(
            'relative flex shrink-0 items-center justify-center',
            isLg ? 'size-10 sm:size-11' : 'size-8 sm:size-9',
          )}
        >
          <VirtueMark className="size-full" animate={false} tone={tone} />
        </span>
      )}

      <span className="inline-flex flex-col whitespace-nowrap">
        <span
          className={cn(
            'font-sans font-bold tracking-tight leading-none',
            isLg ? 'text-xl sm:text-2xl' : 'text-base sm:text-xl',
            isInvert ? 'text-white' : 'text-foreground',
          )}
        >
          {WORDMARK.lead}{' '}
          <span className="text-primary font-bold">{WORDMARK.ampersand}</span>{' '}
          {WORDMARK.trail}
        </span>

        {descriptor ? (
          <span
            className={cn(
              'font-sans leading-none font-semibold tracking-[0.28em] uppercase',
              isLg ? 'mt-1.5 text-[11px]' : 'mt-1 text-[10px]',
              isInvert ? 'text-ink-300' : 'text-muted-foreground',
            )}
          >
            {WORDMARK.descriptor}
          </span>
        ) : null}
      </span>
    </span>
  )
}
