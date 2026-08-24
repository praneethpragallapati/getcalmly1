// Bundled demo patient used to render the patient web dashboard when there is no
// live database / signed-in patient, mirrors the DB-with-fallback pattern used
// by blog & community. Shapes here match what `src/lib/dashboard.ts` returns.
// Visual reference: Drive "getcalmly-patient-dashboard-v2.html" (desktop web).

export type CareCategoryName = 'Individual' | 'Couple' | 'Kids'
export type PlanTierName = 'Starter' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type Tone = 'coral' | 'green' | 'gold' | 'purple'

export type CheckinScores = { mood: number; energy: number; calm: number } // 0–10
export type MoodWeekPoint = { day: string; mood: number; energy: number; calm: number }

export type DashTask = {
  id: string
  type: 'EXERCISE' | 'VIDEO' | 'READING' | 'REFLECTION' | 'BREATHING'
  title: string
  detail?: string
  done: boolean
  frequencyLabel?: string // "Daily" / "Weekly" … for recurring tasks
  timesLabel?: string // "Morning · Evening" … when a time of day is set
  assignedBy?: string
  dueLabel?: string // human-readable expiry, when set
  expired?: boolean // past its dueDate and not done
}

export type DashSession = {
  id: string
  expert: string
  expertRole: string
  /** Expert's profile photo, when they've set one. */
  expertImage?: string | null
  when: string // human readable
  scheduledISO?: string // machine-readable start, when known (real appointments)
  durationMins: number
  status: 'UPCOMING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  /**
   * A session that ended as a CANCELLED row but was still CHARGED — a no-show
   * that wasn't cancelled in time, where neither side joined. The slot was used
   * and NOT returned to the package. Kept apart from a plain cancellation, which
   * IS refunded, so the two never share the word "Cancelled" — that word reads
   * as "you'll get this back", which is the opposite of what happened here.
   */
  chargedNoShow?: boolean
  sessionNo?: number
  tags?: string[]
  hasSummary?: boolean
  // The patient's own rating for this session (1–5), or null when not yet rated.
  // Only set for real, past appointments; drives the post-session rating prompt.
  myRating?: number | null
  reviewable?: boolean
  // Whether this patient has already joined the room once (drives re-entry).
  joinedThisSide?: boolean
}

export type TodaySession = DashSession & { startsIn: string; tags: string[]; sessionNo: number }

/** The three parts a weekly insight is written in. */
export type InsightParts = { pattern: string; driver: string; win: string }
export type DashInsight = { title: string; body: string; parts?: InsightParts | null }
export type Pattern = { title: string; sub: string; tone: Tone }

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
  durationDays?: number
  prescribedBy?: string
  active: boolean
}

export type Milestone = { label: string; sub: string; done: boolean }
export type MoodOverTimePoint = { label: string; value: number }
export type CommunityPreview = {
  author: string
  role: string
  text: string
  likes: number
  comments: number
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
  startedOn: string
  daysOnPlatform: number
  planActive: boolean
  // Mood / streak
  streakDays: number
  checkin: CheckinScores
  moodWeek: MoodWeekPoint[]
  /** Last 6 calendar weeks, oldest→newest; each point is that week's average. */
  moodSixWeeks: MoodWeekPoint[]
  avgMood: number
  moodOverTime: MoodOverTimePoint[]
  moodMonthChangePct: number | null
  // Home content
  dailyInsight: DashInsight | null
  detectedThisWeek: Pattern[]
  tasks: DashTask[]
  todaySession: TodaySession | null
  // The soonest upcoming session (may be the same one shown as todaySession when
  // it's within the join window); null when nothing is booked.
  nextSession: { id: string; expert: string; expertRole?: string; expertImage?: string | null; when: string; durationMins: number; scheduledISO?: string } | null
  community: CommunityPreview[]
  // Sessions
  upcoming: DashSession[]
  past: DashSession[]
  // Journal
  journals: DashJournal[]
  journalPatterns: Pattern[]
  weeklyInsight: DashInsight | null
  // Progress
  milestones: Milestone[]
  sessionsDone: number
  journalCount: number
  // Other
  medications: DashMedication[]
  privacy: PrivacyFlags
}

/**
 * A fully-empty dashboard for a signed-in patient. Used as the starting point
 * (and the error fallback) so a real user NEVER sees the "Priya" demo — only
 * their own data, or honest empty states. Content is filled in from the DB.
 */
