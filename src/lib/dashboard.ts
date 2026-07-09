import {
  demoDashboard,
  type DashboardData,
  type DashJournal,
  type DashTask,
  type Milestone,
  type MoodOverTimePoint,
  type MoodWeekPoint,
  type Pattern,
  type PlanTierName,
  type TodaySession,
} from '@/data/dashboardDemo'
import { prisma } from '@/lib/prisma'
import { frequencyChip, isDoneForPeriod } from '@/lib/taskRecurrence'
import { getSessionUserId } from '@/lib/patient'
import { getCommunityPosts } from '@/lib/community'

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

/**
 * A patient's last-7-day progress summary, expert-assigned task completion plus
 * mood check-in activity. Shared by the patient's Progress page and the expert's
 * patient profile so both sides read the exact same numbers from the same source.
 * Denominator is tasks assigned in the window; completion counts toward progress.
 */
export type WeeklyProgress = {
  tasksAssigned: number
  tasksCompleted: number
  completionPct: number
  moodCheckins: number
  moodAvg: number | null
}

export async function getWeeklyProgress(userId: string): Promise<WeeklyProgress> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  try {
    const [tasks, moods] = await Promise.all([
      prisma.task.findMany({ where: { userId, createdAt: { gte: weekAgo } } }),
      prisma.moodEntry.findMany({ where: { userId, createdAt: { gte: weekAgo } }, select: { mood: true } }),
    ])
    const tasksCompleted = tasks.filter((t) => t.completedAt).length
    const moodAvg = moods.length
      ? Math.round((moods.reduce((a, m) => a + m.mood, 0) / moods.length) * 10) / 10
      : null
    return {
      tasksAssigned: tasks.length,
      tasksCompleted,
      completionPct: tasks.length ? Math.round((tasksCompleted / tasks.length) * 100) : 0,
      moodCheckins: moods.length,
      moodAvg,
    }
  } catch {
    return { tasksAssigned: 0, tasksCompleted: 0, completionPct: 0, moodCheckins: 0, moodAvg: null }
  }
}

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
 * no session or no DB it returns bundled demo data, same fallback approach used
 * by blog/community.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const base = demoDashboard
  const userId = await getSessionUserId()
  if (!userId) return base

  try {
    const [moods, journals, journalCount, user, dailyInsight, weeklyInsight, tasks, sub, appts, communityPosts] =
      await Promise.all([
        prisma.moodEntry.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 90, // enough history for the 4-week mood-over-time chart
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
        prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }),
        prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
        prisma.appointment.findMany({
          where: { patientId: userId },
          orderBy: { scheduledAt: 'asc' },
          include: { therapist: { include: { user: { select: { name: true } } } } },
        }),
        getCommunityPosts(),
      ])

    if (moods.length === 0 && journalCount === 0 && tasks.length === 0 && !sub && appts.length === 0) return base

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

      // Last 4 calendar weeks, oldest→newest, averaged from whatever check-ins land in each.
      const weekBuckets: { mood: number }[][] = [[], [], [], []]
      const now2 = Date.now()
      for (const m of moods) {
        const daysAgo = Math.floor((now2 - m.createdAt.getTime()) / (24 * 60 * 60 * 1000))
        const weekIndex = 3 - Math.floor(daysAgo / 7) // 3 = this week, 0 = oldest of the 4
        if (weekIndex >= 0 && weekIndex < 4) weekBuckets[weekIndex].push({ mood: m.mood })
      }
      const hasAnyBucket = weekBuckets.some((b) => b.length > 0)
      if (hasAnyBucket) {
        data.moodOverTime = weekBuckets.map<MoodOverTimePoint>((bucket, i) => ({
          label: `Week ${i + 1}`,
          value: bucket.length ? Math.round((bucket.reduce((a, m) => a + m.mood, 0) / bucket.length) * 10) / 10 : 0,
        }))
        const firstNonEmpty = weekBuckets.find((b) => b.length > 0)
        const lastNonEmpty = [...weekBuckets].reverse().find((b) => b.length > 0)
        if (firstNonEmpty && lastNonEmpty && firstNonEmpty !== lastNonEmpty) {
          const startAvg = firstNonEmpty.reduce((a, m) => a + m.mood, 0) / firstNonEmpty.length
          const endAvg = lastNonEmpty.reduce((a, m) => a + m.mood, 0) / lastNonEmpty.length
          data.moodMonthChangePct = startAvg > 0 ? Math.round(((endAvg - startAvg) / startAvg) * 100) : null
        } else {
          data.moodMonthChangePct = null
        }
      }
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

    if (tasks.length > 0) {
      const now = Date.now()
      data.tasks = tasks.map<DashTask>((t) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        detail: t.description ?? undefined,
        done: isDoneForPeriod(t.completedAt, t.frequency),
        frequencyLabel: frequencyChip(t.frequency),
        assignedBy: t.assignedBy ?? undefined,
        dueLabel: t.dueDate
          ? t.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : undefined,
        expired: Boolean(t.dueDate && !t.completedAt && t.dueDate.getTime() < now),
      }))
    }

    const completedAppts = appts.filter((a) => a.status === 'COMPLETED' || a.scheduledAt.getTime() < Date.now())
    if (sub) {
      data.sessionsTotal = sub.sessionsTotal
      data.sessionsUsed = sub.sessionsUsed
      data.sessionsDone = sub.sessionsUsed
      data.minutesTotal = sub.minutesTotal
      data.minutesUsed = sub.minutesUsed
      data.tier = tierForMonths(sub.paidMonths)
      data.paidMonths = sub.paidMonths
      data.planName = sub.planName
      data.planActive = true
    } else if (appts.length > 0) {
      // No active subscription row, but real appointments exist, count from those.
      data.sessionsDone = completedAppts.length
      data.planActive = false
    }

    // Today's session, computed straight from real appointments (same join window
    // as the Sessions page) rather than from demo.
    if (appts.length > 0) {
      const now3 = Date.now()
      const JOIN_WINDOW_MS = 10 * 60 * 1000
      const todayAppt = appts.find((a) => {
        const start = a.scheduledAt.getTime()
        const end = start + a.durationMins * 60 * 1000
        return a.status !== 'COMPLETED' && now3 >= start - JOIN_WINDOW_MS && now3 <= end
      })
      if (todayAppt) {
        const startMs = todayAppt.scheduledAt.getTime() - now3
        const mins = Math.max(0, Math.round(startMs / 60000))
        const startsIn =
          mins <= 0
            ? 'Starting now'
            : mins < 60
              ? `Starting in ${mins} minute${mins === 1 ? '' : 's'}`
              : `Starting in ${Math.floor(mins / 60)} hour${Math.floor(mins / 60) === 1 ? '' : 's'} ${mins % 60} minute${mins % 60 === 1 ? '' : 's'}`
        data.todaySession = {
          id: todayAppt.id,
          expert: todayAppt.therapist.user.name ?? 'Your expert',
          expertRole: 'Clinical Psychologist',
          when: todayAppt.scheduledAt.toLocaleString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          }),
          scheduledISO: todayAppt.scheduledAt.toISOString(),
          durationMins: todayAppt.durationMins,
          status: 'UPCOMING',
          sessionNo: completedAppts.length + 1,
          tags: [],
          startsIn,
        } as TodaySession
      } else {
        data.todaySession = null
      }
    }

    // Real milestones from actual activity, falls back to demo wording only when
    // nothing has happened yet for a given milestone.
    if (moods.length > 0 || completedAppts.length > 0 || data.streakDays > 0) {
      const earliestMood = moods.length ? moods[moods.length - 1] : null
      const firstCompletedAppt = completedAppts[0] ?? null
      const sessionsForMilestone = sub ? sub.sessionsUsed : completedAppts.length
      const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      data.milestones = [
        {
          label: 'First mood check-in',
          sub: earliestMood ? `Completed ${fmt(earliestMood.createdAt)}` : 'Not yet logged',
          done: Boolean(earliestMood),
        },
        {
          label: 'First therapy session',
          sub: firstCompletedAppt ? `Completed ${fmt(firstCompletedAppt.scheduledAt)}` : 'No sessions completed yet',
          done: Boolean(firstCompletedAppt),
        },
        {
          label: '7-day streak',
          sub: data.streakDays >= 7 ? 'Achieved 🔥' : `${7 - data.streakDays} days to go`,
          done: data.streakDays >= 7,
        },
        {
          label: '30-day streak',
          sub: data.streakDays >= 30 ? 'Achieved 🔥' : `${30 - data.streakDays} days to go`,
          done: data.streakDays >= 30,
        },
        {
          label: '10 therapy sessions',
          sub: sessionsForMilestone >= 10 ? 'Achieved' : `${10 - sessionsForMilestone} sessions to go`,
          done: sessionsForMilestone >= 10,
        },
      ] satisfies Milestone[]
    }

    // Real community discussions (top 3, newest first) instead of the demo preview.
    if (communityPosts.length > 0) {
      data.community = communityPosts.slice(0, 3).map((p) => ({
        author: p.author,
        role: p.role,
        text: p.body,
        likes: p.upvotes,
        comments: p.comments,
      }))
    }

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
