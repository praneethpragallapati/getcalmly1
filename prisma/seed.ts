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

  await seedDemoPatient()

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
