/**
 * Resilience for outbound calls to slow / unreliable dependencies (LLM APIs,
 * SMS, email). Three guards in one wrapper:
 *
 *   1. Timeout — abort a call that hangs, so a stalled dependency can't hold a
 *      request (and its DB connection / thread) open indefinitely.
 *   2. Circuit breaker — after N failures a dependency is marked "open" and every
 *      call fast-fails for a cooldown window, instead of every request piling up
 *      against something that's already down. It closes again after the cooldown.
 *   3. Concurrency cap — bound how many calls to one dependency are in flight, so
 *      a slow dependency can't monopolise the pool.
 *
 * State is per server instance (in-memory) — the right scope for a breaker, and
 * naturally per-instance on serverless. Failures here should degrade gracefully:
 * callers already treat a missing AI answer / unsent OTP as a handled outcome.
 */

/** Thrown when the circuit is open or the concurrency cap is hit — a fast-fail. */
export class DependencyUnavailableError extends Error {
  constructor(public dep: string, reason: 'circuit_open' | 'at_capacity') {
    super(`dependency_unavailable:${dep}:${reason}`)
    this.name = 'DependencyUnavailableError'
  }
}

type State = { fails: number; openUntil: number; inflight: number }
const states = new Map<string, State>()
function stateFor(dep: string): State {
  let s = states.get(dep)
  if (!s) { s = { fails: 0, openUntil: 0, inflight: 0 }; states.set(dep, s) }
  return s
}

export type GuardOpts = {
  timeoutMs?: number
  failureThreshold?: number
  cooldownMs?: number
  maxConcurrent?: number
}

/**
 * fetch() wrapped with a timeout, a circuit breaker and a concurrency cap, keyed
 * by a dependency name (e.g. 'openai', 'msg91'). 5xx / 429 responses and thrown
 * errors count as failures; 4xx are caller errors and don't trip the breaker.
 * On an open circuit or at capacity it throws DependencyUnavailableError so the
 * caller can fall back immediately rather than wait.
 */
export async function guardedFetch(
  dep: string,
  url: string,
  init: RequestInit = {},
  opts: GuardOpts = {},
): Promise<Response> {
  const { timeoutMs = 15_000, failureThreshold = 5, cooldownMs = 30_000, maxConcurrent = 8 } = opts
  const s = stateFor(dep)
  const now = Date.now()

  if (s.openUntil > now) throw new DependencyUnavailableError(dep, 'circuit_open')
  if (s.inflight >= maxConcurrent) throw new DependencyUnavailableError(dep, 'at_capacity')

  s.inflight++
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal })
    if (res.status >= 500 || res.status === 429) recordFailure(s, failureThreshold, cooldownMs)
    else recordSuccess(s)
    return res
  } catch (e) {
    recordFailure(s, failureThreshold, cooldownMs)
    throw e
  } finally {
    clearTimeout(timer)
    s.inflight--
  }
}

function recordFailure(s: State, threshold: number, cooldownMs: number): void {
  s.fails++
  if (s.fails >= threshold) {
    s.openUntil = Date.now() + cooldownMs
    s.fails = 0 // reset the counter; the open window now governs
  }
}
function recordSuccess(s: State): void {
  s.fails = 0
  s.openUntil = 0
}
