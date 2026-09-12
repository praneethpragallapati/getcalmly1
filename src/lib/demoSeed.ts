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

export const SEED_SOURCE = 'demo-seed'
export const SEED_TAG = 'demo-seed'

const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)))

/** A short, consistent "situation" the insight prompts read as patient context. */
const CURRENT_SITUATION =
  'Working on sleep and a calmer evening routine. Tends to stay up late on stressful days, which knocks the next morning. Building a wind-down habit and protecting a fixed rise time.'

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
      userId, patientId: `GC-P-${userId.slice(-8)}`, careMode: 'INDIVIDUAL', country: 'IN',
      track: ['sleep'], subTrack: 'sleep', trackLabel: 'Sleep and Rest', currentSituation: CURRENT_SITUATION,
    },
    update: { track: ['sleep'], subTrack: 'sleep', trackLabel: 'Sleep and Rest', currentSituation: CURRENT_SITUATION },
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

  return { mood: moodRows.length, journals: journalRows.length }
}
