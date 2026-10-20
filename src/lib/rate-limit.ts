import 'server-only'

/**
 * Best-effort in-memory rate limiter.
 *
 * Vercel runs multiple isolated instances, so this is a speed bump rather than
 * a hard guarantee. It's enough to stop naive form/checkout spam without adding
 * an Upstash dependency. Swap in `@upstash/ratelimit` when you need it airtight.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const MAX_KEYS = 5_000

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(
  identifier: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(identifier)

  if (!existing || existing.resetAt <= now) {
    if (buckets.size > MAX_KEYS) sweep(now)
    buckets.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  existing.count += 1
  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds }
  }

  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds }
}

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/** Derives a stable client key behind Vercel's proxy chain. */
export function clientKey(headers: Headers, scope: string) {
  const forwarded = headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? headers.get('x-real-ip') ?? 'unknown'
  return `${scope}:${ip}`
}
