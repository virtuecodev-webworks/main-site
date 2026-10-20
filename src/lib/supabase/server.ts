import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from './env'

/**
 * Request-scoped Supabase client for Server Components, Server Actions and
 * Route Handlers. Honours the caller's session via the cookie jar, so RLS is
 * evaluated as the signed-in user.
 *
 * Returns `null` when Supabase isn't configured yet.
 */
export async function createSupabaseServerClient() {
  const env = getSupabaseEnv()
  if (!env) return null

  // Next.js 16: `cookies()` is async.
  const cookieStore = await cookies()

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component, where Next.js forbids writing
          // cookies during render. A refreshed token therefore cannot be
          // persisted from here; the proxy's signed-out guard deliberately does
          // not depend on that, and the next Server Action or Route Handler
          // (which may set cookies) will write the rotation.
        }
      },
    },
  })
}

export type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>
