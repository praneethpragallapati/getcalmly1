import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

/**
 * Password hashing for email+password sign-in. Uses Node's built-in scrypt (no
 * extra dependency). Stored format: "scrypt$<saltHex>$<hashHex>". We never store
 * or log the raw password.
 */
const KEYLEN = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, KEYLEN).toString('hex')
  return `scrypt$${salt}$${derived}`
}

/**
 * A readable one-time password for admin-created accounts. Avoids ambiguous
 * characters (0/O, 1/l/I) so it's easy to read out or paste. The account is
 * flagged mustChangePassword, so this is only ever used for the first sign-in.
 */
export function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const digits = '23456789'
  const all = upper + lower + digits
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)]
  // Guarantee at least one of each class, then fill to length 10.
  const chars = [pick(upper), pick(lower), pick(digits), pick(digits)]
  while (chars.length < 10) chars.push(pick(all))
  // Fisher–Yates shuffle so the guaranteed chars aren't always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return `Gc-${chars.join('')}`
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false
  const [scheme, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  try {
    const derived = scryptSync(password, salt, KEYLEN)
    const expected = Buffer.from(hash, 'hex')
    return expected.length === derived.length && timingSafeEqual(expected, derived)
  } catch {
    return false
  }
}
