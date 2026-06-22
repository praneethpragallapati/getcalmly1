import { PrismaClient, type CommunityRole } from '@prisma/client'
import { blogSeed } from '../src/data/blogSeed'
import { communitySeed, ROLE_NAME_TO_ENUM } from '../src/data/communitySeed'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

const DAY_MS = 24 * 60 * 60 * 1000
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS)

/**
 * Seeds a fully-populated demo patient (and the therapist they see) so the live
 * dashboard renders real data end-to-end. Idempotent: re-running replaces this
 * patient's time-series rows rather than duplicating them.
 */
async function seedDemoPatient() {
  console.log('Seeding demo patient + therapist…')

  // ── Therapist the patient is assigned to ──────────────────────────────────
  const therapistUser = await prisma.user.upsert({
    where: { email: 'dr.ananya@getcalmly.com' },
    update: { name: 'Dr. Ananya Sharma', role: 'THERAPIST' },
    create: { email: 'dr.ananya@getcalmly.com', name: 'Dr. Ananya Sharma', role: 'THERAPIST' },
  })
  const therapist = await prisma.therapistProfile.upsert({
    where: { userId: therapistUser.id },
    update: { isActive: true, isVerified: true },
    create: {
      userId: therapistUser.id,
      bio: 'Clinical psychologist specialising in anxiety, CBT and work-related stress.',
      qualifications: ['M.Phil Clinical Psychology', 'RCI Registered'],
      yearsExp: 8,
      languages: ['English', 'Hindi'],
      specializations: ['Anxiety', 'CBT', 'Work stress'],
      rciNumber: 'RCI-DEMO-0001',
      sessionFee: 1500,
      rating: 4.9,
      totalReviews: 128,
      isVerified: true,
      isActive: true,
    },
  })

  // ── The demo patient ──────────────────────────────────────────────────────
  const patient = await prisma.user.upsert({
    where: { email: 'praneethpragallapati@gmail.com' },
    update: { name: 'Praneeth Pragallapati', role: 'PATIENT', passwordHash: hashPassword('Merind07!demo') },
    create: {
      email: 'praneethpragallapati@gmail.com',
      name: 'Praneeth Pragallapati',
      role: 'PATIENT',
      passwordHash: hashPassword('Merind07!demo'),
    },
  })
  const uid = patient.id

  await prisma.patientProfile.upsert({
    where: { userId: uid },
    update: {
      trackLabel: 'Anxiety and Overthinking',
      diagnosis: 'Generalized Anxiety Disorder',
      currentSituation: 'Living alone, demanding job with shifting deadlines; supportive but distant family.',
      therapyStatus: 'active',
    },
    create: {
      userId: uid,
      patientId: 'GC-P-000482',
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

  await prisma.privacySettings.upsert({
    where: { userId: uid },
    update: {},
    create: { userId: uid },
  })

  // Active subscription (Silver tier, 7 paid months, 5 of 12 sessions used).
  await prisma.subscription.deleteMany({ where: { userId: uid } })
  await prisma.subscription.create({
    data: {
      userId: uid,
      category: 'INDIVIDUAL',
      trackSlug: 'therapy',
      planName: 'Growth Plan',
      tier: 'SILVER',
      status: 'ACTIVE',
      paidMonths: 7,
      sessionsTotal: 12,
      sessionsUsed: 5,
      minutesTotal: 600,
      minutesUsed: 250,
      startedAt: daysAgo(140),
      renewsAt: new Date(Date.now() + 90 * DAY_MS),
    },
  })

  // 28 days of daily mood check-ins, gently improving (drives streak, weekly
  // chart, mood-over-time and the month-change badge).
  await prisma.moodEntry.deleteMany({ where: { userId: uid } })
  const moodRows = []
  for (let i = 27; i >= 0; i--) {
    const trend = (27 - i) / 27 // 0 → 1 over the month
    const wobble = ((i % 3) - 1) * 0.6
    const mood = Math.max(2, Math.min(9, Math.round(4 + trend * 3.5 + wobble)))
    moodRows.push({
      userId: uid,
      mood,
      energy: Math.max(2, Math.min(9, mood - 1)),
      calm: Math.max(2, Math.min(9, mood - (i % 2))),
      sleep: Math.max(3, Math.min(9, mood)),
      note: i === 0 ? 'Felt steadier today after the breathing exercise.' : null,
      source: 'home-checkin',
      createdAt: daysAgo(i),
    })
  }
  await prisma.moodEntry.createMany({ data: moodRows })

  // Journals
  await prisma.journalEntry.deleteMany({ where: { userId: uid } })
  await prisma.journalEntry.createMany({
    data: [
      {
        userId: uid,
        title: 'Session prep: what I want to say',
        content:
          'Before today’s session I want to bring up the work anxiety that creeps in on Sunday nights. It started after the deadline moved up last month and I haven’t been able to shake it.',
        moodTag: 'Anxious',
        topicTags: ['Work', 'Session prep'],
        createdAt: daysAgo(0),
      },
      {
        userId: uid,
        title: 'A moment of stillness',
        content:
          'Sat by the window with tea and didn’t touch my phone for 20 minutes. Quietest I’ve felt in weeks.',
        moodTag: 'Calm',
        topicTags: ['Mindfulness'],
        createdAt: daysAgo(1),
      },
      {
        userId: uid,
        title: 'The meeting that spiralled',
        content:
          'A simple comment from my manager and I replayed it for three hours. Did I say something wrong?',
        moodTag: 'Low',
        topicTags: ['Work', 'Rumination'],
        createdAt: daysAgo(4),
      },
      {
        userId: uid,
        title: 'After the session — lighter',
        content:
          'Dr. Ananya helped me reframe something I’ve carried for months. What would I say to a friend in my situation?',
        moodTag: 'Good',
        topicTags: ['Post-session'],
        createdAt: daysAgo(9),
      },
    ],
  })

  // Expert-assigned tasks (some done, one expired) — assigned this week so they
  // count toward the weekly progress summary both portals show.
  await prisma.task.deleteMany({ where: { userId: uid } })
  await prisma.task.createMany({
    data: [
      {
        userId: uid,
        type: 'BREATHING',
        title: '4-7-8 breathing, twice today',
        description: 'Once after waking, once before bed.',
        assignedBy: 'Dr. Ananya Sharma',
        dueDate: new Date(Date.now() + 1 * DAY_MS),
        completedAt: daysAgo(0),
        createdAt: daysAgo(2),
      },
      {
        userId: uid,
        type: 'REFLECTION',
        title: 'Name one thing that went well',
        description: 'Add it to your journal.',
        assignedBy: 'Dr. Ananya Sharma',
        dueDate: new Date(Date.now() + 2 * DAY_MS),
        createdAt: daysAgo(2),
      },
      {
        userId: uid,
        type: 'VIDEO',
        title: 'Watch: Grounding when anxious (6 min)',
        assignedBy: 'Dr. Ananya Sharma',
        dueDate: daysAgo(1), // expired, not done
        createdAt: daysAgo(5),
      },
      {
        userId: uid,
        type: 'READING',
        title: 'Read: The Sunday-night spiral',
        assignedBy: 'Dr. Ananya Sharma',
        completedAt: daysAgo(3),
        createdAt: daysAgo(6),
      },
    ],
  })

  // Medication
  await prisma.medication.deleteMany({ where: { userId: uid } })
  await prisma.medication.create({
    data: {
      userId: uid,
      name: 'Sertraline',
      dosage: '50 mg',
      frequency: 'Once daily',
      times: ['Morning'],
      prescribedBy: 'Dr. Rohan Mehta',
      startedAt: daysAgo(120),
      active: true,
    },
  })

  // Appointments: completed past sessions (with summaries) + one starting shortly
  // (so the Home "today's session" card appears) + an upcoming one.
  await prisma.appointment.deleteMany({ where: { patientId: uid } })
  const apptBase = { patientId: uid, therapistId: therapist.id, durationMins: 50, fee: therapist.sessionFee }
  await prisma.appointment.create({
    data: {
      ...apptBase,
      scheduledAt: daysAgo(7),
      status: 'COMPLETED',
      summary:
        'Explored the Sunday-night work spiral and practised reframing. Homework: notice one catastrophic thought and write the kinder version next to it.',
      preSessionNote: 'Wanted to talk about deadlines.',
    },
  })
  await prisma.appointment.create({
    data: {
      ...apptBase,
      scheduledAt: daysAgo(14),
      status: 'COMPLETED',
      summary: 'Introduced 4-7-8 breathing and a worry-window. Patient responded well to structure.',
    },
  })
  await prisma.appointment.create({
    data: {
      ...apptBase,
      scheduledAt: new Date(Date.now() + 5 * 60 * 1000), // starts in 5 min → joinable today
      status: 'CONFIRMED',
      roomId: 'demo-room-praneeth',
    },
  })
  await prisma.appointment.create({
    data: {
      ...apptBase,
      scheduledAt: new Date(Date.now() + 7 * DAY_MS),
      status: 'CONFIRMED',
    },
  })

  // Light clinical context (track-scoped) the AI pipeline reads.
  await prisma.clinicalContext.upsert({
    where: { userId: uid },
    update: { trend: 'improving' },
    create: {
      userId: uid,
      scale: 'GAD-7',
      trend: 'improving',
      whatHasHelped: ['4-7-8 breathing', 'Journaling before bed', 'Walks without the phone'],
      whatHasNotHelped: ['Doomscrolling', 'Skipping meals when busy'],
      recurringTriggers: ['Shifting deadlines', 'Manager feedback', 'Sunday evenings'],
      sleepDisturbance: true,
      updatedBy: 'Dr. Ananya Sharma',
    },
  })

  console.log(`Done. Demo patient: ${patient.email} (password sign-in enabled).`)
  return { therapist, patientUserId: uid }
}

/**
 * Seeds the expert-portal extras: Dr. Ananya's weekly availability template and a
 * supervision relationship (a senior therapist supervising her). Idempotent.
 */
async function seedExpertExtras(therapistId: string, demoPatientUserId: string) {
  console.log('Seeding expert availability + supervision…')

  // Weekly availability: weekdays, morning + afternoon + evening 1-hour slots.
  const weekdayHours = [9, 10, 12, 13, 14, 17, 18]
  await prisma.therapistAvailability.deleteMany({ where: { therapistId } })
  for (let day = 1; day <= 5; day++) {
    await prisma.therapistAvailability.create({
      data: { therapistId, dayOfWeek: day, hours: weekdayHours },
    })
  }

  // A senior therapist who supervises Dr. Ananya.
  const supervisorUser = await prisma.user.upsert({
    where: { email: 'dr.vikram@getcalmly.com' },
    update: { name: 'Dr. Vikram Rao', role: 'THERAPIST' },
    create: { email: 'dr.vikram@getcalmly.com', name: 'Dr. Vikram Rao', role: 'THERAPIST' },
  })
  const supervisor = await prisma.therapistProfile.upsert({
    where: { userId: supervisorUser.id },
    update: { isActive: true, isVerified: true },
    create: {
      userId: supervisorUser.id,
      bio: 'Senior clinical psychologist and clinical supervisor; 18 years of practice.',
      qualifications: ['PhD Clinical Psychology', 'RCI Registered', 'Certified Clinical Supervisor'],
      yearsExp: 18,
      languages: ['English', 'Hindi', 'Marathi'],
      specializations: ['Supervision', 'Trauma', 'CBT'],
      rciNumber: 'RCI-DEMO-0002',
      sessionFee: 2500,
      rating: 5.0,
      totalReviews: 64,
      isVerified: true,
      isActive: true,
    },
  })

  const link = await prisma.supervisionLink.upsert({
    where: { supervisorId_superviseeId: { supervisorId: supervisor.id, superviseeId: therapistId } },
    update: {},
    create: { supervisorId: supervisor.id, superviseeId: therapistId },
  })

  // Seed a couple of supervision notes only if none exist yet (avoid duplicates).
  const existingNotes = await prisma.supervisionNote.count({ where: { linkId: link.id } })
  if (existingNotes === 0) {
    await prisma.supervisionNote.create({
      data: {
        linkId: link.id,
        authorId: supervisor.id,
        patientId: demoPatientUserId,
        content:
          'Good formulation on the work-anxiety case. Consider a behavioural experiment around the Sunday-night spiral next session, and watch for avoidance creeping back in.',
      },
    })
    await prisma.supervisionNote.create({
      data: {
        linkId: link.id,
        authorId: therapistId,
        content: 'Thanks — will set up the behavioural experiment and report back on adherence.',
      },
    })
  }

  console.log('Done. Availability + supervision seeded.')
}

type MoodPattern = 'improving' | 'declining' | 'stable'

/** Build N daily mood rows following a pattern (drives trends + risk detection). */
function moodSeries(userId: string, days: number, pattern: MoodPattern) {
  const rows = []
  for (let i = days - 1; i >= 0; i--) {
    const t = (days - 1 - i) / (days - 1) // 0 → 1 over the window
    const base =
      pattern === 'improving' ? 4 + t * 3.5 : pattern === 'declining' ? 7.5 - t * 4 : 6
    const wobble = ((i % 3) - 1) * 0.6
    const mood = Math.max(2, Math.min(9, Math.round(base + wobble)))
    rows.push({
      userId,
      mood,
      energy: Math.max(2, Math.min(9, mood - 1)),
      calm: Math.max(2, Math.min(9, mood - (i % 2))),
      sleep: Math.max(3, Math.min(9, mood)),
      source: 'home-checkin',
      createdAt: daysAgo(i),
    })
  }
  return rows
}

type DummyPatientSpec = {
  email: string
  name: string
  patientId: string
  track: string
  trackLabel: string
  diagnosis: string
  moodPattern: MoodPattern
  sessionsTotal: number
  sessionsUsed: number
  withCrisis?: boolean
  password?: string
}

/**
 * Create (idempotently) a patient mapped to `therapistId` with mood history,
 * subscription, tasks and appointments — enough to populate the doctor's
 * caseload, risk feed, earnings and patient-profile views.
 */
async function seedMappedPatient(therapistId: string, therapistName: string, spec: DummyPatientSpec) {
  const user = await prisma.user.upsert({
    where: { email: spec.email },
    update: { name: spec.name, role: 'PATIENT', ...(spec.password ? { passwordHash: hashPassword(spec.password) } : {}) },
    create: {
      email: spec.email,
      name: spec.name,
      role: 'PATIENT',
      ...(spec.password ? { passwordHash: hashPassword(spec.password) } : {}),
    },
  })
  const uid = user.id

  await prisma.patientProfile.upsert({
    where: { userId: uid },
    update: { trackLabel: spec.trackLabel, diagnosis: spec.diagnosis, therapyStatus: 'active' },
    create: {
      userId: uid,
      patientId: spec.patientId,
      track: [spec.track],
      trackLabel: spec.trackLabel,
      diagnosis: spec.diagnosis,
      therapyStatus: 'active',
      country: 'IN',
      preferredLanguage: 'English',
      dataRetentionConsent: true,
      llmDataSharingConsent: true,
      aiDisclaimerAck: true,
      liabilityAck: true,
      termsAcceptedAt: daysAgo(120),
    },
  })
  await prisma.privacySettings.upsert({ where: { userId: uid }, update: {}, create: { userId: uid } })

  await prisma.subscription.deleteMany({ where: { userId: uid } })
  await prisma.subscription.create({
    data: {
      userId: uid,
      category: 'INDIVIDUAL',
      trackSlug: 'therapy',
      planName: 'Growth Plan',
      tier: 'SILVER',
      status: 'ACTIVE',
      paidMonths: 4,
      sessionsTotal: spec.sessionsTotal,
      sessionsUsed: spec.sessionsUsed,
      startedAt: daysAgo(120),
      renewsAt: new Date(Date.now() + 90 * DAY_MS),
    },
  })

  await prisma.moodEntry.deleteMany({ where: { userId: uid } })
  await prisma.moodEntry.createMany({ data: moodSeries(uid, 21, spec.moodPattern) })

  await prisma.task.deleteMany({ where: { userId: uid } })
  await prisma.task.createMany({
    data: [
      {
        userId: uid,
        type: 'BREATHING',
        title: 'Box breathing before bed',
        assignedBy: therapistName,
        dueDate: new Date(Date.now() + 1 * DAY_MS),
        createdAt: daysAgo(2),
      },
      {
        userId: uid,
        type: 'REFLECTION',
        title: 'Note one win each day',
        assignedBy: therapistName,
        completedAt: daysAgo(1),
        createdAt: daysAgo(4),
      },
    ],
  })

  // Appointments: two completed (drives earnings + session notes), one upcoming.
  await prisma.appointment.deleteMany({ where: { patientId: uid, therapistId } })
  const base = { patientId: uid, therapistId, durationMins: 50, fee: 1800 }
  await prisma.appointment.create({
    data: {
      ...base,
      scheduledAt: daysAgo(10),
      status: 'COMPLETED',
      summary: 'Reviewed coping strategies and set a behavioural goal for the week.',
    },
  })
  await prisma.appointment.create({
    data: { ...base, scheduledAt: daysAgo(3), status: 'COMPLETED', summary: 'Checked in on progress; adjusted homework.' },
  })
  await prisma.appointment.create({
    data: { ...base, scheduledAt: new Date(Date.now() + 3 * DAY_MS), status: 'CONFIRMED' },
  })

  if (spec.withCrisis) {
    await prisma.crisisAlert.deleteMany({ where: { userId: uid } })
    await prisma.crisisAlert.create({
      data: {
        userId: uid,
        patientName: spec.name,
        therapistName,
        label: 'VENT_DISTRESS',
        question: 'I feel like everything is falling apart and I cannot cope.',
        answer: "I hear how overwhelming this feels. You don't have to carry it alone — let's slow down together.",
        handoffNote: 'Patient expressed acute distress in Calm AI chat. Recommend a check-in within 24h.',
        resolved: false,
      },
    })
  }

  return uid
}

/**
 * Seeds a second clinician account (with password sign-in) for testing the expert
 * portal end-to-end: maps the existing demo patient plus a few dummy patients with
 * varied trends, a crisis flag, availability and a supervision link.
 */
async function seedDoctorTestAccount() {
  console.log('Seeding doctor test account…')

  const docUser = await prisma.user.upsert({
    where: { email: 'pragallapati.hom@gmail.com' },
    update: { name: 'Dr. Hom Pragallapati', role: 'THERAPIST', passwordHash: hashPassword('Merind07!demo') },
    create: {
      email: 'pragallapati.hom@gmail.com',
      name: 'Dr. Hom Pragallapati',
      role: 'THERAPIST',
      passwordHash: hashPassword('Merind07!demo'),
    },
  })
  const doc = await prisma.therapistProfile.upsert({
    where: { userId: docUser.id },
    update: { isActive: true, isVerified: true },
    create: {
      userId: docUser.id,
      bio: 'Clinical psychologist focused on anxiety, depression and stress management.',
      qualifications: ['M.Phil Clinical Psychology', 'RCI Registered'],
      yearsExp: 10,
      languages: ['English', 'Hindi', 'Telugu'],
      specializations: ['Anxiety', 'Depression', 'CBT', 'Stress'],
      rciNumber: 'RCI-DEMO-0003',
      sessionFee: 1800,
      rating: 4.8,
      totalReviews: 96,
      isVerified: true,
      isActive: true,
    },
  })
  const docName = 'Dr. Hom Pragallapati'

  // Weekly availability: Mon–Sat, morning + afternoon + evening 1-hour slots.
  await prisma.therapistAvailability.deleteMany({ where: { therapistId: doc.id } })
  const hours = [9, 10, 11, 12, 14, 15, 17, 18]
  for (let day = 1; day <= 6; day++) {
    await prisma.therapistAvailability.create({ data: { therapistId: doc.id, dayOfWeek: day, hours } })
  }

  // Map the EXISTING demo patient (praneethpragallapati@gmail.com) to this doctor
  // by adding appointments — the caseload is derived from appointments.
  const praneeth = await prisma.user.findUnique({ where: { email: 'praneethpragallapati@gmail.com' } })
  if (praneeth) {
    await prisma.appointment.deleteMany({ where: { patientId: praneeth.id, therapistId: doc.id } })
    const base = { patientId: praneeth.id, therapistId: doc.id, durationMins: 50, fee: doc.sessionFee }
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
    // A pending booking request to test the Schedule "Booking requests" flow.
    await prisma.appointment.create({
      data: { ...base, scheduledAt: new Date(Date.now() + 5 * DAY_MS), status: 'PENDING' },
    })
  }

  // A few dummy patients with varied trends so every view has data.
  await seedMappedPatient(doc.id, docName, {
    email: 'demo.aarav@getcalmly.test',
    name: 'Aarav Menon',
    patientId: 'GC-P-000601',
    track: 'depression',
    trackLabel: 'Low mood and motivation',
    diagnosis: 'Major Depressive Disorder (mild)',
    moodPattern: 'declining',
    sessionsTotal: 8,
    sessionsUsed: 3,
    withCrisis: true,
  })
  await seedMappedPatient(doc.id, docName, {
    email: 'demo.isha@getcalmly.test',
    name: 'Isha Reddy',
    patientId: 'GC-P-000602',
    track: 'anxiety',
    trackLabel: 'Social anxiety',
    diagnosis: 'Social Anxiety Disorder',
    moodPattern: 'improving',
    sessionsTotal: 12,
    sessionsUsed: 7,
  })
  await seedMappedPatient(doc.id, docName, {
    email: 'demo.kabir@getcalmly.test',
    name: 'Kabir Shah',
    patientId: 'GC-P-000603',
    track: 'stress',
    trackLabel: 'Work-related stress',
    diagnosis: 'Adjustment disorder',
    moodPattern: 'stable',
    sessionsTotal: 6,
    sessionsUsed: 2,
  })

  // Supervision: the existing senior supervisor (Dr. Vikram) also supervises this doctor.
  const vikram = await prisma.user.findUnique({
    where: { email: 'dr.vikram@getcalmly.com' },
    include: { therapistProfile: true },
  })
  if (vikram?.therapistProfile) {
    const link = await prisma.supervisionLink.upsert({
      where: { supervisorId_superviseeId: { supervisorId: vikram.therapistProfile.id, superviseeId: doc.id } },
      update: {},
      create: { supervisorId: vikram.therapistProfile.id, superviseeId: doc.id },
    })
    const existing = await prisma.supervisionNote.count({ where: { linkId: link.id } })
    if (existing === 0) {
      await prisma.supervisionNote.create({
        data: {
          linkId: link.id,
          authorId: vikram.therapistProfile.id,
          content: 'Welcome aboard. Flag any high-risk cases early and we can review together.',
        },
      })
    }
  }

  console.log(`Done. Doctor login: ${docUser.email} / Merind07!demo (3+ patients mapped).`)
}

// Turn "2 hours ago" / "Yesterday" / "1 week ago" into a real timestamp so the
// relative-time display on the live site stays believable after seeding.
function dateFromDisplay(label: string): Date {
  const now = Date.now()
  const m = label.match(/(\d+)\s+(hour|day|week|minute)/i)
  if (label.toLowerCase() === 'yesterday') return new Date(now - 864e5)
  if (m) {
    const n = parseInt(m[1], 10)
    const unit = m[2].toLowerCase()
    const ms = unit === 'minute' ? 6e4 : unit === 'hour' ? 36e5 : unit === 'day' ? 864e5 : 6048e5
    return new Date(now - n * ms)
  }
  return new Date(now)
}

// "12 June 2026" -> Date
function dateFromBlog(label: string): Date {
  const d = new Date(label)
  return isNaN(d.getTime()) ? new Date() : d
}

async function main() {
  console.log('Seeding blog posts…')
  for (const p of blogSeed) {
    const publishedAt = dateFromBlog(p.date)
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        authorName: p.author,
        authorRole: p.role,
        tags: p.tags,
        readTime: p.readTime,
        publishedAt,
      },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        authorName: p.author,
        authorRole: p.role,
        tags: p.tags,
        readTime: p.readTime,
        published: true,
        publishedAt,
      },
    })
  }

  console.log('Seeding community discussions…')
  // Idempotent on (title) so re-running does not duplicate the sample set.
  for (const c of communitySeed) {
    const existing = await prisma.communityPost.findFirst({ where: { title: c.title } })
    const data = {
      title: c.title,
      body: c.body,
      authorName: c.author,
      authorRole: ROLE_NAME_TO_ENUM[c.role] as CommunityRole,
      tenure: c.tenure,
      tags: c.tags,
      upvotes: c.upvotes,
      createdAt: dateFromDisplay(c.date),
    }
    if (existing) {
      await prisma.communityPost.update({ where: { id: existing.id }, data })
    } else {
      await prisma.communityPost.create({ data })
    }
  }

  const { therapist, patientUserId } = await seedDemoPatient()
  await seedExpertExtras(therapist.id, patientUserId)
  await seedDoctorTestAccount()

  const blogCount = await prisma.blogPost.count()
  const postCount = await prisma.communityPost.count()
  console.log(`Done. ${blogCount} blog posts, ${postCount} community discussions.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
