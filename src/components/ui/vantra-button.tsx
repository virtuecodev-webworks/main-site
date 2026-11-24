'use client'

import * as React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface VantraButtonProps {
  children: React.ReactNode
  hoverLabel?: React.ReactNode
  variant?: 'dark' | 'light' | 'gold' | 'ghost'
  size?: 'md' | 'sm'
  href?: string
  external?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLElement>
  className?: string
  icon?: React.ReactNode
}

export function VantraButton({
  children,
  hoverLabel,
  variant = 'dark',
  size = 'md',
  href,
  external = false,
  type = 'button',
  disabled = false,
  onClick,
  className,
  icon,
}: VantraButtonProps) {
  const isCta = variant === 'dark' || variant === 'gold'
  const chipIcon = icon ?? <ArrowUpRight className="gr-cta-arrow" strokeWidth={2.4} />

  const ctaInner = (
    <>
      <span aria-hidden="true" className="gr-cta-fill" />
      <span className="relative grid overflow-hidden">
        <span className="gr-cta-label gr-cta-label-rest">{children}</span>
        <span aria-hidden="true" className="gr-cta-label gr-cta-label-hover">
          {hoverLabel ?? children}
        </span>
      </span>
      <span aria-hidden="true" className="gr-cta-tile">
        {chipIcon}
      </span>
    </>
  )

  const legacyVariantClass = variant === 'light' ? 'vantra-btn-light' : 'vantra-btn-ghost'
  const legacyInner = (
    <>
      <span className="vantra-btn_text-col">
        <span className="vantra-btn_text-row" data-link-action="text-row-01">
          <span className="vantra-btn_text">{children}</span>
        </span>
        <span className="vantra-btn_text-row" data-link-action="text-row-02" aria-hidden="true">
          <span className="vantra-btn_text">{hoverLabel ?? children}</span>
        </span>
      </span>
      <span className="vantra-btn_chip">
        <span className="vantra-btn_chip-icon-primary" data-link-action="chip-row-01">
          {icon ?? <ArrowUpRight className="size-4 stroke-[2]" />}
        </span>
        <span
          className="vantra-btn_chip-icon-secondary"
          data-link-action="chip-row-02"
          aria-hidden="true"
        >
          {icon ?? <ArrowUpRight className="size-4 stroke-[2]" />}
        </span>
      </span>
    </>
  )

  const classes = isCta
    ? cn(
        'gr-cta gr-focus group',
        size === 'sm' && 'gr-cta-sm',
        variant === 'gold' && 'ring-1 ring-[#F6B51E]/40',
        disabled && 'pointer-events-none opacity-50',
        className,
      )
    : cn(
        'vantra-btn focus-ring',
        legacyVariantClass,
        disabled && 'pointer-events-none opacity-50',
        className,
      )

  const inner = isCta ? ctaInner : legacyInner

  if (href) {
    if (external || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
      return (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          onClick={onClick}
          className={classes}
          data-link-action="link"
        >
          {inner}
        </a>
      )
    }

    return (
      <Link href={href} onClick={onClick} className={classes} data-link-action="link">
        {inner}
      </Link>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
      data-link-action="link"
    >
      {inner}
    </button>
  )
}
