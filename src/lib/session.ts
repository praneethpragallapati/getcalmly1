import { cache } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * The current auth session, memoised for the duration of a single request via
 * React `cache()`. A dashboard render calls `getServerSession` from the layout,
 * the page, and several data helpers — without this each call re-decodes the JWT
 * and re-runs the session callback (which reads the DB). Deduping collapses all
 * of those to one resolution per request. Use this everywhere instead of calling
 * getServerSession directly.
 */
export const getAuthSession = cache(() => getServerSession(authOptions))

type SessionUser = { id?: string; role?: string; name?: string | null; adminType?: string | null }

/** The signed-in user's id, or null. Request-memoised. */
export async function getUserId(): Promise<string | null> {
  const session = await getAuthSession()
  return (session?.user as SessionUser | undefined)?.id ?? null
}

/** The signed-in user's { id, role }, or null. Request-memoised. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getAuthSession()
  return (session?.user as SessionUser | undefined) ?? null
}
