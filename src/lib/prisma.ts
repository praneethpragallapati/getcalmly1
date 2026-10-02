import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * The runtime connection string, made safe for serverless. Each function
 * instance holds its own pool, so on Supabase:
 * - the session pooler (port 5432 on *.pooler.supabase.com) gives every client
 *   a dedicated connection and runs out at its pool size (15), which locks
 *   everyone out with EMAXCONNSESSION. The transaction pooler (port 6543) on the
 *   same host shares connections, so we use it, in pgbouncer mode.
 * - Prisma's pool per instance is kept small (a page runs a few queries in
 *   parallel, so one connection made them queue and time out), with a longer
 *   wait before giving up.
 * Anything else (a local or direct database) is left exactly as configured.
 */
function runtimeUrl(raw: string | undefined): string | undefined {
  if (!raw || process.env.NODE_ENV !== 'production') return raw
  try {
    const u = new URL(raw)
    if (!u.hostname.endsWith('pooler.supabase.com')) return raw
    if (u.port === '5432' || u.port === '') u.port = '6543'
    if (u.port === '6543' && !u.searchParams.has('pgbouncer')) u.searchParams.set('pgbouncer', 'true')
    if (!u.searchParams.has('connection_limit')) u.searchParams.set('connection_limit', '5')
    if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '20')
    return u.toString()
  } catch {
    return raw
  }
}

const url = runtimeUrl(process.env.DATABASE_URL)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(url ? { datasources: { db: { url } } } : {}),
    // Never log every query in production — it floods the serverless logs and
    // adds overhead on the hot path. Errors only in prod; full query log in dev.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  })

// Reuse a single client across hot reloads in dev AND across warm serverless
// invocations in prod, so we don't open a fresh connection pool each time.
globalForPrisma.prisma = prisma
