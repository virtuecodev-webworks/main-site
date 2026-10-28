'use client'

import * as React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface VantraButtonProps {
  children: React.ReactNode
  variant?: 'dark' | 'light' | 'gold' | 'ghost'
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
  variant = 'dark',
  href,
  external = false,
  type = 'button',
  disabled = false,
  onClick,
  className,
  icon,
}: VantraButtonProps) {
  const variantClass = {
    dark: 'vantra-btn-dark',
    light: 'vantra-btn-light',
    gold: 'vantra-btn-gold',
    ghost: 'vantra-btn-ghost',
  }[variant]

  const chipIcon = icon ?? <ArrowUpRight className="size-4 stroke-[2]" />

  const inner = (
    <>
      <span className="vantra-btn_text-col">
        <span className="vantra-btn_text-row" data-link-action="text-row-01">
          <span className="vantra-btn_text">{children}</span>
        </span>
        <span className="vantra-btn_text-row" data-link-action="text-row-02" aria-hidden="true">
          <span className="vantra-btn_text">{children}</span>
        </span>
      </span>
      <span className="vantra-btn_chip">
        <span className="vantra-btn_chip-icon-primary" data-link-action="chip-row-01">
          {chipIcon}
        </span>
        <span
          className="vantra-btn_chip-icon-secondary"
          data-link-action="chip-row-02"
          aria-hidden="true"
        >
          {chipIcon}
        </span>
      </span>
    </>
  )

  const classes = cn(
    'vantra-btn focus-ring',
    variantClass,
    disabled && 'pointer-events-none opacity-50',
    className,
  )

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
