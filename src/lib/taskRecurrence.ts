// Task recurrence: therapist-assigned tasks can repeat until their expiry.
// `completedAt` stores the latest completion; whether the task is "done"
// right now is derived from the frequency window, so a DAILY task re-opens
// each day, WEEKLY each 7 days, and so on, until dueDate passes.

export const TASK_FREQUENCIES = ['ONE_TIME', 'DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY'] as const
export type TaskFrequency = (typeof TASK_FREQUENCIES)[number]

export const FREQUENCY_LABEL: Record<TaskFrequency, string> = {
  ONE_TIME: 'One-time',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  FORTNIGHTLY: 'Fortnightly',
  MONTHLY: 'Monthly',
}

export function normalizeFrequency(raw: string | null | undefined): TaskFrequency {
  return (TASK_FREQUENCIES as readonly string[]).includes(raw ?? '') ? (raw as TaskFrequency) : 'ONE_TIME'
}

// When in the day the task should be done. Any subset can be picked; empty
// means no particular time. Shared by therapist→patient and admin→therapist
// assignment so both use the exact same vocabulary.
export const TASK_TIMES_OF_DAY = ['Morning', 'Afternoon', 'Evening'] as const
export type TaskTimeOfDay = (typeof TASK_TIMES_OF_DAY)[number]

/** Keep only valid, de-duplicated times, in canonical Morning→Evening order. */
export function normalizeTimesOfDay(raw: (string | null | undefined)[]): TaskTimeOfDay[] {
  const picked = new Set(raw.filter(Boolean).map(String))
  return TASK_TIMES_OF_DAY.filter((t) => picked.has(t))
}

/** Short label for the task lists ("Morning · Evening"); empty for none. */
export function timesOfDayChip(times: string[] | null | undefined): string | undefined {
  const t = normalizeTimesOfDay(times ?? [])
  return t.length ? t.join(' · ') : undefined
}

/** Human chip for the patient/expert task lists ("Daily", "Weekly", …); empty for one-time. */
export function frequencyChip(raw: string | null | undefined): string | undefined {
  const f = normalizeFrequency(raw)
  return f === 'ONE_TIME' ? undefined : FREQUENCY_LABEL[f]
}

const sameCalendarDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

/** Whether the task counts as done for the CURRENT period of its frequency. */
export function isDoneForPeriod(
  completedAt: Date | null | undefined,
  frequency: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!completedAt) return false
  const f = normalizeFrequency(frequency)
  if (f === 'ONE_TIME') return true
  if (f === 'DAILY') return sameCalendarDay(completedAt, now)
  const days = f === 'WEEKLY' ? 7 : f === 'FORTNIGHTLY' ? 14 : 30
  return now.getTime() - completedAt.getTime() < days * 24 * 60 * 60 * 1000
}
