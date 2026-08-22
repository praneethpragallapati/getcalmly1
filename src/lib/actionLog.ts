/**
 * Why a server action gave up.
 *
 * Server actions that return void bail with a bare `return`: no session, no id,
 * an ownership check that came back false. To the person who clicked, all of
 * those look identical — the form submits, the page revalidates, and nothing
 * happens. Nothing reaches the logs either, so there is no way to tell a
 * permission answer from a missing database column after the fact.
 *
 * `bail` makes the giving-up visible. It returns undefined so it can be used in
 * expression position at the point of the `return`, which keeps the call sites
 * one line each:
 *
 *     if (!ctx) return bail('assignTask', 'no clinician session')
 *
 * This is not a substitute for telling the user — an action that writes clinical
 * data should return a result the UI can show, as assignTask now does. It is the
 * floor: after this, every refusal is one log search away instead of invisible.
 */
export function bail(action: string, reason: string, meta?: Record<string, unknown>): undefined {
  const detail = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  console.warn(`[${action}] did nothing: ${reason}${detail}`)
  return undefined
}

/**
 * Log a write that threw inside a void action, so a database fault is not
 * mistaken for a no-op. Rethrows nothing: the caller has already decided this
 * failure should not take the page down.
 */
export function bailErr(action: string, e: unknown, meta?: Record<string, unknown>): undefined {
  const detail = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  const message = e instanceof Error ? e.message : String(e)
  const schema = /does not exist in the current database/i.test(message)
  console.error(
    `[${action}] FAILED${detail}${schema ? ' — a column or table is missing; run the pending migrations' : ''}`,
    e,
  )
  return undefined
}
