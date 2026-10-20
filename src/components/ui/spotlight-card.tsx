'use client'

import * as React from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
  radius?: number
}

/**
 * 21st.dev signature Spotlight Card.
 * Tracks cursor coordinates on hover to cast an ambient luminous gold glow
 * across the card borders and backdrop without compromising accessibility.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(220, 170, 40, 0.16)',
  radius = 350,
  ...props
}: SpotlightCardProps) {
  const mouseX = useMotionValue(-1000)
  const mouseY = useMotionValue(-1000)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  function handleMouseLeave() {
    mouseX.set(-1000)
    mouseY.set(-1000)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative rounded-xl border border-border bg-card p-6 text-card-foreground transition-all duration-300 hover:border-border/80 hover:shadow-lg',
        className,
      )}
      {...props}
    >
      {/* Background ambient spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              ${spotlightColor},
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
