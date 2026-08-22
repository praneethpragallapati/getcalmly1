/**
 * Package-counter checks, against a real PostgreSQL.
 *
 * `sessionsUsed` is arithmetic a patient can see and a clinician makes
 * decisions on, so it is worth proving rather than reasoning about. Every case
 * below is one that actually produced a wrong number on screen — most of all
 * the first, a 17-session package reading "1 used" beside two sessions that had
 * been held.
 *
 * Run it against a THROWAWAY database — it writes rows and does not clean up:
 *
 *     createdb scratch
 *     DATABASE_URL=postgresql://localhost/scratch DIRECT_URL=$DATABASE_URL \
 *       npx prisma db push --skip-generate
 *     DATABASE_URL=postgresql://localhost/scratch npx tsx scripts/check-package-counters.mts
 */
import { PrismaClient } from '@prisma/client'
import { reconcilePackageCounters } from '../src/lib/packageCounters'

const db = new PrismaClient()
const D = (s: string) => new Date(s)

let failures = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  got ${JSON.stringify(actual)} want ${JSON.stringify(expected)}`)
}

async function therapist(tag: string, clinicianType: string) {
  const u = await db.user.create({ data: { email: `t-${tag}@example.com`, name: `Dr ${tag}`, role: 'THERAPIST' } })
  return db.therapistProfile.create({
    data: {
      userId: u.id, bio: 'x', qualifications: [], yearsExp: 3, languages: ['en'],
      specializations: [], rciNumber: `RCI-${tag}`, sessionFee: 1200, clinicianType,
    },
  })
}

async function patient(tag: string) {
  return db.user.create({ data: { email: `p-${tag}@example.com`, name: tag, role: 'PATIENT' } })
}

const appt = (patientId: string, therapistId: string, when: string, status: string, subId: string | null) =>
  db.appointment.create({
    data: {
      patientId, therapistId, scheduledAt: D(when), status: status as never, fee: 1200,
      ...(subId ? { consumedSubscriptionId: subId } : {}),
    },
  })

const usedOf = async (userId: string) =>
  (await db.subscription.findMany({ where: { userId }, orderBy: { createdAt: 'asc' }, select: { sessionsUsed: true, sessionsTotal: true } }))
    .map((s) => `${s.sessionsUsed}/${s.sessionsTotal}`)

async function main() {
  const th = await therapist('therapy', 'Therapist')
  const psy = await therapist('psych', 'Psychiatrist')

  // ── 1. The reported case: 17-session package reading 1 used, two sessions held,
  //       one of them holding no slot (created before the link existed).
  {
    const p = await patient('praneeth')
    const sub = await db.subscription.create({
      data: { userId: p.id, trackSlug: 'therapy', planName: 'Individual', sessionsTotal: 17, sessionsUsed: 1, startedAt: D('2026-06-01'), expiresAt: D('2026-12-01') },
    })
    await appt(p.id, th.id, '2026-07-10T10:00:00Z', 'COMPLETED', sub.id)
    await appt(p.id, th.id, '2026-07-24T10:00:00Z', 'COMPLETED', null) // the orphan
    check('before: counter under-reports', await usedOf(p.id), ['1/17'])
    await reconcilePackageCounters(p.id)
    check('1. two sessions held → 2/17', await usedOf(p.id), ['2/17'])

    // ...then one booked ahead → 3/17, which is exactly what the user expected.
    await appt(p.id, th.id, '2026-09-05T10:00:00Z', 'CONFIRMED', sub.id)
    await reconcilePackageCounters(p.id)
    check('1b. plus one booked ahead → 3/17', await usedOf(p.id), ['3/17'])

    // Idempotent
    await reconcilePackageCounters(p.id)
    check('1c. running it again changes nothing', await usedOf(p.id), ['3/17'])
  }

  // ── 2. A voided-and-refunded session must NOT come back as used; a no-show the
  //       patient was charged for MUST stay used.
  {
    const p = await patient('voids')
    const sub = await db.subscription.create({
      data: { userId: p.id, trackSlug: 'therapy', planName: 'Individual', sessionsTotal: 10, sessionsUsed: 5, startedAt: D('2026-06-01') },
    })
    await appt(p.id, th.id, '2026-07-01T10:00:00Z', 'COMPLETED', sub.id)
    await appt(p.id, th.id, '2026-07-02T10:00:00Z', 'CANCELLED', null)      // voided + refunded
    await appt(p.id, th.id, '2026-07-03T10:00:00Z', 'CANCELLED', sub.id)    // no-show, charged
    await reconcilePackageCounters(p.id)
    check('2. refund not re-charged, no-show still charged → 2/10', await usedOf(p.id), ['2/10'])
  }

  // ── 3. Buying more sessions adds to the balance instead of resetting it.
  {
    const p = await patient('topup')
    const a = await db.subscription.create({
      data: { userId: p.id, trackSlug: 'therapy', planName: 'Individual 16', sessionsTotal: 16, sessionsUsed: 0, startedAt: D('2026-01-01'), expiresAt: D('2026-06-01') },
    })
    await appt(p.id, th.id, '2026-02-01T10:00:00Z', 'COMPLETED', a.id)
    await appt(p.id, th.id, '2026-03-01T10:00:00Z', 'COMPLETED', a.id)
    // A second pack of 4 bought later.
    await db.subscription.create({
      data: { userId: p.id, trackSlug: 'therapy', planName: 'Individual 4', sessionsTotal: 4, sessionsUsed: 0, startedAt: D('2026-06-01'), expiresAt: D('2026-12-01') },
    })
    await appt(p.id, th.id, '2026-07-01T10:00:00Z', 'COMPLETED', null) // orphan after the top-up
    await reconcilePackageCounters(p.id)
    const subs = await db.subscription.findMany({ where: { userId: p.id }, orderBy: { createdAt: 'asc' }, select: { sessionsTotal: true, sessionsUsed: true } })
    check('3. totals add up across packages → 20', subs.reduce((n, s) => n + s.sessionsTotal, 0), 20)
    check('3b. used across packages → 3', subs.reduce((n, s) => n + s.sessionsUsed, 0), 3)
    check('3c. the July session went to the package live in July', await usedOf(p.id), ['2/16', '1/4'])
  }

  // ── 4. Care types never borrow from each other.
  {
    const p = await patient('tracks')
    await db.subscription.create({ data: { userId: p.id, trackSlug: 'therapy', planName: 'T', sessionsTotal: 5, sessionsUsed: 0, startedAt: D('2026-01-01') } })
    await db.subscription.create({ data: { userId: p.id, trackSlug: 'psychiatry', planName: 'P', sessionsTotal: 3, sessionsUsed: 0, startedAt: D('2026-01-01') } })
    await appt(p.id, psy.id, '2026-02-01T10:00:00Z', 'COMPLETED', null)
    await appt(p.id, th.id, '2026-02-02T10:00:00Z', 'COMPLETED', null)
    await reconcilePackageCounters(p.id)
    check('4. psychiatry session hit the psychiatry pack', await usedOf(p.id), ['1/5', '1/3'])
  }

  // ── 5. Never oversell: an unlinked session with no room stays unlinked rather
  //       than pushing the balance negative.
  {
    const p = await patient('full')
    const sub = await db.subscription.create({
      data: { userId: p.id, trackSlug: 'therapy', planName: 'One', sessionsTotal: 1, sessionsUsed: 0, startedAt: D('2026-01-01') },
    })
    await appt(p.id, th.id, '2026-02-01T10:00:00Z', 'COMPLETED', sub.id)
    await appt(p.id, th.id, '2026-02-08T10:00:00Z', 'COMPLETED', null)
    await reconcilePackageCounters(p.id)
    check('5. capped at the package size → 1/1', await usedOf(p.id), ['1/1'])
  }

  // ── 6. An over-counted package is corrected downwards too.
  {
    const p = await patient('over')
    const sub = await db.subscription.create({
      data: { userId: p.id, trackSlug: 'therapy', planName: 'Ten', sessionsTotal: 10, sessionsUsed: 8, startedAt: D('2026-01-01') },
    })
    await appt(p.id, th.id, '2026-02-01T10:00:00Z', 'COMPLETED', sub.id)
    await reconcilePackageCounters(p.id)
    check('6. inflated counter corrected → 1/10', await usedOf(p.id), ['1/10'])
  }

  // ── 7. A patient with no package is left completely alone.
  {
    const p = await patient('nopack')
    await appt(p.id, th.id, '2026-02-01T10:00:00Z', 'COMPLETED', null)
    await reconcilePackageCounters(p.id)
    const linked = await db.appointment.count({ where: { patientId: p.id, consumedSubscriptionId: { not: null } } })
    check('7. no package → nothing touched', linked, 0)
  }

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
