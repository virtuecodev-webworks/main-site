/**
 * Environment access for Supabase. Every helper degrades gracefully so the
 * marketing site still renders before keys are added (see `.env.example`).
 */

export interface SupabaseEnv {
  url: string
  anonKey: string
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey || url.includes('<project-ref>')) return null
  return { url, anonKey }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null
}

export function getServiceRoleKey(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return key && !key.includes('<service-role-key>') ? key : null
}

/** Emails allowed into `/admin`, in addition to any profile with role='admin'. */
export function getAdminAllowlist(): string[] {
  return (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Resolves a Supabase Storage object path to a public URL for a named bucket.
 * Returns null when the path is already absolute or storage isn't configured.
 */
export function publicStorageUrl(bucket: string, path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path

  const env = getSupabaseEnv()
  if (!env) return null

  return `${env.url}/storage/v1/object/public/${bucket}/${path.replace(/^\/+/, '')}`
}

/**
 * Resolves a portfolio screenshot path.
 *
 * The bucket is configurable so a project can point at its own storage without
 * touching code; `design-fonts` uses `publicStorageUrl` directly.
 */
export function publicMediaUrl(path: string | null | undefined): string | null {
  return publicStorageUrl(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? 'project-media', path)
}
