/**
 * Shared guard for the scheduled-insight route handlers. Authenticates the caller
 * with a shared secret so only the configured scheduler (Vercel Cron, Railway,
 * GitHub Actions, etc.) can trigger generation. Accepts either an
 * `Authorization: Bearer <secret>` header or `?key=<secret>` for schedulers that
 * can't set headers. When CRON_SECRET is unset, the endpoint is disabled (403).
 */
import { aiConfig } from './config'

export function authorizeCron(req: Request): { ok: boolean; status: number } {
  if (!aiConfig.cronSecret) return { ok: false, status: 403 }
  const header = req.headers.get('authorization') ?? ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : ''
  const url = new URL(req.url)
  const key = url.searchParams.get('key') ?? ''
  const provided = bearer || key
  if (provided && provided === aiConfig.cronSecret) return { ok: true, status: 200 }
  return { ok: false, status: 401 }
}
