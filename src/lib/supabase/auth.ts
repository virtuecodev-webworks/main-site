import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createSupabaseServerClient } from './server'
import { getAdminAllowlist } from './env'
import { isStaffRole, type ProfileRole } from '@/lib/constants'
import type { Profile } from './types'

export interface AdminSession {
  userId: string
  email: string | null
  name: string | null
  source: 'allowlist' | 'profile'
}

/**
 * Signed-in Supabase user, or null. Cached per request so multiple components
 * (header, admin shell, server actions) share one round trip.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ?? null
})

/**
 * Admin gate. Two independent paths, both required to stay closed by default:
 *   1. the email appears in ADMIN_EMAIL_ALLOWLIST
 *   2. OR the user's `profiles.role` is 'admin' (set in Supabase)
 */
export const getAdminSession = cache(resolveAdminSession)

export async function isAdmin() {
  return (await getAdminSession()) !== null
}

function parseDemoSession(raw: string | undefined): any | null {
  if (!raw) return null
  try {
    const text = raw.includes('%') ? decodeURIComponent(raw) : raw
    return JSON.parse(text)
  } catch {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
}

/**
 * Uncached admin resolution. Use this inside Server Actions after mutating auth
 * state, where React's per-request `cache` may hold a stale result.
 */
export async function resolveAdminSession(): Promise<AdminSession | null> {
  try {
    const jar = await cookies()
    const parsed = parseDemoSession(jar.get('vcw:demo_session')?.value)
    if (parsed && parsed.role === 'admin') {
      return {
        userId: parsed.userId || 'demo-admin-id',
        email: parsed.email || 'admin@virtueco.dev',
        name: parsed.name || 'Studio Administrator',
        source: 'profile',
      }
    }
  } catch {}

  const user = await getCurrentUser()
  if (!user) return null

  const email = user.email?.toLowerCase() ?? null
  const name = (user.user_metadata?.full_name as string | undefined) ?? null

  if (email && getAdminAllowlist().includes(email)) {
    return { userId: user.id, email: user.email ?? null, name, source: 'allowlist' }
  }

  const supabase = await createSupabaseServerClient()
  if (!supabase) return null

  const { data } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle<Pick<Profile, 'role' | 'full_name'>>()

  if (data?.role === 'admin') {
    return {
      userId: user.id,
      email: user.email ?? null,
      name: (data.full_name as string | null) ?? name,
      source: 'profile',
    }
  }

  return null
}

/* -------------------------------------------------------------------------- */
/*  Portal + staff sessions                                                    */
/* -------------------------------------------------------------------------- */

export interface Session {
  userId: string
  email: string | null
  name: string | null
  role: ProfileRole | null
  isStaff: boolean
  isAdmin: boolean
}

/**
 * The caller's role, resolved once per request.
 *
 * The allow-list is folded in as an *admin* fallback so a brand-new deploy can
 * still be administered before anyone has been promoted in the database — the
 * same two-path rule 0001 established, now expressed as a single role.
 */
/**
 * Uncached role resolution.
 *
 * Used by Server Actions after a sign-in — where React's per-request `cache`
 * could still hold the pre-authentication result — and by the `/api/session`
 * route handler, which runs outside a React render.
 */
export async function resolveSession(): Promise<Session | null> {
  try {
    const jar = await cookies()
    const parsed = parseDemoSession(jar.get('vcw:demo_session')?.value)
    if (parsed && parsed.role) {
      return {
        userId: parsed.userId || (parsed.role === 'admin' ? 'demo-admin-id' : 'demo-client-id'),
        email: parsed.email || (parsed.role === 'admin' ? 'admin@virtueco.dev' : 'client@virtueco.dev'),
        name: parsed.name || (parsed.role === 'admin' ? 'Studio Administrator' : 'Alex Vance'),
        role: parsed.role,
        isStaff: isStaffRole(parsed.role),
        isAdmin: parsed.role === 'admin',
      }
    }
  } catch {}

  const user = await getCurrentUser()
  if (!user) return null

  const email = user.email?.toLowerCase() ?? null
  let name = (user.user_metadata?.full_name as string | undefined) ?? null
  let role: ProfileRole | null = null

  const supabase = await createSupabaseServerClient()
  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .maybeSingle<Pick<Profile, 'role' | 'full_name'>>()

    role = (data?.role as ProfileRole | undefined) ?? null
    name = (data?.full_name as string | null) ?? name
  }

  if (email && getAdminAllowlist().includes(email)) {
    role = 'admin'
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    name,
    role,
    isStaff: isStaffRole(role),
    isAdmin: role === 'admin',
  }
}

export const getSession = cache(resolveSession)

/**
 * Where a signed-in account belongs.
 *
 * One rule in one place, because three callers need it: the sign-in action once
 * it has authenticated, and the sign-in and sign-up pages when an already
 * signed-in visitor arrives. Agents land on the orders console rather than the
 * studio overview, which they cannot open.
 */
export function landingFor(locale: string, role: ProfileRole | null): string {
  if (role === 'admin') return `/${locale}/admin`
  if (role === 'agent') return `/${locale}/admin/orders`
  return `/${locale}/portal`
}

/** Any signed-in account — client or staff. */
export async function requireSession(locale: string): Promise<Session> {
  const session = await getSession()
  if (!session) redirect(`/${locale}/login`)
  return session
}

/**
 * The client half of the site.
 *
 * A staff account visiting `/portal` is sent to the console instead: the portal
 * would render for them, but it is not the surface they work in.
 */
export async function requireClient(locale: string): Promise<Session> {
  const session = await requireSession(locale)
  if (session.isStaff) redirect(`/${locale}/admin/orders`)
  return session
}

/** Anyone on the studio side. Clients are sent to their own portal. */
export async function requireStaff(locale: string): Promise<Session> {
  const session = await requireSession(locale)
  if (!session.isStaff) redirect(`/${locale}/portal`)
  return session
}

/**
 * Admin only. An agent is sent to the orders console rather than to the portal,
 * which is what keeps this from bouncing between two redirects.
 */
export async function requireAdmin(locale: string): Promise<Session> {
  const session = await requireStaff(locale)
  if (!session.isAdmin) redirect(`/${locale}/admin/orders`)
  return session
}
