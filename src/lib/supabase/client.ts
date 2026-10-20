'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from './env'

let cached: ReturnType<typeof createBrowserClient> | null = null

/**
 * Browser Supabase client. Safe to call from Client Components — returns a
 * singleton so auth state isn't duplicated across renders.
 *
 * Throws when keys are missing so misconfiguration surfaces loudly on the
 * client instead of silently failing to authenticate.
 */
export function createClient() {
  if (cached) return cached

  const env = getSupabaseEnv()
  if (!env) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local',
    )
  }

  cached = createBrowserClient(env.url, env.anonKey)
  return cached
}

export function isBrowserSupabaseConfigured() {
  return getSupabaseEnv() !== null
}
