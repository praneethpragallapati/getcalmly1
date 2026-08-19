import { prisma } from '@/lib/prisma'
import { ensureFeelingSchema } from '@/lib/feeling'

/**
 * The member's achievement milestones. A broad catalog (~50) spanning
 * consistency, journaling, therapy, community and tenure, each computed from
 * real activity with a 0..1 progress so the UI can rank the nearest ones first
 * and split done vs in-progress. Everything is best-effort: a query that fails
 * (or a not-yet-migrated column) degrades that signal to 0, never the page.
 */
export type MilestoneGroup =
  | 'Consistency'
  | 'Journaling'
  | 'Therapy'
  | 'Community'
  | 'Profile'
  | 'Tenure'

export type MilestoneView = {
  key: string
  label: string
  sub: string
  done: boolean
  progress: number // 0..1
  group: MilestoneGroup
  icon: string // emoji
}

type Stats = {
  streak: number
  moodTotal: number
  journal: number
  sessions: number
  posts: number
  replies: number
  pollsVoted: number
  tasksCompleted: number
  feelingSet: boolean
  photoSet: boolean
  profileFields: number // 0..5 of the key personal fields filled
  months: number // paid months on an active plan
  daysOnPlatform: number
  meds: number
  referrals: number
  bestMoodAvg7: number // best 7-check-in rolling average of mood (0..10)
}

