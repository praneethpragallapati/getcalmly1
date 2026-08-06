import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Never log every query in production — it floods the serverless logs and
    // adds overhead on the hot path. Errors only in prod; full query log in dev.
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  })

// Reuse a single client across hot reloads in dev AND across warm serverless
// invocations in prod, so we don't open a fresh connection pool each time.
globalForPrisma.prisma = prisma
