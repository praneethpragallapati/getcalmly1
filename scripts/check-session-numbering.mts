/**
 * Session-numbering checks, against a real PostgreSQL.
 *
 * "Session #4" was showing above a session that was plainly the third. The
 * number came from the package counter plus one, and a booked session is
 * already counted as used the moment it is booked — so the upcoming session was
 * counted twice. It is now taken from the appointments themselves.
 *
 * Run against a THROWAWAY database — it writes rows and does not clean up:
 *
 *     createdb scratch
 *     DATABASE_URL=postgresql://localhost/scratch DIRECT_URL=$DATABASE_URL \\
 *       npx prisma db push --skip-generate
 *     DATABASE_URL=postgresql://localhost/scratch npx tsx scripts/check-session-numbering.mts
 */
import { PrismaClient } from '@prisma/client'
import { getTherapistSchedule } from '../src/lib/expert'

const db = new PrismaClient()
let failures = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}\n        got  ${JSON.stringify(actual)}\n        want ${JSON.stringify(expected)}`)
}

async function main() {
  const du = await db.user.create({ data: { email: 'dr@example.com', name: 'Dr Hom', role: 'THERAPIST' } })
  const dr = await db.therapistProfile.create({
    data: { userId: du.id, bio: 'x', qualifications: [], yearsExp: 5, languages: ['en'], specializations: [], rciNumber: 'RCI-1', sessionFee: 1500, clinicianType: 'Therapist' },
  })
  const p = await db.user.create({ data: { email: 'p@example.com', name: 'Praneeth', role: 'PATIENT' } })
  const sub = await db.subscription.create({
    data: { userId: p.id, trackSlug: 'therapy', planName: 'Individual', sessionsTotal: 16, sessionsUsed: 3, startedAt: new Date('2026-06-01') },
  })

  // The screenshot's situation: two sessions held, a third booked for today.
  const mk = (when: string, status: string) =>
    db.appointment.create({
      data: { patientId: p.id, therapistId: dr.id, scheduledAt: new Date(when), status: status as never, fee: 1500, consumedSubscriptionId: sub.id, durationMins: 45 },
    })
  await mk('2026-08-09T05:30:00Z', 'COMPLETED')
  await mk('2026-08-16T05:30:00Z', 'COMPLETED')
  await mk('2027-08-23T05:30:00Z', 'CONFIRMED') // upcoming

  const sched = await getTherapistSchedule(dr.id)
  check(
    'two held, one upcoming → the upcoming one is #3',
    sched.map((a) => `${a.scheduledAt.toISOString().slice(0, 10)} ${a.status} #${a.sessionNo}`),
    ['2026-08-09 COMPLETED #1', '2026-08-16 COMPLETED #2', '2027-08-23 CONFIRMED #3'],
  )

  const upcoming = sched.filter((a) => !a.isPast && a.status !== 'CANCELLED')[0]
  check('the hero would print "Session #3"', upcoming.sessionNo, 3)
  const stored = await db.subscription.findUnique({ where: { id: sub.id }, select: { sessionsUsed: true } })
  check('the old rule (counter + 1) would have said 4', (stored?.sessionsUsed ?? 0) + 1, 4)

  // A cancelled session takes no number and does not push the others along.
  await mk('2026-08-20T05:30:00Z', 'CANCELLED')
  const sched2 = await getTherapistSchedule(dr.id)
  check(
    'a cancelled session is skipped, not numbered',
    sched2.map((a) => `${a.scheduledAt.toISOString().slice(0, 10)} ${a.status} #${a.sessionNo}`),
    ['2026-08-09 COMPLETED #1', '2026-08-16 COMPLETED #2', '2026-08-20 CANCELLED #null', '2027-08-23 CONFIRMED #3'],
  )

  // The patient's own list (src/lib/sessions.ts) numbers by the same rule —
  // non-cancelled appointments in date order — so with a single clinician the
  // two views print the same number, which is the consistency being asked for.
  const patientSideRule = (await db.appointment.findMany({
    where: { patientId: p.id, status: { not: 'CANCELLED' } },
    orderBy: { scheduledAt: 'asc' },
    select: { id: true },
  })).map((a, i) => `${a.id} #${i + 1}`)
  const clinicianSide = sched2.filter((a) => a.sessionNo).map((a) => `${a.id} #${a.sessionNo}`)
  check('clinician numbering matches the patient list', clinicianSide, patientSideRule)

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
