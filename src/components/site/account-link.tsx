'use client'

import * as React from 'react'
import { LayoutDashboard, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SessionInfo {
  signedIn: boolean
  isStaff: boolean
}

/*
 * One fetch per page load, shared by every instance on the page (the header
 * renders this twice — desktop and the mobile drawer).
 */
let pending: Promise<SessionInfo> | null = null

function loadSession(): Promise<SessionInfo> {
  pending ??= fetch('/api/session', { cache: 'no-store' })
    .then((response) => (response.ok ? response.json() : null))
    .then((data): SessionInfo => ({
      signedIn: Boolean(data?.signedIn),
      isStaff: Boolean(data?.isStaff),
    }))
    .catch((): SessionInfo => ({ signedIn: false, isStaff: false }))

  return pending
}

/**
 * Signed-in state, resolved in the browser.
 *
 * Starts as `null` — "not known yet" — so the first client render matches the
 * static HTML and hydration stays clean. The signed-out link is what gets
 * painted, which is also what the great majority of visitors should see.
 */
export function useSessionInfo(): SessionInfo | null {
  const [info, setInfo] = React.useState<SessionInfo | null>(null)

  React.useEffect(() => {
    let alive = true
    void loadSession().then((value) => {
      if (alive) setInfo(value)
    })
    return () => {
      alive = false
    }
  }, [])

  return info
}

/**
 * Account entry point in the header.
 *
 * Signed out it points at the shared sign-in page; signed in it points at
 * whichever console belongs to that role. The label is given a fixed minimum
 * width by the caller so swapping between "Sign in" and "Your projects" cannot
 * nudge the rest of the header — the page has no layout shift to spare.
 */
export function AccountLink({
  className,
  onNavigate,
  size = 'sm',
  variant = 'ghost',
}: {
  className?: string
  onNavigate?: () => void
  size?: NonNullable<ButtonProps['size']>
  variant?: NonNullable<ButtonProps['variant']>
}) {
  const t = useTranslations('Nav')
  const info = useSessionInfo()

  const signedIn = info?.signedIn ?? false
  const staff = info?.isStaff ?? false

  const href = !signedIn ? '/login' : staff ? '/admin' : '/portal'
  const label = !signedIn ? t('login') : staff ? t('admin') : t('account')
  const Icon = signedIn ? LayoutDashboard : UserRound

  return (
    <Button asChild variant={variant} size={size} className={cn('gap-2 px-3', className)}>
      <Link href={href} onClick={onNavigate}>
        <Icon aria-hidden="true" className="size-4" />
        <span className="truncate">{label}</span>
      </Link>
    </Button>
  )
}
