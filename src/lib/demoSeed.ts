/**
 * Demo activity seeding for ONE patient: ~4 weeks of realistic mood check-ins
 * and journal entries, plus the profile context (track + current situation) so
 * the daily and weekly AI insights have consistent material to react to.
 *
 * Everything reversible is tagged: mood rows use source = 'demo-seed', journals
 * carry the topic tag 'demo-seed'. clearDemoActivity removes exactly those.
 * Shared by scripts/seed-demo-activity.ts and the admin AI Health page.
 */
import { prisma } from '@/lib/prisma'
import { bandFor } from '@/lib/outcomes/instruments'
import { synthesizeSessionNote } from '@/lib/ai/synthesizer'

export const SEED_SOURCE = 'demo-seed'
export const SEED_TAG = 'demo-seed'
const SEED_ROOM = 'demo-seed'

const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)))

/** A short, consistent "situation" the insight prompts read as patient context. */
const CURRENT_SITUATION =
  'Working on sleep and a calmer evening routine. Tends to stay up late on stressful days, which knocks the next morning. Building a wind-down habit and protecting a fixed rise time.'

/** Personal & contact details so chats can be personal (therapist, from, contact). */
const PROFILE_DETAILS = {
  diagnosis: 'Adjustment difficulties with sleep disturbance',
  therapyStatus: 'ongoing',
  gender: 'Male',
  dateOfBirth: new Date('1994-06-14'),
  city: 'Bengaluru', state: 'Karnataka', country: 'IN',
  preferredLanguage: 'English',
  occupation: 'Software engineer',
  maritalStatus: 'Single',
  emergencyName: 'Anita Rao', emergencyPhone: '9000000000', emergencyRelation: 'Sister',
}

/** Improving Pulse trajectories across the month (per weekly point, oldest first). */
const PULSE_SERIES: Record<string, number[]> = {
  PHQ9: [16, 13, 9, 6, 4],
  GAD7: [14, 11, 8, 6, 5],
  GAS: [40, 55, 68, 78, 83],
  WHO5: [8, 10, 12, 13, 15],
  K10: [30, 26, 22, 19, 17],
}

const FORM_RESPONSES: Record<string, string> = {
  sleepHours: '5 to 6 hours',
  mainConcern: 'Racing thoughts at night and low energy in the mornings',
  triedBefore: 'Melatonin, cutting caffeine',
  goal: 'Fall asleep faster and wake up less tired',
}

const DEMO_TASKS = [
  { title: 'Wind-down routine before bed', description: 'No screens after 10pm, ten minutes of reading.', frequency: 'DAILY', doneDaysAgo: 1 },
  { title: 'Fixed wake-up time', description: 'Get up at 7am regardless of the night.', frequency: 'DAILY', doneDaysAgo: 2 },
  { title: 'Afternoon walk', description: 'A short walk after lunch on work days.', frequency: 'DAILY', doneDaysAgo: null },
  { title: 'Worry journal', description: 'Write the loudest thought before bed.', frequency: 'DAILY', doneDaysAgo: 3 },
  { title: 'Caffeine cut-off by 2pm', description: 'No coffee after 2pm.', frequency: 'DAILY', doneDaysAgo: null },
]

const NOTES_LOW = [
  'Barely slept, kept checking the clock past 2am.',
  'Woke up groggy and behind before the day even started.',
  'Scrolled in bed for an hour, mind would not switch off.',
  'Dragged through the morning standup, low energy all day.',
]
const NOTES_MID = [
  'Okay day. Got outside for a short walk after lunch.',
  'Steady enough. Work was busy but I paced myself.',
  'Neutral. Kept my rise time even though I was tired.',
  'Fine. Did the breathing thing before bed, small help.',
]
const NOTES_HIGH = [
  'Slept a full seven hours and it showed, felt clear.',
  'Good day. Wound down early, no screens after 10.',
  'Lighter today. The consistent bedtime is starting to pay off.',
  'Felt rested and actually present in my session.',
]

const JOURNALS = [
  { daysAgo: 25, title: 'The 2am spiral again', mood: 'Anxious',
    body: 'Another late one. I know the pattern by now: the later I stay up, the louder the worry gets. Tonight it was work, tomorrow it will be something else. Writing it down so it is out of my head and on the page instead.' },
  { daysAgo: 20, title: 'Trying a wind-down', mood: 'Okay',
    body: 'Put my phone in the other room and read for twenty minutes before bed. Fell asleep faster than I expected. One night is not a routine, but it felt like proof it can work.' },
  { daysAgo: 14, title: 'A better morning', mood: 'Calm',
    body: 'Kept my rise time even though the weekend threw it off. Morning felt less frantic and I was calmer in the team meeting. The wind-down from earlier in the week seems to be sticking.' },
  { daysAgo: 9, title: 'Work bled into the night', mood: 'Low',
    body: 'Deadline pushed and I let it follow me home. Answered messages till late and slept badly. Noting it because it is the same trigger every time: no boundary at the end of the day.' },
  { daysAgo: 4, title: 'Held the boundary', mood: 'Good',
    body: 'Set a hard stop at 9pm, no messages after. Slept better and woke up steadier. When I protect the last hour of the day, everything the next morning is easier.' },
  { daysAgo: 1, title: 'Small steady wins', mood: 'Calm',
    body: 'Four nights this week with a proper wind-down. Mood has been noticeably steadier and I am less reactive at work. Want to keep guarding these evenings.' },
]

