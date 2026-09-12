/**
 * Seed ~4 weeks of realistic mood check-ins and journal entries for ONE patient,
 * so you can watch the daily and weekly AI insights react to real-looking data.
 *
 * Everything it writes is tagged so it can be removed again cleanly:
 *   - mood entries use  source = 'demo-seed'
 *   - journal entries carry the topic tag 'demo-seed'
 *
 * It also flips the patient's privacy switches on (mood + journals + feed-to-AI),
 * because the insight pipeline only reads categories the patient has allowed.
 *
 * This needs a real database (DATABASE_URL) and, to actually generate the
 * insights on the spot, an LLM key (OPENAI_API_KEY or ANTHROPIC_API_KEY). With a
 * key it regenerates the DAILY and WEEKLY insight rows immediately; without one
 * it just seeds the activity and the next scheduled cron will pick it up.
 *
 * Usage (run where the env vars live — locally or a one-off on the deployment):
 *   npx tsx scripts/seed-demo-activity.ts --email=you@example.com
 *   npx tsx scripts/seed-demo-activity.ts --email=you@example.com --weeks=4
 *   npx tsx scripts/seed-demo-activity.ts --email=you@example.com --clean   # remove seeded rows
 */
import { PrismaClient } from '@prisma/client'
import { storeInsight } from '../src/lib/ai/insights'
import { hasLlm } from '../src/lib/ai/config'

const db = new PrismaClient()

const SEED_SOURCE = 'demo-seed'
const SEED_TAG = 'demo-seed'

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=').slice(1).join('=') : undefined
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`)

const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)))
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** A note bank keyed loosely to how the day felt, so the AI has real colour. */
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

async function main() {
  const email = arg('email')
  if (!email) {
    console.error('Pass --email=you@example.com (the patient to seed).')
    process.exit(1)
  }
  const weeks = Math.max(1, Math.min(8, Number(arg('weeks') ?? 4)))
  const days = weeks * 7

  const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true, name: true } })
  if (!user) { console.error(`No user with email ${email}.`); process.exit(1) }
  if (user.role !== 'PATIENT') { console.error(`${email} is ${user.role}, not a PATIENT.`); process.exit(1) }
  const userId = user.id

  // Always clear previously seeded rows first, so re-running is idempotent.
  const delMood = await db.moodEntry.deleteMany({ where: { userId, source: SEED_SOURCE } })
  const delJourn = await db.journalEntry.deleteMany({ where: { userId, topicTags: { has: SEED_TAG } } })
  console.log(`Cleared ${delMood.count} seeded mood rows and ${delJourn.count} seeded journals.`)
  if (hasFlag('clean')) {
    console.log('Clean-only run: done.')
    return
  }

  // Make sure the AI is allowed to read this data (it is gated by privacy).
  await db.privacySettings.upsert({
    where: { userId },
    create: { userId, collectMood: true, collectJournals: true, collectSessions: true, collectChats: true, feedToLlm: true },
    update: { collectMood: true, collectJournals: true, feedToLlm: true },
  })

  // Build `days` of check-ins. A rising baseline (a routine slowly forming), a
  // day-of-week dip early in the week, journaling days nudging the next day up,
  // and light noise. Notes are attached to roughly 45% of days.
  const journalDaysAgo = new Set(JOURNALS.map((j) => j.daysAgo))
  const moodRows: { userId: string; mood: number; energy: number; calm: number; sleep: number; note: string | null; source: string; createdAt: Date }[] = []
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    date.setHours(9, 15, 0, 0)
    const dow = date.getDay()

    const trend = (days - 1 - d) / (days - 1) // 0 → 1 across the window
    const base = 4.2 + trend * 2.6 // ~4.2 up to ~6.8 as the routine builds
    const dowEffect = dow === 1 ? -1.4 : dow === 0 ? -1.0 : dow === 6 ? 0.3 : dow >= 2 && dow <= 4 ? 0.5 : 0
    const journaledYesterday = journalDaysAgo.has(d + 1) ? 0.8 : 0
    const noise = (Math.sin(d * 1.7) + Math.cos(d * 0.9)) * 0.5
    const mood = clamp(base + dowEffect + journaledYesterday + noise)

    const bank = mood <= 4 ? NOTES_LOW : mood <= 6 ? NOTES_MID : NOTES_HIGH
    const withNote = (d * 7) % 20 < 9 // ~45% of days, deterministic
    const note = withNote ? bank[(d + dow) % bank.length] : null

    moodRows.push({
      userId,
      mood,
      energy: clamp(mood + (noise > 0 ? 1 : -1)),
      calm: clamp(mood - dowEffect * 0.5),
      sleep: clamp(mood + (mood <= 4 ? -1 : 1)),
      note,
      source: SEED_SOURCE,
      createdAt: new Date(date),
    })
  }
  await db.moodEntry.createMany({ data: moodRows })
  console.log(`Seeded ${moodRows.length} mood check-ins (${DOW[moodRows[0].createdAt.getDay()]} → ${DOW[moodRows[moodRows.length - 1].createdAt.getDay()]}).`)

  // Journals across the window (only those inside the requested range).
  const journalRows = JOURNALS.filter((j) => j.daysAgo < days).map((j) => {
    const date = new Date()
    date.setDate(date.getDate() - j.daysAgo)
    date.setHours(21, 30, 0, 0)
    return { userId, title: j.title, content: j.body, moodTag: j.mood, topicTags: [SEED_TAG, 'sleep'], createdAt: date }
  })
  for (const j of journalRows) await db.journalEntry.create({ data: j })
  console.log(`Seeded ${journalRows.length} journal entries.`)

  // Regenerate the insights now, if a model is configured.
  if (hasLlm()) {
    console.log('LLM configured — regenerating insights…')
    const daily = await storeInsight(userId, 'DAILY')
    const weekly = await storeInsight(userId, 'WEEKLY')
    console.log(`Daily insight generated: ${daily}. Weekly insight generated: ${weekly}.`)
    console.log('Open the dashboard to see the daily card and the three-section weekly insight.')
  } else {
    console.log('No LLM key in this environment — activity seeded, insights will generate on the next scheduled run.')
    console.log('(Or run this again with OPENAI_API_KEY / ANTHROPIC_API_KEY set to generate them now.)')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
