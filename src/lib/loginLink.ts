/**
 * The login link for someone who has just given us their phone number (the
 * assessment's details step, or direct booking): the number is filled in and
 * the code is sent on arrival, so they land on code entry. Without a usable
 * number it is the plain login page. `next` is where they go once signed in.
 */
export function loginWithCodeHref(phone: string | null | undefined, next: string): string {
  const d = (phone ?? '').replace(/\D/g, '')
  const mobile = d.length === 10 ? `91${d}` : d // 10 digits are taken as Indian
  const to = `next=${encodeURIComponent(next)}`
  return mobile.length >= 10 ? `/login?phone=${mobile}&send=1&${to}` : `/login?${to}`
}
