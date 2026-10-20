import * as React from 'react'
import { cn } from '@/lib/utils'

export interface VirtueSpinnerProps {
  className?: string
  /** Accessible label. Pass a title to expose the spinner to assistive tech. */
  label?: string
  /** Adds the illustrated monogram mark inside. */
  showMark?: boolean
}

/**
 * The studio's signature illustrated loading spinner.
 * Features counter-rotating rings and the illustrated architectural V+W monogram mark.
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
      {/* Track */}
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="2.5"
      />

      {/* Outer sweep */}
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
          stroke="currentColor"
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
          strokeOpacity="0.45"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="30 55"
        />
      </g>

      {/* Illustrated V+W Monogram Mark */}
      {showMark ? (
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer V */}
          <path d="M 16.5 19 L 24 30 L 31.5 19" strokeWidth="2.5" />
          {/* Inner W */}
          <path d="M 20 24 L 24 18 L 28 24" strokeWidth="2.0" strokeOpacity="0.8" />
          {/* Top anchor */}
          <path d="M 18.5 18 L 29.5 18" strokeWidth="1.5" strokeOpacity="0.6" />
        </g>
      ) : (
        <circle cx="24" cy="24" r="3" fill="currentColor" />
      )}
    </svg>
  )
}
