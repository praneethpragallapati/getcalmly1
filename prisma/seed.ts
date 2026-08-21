import { PrismaClient, type CommunityRole } from '@prisma/client'
import { blogSeed } from '../src/data/blogSeed'
import { communitySeed, ROLE_NAME_TO_ENUM } from '../src/data/communitySeed'
import { FORM_TEMPLATES } from '../src/data/forms'
import { hashPassword } from '../src/lib/password'

/** Seed the singleton earnings config + an admin account to manage it. */
async function seedEarningsAndAdmin() {
  console.log('Seeding earnings config + admin…')
  await prisma.earningsConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      baseFee: 600,
      baseFeeIndividual: 600,
      baseFeeCouples: 900,
      baseFeePsychiatry: 800,
      secondSessionBonus: 50,
      thirdOnwardsBonus: 100,
      miscBonus: 0,
      nightSessionBonus: 200,
    },
  })
}

// ── Clean account seed ───────────────────────────────────────────────────────
// The ONLY accounts we create: 1 admin + 5 clinicians + 9 patients. No
// appointments, packages, moods, journals, tasks or mappings — everything is
// built from the admin dashboard. Idempotent (upsert).
//
// DEVELOPMENT AND DEMO ONLY. Every account is fictional and every address is
// under example.com, which RFC 2606 reserves and no mail server will deliver
// to — so a seeded account can never receive an OTP or a notification intended
// for a real person, even if this is pointed at the wrong database. It used to
// seed two real people at their personal Gmail addresses.
//
// SEED_PASSWORD is read from the environment so a shared demo deployment can
// use something that isn't printed in a public repository. The fallback is for
// local development only.
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'DemoSeed@2026'

const SEED_CLINICIANS = [
  { name: 'Dr. Arjun Desai', email: 'arjun.desai@example.com', gender: 'Male', type: 'Therapist', emp: 'PART_TIME', spec: ['Anxiety', 'CBT', 'Work stress'], qual: ['M.Phil Clinical Psychology (RCI)'], lang: ['English', 'Hindi', 'Telugu'], yrs: 9, fee: 1200, rci: 'A100001', bio: 'Works with adults on anxiety, burnout and life transitions, blending CBT with practical between-session tools.' },
  { name: 'Dr. Ananya Sharma', email: 'ananya.sharma@example.com', gender: 'Female', type: 'Therapist', emp: 'FULL_TIME', spec: ['Anxiety', 'Trauma', 'CBT'], qual: ['M.Phil Clinical Psychology (RCI)'], lang: ['English', 'Hindi'], yrs: 8, fee: 1200, rci: 'A100002', bio: 'Trauma-informed clinical psychologist supporting adults through anxiety and difficult life change.' },
  { name: 'Dr. Rohan Verma', email: 'rohan.verma@example.com', gender: 'Male', type: 'Therapist', emp: 'FULL_TIME', spec: ['Depression', 'Relationships', 'Grief'], qual: ['M.A. Psychology', 'M.Phil (RCI)'], lang: ['English', 'Hindi', 'Punjabi'], yrs: 11, fee: 1300, rci: 'A100003', bio: 'Helps people navigate depression, relationships and loss with warmth and structure.' },
  { name: 'Dr. Meera Iyer', email: 'meera.iyer@example.com', gender: 'Female', type: 'Couples therapist', emp: 'FULL_TIME', spec: ['Couples', 'EFT', 'Communication'], qual: ['M.Sc Counselling Psychology'], lang: ['English', 'Tamil', 'Hindi'], yrs: 7, fee: 1500, rci: 'A100004', bio: 'Couples specialist using Emotionally Focused Therapy to help partners reconnect.' },
  { name: 'Dr. Kabir Rao', email: 'kabir.rao@example.com', gender: 'Male', type: 'Psychiatrist', emp: 'FULL_TIME', spec: ['Psychiatry', 'Medication management', 'Adult ADHD'], qual: ['MBBS', 'MD Psychiatry (NMC)'], lang: ['English', 'Hindi', 'Kannada'], yrs: 12, fee: 1800, rci: 'N200001', bio: 'Consultant psychiatrist for diagnosis and medication, working alongside your therapist.' },
]

const SEED_PATIENTS = [
  ['Rhea Kapoor', 'rhea.kapoor@example.com'],
  ['Aarav Patel', 'aarav.patel@example.com'],
  ['Diya Nair', 'diya.nair@example.com'],
  ['Vikram Singh', 'vikram.singh@example.com'],
  ['Sara Khan', 'sara.khan@example.com'],
  ['Aditya Rao', 'aditya.rao@example.com'],
  ['Isha Gupta', 'isha.gupta@example.com'],
  ['Karan Mehta', 'karan.mehta@example.com'],
  ['Ananya Reddy', 'ananya.reddy@example.com'],
]

async function seedCleanAccounts() {
  console.log('Seeding clean accounts (no data, no mappings)…')
  const pw = hashPassword(SEED_PASSWORD)

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: 'ADMIN', name: 'Demo Admin', passwordHash: pw },
    create: { email: 'admin@example.com', name: 'Demo Admin', role: 'ADMIN', passwordHash: pw },
  })

  // Clinicians (+ profile, no appointments/mappings)
  for (const c of SEED_CLINICIANS) {
    const u = await prisma.user.upsert({
      where: { email: c.email },
      update: { role: 'THERAPIST', name: c.name, passwordHash: pw },
      create: { email: c.email, name: c.name, role: 'THERAPIST', passwordHash: pw },
    })
    await prisma.therapistProfile.upsert({
      where: { userId: u.id },
      update: { bio: c.bio, qualifications: c.qual, yearsExp: c.yrs, languages: c.lang, specializations: c.spec, gender: c.gender, clinicianType: c.type, sessionFee: c.fee, employmentType: c.emp as 'PART_TIME' | 'FULL_TIME', isVerified: true, isActive: true },
      create: { userId: u.id, bio: c.bio, qualifications: c.qual, yearsExp: c.yrs, languages: c.lang, specializations: c.spec, gender: c.gender, clinicianType: c.type, rciNumber: c.rci, sessionFee: c.fee, employmentType: c.emp as 'PART_TIME' | 'FULL_TIME', isVerified: true, isActive: true },
    })
  }

  // Patients (+ minimal profile, no data/mappings)
  for (let i = 0; i < SEED_PATIENTS.length; i++) {
    const [name, email] = SEED_PATIENTS[i]
    const u = await prisma.user.upsert({
      where: { email },
      update: { role: 'PATIENT', name, passwordHash: pw },
      create: { email, name, role: 'PATIENT', passwordHash: pw },
    })
    await prisma.patientProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, patientId: `P-${1000 + i}`, careMode: 'INDIVIDUAL', track: [], country: 'IN' },
    })
  }
}

/** Upsert the in-code clinical forms library into the DB (idempotent by slug). */
async function seedFormTemplates() {
  console.log('Seeding form templates…')
  for (const t of FORM_TEMPLATES) {
    await prisma.formTemplate.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        description: t.description,
        kind: t.kind,
        category: t.category ?? null,
        autoSend: t.autoSend ?? false,
        fields: t.fields,
        active: true,
      },
      create: {
        slug: t.slug,
        title: t.title,
        description: t.description,
        kind: t.kind,
        category: t.category ?? null,
        autoSend: t.autoSend ?? false,
        fields: t.fields,
      },
    })
  }
}

const prisma = new PrismaClient()

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

  await seedEarningsAndAdmin()
  await seedFormTemplates()
  await seedCleanAccounts()

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
