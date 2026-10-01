/**
 * A return address from a query string, only if it is a path on this site.
 * Anything else (another origin, "//evil", a backslash trick) is dropped, so a
 * link can never bounce a member off-site after they sign in.
 */
export function safeNext(v: string | string[] | null | undefined): string | null {
  const s = Array.isArray(v) ? v[0] : v
  if (!s || !s.startsWith('/') || s.startsWith('//') || s.includes('\\')) return null
  return s
}