export function blankDashboard(): DashboardData {
  return {
    ...demoDashboard,
    name: '',
    patientId: '',
    planName: 'No active plan',
    tier: 'Starter',
    paidMonths: 0,
    sessionsTotal: 0,
    sessionsUsed: 0,
    minutesTotal: null,
    minutesUsed: null,
    renewsOn: null,
    startedOn: '—',
    daysOnPlatform: 0,
    planActive: false,
    streakDays: 0,
    checkin: { mood: 0, energy: 0, calm: 0 },
    moodWeek: [],
    moodSixWeeks: [],
    avgMood: 0,
    moodOverTime: [],
    moodMonthChangePct: null,
    dailyInsight: null,
    detectedThisWeek: [],
    tasks: [],
    todaySession: null,
    nextSession: null,
    community: [],
    upcoming: [],
    past: [],
    journals: [],
    journalPatterns: [],
    weeklyInsight: null,
    milestones: [],
    sessionsDone: 0,
    journalCount: 0,
    medications: [],
  }
}

export const demoDashboard: DashboardData = {
  name: 'Priya',
  patientId: 'P-000482',
  category: 'Individual',
  trackSlug: 'therapy',
  trackTitle: 'Individual Therapy',
  planName: 'Growth Plan',
  tier: 'Silver',
  paidMonths: 7,
  sessionsTotal: 12,
  sessionsUsed: 5,
  minutesTotal: 600,
  minutesUsed: 250,
  renewsOn: '12 Sep 2026',
  startedOn: '3 Feb 2026',
  daysOnPlatform: 28,
  planActive: true,
  streakDays: 7,
  checkin: { mood: 6, energy: 5, calm: 4 },
  moodWeek: [
    { day: 'Mon', mood: 5, energy: 4, calm: 4 },
    { day: 'Tue', mood: 4, energy: 4, calm: 3 },
    { day: 'Wed', mood: 6, energy: 5, calm: 5 },
    { day: 'Thu', mood: 5, energy: 5, calm: 4 },
    { day: 'Fri', mood: 7, energy: 6, calm: 5 },
    { day: 'Sat', mood: 8, energy: 7, calm: 7 },
    { day: 'Sun', mood: 7, energy: 6, calm: 6 },
  ],
  moodSixWeeks: [
    { day: '7 Jul', mood: 4, energy: 4, calm: 3 },
    { day: '14 Jul', mood: 5, energy: 4, calm: 4 },
    { day: '21 Jul', mood: 5, energy: 5, calm: 4 },
    { day: '28 Jul', mood: 6, energy: 5, calm: 5 },
    { day: '4 Aug', mood: 6, energy: 6, calm: 5 },
    { day: '11 Aug', mood: 7, energy: 6, calm: 6 },
  ],
  avgMood: 6.4,
  moodOverTime: [
    { label: 'Week 1', value: 5.2 },
    { label: 'Week 2', value: 5.8 },
    { label: 'Week 3', value: 6.1 },
    { label: 'Week 4', value: 6.4 },
  ],
  moodMonthChangePct: 18,
  dailyInsight: {
    title: 'Mondays tend to feel heavier for you, and that’s okay.',
    body: 'Your data shows a gentle mood dip each Monday morning. Before your session with Dr. Ananya at 3 PM today, a short breathing exercise has helped you arrive calmer in the past. You’ve been consistent, and that matters more than how you feel right now.',
  },
  detectedThisWeek: [
    { title: 'Work anxiety peaking Sundays', sub: '6 of 12 entries mention work', tone: 'coral' },
    { title: 'Mindfulness lifts your mood', sub: '+34% on stillness days', tone: 'green' },
    { title: 'Calm score up 18% this week', sub: 'Steady improvement since W2', tone: 'gold' },
  ],
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
  todaySession: {
    id: 's1',
    expert: 'Dr. Ananya Sharma',
    expertRole: 'Clinical Psychologist · RCI Verified · 8 yrs',
    when: 'Monday, 2 March · 3:00 PM',
    durationMins: 50,
    status: 'UPCOMING',
    startsIn: 'Starting in 5 hours 19 minutes',
    sessionNo: 4,
    tags: ['CBT', 'Work anxiety'],
  },
  nextSession: null,
  community: [
    {
      author: 'meera_k',
      role: 'Anxiety Warriors',
      text: 'Has anyone tried the 5-4-3-2-1 grounding technique? It’s been a game-changer 🌿',
      likes: 34,
      comments: 12,
    },
    {
      author: 'shruti.m',
      role: 'Depression Support',
      text: '3 months into therapy and I actually laughed today 🙂',
      likes: 142,
      comments: 21,
    },
    {
      author: 'arjun_22',
      role: 'Work Wellness',
      text: 'Set a boundary with my manager today. Terrifying but necessary 🙌',
      likes: 58,
      comments: 9,
    },
  ],
  upcoming: [
    {
      id: 's1',
      expert: 'Dr. Ananya Sharma',
      expertRole: 'Clinical Psychologist',
      when: 'Monday, 9 March · 3:00 PM',
      durationMins: 50,
      status: 'UPCOMING',
    },
    {
      id: 's2',
      expert: 'Dr. Ananya Sharma',
      expertRole: 'Clinical Psychologist',
      when: 'Monday, 16 March · 3:00 PM',
      durationMins: 50,
      status: 'SCHEDULED',
    },
  ],
  past: [
    {
      id: 's3',
      expert: 'Dr. Ananya Sharma',
      expertRole: 'Clinical Psychologist',
      when: 'Monday, 24 Feb · 3:00 PM',
      durationMins: 50,
      status: 'COMPLETED',
      sessionNo: 3,
      hasSummary: true,
    },
    {
      id: 's4',
      expert: 'Dr. Ananya Sharma',
      expertRole: 'Clinical Psychologist',
      when: 'Monday, 17 Feb · 3:00 PM',
      durationMins: 50,
      status: 'COMPLETED',
      sessionNo: 2,
      hasSummary: true,
    },
  ],
  journals: [
    {
      id: 'j1',
      title: 'Session prep: what I want to say',
      date: 'Today, 8:30 AM',
      preview:
        'Before today’s session I want to bring up the work anxiety that’s been creeping in during Sunday nights. It started after the project deadline moved up last month and I haven’t been able to shake it since…',
      moodTag: 'Anxious',
      topicTags: ['Work', 'Session prep'],
    },
    {
      id: 'j2',
      title: 'A moment of stillness',
      date: 'Yesterday, 7:15 AM',
      preview:
        'I sat by the window this morning with tea and didn’t look at my phone for 20 minutes. It was the quietest I’ve felt in weeks. The light was coming in sideways and I noticed how the dust caught it…',
      moodTag: 'Calm',
      topicTags: ['Mindfulness'],
    },
    {
      id: 'j3',
      title: 'The meeting that spiralled',
      date: 'Sat, 28 Feb',
      preview:
        'It started with a simple comment from my manager and I found myself replaying it for the next three hours. I kept thinking, did I say something wrong? Did they mean it as a criticism?…',
      moodTag: 'Low',
      topicTags: ['Work', 'Rumination'],
    },
    {
      id: 'j4',
      title: 'After the session, feeling lighter',
      date: 'Mon, 24 Feb',
      preview:
        'Dr. Ananya helped me reframe something I’ve been carrying for months. She asked me: what would I say to a friend who was in exactly my situation? And I realised I’d never speak to a friend the way I speak to myself…',
      moodTag: 'Good',
      topicTags: ['Post-session'],
    },
  ],
  journalPatterns: [
    { title: 'Work comes up a lot', sub: 'Mentioned in 8 of your last 12 entries', tone: 'coral' },
    { title: 'Sunday anxiety pattern', sub: 'Mood dips Sunday evenings consistently', tone: 'gold' },
    { title: 'Mindfulness helps', sub: 'Mood +34% on stillness days', tone: 'green' },
  ],
  weeklyInsight: {
    title: 'This week: work was your main stressor',
    body: 'Three of your five entries mentioned work pressure, often paired with anxious mood. The entry where you set a boundary stood out as a turning point worth building on.',
    parts: {
      pattern: 'your anxiety runs highest on Sunday nights, right before your Monday stand-up.',
      driver: 'nights under 6 hours of sleep double the self-criticism in your journal the next day.',
      win: 'on weeks you journal 4+ days, your mood recovers almost twice as fast.',
    },
  },
  milestones: [
    { label: 'First mood check-in', sub: 'Completed 3 Feb', done: true },
    { label: 'First therapy session', sub: 'Completed 10 Feb', done: true },
    { label: '7-day streak', sub: 'Achieved today 🔥', done: true },
    { label: '30-day streak', sub: '23 days to go', done: false },
    { label: '10 therapy sessions', sub: '7 sessions to go', done: false },
  ],
  sessionsDone: 3,
  journalCount: 14,
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
