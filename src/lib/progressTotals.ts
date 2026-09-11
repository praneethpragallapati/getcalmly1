/**
 * Lifetime activity totals for the Progress tab: how many journals, tasks,
 * mood check-ins and therapy sessions the patient has completed since joining.
 * Shared by the Progress page and its PDF export so both read the same numbers.
 */
import { prisma } from '@/lib/prisma'

export type LifetimeTotals = {
  journals: number
  tasksCompleted: number
  checkins: number
  sessions: number
}

export async function getLifetimeTotals(userId: string): Promise<LifetimeTotals> {
  const [journals, tasksCompleted, checkins, sessions] = await Promise.all([
    prisma.journalEntry.count({ where: { userId } }).catch(() => 0),
    prisma.task.count({ where: { userId, completedAt: { not: null } } }).catch(() => 0),
    prisma.moodEntry.count({ where: { userId } }).catch(() => 0),
    // Sessions the patient has actually had: completed, or scheduled in the past
    // and not cancelled. Mirrors the "sessions done" logic on the dashboard.
    prisma.appointment.count({
      where: { patientId: userId, status: { not: 'CANCELLED' }, scheduledAt: { lt: new Date() } },
    }).catch(() => 0),
  ])
  return { journals, tasksCompleted, checkins, sessions }
}
