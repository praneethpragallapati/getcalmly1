// Bundled demo patient used to render the app dashboard when there is no live
// database / signed-in patient — mirrors the DB-with-fallback pattern used by
// blog & community. The shapes here match what `src/lib/dashboard.ts` returns.

export type CareCategoryName = 'Individual' | 'Couple' | 'Kids'
export type PlanTierName = 'Starter' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

export type MoodPoint = { day: string; score: number; today?: boolean }

export type DashTask = {
  id: string
  type: 'EXERCISE' | 'VIDEO' | 'READING' | 'REFLECTION' | 'BREATHING'
  title: string
  detail?: string
  done: boolean
  assignedBy?: string
}

export type DashSession = {
  id: string
  expert: string
  expertRole: string
  when: string // human readable
  durationMins: number
  status: 'UPCOMING' | 'SCHEDULED' | 'COMPLETED'
  hasSummary?: boolean
}

export type DashInsight = { title: string; body: string }

export type DashJournal = {
  id: string
  title: string
  date: string
  preview: string
  moodTag?: string
  topicTags: string[]
}

export type DashMedication = {
  id: string
  name: string
  dosage?: string
  frequency?: string
  times: string[]
  prescribedBy?: string
  active: boolean
}

export type PrivacyFlags = {
  collectSessions: boolean
  collectChats: boolean
  collectMood: boolean
  collectJournals: boolean
  feedToLlm: boolean
}

export type DashboardData = {
  name: string
  patientId: string
  // Subscription / plan
  category: CareCategoryName
  trackSlug: string
  trackTitle: string
  planName: string
  tier: PlanTierName
  paidMonths: number
  sessionsTotal: number
  sessionsUsed: number
  minutesTotal: number | null
  minutesUsed: number | null
  renewsOn: string | null
  // Mood / streak
  streakDays: number
  moodTrend: MoodPoint[]
  // Home content
  dailyInsight: DashInsight
  tasks: DashTask[]
  nextSession: DashSession | null
  // Other tabs
  upcoming: DashSession[]
  past: DashSession[]
  journals: DashJournal[]
  weeklyInsight: DashInsight
  medications: DashMedication[]
  privacy: PrivacyFlags
}

export const demoDashboard: DashboardData = {
  name: 'Aanya',
  patientId: 'GC-P-000482',
  category: 'Individual',
  trackSlug: 'therapy',
  trackTitle: 'Individual Therapy',
  planName: 'Calm+ Quarterly',
  tier: 'Silver',
  paidMonths: 7,
  sessionsTotal: 12,
  sessionsUsed: 5,
  minutesTotal: 600,
  minutesUsed: 250,
  renewsOn: '12 Sep 2026',
  streakDays: 6,
  moodTrend: [
    { day: 'Mon', score: 3 },
    { day: 'Tue', score: 2 },
    { day: 'Wed', score: 4 },
    { day: 'Thu', score: 3 },
    { day: 'Fri', score: 4 },
    { day: 'Sat', score: 5 },
    { day: 'Sun', score: 4, today: true },
  ],
  dailyInsight: {
    title: 'Your mood lifts on days you journal',
    body: 'Over the last week, the days you logged a journal entry scored about a point higher on mood. A short note tonight might be worth it.',
  },
  tasks: [
    {
      id: 't1',
      type: 'BREATHING',
      title: '4-7-8 breathing, twice today',
      detail: 'Once after waking, once before bed',
      done: true,
      assignedBy: 'Dr. Ananya Sharma',
    },
    {
      id: 't2',
      type: 'REFLECTION',
      title: 'Name one thing that went well',
      detail: 'Add it to your journal',
      done: false,
      assignedBy: 'Dr. Ananya Sharma',
    },
    {
      id: 't3',
      type: 'VIDEO',
      title: 'Watch: Grounding when anxious (6 min)',
      done: false,
      assignedBy: 'Dr. Ananya Sharma',
    },
  ],
  nextSession: {
    id: 's1',
    expert: 'Dr. Ananya Sharma',
    expertRole: 'Clinical Psychologist',
    when: 'Mon, 23 Jun · 3:00 PM',
    durationMins: 50,
    status: 'UPCOMING',
  },
  upcoming: [
    {
      id: 's1',
      expert: 'Dr. Ananya Sharma',
      expertRole: 'Clinical Psychologist',
      when: 'Mon, 23 Jun · 3:00 PM',
      durationMins: 50,
      status: 'UPCOMING',
    },
    {
      id: 's2',
      expert: 'Dr. Ananya Sharma',
      expertRole: 'Clinical Psychologist',
      when: 'Mon, 30 Jun · 3:00 PM',
      durationMins: 50,
      status: 'SCHEDULED',
    },
  ],
  past: [
    {
      id: 's3',
      expert: 'Dr. Ananya Sharma',
      expertRole: 'Clinical Psychologist',
      when: 'Mon, 16 Jun · 3:00 PM',
      durationMins: 50,
      status: 'COMPLETED',
      hasSummary: true,
    },
    {
      id: 's4',
      expert: 'Dr. Ananya Sharma',
      expertRole: 'Clinical Psychologist',
      when: 'Mon, 9 Jun · 3:00 PM',
      durationMins: 50,
      status: 'COMPLETED',
      hasSummary: true,
    },
  ],
  journals: [
    {
      id: 'j1',
      title: 'A calmer Sunday',
      date: '22 Jun',
      preview: 'Slept in, went for a walk by the lake. Noticed I was less in my head than usual…',
      moodTag: 'Calm',
      topicTags: ['self-care', 'rest'],
    },
    {
      id: 'j2',
      title: 'Tough morning at work',
      date: '19 Jun',
      preview: 'The review meeting left me anxious. Tried the box breathing Dr. Sharma suggested…',
      moodTag: 'Anxious',
      topicTags: ['work', 'anxiety'],
    },
    {
      id: 'j3',
      title: 'Small win',
      date: '17 Jun',
      preview: 'Said no to an extra project without over-explaining. Felt uncomfortable but right.',
      moodTag: 'Proud',
      topicTags: ['boundaries'],
    },
  ],
  weeklyInsight: {
    title: 'This week: work was your main stressor',
    body: 'Three of your five entries mentioned work pressure, often paired with anxious mood. The entry where you set a boundary stood out as a turning point worth building on.',
  },
  medications: [
    {
      id: 'm1',
      name: 'Sertraline',
      dosage: '50 mg',
      frequency: 'Once daily',
      times: ['Morning'],
      prescribedBy: 'Dr. Rohan Mehta',
      active: true,
    },
  ],
  privacy: {
    collectSessions: true,
    collectChats: true,
    collectMood: true,
    collectJournals: true,
    feedToLlm: true,
  },
}
