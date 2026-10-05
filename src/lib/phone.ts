import { countries, defaultCountry, type Country } from '@/data/countries'

/**
 * A full phone number ("+91 98765 43210", "919876543210") split into its
 * country and local part: the longest dial code that leaves a plausible local
 * number. Ten digits or fewer, with no "+", are taken as an Indian number.
 */
export function splitPhone(raw: string | null | undefined): { country: Country; local: string } {
  const s = (raw ?? '').trim()
  // Our own format, "+91 98765 43210": the code is whatever precedes the space.
  const own = /^\+(\d{1,4})\s+(.*)$/.exec(s)
  if (own) {
    const c = countries.find((x) => x.dial === own[1])
    if (c) return { country: c, local: own[2].replace(/\D/g, '') }
  }
  const d = s.replace(/\D/g, '')
  if (d.length <= 10 && !s.startsWith('+')) return { country: defaultCountry, local: d }
  const match = [...countries]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => d.startsWith(c.dial) && d.length - c.dial.length >= 6)
  return match ? { country: match, local: d.slice(match.dial.length) } : { country: defaultCountry, local: d }
}

/** "+91 9876543210" from a country and the local number; empty without one. */
export function joinPhone(country: Country, local: string): string {
  const d = local.replace(/\D/g, '')
  return d ? `+${country.dial} ${d}` : ''
}
