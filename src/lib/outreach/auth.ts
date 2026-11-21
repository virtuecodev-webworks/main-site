import 'server-only'

import { timingSafeEqual } from 'node:crypto'
import { resolveSession, type AdminSession } from '@/lib/supabase/auth'
import { getAdminAllowlist } from '@/lib/supabase/env'

export type AdminApiAuthResult =
  | { ok: true; session: AdminSession }
  | { ok: false; status: 401 | 403; error: string }

export type CronOrAdminApiAuthResult =
  | AdminApiAuthResult
  | { ok: true; session: { source: 'cron'; userId?: string; email?: string | null } }

function safeCompareBearerToken(authHeader: string | null, expectedSecret: string): boolean {
  if (!authHeader || !expectedSecret) return false
  const expectedHeader = `Bearer ${expectedSecret}`
  const actualBuf = Buffer.from(authHeader, 'utf8')
  const expectedBuf = Buffer.from(expectedHeader, 'utf8')

  if (actualBuf.length !== expectedBuf.length) {
    return false
  }

  return timingSafeEqual(actualBuf, expectedBuf)
}

export async function requireAdminApi(): Promise<AdminApiAuthResult> {
  const session = await resolveSession()
  if (!session) {
    return {
      ok: false,
      status: 401,
      error: 'Authentication required',
    }
  }

  if (!session.isAdmin) {
    return {
      ok: false,
      status: 403,
      error: 'Admin access required',
    }
  }

  const normalizedEmail = session.email?.toLowerCase() ?? null
  const isAllowlisted = Boolean(normalizedEmail && getAdminAllowlist().includes(normalizedEmail))

  return {
    ok: true,
    session: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      source: isAllowlisted ? 'allowlist' : 'profile',
    },
  }
}

export async function requireCronOrAdminApi(
  request: Request,
): Promise<CronOrAdminApiAuthResult> {
  const cronSecret = process.env.CRON_SECRET?.trim() ?? ''
  const authHeader = request.headers.get('authorization')

  if (cronSecret.length > 0 && safeCompareBearerToken(authHeader, cronSecret)) {
    return {
      ok: true,
      session: {
        source: 'cron',
      },
    }
  }

  return requireAdminApi()
}
