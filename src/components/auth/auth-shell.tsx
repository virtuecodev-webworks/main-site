import * as React from 'react'
import { AuthPortalShell } from '@/components/auth/auth-portal-shell'

/**
 * Calm, Simple, Client-Friendly Auth Shell.
 * Delegates to the concentric orbital portal styled in Deep Ink & Rich Gold.
 */
export async function AuthShell({
  title,
  subtitle,
  mode = 'login',
  children,
}: {
  title: string
  subtitle: string
  mode?: 'login' | 'signup' | 'recovery'
  children: React.ReactNode
}) {
  return (
    <AuthPortalShell title={title} subtitle={subtitle} mode={mode}>
      {children}
    </AuthPortalShell>
  )
}
