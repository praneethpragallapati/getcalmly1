import {
  demoDashboard,
  type DashboardData,
  type DashJournal,
  type MoodWeekPoint,
  type Pattern,
  type PlanTierName,
} from '@/data/dashboardDemo'
import { prisma } from '@/lib/prisma'
import { getSessionUserId } from '@/lib/patient'

/**
 * Tenure-based membership tier from cumulative paid months (#18). Kept here so
 * the same rule is used wherever a tier badge is shown.
 */
export function tierForMonths(paidMonths: number): PlanTierName {
  if (paidMonths >= 24) return 'Platinum'
  if (paidMonths >= 12) return 'Gold'
  if (paidMonths >= 6) return 'Silver'
  if (paidMonths >= 3) return 'Bronze'
  return 'Starter'
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Consecutive days (ending today or yesterday) that have at least one check-in. */
function computeStreak(dates: Date[]): number {
  const days = new Set(dates.map(startOfDay))
  let streak = 0
  const cursor = new Date()
  // allow the streak to count from today or yesterday
  if (!days.has(startOfDay(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(startOfDay(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/**
 * The signed-in patient's dashboard data.
 *
 * Reads the data we now persist (mood check-ins, journal entries) for the
 * signed-in patient and overlays it on sensible demo defaults; everything not
 * yet captured (plan, sessions, etc.) stays on demo until its phase lands. With
 * no session or no DB it returns bundled demo data — same fallback approach used
 * by blog/community.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const base = demoDashboard
  const userId = await getSessionUserId()
  if (!userId) return base

  try {
    const [moods, journals, journalCount, user, dailyInsight, weeklyInsight] = await Promise.all([
      prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.journalEntry.count({ where: { userId } }),
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.aiInsight.findFirst({
        where: { userId, kind: 'DAILY' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiInsight.findFirst({
        where: { userId, kind: 'WEEKLY' },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    if (moods.length === 0 && journalCount === 0) return base

    const data: DashboardData = { ...base }
    if (user?.name) data.name = user.name.split(' ')[0]

    if (moods.length > 0) {
      const latest = moods[0]
      data.checkin = { mood: latest.mood, energy: latest.energy, calm: latest.calm ?? 5 }
      data.streakDays = computeStreak(moods.map((m) => m.createdAt))

      // Last 7 calendar days, oldest→newest.
      const week: MoodWeekPoint[] = []
      for (let i = 6; i >= 0; i--) {
        const day = new Date()
        day.setDate(day.getDate() - i)
        const sod = startOfDay(day)
        const dayMoods = moods.filter((m) => startOfDay(m.createdAt) === sod)
        const avg = (sel: (m: (typeof moods)[number]) => number) =>
          dayMoods.length ? Math.round(dayMoods.reduce((a, m) => a + sel(m), 0) / dayMoods.length) : 0
        week.push({
          day: DAY[day.getDay()],
          mood: avg((m) => m.mood),
          energy: avg((m) => m.energy),
          calm: avg((m) => m.calm ?? 5),
        })
      }
      data.moodWeek = week
      const scored = moods.slice(0, 14)
      data.avgMood = scored.length
        ? Math.round((scored.reduce((a, m) => a + m.mood, 0) / scored.length) * 10) / 10
        : base.avgMood
    }

    if (journals.length > 0) {
      data.journals = journals.map<DashJournal>((j) => ({
        id: j.id,
        title: j.title ?? 'Untitled entry',
        date: j.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        preview: j.content,
        moodTag: j.moodTag ?? undefined,
        topicTags: j.topicTags,
      }))
    }
    data.journalCount = journalCount || base.journalCount

    // Overlay real AI insights when the scheduled jobs have produced them. The
    // Pattern cards live in AiInsight.meta.patterns (daily → detectedThisWeek on
    // Home, weekly → journalPatterns on the Journal tab); fall back to demo when absent.
    const patternsOf = (meta: unknown): Pattern[] => {
      const arr = (meta as { patterns?: unknown })?.patterns
      return Array.isArray(arr) ? (arr as Pattern[]) : []
    }
    if (dailyInsight) {
      data.dailyInsight = { title: dailyInsight.title, body: dailyInsight.body }
      const p = patternsOf(dailyInsight.meta)
      if (p.length) data.detectedThisWeek = p
    }
    if (weeklyInsight) {
      data.weeklyInsight = { title: weeklyInsight.title, body: weeklyInsight.body }
      const p = patternsOf(weeklyInsight.meta)
      if (p.length) data.journalPatterns = p
    }

    return data
  } catch {
    return base
  }
}
