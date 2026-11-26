'use client'

import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { CurrencyCode } from '@/lib/constants'
import { cn, formatMoney } from '@/lib/utils'

export interface AnimatedPriceProps {
  value: number
  currency: CurrencyCode
  locale: string
  className?: string
}

/**
 * Animated formatted currency readout using Framer Motion rolling transitions.
 */
export function AnimatedPrice({
  value,
  currency,
  locale,
  className,
}: AnimatedPriceProps) {
  const prefersReducedMotion = useReducedMotion()
  const formatted = formatMoney(value, currency, locale, { decimals: false })

  if (prefersReducedMotion) {
    return (
      <span className={cn('inline-flex items-baseline tabular-nums', className)}>
        {formatted}
      </span>
    )
  }

  const chars = Array.from(formatted)

  return (
    <span
      className={cn('inline-flex items-baseline overflow-hidden tabular-nums', className)}
      aria-label={formatted}
    >
      {chars.map((char, idx) => {
        const isDigit = /\d/.test(char)
        const slotKey = `${chars.length - idx}-${isDigit ? 'd' : 's'}`
        return (
          <span key={slotKey} className="relative inline-flex overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={`${slotKey}-${char}`}
                initial={{ y: isDigit ? '65%' : 0, opacity: isDigit ? 0 : 1 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: isDigit ? '-65%' : 0, opacity: isDigit ? 0 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }}
                className="inline-block"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            </AnimatePresence>
          </span>
        )
      })}
    </span>
  )
}
