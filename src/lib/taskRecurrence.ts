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
