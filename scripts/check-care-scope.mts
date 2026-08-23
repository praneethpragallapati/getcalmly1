/**
 * Care-type scoping checks, against a real PostgreSQL.
 *
 * A clinician should see the packages they are on the hook for and no others:
 * a psychiatrist has no use for a therapy balance they will never draw a
 * session from, and someone who does individual AND couples for the same
 * patient needs the two apart rather than added into one number. An admin is
 * the exception and keeps the whole picture.
 *
 * Run against a THROWAWAY database — it writes rows and does not clean up:
 *
 *     createdb scratch
 *     DATABASE_URL=postgresql://localhost/scratch DIRECT_URL=$DATABASE_URL \\
 *       npx prisma db push --skip-generate
 *     DATABASE_URL=postgresql://localhost/scratch npx tsx scripts/check-care-scope.mts
 */
import { PrismaClient } from '@prisma/client'
import { getExpertPatientProfile, getCaseload } from '../src/lib/expert'
import { getPatientDetail } from '../src/lib/admin'

const db = new PrismaClient()
let failures = 0
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}\n        got  ${JSON.stringify(actual)}\n        want ${JSON.stringify(expected)}`)
}

async function clinician(tag: string, clinicianType: string, specializations: string[] = []) {
  const u = await db.user.create({ data: { email: `${tag}@example.com`, name: `Dr ${tag}`, role: 'THERAPIST' } })
  return db.therapistProfile.create({
    data: { userId: u.id, bio: 'x', qualifications: [], yearsExp: 5, languages: ['en'], specializations, rciNumber: `RCI-${tag}`, sessionFee: 1500, clinicianType },
  })
}

const lines = (pkgs: { label: string; used: number; total: number; remaining: number; held: number; bookedAhead: number }[]) =>
  pkgs.map((p) => `${p.label} ${p.used}/${p.total} (${p.remaining} left, ${p.held} held, ${p.bookedAhead} ahead)`)

async function main() {
  const therapist = await clinician('thera', 'Therapist')
  const psych = await clinician('psy', 'Psychiatrist')
  const both = await clinician('both', 'Couples therapist')

  // A patient holding therapy AND psychiatry, each with its own clinician.
  const p1 = await db.user.create({ data: { email: 'p1@example.com', name: 'Patient One', role: 'PATIENT' } })
  const t1 = await db.subscription.create({
    data: { userId: p1.id, trackSlug: 'therapy', planName: 'Individual', sessionsTotal: 17, sessionsUsed: 0, startedAt: new Date('2026-06-01'), therapistId: therapist.id },
  })
  const y1 = await db.subscription.create({
    data: { userId: p1.id, trackSlug: 'psychiatry', planName: 'Psychiatry', sessionsTotal: 4, sessionsUsed: 0, startedAt: new Date('2026-06-01'), therapistId: psych.id },
  })
  await db.patientProfile.create({
    data: { userId: p1.id, patientId: 'GC-0001', assignedTherapistIndividualId: therapist.id, assignedTherapistPsychiatryId: psych.id },
  })
  // Two therapy sessions held, one booked ahead; one psychiatry session held.
  await db.appointment.create({ data: { patientId: p1.id, therapistId: therapist.id, scheduledAt: new Date('2026-07-01T10:00:00Z'), status: 'COMPLETED', fee: 1500, consumedSubscriptionId: t1.id } })
  await db.appointment.create({ data: { patientId: p1.id, therapistId: therapist.id, scheduledAt: new Date('2026-07-08T10:00:00Z'), status: 'COMPLETED', fee: 1500, consumedSubscriptionId: t1.id } })
  await db.appointment.create({ data: { patientId: p1.id, therapistId: therapist.id, scheduledAt: new Date('2026-09-20T10:00:00Z'), status: 'CONFIRMED', fee: 1500, consumedSubscriptionId: t1.id } })
  await db.appointment.create({ data: { patientId: p1.id, therapistId: psych.id, scheduledAt: new Date('2026-07-05T10:00:00Z'), status: 'COMPLETED', fee: 2000, consumedSubscriptionId: y1.id } })

  const asTherapist = await getExpertPatientProfile(therapist.id, p1.id)
  check('therapist sees ONLY the therapy package', lines(asTherapist!.packages), ['Individual therapy 3/17 (14 left, 2 held, 1 ahead)'])
  check('therapist totals are their slice', [asTherapist!.sessionsDone, asTherapist!.sessionsTotal, asTherapist!.sessionsRemaining], [3, 17, 14])

  const asPsych = await getExpertPatientProfile(psych.id, p1.id)
  check('psychiatrist sees ONLY the psychiatry package', lines(asPsych!.packages), ['Psychiatry 1/4 (3 left, 1 held, 0 ahead)'])
  check('psychiatrist never sees the 17-session therapy balance', asPsych!.sessionsTotal, 4)

  // One clinician doing individual AND couples for the same patient.
  const p2 = await db.user.create({ data: { email: 'p2@example.com', name: 'Patient Two', role: 'PATIENT' } })
  const t2 = await db.subscription.create({
    data: { userId: p2.id, trackSlug: 'therapy', planName: 'Individual', sessionsTotal: 8, sessionsUsed: 0, startedAt: new Date('2026-06-01'), therapistId: both.id },
  })
  await db.subscription.create({
    data: { userId: p2.id, trackSlug: 'couples', planName: 'Couples', sessionsTotal: 4, sessionsUsed: 0, startedAt: new Date('2026-06-01'), therapistId: both.id },
  })
  await db.patientProfile.create({
    data: { userId: p2.id, patientId: 'GC-0002', assignedTherapistIndividualId: both.id, assignedTherapistCouplesId: both.id },
  })
  await db.appointment.create({ data: { patientId: p2.id, therapistId: both.id, scheduledAt: new Date('2026-07-01T10:00:00Z'), status: 'COMPLETED', fee: 1500, consumedSubscriptionId: t2.id } })

  const asBoth = await getExpertPatientProfile(both.id, p2.id)
  check('a clinician doing both sees TWO separate lines', lines(asBoth!.packages), [
    'Individual therapy 1/8 (7 left, 1 held, 0 ahead)',
    'Couples 0/4 (4 left, 0 held, 0 ahead)',
  ])

  // No assignment recorded, but a session was delivered against a package:
  // the package's own track is what counts, not a guess from the job title.
  const p3 = await db.user.create({ data: { email: 'p3@example.com', name: 'Patient Three', role: 'PATIENT' } })
  const y3 = await db.subscription.create({
    data: { userId: p3.id, trackSlug: 'psychiatry', planName: 'Psychiatry', sessionsTotal: 6, sessionsUsed: 1, startedAt: new Date('2026-06-01') },
  })
  await db.subscription.create({
    data: { userId: p3.id, trackSlug: 'therapy', planName: 'Individual', sessionsTotal: 20, sessionsUsed: 0, startedAt: new Date('2026-06-01') },
  })
  await db.appointment.create({ data: { patientId: p3.id, therapistId: psych.id, scheduledAt: new Date('2026-07-02T10:00:00Z'), status: 'COMPLETED', fee: 2000, consumedSubscriptionId: y3.id } })
  const asPsych3 = await getExpertPatientProfile(psych.id, p3.id)
  check('unassigned: scope comes from the package the session drew on', lines(asPsych3!.packages), ['Psychiatry 1/6 (5 left, 1 held, 0 ahead)'])

  // Nothing on record at all — fall back to what this clinician can deliver.
  const p4 = await db.user.create({ data: { email: 'p4@example.com', name: 'Patient Four', role: 'PATIENT' } })
  await db.patientProfile.create({ data: { userId: p4.id, patientId: 'GC-0004', assignedTherapistPsychiatryId: psych.id } })
  const asPsych4 = await getExpertPatientProfile(psych.id, p4.id)
  check('assigned but nothing bought: an empty line, not a borrowed one', asPsych4!.packages.map((l) => `${l.label} ${l.total}`), ['Psychiatry 0'])

  // The caseload rows carry the same scoping.
  const caseTherapist = await getCaseload(therapist.id)
  const row1 = caseTherapist.find((c) => c.patientId === p1.id)!
  check('caseload: therapist row is therapy only', [row1.sessionsLeft, row1.packageTypes], [14, ['therapy']])
  const casePsych = await getCaseload(psych.id)
  const row2 = casePsych.find((c) => c.patientId === p1.id)!
  check('caseload: psychiatrist row is psychiatry only', [row2.sessionsLeft, row2.packageTypes], [3, ['psychiatry']])
  const caseBoth = await getCaseload(both.id)
  const row3 = caseBoth.find((c) => c.patientId === p2.id)!
  check('caseload: both care types kept apart', row3.packageLines.map((l) => `${l.label} ${l.remaining} left`), ['Individual therapy 7 left', 'Couples 4 left'])
  check('caseload: sessionsLeft is the scoped sum', row3.sessionsLeft, 11)

  // Admin keeps the whole picture.
  const admin = await getPatientDetail(p1.id)
  check('admin still sees every package', admin?.subscriptions.map((s) => `${s.trackSlug} ${s.sessionsUsed}/${s.sessionsTotal}`).sort(), ['psychiatry 1/4', 'therapy 3/17'])

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
