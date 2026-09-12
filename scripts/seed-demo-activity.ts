/**
 * Seed ~4 weeks of realistic mood check-ins and journal entries (plus the
 * profile context) for ONE patient, so the daily and weekly AI insights have
 * consistent material to react to. Everything is tagged and removable.
 *
 * Needs a real database (DATABASE_URL) and, to generate the insights on the
 * spot, an LLM key (OPENAI_API_KEY). Without a key it seeds the activity and the
 * next scheduled cron picks it up.
 *
 * Usage (run where the env vars live):
 *   npx tsx scripts/seed-demo-activity.ts --email=you@example.com
 *   npx tsx scripts/seed-demo-activity.ts --email=you@example.com --weeks=4
 *   npx tsx scripts/seed-demo-activity.ts --email=you@example.com --clean
 */
import { PrismaClient } from '@prisma/client'
import { seedDemoActivity, clearDemoActivity } from '../src/lib/demoSeed'
import { storeInsight } from '../src/lib/ai/insights'
import { hasLlm } from '../src/lib/ai/config'

const db = new PrismaClient()

function arg(name: string): string | undefined {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=').slice(1).join('=') : undefined
}
const hasFlag = (name: string) => process.argv.includes(`--${name}`)

async function main() {
  const email = arg('email')
  if (!email) { console.error('Pass --email=you@example.com (the patient to seed).'); process.exit(1) }
  const weeks = Math.max(1, Math.min(8, Number(arg('weeks') ?? 4)))

  const user = await db.user.findUnique({ where: { email }, select: { id: true, role: true } })
  if (!user) { console.error(`No user with email ${email}.`); process.exit(1) }
  if (user.role !== 'PATIENT') { console.error(`${email} is ${user.role}, not a PATIENT.`); process.exit(1) }

  if (hasFlag('clean')) {
    const c = await clearDemoActivity(user.id)
    console.log(`Removed ${c.mood} seeded mood rows and ${c.journals} seeded journals.`)
    return
  }

  const seeded = await seedDemoActivity(user.id, weeks)
  console.log(`Seeded ${seeded.mood} mood check-ins and ${seeded.journals} journals, plus profile context.`)

  if (hasLlm()) {
    console.log('LLM configured — regenerating insights…')
    const daily = await storeInsight(user.id, 'DAILY')
    const weekly = await storeInsight(user.id, 'WEEKLY')
    console.log(`Daily insight generated: ${daily}. Weekly insight generated: ${weekly}.`)
    console.log('Open the dashboard to see the daily card and the three-section weekly insight.')
  } else {
    console.log('No LLM key here — activity seeded; insights will generate on the next scheduled run.')
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