const startOfDayMs = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}
function streakFromDates(dates: Date[]): number {
  const days = new Set(dates.map(startOfDayMs))
  let streak = 0
  const cursor = new Date()
  if (!days.has(startOfDayMs(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(startOfDayMs(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

async function gatherStats(userId: string): Promise<Stats> {
  await ensureFeelingSchema()
  const num = (p: Promise<number>) => p.catch(() => 0)

  const [
    moodDates, moodTotal, journal, sessions, posts, replies, pollsVoted,
    tasksCompleted, user, profile, meds,
  ] = await Promise.all([
    prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 400, select: { createdAt: true, mood: true } }).catch(() => [] as { createdAt: Date; mood: number }[]),
    num(prisma.moodEntry.count({ where: { userId } })),
    num(prisma.journalEntry.count({ where: { userId } })),
    num(prisma.appointment.count({ where: { patientId: userId, status: 'COMPLETED' } })),
    num(prisma.communityPost.count({ where: { authorId: userId } })),
    num(prisma.communityComment.count({ where: { authorId: userId } })),
    num(prisma.pollVote.count({ where: { userId } })),
    num(prisma.task.count({ where: { userId, NOT: { completedAt: null } } })),
    prisma.user.findUnique({ where: { id: userId }, select: { image: true, phone: true, createdAt: true } }).catch(() => null),
    prisma.patientProfile.findUnique({ where: { userId }, select: { gender: true, dateOfBirth: true, state: true, emergencyPhone: true, feeling: true } }).catch(() => null),
    num(prisma.medication.count({ where: { userId } })),
  ])

  // Best 7-window rolling mood average (chronological).
  const chron = [...moodDates].reverse()
  let bestAvg = 0
  for (let i = 0; i + 1 <= chron.length; i++) {
    const window = chron.slice(Math.max(0, i - 6), i + 1)
    if (window.length >= 3) {
      const avg = window.reduce((s, m) => s + (m.mood ?? 0), 0) / window.length
      bestAvg = Math.max(bestAvg, avg)
    }
  }

  // Paid months on an active plan (tenure milestones).
  let months = 0
  try {
    const sub = await prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, select: { paidMonths: true } })
    months = sub?.paidMonths ?? 0
  } catch { /* ignore */ }

  // Qualified referrals (referrer side) — defensive, column may predate 0026.
  let referralCount = 0
  try {
    referralCount = await prisma.referral.count({ where: { referrerId: userId, status: 'QUALIFIED' } })
  } catch { /* ignore */ }

  const profileFields = [profile?.gender, profile?.dateOfBirth, profile?.state, profile?.emergencyPhone, user?.phone].filter(Boolean).length

  return {
    streak: streakFromDates(moodDates.map((m) => m.createdAt)),
    moodTotal,
    journal,
    sessions,
    posts,
    replies,
    pollsVoted,
    tasksCompleted,
    feelingSet: Boolean(profile?.feeling),
    photoSet: Boolean(user?.image),
    profileFields,
    months,
    daysOnPlatform: user?.createdAt ? Math.max(1, Math.floor((Date.now() - user.createdAt.getTime()) / 86_400_000)) : 0,
    meds,
    referrals: referralCount,
    bestMoodAvg7: bestAvg,
  }
}

type Def = {
  key: string
  group: MilestoneGroup
  icon: string
  label: string
  target: number
  value: (s: Stats) => number
  unit?: string // for the "N to go" copy, e.g. "sessions"
  bool?: boolean // one-shot achievement (done/not), no numeric progress copy
  doneSub?: string
}

const DEFS: Def[] = [
  // ── Consistency: check-in streaks ──
  { key: 'streak-3', group: 'Consistency', icon: '🔥', label: '3-day streak', target: 3, value: (s) => s.streak, unit: 'days' },
  { key: 'streak-7', group: 'Consistency', icon: '🔥', label: '7-day streak', target: 7, value: (s) => s.streak, unit: 'days' },
  { key: 'streak-14', group: 'Consistency', icon: '🔥', label: '2-week streak', target: 14, value: (s) => s.streak, unit: 'days' },
  { key: 'streak-21', group: 'Consistency', icon: '🔥', label: '21-day streak', target: 21, value: (s) => s.streak, unit: 'days' },
  { key: 'streak-30', group: 'Consistency', icon: '🔥', label: '30-day streak', target: 30, value: (s) => s.streak, unit: 'days' },
  { key: 'streak-60', group: 'Consistency', icon: '🔥', label: '60-day streak', target: 60, value: (s) => s.streak, unit: 'days' },
  { key: 'streak-90', group: 'Consistency', icon: '🔥', label: '90-day streak', target: 90, value: (s) => s.streak, unit: 'days' },
  { key: 'streak-180', group: 'Consistency', icon: '🏔️', label: '6-month streak', target: 180, value: (s) => s.streak, unit: 'days' },
  { key: 'streak-365', group: 'Consistency', icon: '🏆', label: '365-day streak', target: 365, value: (s) => s.streak, unit: 'days' },
  // ── Consistency: total check-ins ──
  { key: 'mood-1', group: 'Consistency', icon: '🌤️', label: 'First mood check-in', target: 1, value: (s) => s.moodTotal, bool: true, doneSub: 'Logged your first mood' },
  { key: 'mood-5', group: 'Consistency', icon: '🌤️', label: '5 mood check-ins', target: 5, value: (s) => s.moodTotal, unit: 'check-ins' },
  { key: 'mood-10', group: 'Consistency', icon: '🌤️', label: '10 mood check-ins', target: 10, value: (s) => s.moodTotal, unit: 'check-ins' },
  { key: 'mood-25', group: 'Consistency', icon: '🌤️', label: '25 mood check-ins', target: 25, value: (s) => s.moodTotal, unit: 'check-ins' },
  { key: 'mood-50', group: 'Consistency', icon: '🌦️', label: '50 mood check-ins', target: 50, value: (s) => s.moodTotal, unit: 'check-ins' },
  { key: 'mood-100', group: 'Consistency', icon: '⛅', label: '100 mood check-ins', target: 100, value: (s) => s.moodTotal, unit: 'check-ins' },
  { key: 'mood-200', group: 'Consistency', icon: '☀️', label: '200 mood check-ins', target: 200, value: (s) => s.moodTotal, unit: 'check-ins' },
  { key: 'mood-avg-7', group: 'Consistency', icon: '📈', label: 'A brighter week (avg mood 7+)', target: 7, value: (s) => s.bestMoodAvg7, bool: true, doneSub: 'Reached a 7+ weekly average' },
  { key: 'tasks-5', group: 'Consistency', icon: '✅', label: 'Complete 5 expert tasks', target: 5, value: (s) => s.tasksCompleted, unit: 'tasks' },
  { key: 'tasks-25', group: 'Consistency', icon: '✅', label: 'Complete 25 expert tasks', target: 25, value: (s) => s.tasksCompleted, unit: 'tasks' },

  // ── Journaling ──
  { key: 'journal-1', group: 'Journaling', icon: '📓', label: 'First journal entry', target: 1, value: (s) => s.journal, bool: true, doneSub: 'Wrote your first entry' },
  { key: 'journal-5', group: 'Journaling', icon: '📓', label: '5 journal entries', target: 5, value: (s) => s.journal, unit: 'entries' },
  { key: 'journal-10', group: 'Journaling', icon: '📓', label: '10 journal entries', target: 10, value: (s) => s.journal, unit: 'entries' },
  { key: 'journal-25', group: 'Journaling', icon: '📔', label: '25 journal entries', target: 25, value: (s) => s.journal, unit: 'entries' },
  { key: 'journal-50', group: 'Journaling', icon: '📔', label: '50 journal entries', target: 50, value: (s) => s.journal, unit: 'entries' },
  { key: 'journal-100', group: 'Journaling', icon: '📚', label: '100 journal entries', target: 100, value: (s) => s.journal, unit: 'entries' },

  // ── Therapy ──
  { key: 'sess-1', group: 'Therapy', icon: '🧑‍⚕️', label: 'First therapy session', target: 1, value: (s) => s.sessions, bool: true, doneSub: 'Completed your first session' },
  { key: 'sess-3', group: 'Therapy', icon: '🧑‍⚕️', label: '3 sessions', target: 3, value: (s) => s.sessions, unit: 'sessions' },
  { key: 'sess-5', group: 'Therapy', icon: '🧑‍⚕️', label: '5 sessions', target: 5, value: (s) => s.sessions, unit: 'sessions' },
  { key: 'sess-10', group: 'Therapy', icon: '💬', label: '10 sessions', target: 10, value: (s) => s.sessions, unit: 'sessions' },
  { key: 'sess-15', group: 'Therapy', icon: '💬', label: '15 sessions', target: 15, value: (s) => s.sessions, unit: 'sessions' },
  { key: 'sess-20', group: 'Therapy', icon: '💬', label: '20 sessions', target: 20, value: (s) => s.sessions, unit: 'sessions' },
  { key: 'sess-30', group: 'Therapy', icon: '🌟', label: '30 sessions', target: 30, value: (s) => s.sessions, unit: 'sessions' },
  { key: 'sess-50', group: 'Therapy', icon: '🌟', label: '50 sessions', target: 50, value: (s) => s.sessions, unit: 'sessions' },
  { key: 'meds-1', group: 'Therapy', icon: '💊', label: 'Track your first medication', target: 1, value: (s) => s.meds, bool: true, doneSub: 'Added a medication to track' },

  // ── Community ──
  { key: 'post-1', group: 'Community', icon: '📝', label: 'First community post', target: 1, value: (s) => s.posts, bool: true, doneSub: 'Shared your first post' },
  { key: 'reply-1', group: 'Community', icon: '💬', label: 'First reply to someone', target: 1, value: (s) => s.replies, bool: true, doneSub: 'Replied to a member' },
  { key: 'reply-5', group: 'Community', icon: '💬', label: '5 helpful replies', target: 5, value: (s) => s.replies, unit: 'replies' },
  { key: 'reply-20', group: 'Community', icon: '🤝', label: '20 helpful replies', target: 20, value: (s) => s.replies, unit: 'replies' },
  { key: 'post-5', group: 'Community', icon: '📝', label: '5 community posts', target: 5, value: (s) => s.posts, unit: 'posts' },
  { key: 'poll-1', group: 'Community', icon: '📊', label: 'Vote in your first poll', target: 1, value: (s) => s.pollsVoted, bool: true, doneSub: 'Cast your first vote' },
  { key: 'poll-5', group: 'Community', icon: '📊', label: 'Vote in 5 polls', target: 5, value: (s) => s.pollsVoted, unit: 'votes' },
  { key: 'refer-1', group: 'Community', icon: '🎁', label: 'Refer a friend', target: 1, value: (s) => s.referrals, bool: true, doneSub: 'A friend joined & subscribed' },

  // ── Profile ──
  { key: 'photo', group: 'Profile', icon: '🖼️', label: 'Add a profile photo', target: 1, value: (s) => (s.photoSet ? 1 : 0), bool: true, doneSub: 'Photo added' },
  { key: 'feeling', group: 'Profile', icon: '😌', label: 'Set your feeling status', target: 1, value: (s) => (s.feelingSet ? 1 : 0), bool: true, doneSub: 'Status set' },
  { key: 'profile-complete', group: 'Profile', icon: '🪪', label: 'Complete your profile', target: 5, value: (s) => s.profileFields, unit: 'fields' },

  // ── Tenure ──
  { key: 'days-7', group: 'Tenure', icon: '🌱', label: 'One week on getCalmly', target: 7, value: (s) => s.daysOnPlatform, unit: 'days' },
  { key: 'days-30', group: 'Tenure', icon: '🌿', label: 'One month on getCalmly', target: 30, value: (s) => s.daysOnPlatform, unit: 'days' },
  { key: 'mo-3', group: 'Tenure', icon: '🌳', label: '3 months with us', target: 3, value: (s) => Math.max(s.months, Math.floor(s.daysOnPlatform / 30)), unit: 'months' },
  { key: 'mo-6', group: 'Tenure', icon: '🌳', label: '6 months with us', target: 6, value: (s) => Math.max(s.months, Math.floor(s.daysOnPlatform / 30)), unit: 'months' },
  { key: 'mo-12', group: 'Tenure', icon: '🎂', label: 'One year with us', target: 12, value: (s) => Math.max(s.months, Math.floor(s.daysOnPlatform / 30)), unit: 'months' },
]

function toView(def: Def, s: Stats): MilestoneView {
  const raw = def.value(s)
  const done = raw >= def.target
  const progress = def.target > 0 ? Math.min(1, raw / def.target) : (done ? 1 : 0)
  let sub: string
  if (done) {
    sub = def.doneSub ?? 'Achieved 🎉'
  } else if (def.bool) {
    sub = 'Not yet'
  } else {
    const remaining = Math.max(0, def.target - Math.floor(raw))
    sub = `${remaining} ${def.unit ?? 'to go'} to go`
  }
  return { key: def.key, label: def.label, sub, done, progress, group: def.group, icon: def.icon }
}

/** The full milestone catalogue for a member, computed from real activity. */
export async function getMilestones(userId: string): Promise<MilestoneView[]> {
  const stats = await gatherStats(userId)
  return DEFS.map((d) => toView(d, stats))
}

export const MILESTONE_COUNT = DEFS.length
