/**
 * Weekly patterns for the Progress tab: mood average, mood check-ins and task
 * adherence, bucketed by IST week (Monday start) from the patient's first
 * activity to now. These feed the tabbed "patterns" charts, the same way the
 * symptom trackers show a trajectory over time.
 */
import { prisma } from '@/lib/prisma'
import { istParts } from '@/lib/tz'

export type WeekPoint = { key: string; label: string; moodAvg: number | null; checkins: number; adherence: number | null }

/** Monday (IST) of the week containing `d`, as a UTC-midnight Date. */
function weekStart(d: Date): Date {
  const p = istParts(d)
  const utc = new Date(Date.UTC(p.year, p.month, p.day))
  const dow = utc.getUTCDay() // 0 Sun … 6 Sat
  const offset = (dow + 6) % 7 // days since Monday
  utc.setUTCDate(utc.getUTCDate() - offset)
  return utc
}

function keyOf(d: Date): string {
  return d.toISOString().slice(0, 10)
}
function labelOf(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const WEEK_MS = 7 * 86_400_000
const MAX_WEEKS = 16

export async function getWeeklyPatterns(userId: string): Promise<WeekPoint[]> {
  const [moods, tasks] = await Promise.all([
    prisma.moodEntry.findMany({ where: { userId }, select: { mood: true, createdAt: true } }).catch(() => []),
    prisma.task.findMany({ where: { userId }, select: { createdAt: true, completedAt: true, dueDate: true } }).catch(() => []),
  ])
  if (moods.length === 0 && tasks.length === 0) return []

  // Range: earliest activity → current week.
  const stamps = [
    ...moods.map((m) => m.createdAt.getTime()),
    ...tasks.map((t) => t.createdAt.getTime()),
  ]
  const firstWeek = weekStart(new Date(Math.min(...stamps)))
  const thisWeek = weekStart(new Date())

  // Bucket moods.
  const moodSum = new Map<string, { sum: number; n: number }>()
  for (const m of moods) {
    const k = keyOf(weekStart(m.createdAt))
    const cur = moodSum.get(k) ?? { sum: 0, n: 0 }
    cur.sum += m.mood
    cur.n += 1
    moodSum.set(k, cur)
  }

  const out: WeekPoint[] = []
  for (let t = firstWeek.getTime(); t <= thisWeek.getTime(); t += WEEK_MS) {
    const start = new Date(t)
    const end = new Date(t + WEEK_MS)
    const k = keyOf(start)
    const ms = moodSum.get(k)

    // Adherence: completed this week vs tasks active during the week.
    let completed = 0
    let active = 0
    for (const task of tasks) {
      const created = task.createdAt.getTime()
      const due = task.dueDate?.getTime() ?? null
      const activeThisWeek = created < end.getTime() && (due == null || due >= start.getTime())
      if (activeThisWeek) active += 1
      if (task.completedAt && task.completedAt.getTime() >= start.getTime() && task.completedAt.getTime() < end.getTime()) {
        completed += 1
      }
    }
    const adherence = active > 0 ? Math.min(100, Math.round((completed / active) * 100)) : null

    out.push({
      key: k,
      label: labelOf(start),
      moodAvg: ms ? Math.round((ms.sum / ms.n) * 10) / 10 : null,
      checkins: ms?.n ?? 0,
      adherence,
    })
  }
  return out.slice(-MAX_WEEKS)
}
