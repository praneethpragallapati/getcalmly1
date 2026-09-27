/**
 * Session-slot labels for the earnings ledger. No server imports, so client
 * views (the clinician and admin ledgers) can use it without pulling in Prisma.
 */

/** A weekend day that carries its own bonus. */
export type WeekendDay = 'sat' | 'sun'

/** The paid-extra slot a session fell in, e.g. "Night", "Sat", "Night · Sun"; '' for none. */
export function slotLabel(night: boolean, weekend: WeekendDay | null): string {
  return [night ? 'Night' : '', weekend === 'sat' ? 'Sat' : weekend === 'sun' ? 'Sun' : ''].filter(Boolean).join(' · ')
}
