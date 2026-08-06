/**
 * Minimal in-memory fixed-window rate limiter (#7). Per-instance only: the
 * counters live in this process and reset on redeploy, and are NOT shared across
 * instances. That's deliberately the starting point — enough to blunt SMS-bombing
 * and account-enumeration abuse from a single origin. Swap the Map for a shared
 * store (Redis/Upstash) when running more than one instance.
 */
type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export type RateLimitResult = { ok: boolean; retryAfterSec: number }

/** Allow up to `limit` hits per `windowMs` for `key`. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  // Opportunistic sweep so the Map can't grow unbounded under many distinct keys.
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)

  const b = buckets.get(key)
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSec: 0 }
  }
  if (b.count >= limit) return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) }
  b.count += 1
  return { ok: true, retryAfterSec: 0 }
}

/** Best-effort client IP from proxy headers (x-forwarded-for wins). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return req.headers.get('x-real-ip')?.trim() || 'unknown'
}
