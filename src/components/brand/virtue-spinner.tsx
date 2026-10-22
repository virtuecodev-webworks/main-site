import * as React from 'react'
import { cn } from '@/lib/utils'
import { VW_POLYGON } from '@/lib/brand/mark-geometry'

export interface VirtueSpinnerProps {
  className?: string
  /** Accessible label. Pass a title to expose the spinner to assistive tech. */
  label?: string
  /** Shows the VW monogram mark inside the spinner rings. */
  showMark?: boolean
}

/**
 * The studio's signature loading spinner.
 * Features counter-rotating rings and the VW combined monogram in the centre.
 * All gold — no green/emerald.
 */
export function VirtueSpinner({ className, label, showMark = true }: VirtueSpinnerProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      role={label ? 'img' : 'presentation'}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cn('shrink-0 overflow-visible', className)}
    >
      <defs>
        <linearGradient id="spin-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C84A" />
          <stop offset="100%" stopColor="#B8922A" />
        </linearGradient>
      </defs>

      {/* Track */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="2.5"
      />

      {/* Outer sweep — gold gradient */}
      <g
        className="animate-spin"
        style={{
          transformBox: 'view-box',
          transformOrigin: 'center',
          animationDuration: '1.2s',
        }}
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="url(#spin-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="75 45"
        />
      </g>

      {/* Inner counter-sweep */}
      <g
        className="animate-spin"
        style={{
          transformBox: 'view-box',
          transformOrigin: 'center',
          animationDuration: '1.8s',
          animationDirection: 'reverse',
        }}
      >
        <circle
          cx="24"
          cy="24"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="30 55"
        />
      </g>

      {/* VW Monogram Mark — mini filled polygon, centered */}
      {showMark ? (
        <g transform="translate(24,25.5) scale(0.145) translate(-50,-41)">
          <polygon points={VW_POLYGON} fill="url(#spin-gold)" />
        </g>
      ) : (
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      )}
    </svg>
  )
}
