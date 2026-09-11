/**
 * Client-safe Pulse constants (no server imports), so both the server pulse
 * layer and client components (the assign form) can share them without pulling
 * Prisma into the client bundle.
 */
export type Recurrence = 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'EVERY' | 'EVEN' | 'ODD'

/** Frequencies offered to the therapist, in order. */
export const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'FORTNIGHTLY', label: 'Fortnightly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'EVERY', label: 'Every session' },
  { value: 'EVEN', label: 'Every even session' },
  { value: 'ODD', label: 'Every odd session' },
]
export const RECURRENCE_LABEL: Record<string, string> = Object.fromEntries(RECURRENCES.map((r) => [r.value, r.label]))

/** Instruments a therapist can assign as Pulse checks. */
export const ASSIGNABLE = ['PHQ9', 'GAD7', 'GAS', 'K10', 'WHO5'] as const
