import {
  blankDashboard,
  demoDashboard,
  type DashboardData,
  type DashJournal,
  type DashTask,
  type Milestone,
  type MoodOverTimePoint,
  type MoodWeekPoint,
  type InsightParts,
  type Pattern,
  type PlanTierName,
  type TodaySession,
} from '@/data/dashboardDemo'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { frequencyChip, isDoneForPeriod, timesOfDayChip } from '@/lib/taskRecurrence'
import { getSessionUserId } from '@/lib/patient'
import { resolveDueAppointments } from '@/lib/sessionLifecycle'
import { getCommunityPostsCached } from '@/lib/community'
import { patientCode } from '@/lib/ids'
import { designationOf } from '@/lib/expert'

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
export type SidebarSummary = {
  name: string
  planActive: boolean
  planName: string
  streakDays: number
  sessionsToday: number
  /** Profile photo (data URL), shown in the chrome. */
  photoUrl: string | null
}

/**
 * The slim data the dashboard chrome (sidebar + greeting) needs on EVERY page.
 * The layout renders on every navigation, so this must stay cheap — a handful of
 * tiny, indexed, parallel reads — instead of the full getDashboardData payload
 * (which does ~11 queries + session settlement and belongs only on the pages
 * that show that data). Request-memoised so the page can reuse it for free.
 */
export const getSidebarSummary = cache(async (): Promise<SidebarSummary> => {
  const fallback: SidebarSummary = { name: demoDashboard.name, planActive: false, planName: '', streakDays: 0, sessionsToday: 0, photoUrl: null }
  const userId = await getSessionUserId()
  if (!userId) return fallback
  try {
    const [user, sub, moods, appt] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, image: true } }).catch(() => null),
      prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        select: { planName: true },
      }).catch(() => null),
      prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 40, // enough to compute the streak; index-backed
        select: { createdAt: true },
      }).catch(() => []),
      prisma.appointment.findFirst({
        where: {
          patientId: userId,
          status: { notIn: ['COMPLETED', 'CANCELLED'] },
          scheduledAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
        orderBy: { scheduledAt: 'asc' },
        select: { scheduledAt: true, durationMins: true },
      }).catch(() => null),
    ])

    let sessionsToday = 0
    if (appt) {
      const start = appt.scheduledAt.getTime()
      const end = start + appt.durationMins * 60_000
      const now = Date.now()
      if (now >= start - 10 * 60_000 && now <= end) sessionsToday = 1
    }
    return {
      name: firstNameFrom(user?.name, user?.email),
      planActive: Boolean(sub),
      planName: sub?.planName ?? '',
      streakDays: computeStreak(moods.map((m) => m.createdAt)),
      sessionsToday,
      photoUrl: user?.image ?? null,
    }
  } catch {
    return fallback
  }
})

export async function getDashboardData(): Promise<DashboardData> {
  const userId = await getSessionUserId()
  if (!userId) return demoDashboard // logged-out: bundled demo, same as blog/community

  const data = blankDashboard()
  data.patientId = patientCode(userId)

  try {
    // ONE round-trip wave. At high DB latency every sequential `await` costs a
    // full round trip, so identity, session settlement and all the analytics run
    // concurrently instead of one-after-another. Settlement's effect (auto
    // complete/cancel) shows on the next load rather than this one — it's
    // idempotent and the sessions page settles too, so a one-load lag is fine.
    // Each query is independently resilient (its own .catch): if one fails only
    // that widget goes empty; the rest of the dashboard still renders.
    const [user, [moods, journals, journalCount, dailyInsight, weeklyInsight, tasks, sub, appts, communityPosts]] =
      await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, createdAt: true },
      }).catch(() => null),
      Promise.all([
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
            therapist: { select: { specializations: true, user: { select: { name: true, image: true } } } },
          },
        }).catch(() => []),
        getCommunityPostsCached().catch(() => []),
      ]),
      // Settlement runs in the same wave; its result is unused (see note above).
      resolveDueAppointments({ patientId: userId }),
    ])

    data.name = firstNameFrom(user?.name, user?.email)
    if (user?.createdAt) {
      data.startedOn = user.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      data.daysOnPlatform = Math.max(1, Math.floor((Date.now() - user.createdAt.getTime()) / 86_400_000))
    }

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

    // Last 6 calendar weeks, oldest→newest. Each point is that week's average
    // across whatever was logged in it; a week with no check-ins stays at 0.
    // Labelled by the week's start date so the axis reads as real dates.
    const SIX = 6
    const sixWeeks: MoodWeekPoint[] = []
    const todaySod = startOfDay(new Date())
    for (let w = SIX - 1; w >= 0; w--) {
      const end = todaySod - w * 7 * 86_400_000 // start-of-day, w weeks back
      const start = end - 6 * 86_400_000        // the 7-day window ending that day
      const bucket = moods.filter((m) => {
        const sod = startOfDay(m.createdAt)
        return sod >= start && sod <= end
      })
      const avg = (sel: (m: (typeof moods)[number]) => number) =>
        bucket.length ? Math.round(bucket.reduce((a, m) => a + sel(m), 0) / bucket.length) : 0
      sixWeeks.push({
        day: new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        mood: avg((m) => m.mood),
        energy: avg((m) => m.energy),
        calm: avg((m) => m.calm ?? 5),
      })
    }
    data.moodSixWeeks = sixWeeks

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
          expertRole: designationOf(todayAppt.therapist.specializations),
          expertImage: todayAppt.therapist.user.image ?? null,
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
          expertRole: designationOf(nx.therapist.specializations),
          expertImage: nx.therapist.user.image ?? null,
          when: nx.scheduledAt.toLocaleString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
          }),
          scheduledISO: nx.scheduledAt.toISOString(),
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
    // The three-part weekly insight (pattern / hidden driver / quiet win) lives
    // in AiInsight.meta. Older rows predate it and simply read as null.
    const partsOf = (meta: unknown): InsightParts | null => {
      const p = (meta as { parts?: unknown })?.parts as Record<string, unknown> | undefined
      if (!p) return null
      const s3 = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
      const parts = { pattern: s3(p.pattern), driver: s3(p.driver), win: s3(p.win) }
      return parts.pattern && parts.driver && parts.win ? parts : null
    }
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
      data.weeklyInsight = {
        title: weeklyInsight.title,
        body: weeklyInsight.body,
        parts: partsOf(weeklyInsight.meta),
      }
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
