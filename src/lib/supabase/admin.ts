import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getServiceRoleKey, getSupabaseEnv } from './env'

let cached: SupabaseClient | null = null

/**
 * Service-role client. **Bypasses Row Level Security.**
 *
 * Only use it from trusted server paths:
 *   - the Flutterwave webhook (write transactions)
 *   - the contact pipeline (insert inquiries when RLS denies anon writes)
 *
 * Never import this from a Client Component or expose the key.
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  if (cached) return cached

  const env = getSupabaseEnv()
  const serviceKey = getServiceRoleKey()
  if (!env || !serviceKey) return null

  cached = createClient(env.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'virtueco-webworks' } },
  })

  return cached
}

let publicCached: SupabaseClient | null = null

/**
 * Anonymous, cookie-free client for **public** reads (published portfolio rows).
 *
 * Deliberately does not touch `cookies()`: it is safe to call from inside
 * `unstable_cache`, where Next.js forbids dynamic request APIs. RLS still
 * applies — the anon role can only ever see published work.
 */
export function createSupabasePublicClient(): SupabaseClient | null {
  if (publicCached) return publicCached

  const env = getSupabaseEnv()
  if (!env) return null

  publicCached = createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-application-name': 'virtueco-webworks-public' } },
  })

  return publicCached
}
