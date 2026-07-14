/**
 * Link the test patient (praneethpragallapati@gmail.com) with the test therapist
 * Dr. Hom Pragallapati (pragallapati.hom@gmail.com) so you can sign in as each and
 * exercise patient <-> therapist interactions (sessions, notes, booking requests,
 * caseload, risk).
 *
 * Focused + idempotent: it only touches these two accounts and the appointments
 * between them. It does NOT seed the rest of the demo content, and it never
 * overwrites the patient's own mood/journal data.
 *
 * Run it against your database (DATABASE_URL / DIRECT_URL must be set in the
 * environment, e.g. from your .env):
 *
 *   npx tsx scripts/link-praneeth-hom.ts
 *      — or —
 *   npm run link:test
 */
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()
const DAY_MS = 24 * 60 * 60 * 1000
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS)

const PATIENT_EMAIL = 'praneethpragallapati@gmail.com'
const DOCTOR_EMAIL = 'pragallapati.hom@gmail.com'
const PASSWORD = 'Merind07!demo'

async function main() {
  // 1) The patient must already exist (you created it by signing in). Give it a
  //    name if it has none, plus a clinical profile so the therapist has context.
  const patient = await prisma.user.findUnique({ where: { email: PATIENT_EMAIL } })
  if (!patient) {
    throw new Error(
      `No patient found for ${PATIENT_EMAIL}. Sign in once with that email to create the account, then re-run.`,
    )
  }
  // Ensure the patient can actually sign in via the Password tab (OTP sign-up
  // leaves no password) and has a name.
  await prisma.user.update({
    where: { id: patient.id },
    data: {
      passwordHash: hashPassword(PASSWORD),
      name: patient.name?.trim() ? patient.name : 'Praneeth Pragallapati',
    },
  })
  await prisma.patientProfile.upsert({
    where: { userId: patient.id },
    update: {
      trackLabel: 'Anxiety and Overthinking',
      diagnosis: 'Generalized Anxiety Disorder',
      therapyStatus: 'active',
    },
    create: {
      userId: patient.id,
      patientId: `GC-P-${patient.id.slice(-6).toUpperCase()}`,
      track: ['anxiety'],
      trackLabel: 'Anxiety and Overthinking',
      subTrack: 'work-related',
      diagnosis: 'Generalized Anxiety Disorder',
      currentSituation: 'Living alone, demanding job with shifting deadlines; supportive but distant family.',
      therapyStatus: 'active',
      country: 'IN',
      preferredLanguage: 'English',
      dataRetentionConsent: true,
      llmDataSharingConsent: true,
      aiDisclaimerAck: true,
      liabilityAck: true,
      termsAcceptedAt: daysAgo(140),
    },
  })

  // 2) The therapist: Dr. Hom Pragallapati (created if missing, refreshed if present).
  const docUser = await prisma.user.upsert({
    where: { email: DOCTOR_EMAIL },
    update: { name: 'Dr. Hom Pragallapati', role: 'THERAPIST', passwordHash: hashPassword(PASSWORD) },
    create: {
      email: DOCTOR_EMAIL,
      name: 'Dr. Hom Pragallapati',
      role: 'THERAPIST',
      passwordHash: hashPassword(PASSWORD),
    },
  })
  const specializations = ['Psychiatry', 'Medication management', 'Anxiety', 'Depression']
  const doc = await prisma.therapistProfile.upsert({
    where: { userId: docUser.id },
    update: { isActive: true, isVerified: true, specializations },
    create: {
      userId: docUser.id,
      bio: 'Consultant psychiatrist specialising in anxiety, depression and psychopharmacology.',
      qualifications: ['MBBS', 'MD Psychiatry', 'NMC Registered'],
      yearsExp: 10,
      languages: ['English', 'Hindi', 'Telugu'],
      specializations,
      rciNumber: 'NMC-DEMO-0003',
      sessionFee: 1800,
      rating: 4.8,
      totalReviews: 96,
      isVerified: true,
      isActive: true,
    },
  })

  // 3) Availability (Mon–Sat) so the patient can also book new slots with them.
  await prisma.therapistAvailability.deleteMany({ where: { therapistId: doc.id } })
  const hours = [9, 10, 11, 12, 14, 15, 17, 18]
  for (let day = 1; day <= 6; day++) {
    await prisma.therapistAvailability.create({ data: { therapistId: doc.id, dayOfWeek: day, hours } })
  }

  // 4) The link itself. The caseload and the patient's "My Therapist"/Sessions are
  //    both derived from appointments, so this pairs them in both directions.
  //    Reset just this pair so re-running doesn't pile up duplicates.
  await prisma.appointment.deleteMany({ where: { patientId: patient.id, therapistId: doc.id } })
  const base = { patientId: patient.id, therapistId: doc.id, durationMins: 50, fee: doc.sessionFee }
  await prisma.appointment.create({
    data: {
      ...base,
      scheduledAt: daysAgo(6),
      status: 'COMPLETED',
      summary: 'Co-managed anxiety case; reinforced reframing and breathing practice.',
    },
  })
  await prisma.appointment.create({
    data: { ...base, scheduledAt: new Date(Date.now() + 2 * DAY_MS), status: 'CONFIRMED' },
  })
  await prisma.appointment.create({
    data: { ...base, scheduledAt: new Date(Date.now() + 5 * DAY_MS), status: 'PENDING' },
  })

  console.log('\n✅  Linked Praneeth ↔ Dr. Hom Pragallapati')
  console.log(`    Patient : ${PATIENT_EMAIL}   /  ${PASSWORD}`)
  console.log(`    Doctor  : ${DOCTOR_EMAIL}   /  ${PASSWORD}`)
  console.log('    Appointments: 1 completed (with summary) · 1 confirmed · 1 pending request')
  console.log('    Sign in as each to test the interactions.\n')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('\n❌  Failed:', e instanceof Error ? e.message : e)
    await prisma.$disconnect()
    process.exit(1)
  })
