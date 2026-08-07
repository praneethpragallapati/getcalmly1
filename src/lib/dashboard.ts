import {
  blankDashboard,
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
import { frequencyChip, isDoneForPeriod, timesOfDayChip } from '@/lib/taskRecurrence'
import { getSessionUserId } from '@/lib/patient'
import { resolveDueAppointments } from '@/lib/sessionLifecycle'
import { getCommunityPosts } from '@/lib/community'
import { patientCode } from '@/lib/ids'

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

/**
 * The greeting name for a signed-in patient. Uses their real name when set,
 * otherwise a friendly value derived from their email — never the demo "Priya".
 */
export function firstNameFrom(name: string | null | undefined, email: string | null | undefined): string {
  const n = name?.trim()
  if (n) return n.split(/\s+/)[0]
  const local = email?.split('@')[0]
  if (local) {
    const word = local.split(/[._\-0-9]+/).filter(Boolean)[0] || local
    return word.charAt(0).toUpperCase() + word.slice(1)
  }
  return 'there'
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
  const userId = await getSessionUserId()
  if (!userId) return demoDashboard // logged-out: bundled demo, same as blog/community

  // Settle any elapsed sessions (no-shows / auto-complete) so the home dashboard's
  // "today / next session" reflects the true state, same as the sessions page.
  await resolveDueAppointments({ patientId: userId })

  // Identity first, in its own guard: even if the analytics queries below fail
  // (e.g. a schema migration not yet applied on this DB), a signed-in patient
  // still sees a personalized EMPTY dashboard — never the "Priya" demo.
  let user: { name: string | null; email: string | null; createdAt: Date } | null = null
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    })
  } catch {
    /* fall through with a blank, unnamed dashboard */
  }

  const data = blankDashboard()
  data.name = firstNameFrom(user?.name, user?.email)
  data.patientId = patientCode(userId)
  if (user?.createdAt) {
    data.startedOn = user.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    data.daysOnPlatform = Math.max(1, Math.floor((Date.now() - user.createdAt.getTime()) / 86_400_000))
  }

  try {
    // Each query is independently resilient: if one fails (e.g. a not-yet-applied
    // migration column), only that widget goes empty — the rest of the dashboard
    // (plan, streak, check-ins) still renders. A single throw must never blank
    // everything back to the "no data" state.
    const [moods, journals, journalCount, dailyInsight, weeklyInsight, tasks, sub, appts, communityPosts] =
      await Promise.all([
        prisma.moodEntry.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 90, // enough history for the 4-week mood-over-time chart
          select: { mood: true, energy: true, calm: true, createdAt: true },
        }).catch(() => []),
        prisma.journalEntry.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: { id: true, title: true, content: true, moodTag: true, topicTags: true, createdAt: true },
        }).catch(() => []),
        prisma.journalEntry.count({ where: { userId } }).catch(() => 0),
        prisma.aiInsight.findFirst({
          where: { userId, kind: 'DAILY' },
          orderBy: { createdAt: 'desc' },
          select: { title: true, body: true, meta: true },
        }).catch(() => null),
        prisma.aiInsight.findFirst({
          where: { userId, kind: 'WEEKLY' },
          orderBy: { createdAt: 'desc' },
          select: { title: true, body: true, meta: true },
        }).catch(() => null),
        prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 10 }).catch(() => []),
        prisma.subscription.findFirst({
          where: { userId, status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          // Narrow select: avoid pulling columns a not-yet-applied migration adds.
          select: { sessionsTotal: true, sessionsUsed: true, minutesTotal: true, minutesUsed: true, paidMonths: true, planName: true },
        }).catch(() => null),
        prisma.appointment.findMany({
          where: { patientId: userId },
          orderBy: { scheduledAt: 'asc' },
          select: {
            id: true,
            scheduledAt: true,
            durationMins: true,
            status: true,
            therapist: { select: { user: { select: { name: true } } } },
          },
        }).catch(() => []),
        getCommunityPosts().catch(() => []),
      ])

    // Mood widgets always reflect the patient's OWN check-ins, never the demo
    // sample. Days (and weeks) they didn't track stay empty instead of showing
    // invented values, so the chart is honest about what was actually logged.
    // The check-in sliders show today's entry if it exists (so it can be edited),
    // otherwise they reset to 0 — a fresh start each new day.
    const sodToday = startOfDay(new Date())
    const todayEntry = moods.find((m) => startOfDay(m.createdAt) === sodToday)
    data.checkin = todayEntry
      ? { mood: todayEntry.mood, energy: todayEntry.energy, calm: todayEntry.calm ?? 0 }
      : { mood: 0, energy: 0, calm: 0 }
    data.streakDays = computeStreak(moods.map((m) => m.createdAt))

    // Last 7 calendar days, oldest→newest. A day with no check-in stays at 0.
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
      : 0 // 0 signals "no check-ins yet"; the UI renders it as "—"

    // Last 4 calendar weeks, oldest→newest, averaged from whatever check-ins land
    // in each. Empty when nothing has been logged in the window.
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
    } else {
      data.moodOverTime = []
      data.moodMonthChangePct = null
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
    data.journalCount = journalCount

    if (tasks.length > 0) {
      const now = Date.now()
      data.tasks = tasks.map<DashTask>((t) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        detail: t.description ?? undefined,
        done: isDoneForPeriod(t.completedAt, t.frequency),
        frequencyLabel: frequencyChip(t.frequency),
        timesLabel: timesOfDayChip(t.timesOfDay),
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

      // The soonest upcoming session (independent of the join window), so the
      // Home always shows "your next session" or a clear "nothing booked" state.
      const nowMs = Date.now()
      const nx = appts
        .filter((a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED' && a.scheduledAt.getTime() + a.durationMins * 60000 >= nowMs)
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0]
      if (nx) {
        data.nextSession = {
          id: nx.id,
          expert: nx.therapist.user.name ?? 'Your expert',
          when: nx.scheduledAt.toLocaleString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
          }),
          durationMins: nx.durationMins,
        }
      }
    }

    // Real milestones from actual activity. Always computed so a new patient
    // sees genuine "not yet" states instead of the demo's pre-filled progress.
    {
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
    // Analytics failed (e.g. schema drift): return the personalized EMPTY
    // dashboard we built above — a signed-in patient never sees the demo.
    return data
  }
}