export async function clearDemoActivity(userId: string): Promise<{ mood: number; journals: number }> {
  const m = await prisma.moodEntry.deleteMany({ where: { userId, source: SEED_SOURCE } })
  const j = await prisma.journalEntry.deleteMany({ where: { userId, topicTags: { has: SEED_TAG } } })
  // Remove the other marked demo rows too, so re-running stays idempotent.
  await prisma.assessmentScore.deleteMany({ where: { userId, version: SEED_SOURCE } }).catch(() => {})
  await prisma.task.deleteMany({ where: { userId, assignedById: SEED_SOURCE } }).catch(() => {})
  await prisma.formAssignment.deleteMany({ where: { patientId: userId, note: SEED_SOURCE } }).catch(() => {})
  await prisma.appointment.deleteMany({ where: { patientId: userId, roomId: { startsWith: SEED_ROOM } } }).catch(() => {})
  await prisma.subscription.deleteMany({ where: { userId, planName: { startsWith: 'Demo ' } } }).catch(() => {})
  return { mood: m.count, journals: j.count }
}

export async function seedDemoActivity(userId: string, weeks = 4): Promise<{ mood: number; journals: number }> {
  const days = Math.max(7, Math.min(56, Math.round(weeks) * 7))

  // Start clean so re-running is idempotent.
  await clearDemoActivity(userId)

  // The AI only reads categories the patient has allowed — turn them on.
  await prisma.privacySettings.upsert({
    where: { userId },
    create: { userId, collectMood: true, collectJournals: true, collectSessions: true, collectChats: true, feedToLlm: true },
    update: { collectMood: true, collectJournals: true, feedToLlm: true },
  })

  // Consistent profile context so the insight prompts have a stable frame.
  await prisma.patientProfile.upsert({
    where: { userId },
    create: {
      userId, patientId: `GC-P-${userId.slice(-8)}`, careMode: 'INDIVIDUAL',
      track: ['sleep'], subTrack: 'sleep', trackLabel: 'Sleep and Rest', currentSituation: CURRENT_SITUATION,
      ...PROFILE_DETAILS,
    },
    update: { track: ['sleep'], subTrack: 'sleep', trackLabel: 'Sleep and Rest', currentSituation: CURRENT_SITUATION, ...PROFILE_DETAILS },
  })

  // Mood check-ins: a rising baseline (a routine forming), a day-of-week dip
  // early in the week, journaling days nudging the next day up, light noise.
  const journalDaysAgo = new Set(JOURNALS.map((j) => j.daysAgo))
  const moodRows: { userId: string; mood: number; energy: number; calm: number; sleep: number; note: string | null; source: string; createdAt: Date }[] = []
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    date.setHours(9, 15, 0, 0)
    const dow = date.getDay()

    const trend = (days - 1 - d) / (days - 1)
    const base = 4.2 + trend * 2.6
    const dowEffect = dow === 1 ? -1.4 : dow === 0 ? -1.0 : dow === 6 ? 0.3 : dow >= 2 && dow <= 4 ? 0.5 : 0
    const journaledYesterday = journalDaysAgo.has(d + 1) ? 0.8 : 0
    const noise = (Math.sin(d * 1.7) + Math.cos(d * 0.9)) * 0.5
    const mood = clamp(base + dowEffect + journaledYesterday + noise)

    const bank = mood <= 4 ? NOTES_LOW : mood <= 6 ? NOTES_MID : NOTES_HIGH
    const note = (d * 7) % 20 < 9 ? bank[(d + dow) % bank.length] : null

    moodRows.push({
      userId, mood,
      energy: clamp(mood + (noise > 0 ? 1 : -1)),
      calm: clamp(mood - dowEffect * 0.5),
      sleep: clamp(mood + (mood <= 4 ? -1 : 1)),
      note, source: SEED_SOURCE, createdAt: new Date(date),
    })
  }
  await prisma.moodEntry.createMany({ data: moodRows })

  const journalRows = JOURNALS.filter((j) => j.daysAgo < days)
  for (const j of journalRows) {
    const date = new Date()
    date.setDate(date.getDate() - j.daysAgo)
    date.setHours(21, 30, 0, 0)
    await prisma.journalEntry.create({
      data: { userId, title: j.title, content: j.body, moodTag: j.mood, topicTags: [SEED_TAG, 'sleep'], createdAt: date },
    })
  }

  // ── Clinical context (what's helped, triggers, risk) ────────────────────────
  const CLINICAL = {
    scale: 'PHQ-9', trend: 'improving',
    whatHasHelped: ['A fixed wake-up time', 'Reading before bed instead of the phone', 'A short afternoon walk', 'Writing the loudest worry down'],
    whatHasNotHelped: ['Trying to force sleep', 'Working late into the night'],
    recurringTriggers: ['Work deadlines', 'Late-night messages', 'Skipping the wind-down'],
    sleepDisturbance: true, passiveSiHistory: false, safetyPlanActive: false,
    updatedBy: 'Demo seed',
  }
  await prisma.clinicalContext.upsert({ where: { userId }, create: { userId, ...CLINICAL }, update: CLINICAL }).catch(() => {})

  // ── Pulse self-reports across the month (marked version = demo-seed) ─────────
  const pulseRows: { userId: string; scale: string; score: number; label: string | null; source: string; version: string; recordedAt: Date }[] = []
  for (const [scale, series] of Object.entries(PULSE_SERIES)) {
    series.forEach((score, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (series.length - 1 - i) * 7)
      date.setHours(10, 0, 0, 0)
      pulseRows.push({ userId, scale, score, label: bandFor(scale, score)?.label ?? null, source: 'patient', version: SEED_SOURCE, recordedAt: date })
    })
  }
  await prisma.assessmentScore.createMany({ data: pulseRows }).catch(() => {})

  // ── One completed intake form (marked note = demo-seed) ─────────────────────
  const template = await prisma.formTemplate.findFirst({ where: { active: true }, orderBy: { kind: 'asc' }, select: { id: true } }).catch(() => null)
  if (template) {
    const fdate = new Date(); fdate.setDate(fdate.getDate() - 24)
    await prisma.formAssignment.create({
      data: { templateId: template.id, patientId: userId, assignedBy: 'Your care team', status: 'COMPLETED', responses: FORM_RESPONSES, note: SEED_SOURCE, sentAt: fdate, completedAt: fdate },
    }).catch(() => {})
  }

  // ── Tasks (marked assignedById = demo-seed) ─────────────────────────────────
  for (const t of DEMO_TASKS) {
    const created = new Date(); created.setDate(created.getDate() - 26)
    let completedAt: Date | null = null
    if (t.doneDaysAgo != null) { completedAt = new Date(); completedAt.setDate(completedAt.getDate() - t.doneDaysAgo) }
    await prisma.task.create({
      data: { userId, type: 'REFLECTION', title: t.title, description: t.description, frequency: t.frequency, assignedBy: 'Your care team', assignedById: SEED_SOURCE, createdAt: created, completedAt },
    }).catch(() => {})
  }

  // ── A therapist + two past sessions + an active plan (paid), if possible ─────
  let sessions = 0
  const therapist = await prisma.therapistProfile.findFirst({ select: { id: true, sessionFee: true, user: { select: { name: true } } } }).catch(() => null)
  if (therapist) {
    await prisma.patientProfile.update({ where: { userId }, data: { assignedTherapistId: therapist.id, assignedTherapistIndividualId: therapist.id } }).catch(() => {})
    await prisma.subscription.create({
      data: {
        userId, category: 'INDIVIDUAL', trackSlug: 'therapy', therapistId: therapist.id,
        planName: 'Demo Therapy Plan', status: 'ACTIVE', paidMonths: 1,
        sessionsTotal: 8, sessionsUsed: 2, minutesTotal: 400, minutesUsed: 100,
        expiresAt: new Date(Date.now() + 60 * 864e5),
      },
    }).catch(() => {})

    const SESSIONS = [
      { daysAgo: 21, note: 'Focus: sleep onset and morning fatigue. Reviewed the last two weeks. Patient reports racing thoughts at night, worse on work deadlines. Introduced stimulus control and a fixed wake time. Agreed a wind-down routine. Mood low but engaged. No safety concerns. PHQ-9 elevated, GAD-7 moderate. Plan: trial wind-down for two weeks, keep a worry journal.' },
      { daysAgo: 7, note: 'Follow-up. Wind-down routine kept four of seven nights. Sleep onset improving, mornings steadier. Patient noticed less reactivity at work. Reinforced fixed wake time and the afternoon walk. Discussed protecting the last hour of the day from messages. Mood improving. No risk. PHQ-9 down, GAD-7 down. Plan: continue routine, add caffeine cut-off by 2pm.' },
    ]
    for (const s of SESSIONS) {
      const when = new Date(); when.setDate(when.getDate() - s.daysAgo); when.setHours(16, 0, 0, 0)
      const ai = await synthesizeSessionNote(s.note).catch(() => null)
      await prisma.appointment.create({
        data: {
          patientId: userId, therapistId: therapist.id, scheduledAt: when, durationMins: 50,
          status: 'COMPLETED', fee: therapist.sessionFee, roomId: `${SEED_ROOM}-${crypto.randomUUID()}`,
          summary: s.note, aiSummary: ai ?? undefined,
        },
      }).catch(() => {})
      sessions++
    }
  }

  return { mood: moodRows.length, journals: journalRows.length + pulseRows.length + sessions }
}
