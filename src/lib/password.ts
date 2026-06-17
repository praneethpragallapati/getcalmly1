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
