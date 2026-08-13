/**
 * Admin portal data access. ADMIN-role only; every page and action must gate on
 * getAdminSession() first. Read helpers fail soft (return zeros/empties) so the
 * portal renders even if a query hiccups.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { designationOf, getTherapistEarnings, type EarningLine } from '@/lib/expert'
import { getEarningsConfig } from '@/lib/earningsConfig'
import { frequencyChip, timesOfDayChip, isDoneForPeriod } from '@/lib/taskRecurrence'
import { fmtIST } from '@/lib/tz'
import { parseCompensationFields, type CompensationField } from '@/lib/compensation'
import { ensureSampleContent } from '@/lib/sampleContent'

export type AdminUser = { id: string; name: string | null; role: string }

/** The signed-in admin, or null if not signed in / not an admin. */
export async function getAdminSession(): Promise<AdminUser | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string; name?: string | null } | undefined
  if (!user?.id || user.role !== 'ADMIN') return null
  return { id: user.id, name: user.name ?? null, role: 'ADMIN' }
}

// ── Overview KPIs ─────────────────────────────────────────────────────────────

export type AdminOverview = {
  patients: number
  clinicians: number
  sessionsToday: number
  openCrises: number
  pendingApplications: number
  newContacts: number
  newLeads: number
  activeSubscriptions: number
}

const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try { return await fn() } catch { return fallback }
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1)

  const [
    patients, clinicians, sessionsToday, openCrises, pendingApplications, newContacts, newLeads, activeSubscriptions,
  ] = await Promise.all([
    safe(() => prisma.user.count({ where: { role: 'PATIENT' } }), 0),
    safe(() => prisma.therapistProfile.count({ where: { isActive: true } }), 0),
    safe(() => prisma.appointment.count({ where: { scheduledAt: { gte: startOfToday, lt: endOfToday }, status: { not: 'CANCELLED' } } }), 0),
    safe(() => prisma.crisisAlert.count({ where: { resolved: false } }), 0),
    safe(() => prisma.therapistApplication.count({ where: { status: { in: ['APPLIED', 'INTERVIEW_SCHEDULED', 'UNDER_REVIEW'] } } }), 0),
    safe(() => prisma.contactMessage.count({ where: { handled: false } }), 0),
    safe(() => prisma.enterpriseLead.count({ where: { handled: false } }), 0),
    safe(() => prisma.subscription.count({ where: { status: 'ACTIVE' } }), 0),
  ])

  return { patients, clinicians, sessionsToday, openCrises, pendingApplications, newContacts, newLeads, activeSubscriptions }
}

// ── Submissions inbox ─────────────────────────────────────────────────────────

export type ApplicationRow = {
  id: string; fullName: string; email: string; phone: string; council: string; registrationNo: string
  yearsExp: number; qualifications: string[]; specializations: string[]; languages: string[]
  bio: string | null; status: string; reviewerNotes: string | null; preferredInterviewAt: string | null
  createdAt: string
}
export type ContactRow = { id: string; name: string; email: string; phone: string | null; message: string; handled: boolean; createdAt: string }
export type LeadRow = { id: string; name: string; email: string; organisation: string | null; sector: string | null; teamSize: string | null; phone: string | null; message: string | null; handled: boolean; createdAt: string }

const fmt = (d: Date) => d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export async function getApplications(): Promise<ApplicationRow[]> {
  return safe(async () => {
    const rows = await prisma.therapistApplication.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map((r) => ({
      id: r.id, fullName: r.fullName, email: r.email, phone: r.phone, council: r.council,
      registrationNo: r.registrationNo, yearsExp: r.yearsExp, qualifications: r.qualifications,
      specializations: r.specializations, languages: r.languages, bio: r.bio, status: r.status,
      reviewerNotes: r.reviewerNotes, preferredInterviewAt: r.preferredInterviewAt ? fmt(r.preferredInterviewAt) : null,
      createdAt: fmt(r.createdAt),
    }))
  }, [])
}

export async function getContactMessages(): Promise<ContactRow[]> {
  return safe(async () => {
    const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, message: r.message, handled: r.handled, createdAt: fmt(r.createdAt) }))
  }, [])
}

export type TherapistPrefill = {
  name: string; email: string; phone: string; council: string; registrationNo: string
  yearsExp: number; qualifications: string; languages: string; specializations: string; bio: string
}

/** Prefill values for the create-clinician form, from an approved application. */
export async function getApplicationForPrefill(id: string): Promise<TherapistPrefill | null> {
  return safe(async () => {
    const r = await prisma.therapistApplication.findUnique({ where: { id } })
    if (!r) return null
    return {
      name: r.fullName, email: r.email, phone: r.phone, council: r.council, registrationNo: r.registrationNo,
      yearsExp: r.yearsExp, qualifications: r.qualifications.join(', '), languages: r.languages.join(', '),
      specializations: r.specializations.join(', '), bio: r.bio ?? '',
    }
  }, null)
}

export async function getEnterpriseLeads(): Promise<LeadRow[]> {
  return safe(async () => {
    const rows = await prisma.enterpriseLead.findMany({ orderBy: { createdAt: 'desc' } })
    return rows.map((r) => ({ id: r.id, name: r.name, email: r.email, organisation: r.organisation, sector: r.sector, teamSize: r.teamSize, phone: r.phone, message: r.message, handled: r.handled, createdAt: fmt(r.createdAt) }))
  }, [])
}

// ── Clinicians ────────────────────────────────────────────────────────────────

export type ClinicianRow = {
  profileId: string; name: string; email: string; designation: string
  employmentType: string; isActive: boolean; isVerified: boolean; rating: number; totalReviews: number
  // Filterable facets.
  languages: string[]
  specializations: string[]
  sessionsCompleted: number
}

export async function getClinicians(): Promise<ClinicianRow[]> {
  return safe(async () => {
    const [rows, completed] = await Promise.all([
      // Narrow select (never a full-row `include`): keeps the list resilient to a
      // newer migration column the deployment's DB may not have yet (e.g.
      // clinicianType / compensationFields) — otherwise one missing column makes
      // the whole query throw and the roster shows empty.
      prisma.therapistProfile.findMany({
        select: {
          id: true, isActive: true, isVerified: true, rating: true, totalReviews: true,
          employmentType: true, languages: true, specializations: true,
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.appointment.groupBy({ by: ['therapistId'], where: { status: 'COMPLETED' }, _count: { _all: true } }),
    ])
    const doneByProfile = new Map(completed.map((c) => [c.therapistId, c._count._all]))
    return rows
      .map((r) => ({
        profileId: r.id, name: r.user?.name ?? 'Clinician', email: r.user?.email ?? '',
        designation: designationOf(r.specializations), employmentType: (r.employmentType as string) ?? 'FULL_TIME',
        isActive: r.isActive, isVerified: r.isVerified, rating: r.rating, totalReviews: r.totalReviews,
        languages: r.languages ?? [], specializations: r.specializations ?? [],
        sessionsCompleted: doneByProfile.get(r.id) ?? 0,
      }))
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name))
  }, [])
}

export type ClinicianDetail = {
  profileId: string; userId: string; name: string; email: string; designation: string
  bio: string; qualifications: string[]; languages: string[]; specializations: string[]
  rciNumber: string; yearsExp: number; sessionFee: number; employmentType: string
  isActive: boolean; isVerified: boolean; rating: number; totalReviews: number
  baseFeeIndividual: number | null; baseFeeCouples: number | null; baseFeePsychiatry: number | null
  secondSessionBonus: number | null; thirdOnwardsBonus: number | null; miscBonus: number | null; nightSessionBonus: number | null
  globalFees: { individual: number; couples: number; psychiatry: number }
  globalBonuses: { second: number; thirdOnwards: number; misc: number; night: number }
  documentUrls: string[]
  compensationFields: CompensationField[]
  supervisors: { linkId: string; name: string }[]
  supervisees: { linkId: string; name: string }[]
  patients: { userId: string; name: string }[]
  allTherapists: { profileId: string; name: string }[]
  reviews: { id: string; rating: number; comment: string | null; date: string }[]
}

export async function getClinicianDetail(profileId: string): Promise<ClinicianDetail | null> {
  return safe(async () => {
    // Explicit select (no full-row `include`) so a newer column the DB may not
    // have yet — e.g. clinicianType — can't make the editor 404. compensationFields
    // is read separately below, tolerating a not-yet-run migration.
    const p = await prisma.therapistProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true, specializations: true, bio: true, qualifications: true, languages: true,
        rciNumber: true, yearsExp: true, sessionFee: true, employmentType: true,
        isActive: true, isVerified: true, rating: true, totalReviews: true,
        baseFeeIndividual: true, baseFeeCouples: true, baseFeePsychiatry: true,
        secondSessionBonus: true, thirdOnwardsBonus: true, miscBonus: true, nightSessionBonus: true,
        documentUrls: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
    if (!p) return null
    let compensationFields: CompensationField[] = []
    try {
      const comp = await prisma.therapistProfile.findUnique({ where: { id: profileId }, select: { compensationFields: true } })
      compensationFields = parseCompensationFields(comp?.compensationFields)
    } catch { /* compensationFields column not migrated yet */ }
    const config = await getEarningsConfig()
    const [links, apptPatients, assigned, allT, reviews] = await Promise.all([
      prisma.supervisionLink.findMany({
        where: { OR: [{ supervisorId: profileId }, { superviseeId: profileId }] },
        include: { supervisor: { include: { user: { select: { name: true } } } }, supervisee: { include: { user: { select: { name: true } } } } },
      }),
      prisma.appointment.findMany({ where: { therapistId: profileId }, select: { patientId: true, patient: { select: { name: true } } }, distinct: ['patientId'] }),
      // Everyone the admin assigned to this clinician — via the default column OR
      // any per-care-type column (individual/couples/psychiatry). Auto-assignment
      // writes the per-category columns, so matching only assignedTherapistId used
      // to miss those patients entirely.
      prisma.patientProfile.findMany({
        where: {
          OR: [
            { assignedTherapistId: profileId },
            { assignedTherapistIndividualId: profileId },
            { assignedTherapistCouplesId: profileId },
            { assignedTherapistPsychiatryId: profileId },
          ],
        },
        select: { userId: true, user: { select: { name: true } } },
      }),
      prisma.therapistProfile.findMany({ include: { user: { select: { name: true } } } }),
      prisma.sessionReview.findMany({ where: { therapistId: profileId }, orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, rating: true, comment: true, createdAt: true } }),
    ])
    // Also anyone attached to this clinician through an active package.
    let pkgPatients: { userId: string; user: { name: string | null } | null }[] = []
    try {
      pkgPatients = await prisma.subscription.findMany({
        where: { therapistId: profileId, status: 'ACTIVE' },
        select: { userId: true, user: { select: { name: true } } },
        distinct: ['userId'],
      })
    } catch { /* 0015 not applied */ }
    const patientMap = new Map<string, string>()
    for (const a of apptPatients) patientMap.set(a.patientId, a.patient?.name ?? 'Patient')
    for (const a of assigned) patientMap.set(a.userId, a.user?.name ?? 'Patient')
    for (const a of pkgPatients) patientMap.set(a.userId, a.user?.name ?? 'Patient')

    return {
      profileId: p.id, userId: p.user?.id ?? '', name: p.user?.name ?? 'Clinician', email: p.user?.email ?? '',
      designation: designationOf(p.specializations), bio: p.bio, qualifications: p.qualifications, languages: p.languages,
      specializations: p.specializations, rciNumber: p.rciNumber, yearsExp: p.yearsExp, sessionFee: p.sessionFee,
      employmentType: (p.employmentType as string) ?? 'FULL_TIME', isActive: p.isActive, isVerified: p.isVerified,
      rating: p.rating, totalReviews: p.totalReviews,
      baseFeeIndividual: p.baseFeeIndividual ?? null, baseFeeCouples: p.baseFeeCouples ?? null, baseFeePsychiatry: p.baseFeePsychiatry ?? null,
      secondSessionBonus: p.secondSessionBonus ?? null, thirdOnwardsBonus: p.thirdOnwardsBonus ?? null,
      miscBonus: p.miscBonus ?? null, nightSessionBonus: p.nightSessionBonus ?? null,
      globalFees: { individual: config.baseFeeIndividual, couples: config.baseFeeCouples, psychiatry: config.baseFeePsychiatry },
      globalBonuses: { second: config.secondSessionBonus, thirdOnwards: config.thirdOnwardsBonus, misc: config.miscBonus, night: config.nightSessionBonus },
      documentUrls: p.documentUrls ?? [],
      compensationFields,
      supervisors: links.filter((l) => l.superviseeId === profileId).map((l) => ({ linkId: l.id, name: l.supervisor.user?.name ?? 'Clinician' })),
      supervisees: links.filter((l) => l.supervisorId === profileId).map((l) => ({ linkId: l.id, name: l.supervisee.user?.name ?? 'Clinician' })),
      patients: [...patientMap.entries()].map(([userId, name]) => ({ userId, name })),
      allTherapists: allT.filter((t) => t.id !== profileId).map((t) => ({ profileId: t.id, name: t.user?.name ?? 'Clinician' })).sort((a, b) => a.name.localeCompare(b.name)),
      reviews: reviews.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, date: r.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })),
    }
  }, null)
}

// ── Admin → therapist tasks ────────────────────────────────────────────────────

export type TherapistTaskRow = {
  id: string; title: string; description: string | null
  frequencyLabel?: string; timesLabel?: string; dueLabel?: string
  assignedBy: string | null; done: boolean; expired: boolean
}

/** Tasks assigned TO a therapist (their own User id is the target). */
export async function getTherapistTasks(therapistUserId: string): Promise<TherapistTaskRow[]> {
  return safe(async () => {
    if (!therapistUserId) return []
    const rows = await prisma.task.findMany({
      where: { userId: therapistUserId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, title: true, description: true, frequency: true, timesOfDay: true, dueDate: true, completedAt: true, assignedBy: true },
    })
    const now = Date.now()
    return rows.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      frequencyLabel: frequencyChip(t.frequency),
      timesLabel: timesOfDayChip(t.timesOfDay),
      dueLabel: t.dueDate ? t.dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
      assignedBy: t.assignedBy,
      done: isDoneForPeriod(t.completedAt, t.frequency),
      expired: Boolean(t.dueDate && !t.completedAt && t.dueDate.getTime() < now),
    }))
  }, [] as TherapistTaskRow[])
}

// ── Patients & subscriptions ───────────────────────────────────────────────────

// Package track slug → human label. Defined in a client-safe module and
// re-exported here so both server loaders and client filters can use it.
export { TRACK_LABEL, trackLabel } from '@/lib/packageLabels'
import { trackLabel } from '@/lib/packageLabels'

export type PatientRow = {
  userId: string; name: string; email: string; activePlans: number
  // Filterable facets: completed sessions, active package types, language, gender.
  sessionsCompleted: number
  sessionsLeft: number // remaining sessions across active packages
  packageTypes: string[] // active subscription trackSlugs (e.g. ['therapy','calmplus'])
  language: string | null
  gender: string | null
  state: string | null
  monthsHere: number // whole months since they joined
  joinedIso: string
  therapistId: string | null // assigned (default) clinician profile id
  therapistName: string | null
}

/** Whole months between an instant and now (approx, 30.44-day months). */
export const monthsSince = (d: Date): number => Math.max(0, Math.floor((Date.now() - d.getTime()) / (30.44 * 86400000)))

export async function getPatients(): Promise<PatientRow[]> {
  return safe(async () => {
    const users = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      // `state` (migration 0020) is fetched separately below so a DB that hasn't
      // run that migration yet still lists patients instead of failing soft to
      // an empty roster.
      select: { id: true, name: true, email: true, createdAt: true, patientProfile: { select: { preferredLanguage: true, gender: true } } },
      orderBy: { createdAt: 'desc' }, take: 300,
    })
    const [subs, completed] = await Promise.all([
      prisma.subscription.findMany({ where: { status: 'ACTIVE' }, select: { userId: true, trackSlug: true, sessionsTotal: true, sessionsUsed: true } }),
      prisma.appointment.groupBy({ by: ['patientId'], where: { status: 'COMPLETED' }, _count: { _all: true } }),
    ])
    // Defensive: skip silently if the `state` column isn't present yet.
    const stateByUser = new Map<string, string | null>()
    try {
      const states = await prisma.patientProfile.findMany({ select: { userId: true, state: true } })
      for (const s of states) stateByUser.set(s.userId, s.state ?? null)
    } catch { /* column not migrated yet */ }
    // Assigned (default) clinician per patient + a profileId → name map, so the
    // roster can be filtered by therapist. Defensive against a pre-assignment DB.
    const assignedByUser = new Map<string, string | null>()
    try {
      const profs = await prisma.patientProfile.findMany({ select: { userId: true, assignedTherapistId: true } })
      for (const pr of profs) assignedByUser.set(pr.userId, pr.assignedTherapistId ?? null)
    } catch { /* assignment column not migrated yet */ }
    const tNameById = new Map<string, string>()
    try {
      const tProfiles = await prisma.therapistProfile.findMany({ select: { id: true, user: { select: { name: true } } } })
      for (const t of tProfiles) tNameById.set(t.id, t.user?.name ?? 'Clinician')
    } catch { /* ignore */ }
    const tracksByUser = new Map<string, Set<string>>()
    const leftByUser = new Map<string, number>()
    for (const s of subs) {
      const set = tracksByUser.get(s.userId) ?? new Set<string>()
      set.add(s.trackSlug); tracksByUser.set(s.userId, set)
      leftByUser.set(s.userId, (leftByUser.get(s.userId) ?? 0) + Math.max(0, s.sessionsTotal - s.sessionsUsed))
    }
    const doneByUser = new Map(completed.map((c) => [c.patientId, c._count._all]))
    return users.map((u) => {
      const tracks = tracksByUser.get(u.id)
      return {
        userId: u.id, name: u.name ?? 'Patient', email: u.email ?? '',
        activePlans: tracks ? tracks.size : 0,
        sessionsCompleted: doneByUser.get(u.id) ?? 0,
        sessionsLeft: leftByUser.get(u.id) ?? 0,
        packageTypes: tracks ? [...tracks] : [],
        language: u.patientProfile?.preferredLanguage ?? null,
        gender: u.patientProfile?.gender ?? null,
        state: stateByUser.get(u.id) ?? null,
        monthsHere: monthsSince(u.createdAt),
        joinedIso: u.createdAt.toISOString(),
        therapistId: assignedByUser.get(u.id) ?? null,
        therapistName: (() => { const id = assignedByUser.get(u.id); return id ? tNameById.get(id) ?? null : null })(),
      }
    })
  }, [])
}

export type SubscriptionRow = {
  id: string; planName: string; trackSlug: string; status: string
  sessionsTotal: number; sessionsUsed: number; sessionsLeft: number; createdAt: string
  validUntil: string | null; expired: boolean
  therapistId: string | null; therapistName: string | null
}
export type CareCategoryKey = 'individual' | 'couples' | 'psychiatry'
export type CategoryAssignment = { id: string | null; name: string | null }

export type PatientDetail = {
  userId: string; name: string; email: string
  assignedTherapistId: string | null; assignedTherapistName: string | null
  assignments: Record<CareCategoryKey, CategoryAssignment>
  subscriptions: SubscriptionRow[]
  therapists: { profileId: string; name: string; clinicianType: string | null; specializations: string[] }[]
}

export async function getPatientDetail(userId: string): Promise<PatientDetail | null> {
  return safe(async () => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, patientProfile: { select: { assignedTherapistId: true } } } })
    if (!user) return null
    // Per-care-type assignments (migration 0016) fetched defensively so a DB that
    // hasn't run 0016 still opens the patient page (instead of 404-ing) — the
    // category assignments just read as unset until the migration lands.
    let catIds: { ind: string | null; cpl: string | null; psy: string | null } = { ind: null, cpl: null, psy: null }
    try {
      const pc = await prisma.patientProfile.findUnique({ where: { userId }, select: { assignedTherapistIndividualId: true, assignedTherapistCouplesId: true, assignedTherapistPsychiatryId: true } })
      catIds = { ind: pc?.assignedTherapistIndividualId ?? null, cpl: pc?.assignedTherapistCouplesId ?? null, psy: pc?.assignedTherapistPsychiatryId ?? null }
    } catch { /* 0016 not applied yet */ }
    const [subs, therapists, latestAppt] = await Promise.all([
      // Narrow select so a not-yet-applied migration column can't make this throw
      // (which would silently drop the whole packages list).
      prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, planName: true, trackSlug: true, status: true,
          sessionsTotal: true, sessionsUsed: true, createdAt: true, expiresAt: true, therapistId: true,
        },
      }),
      // Explicit select (no full-row include, no clinicianType) so a missing 0017
      // column can't blank the clinician picker. clinicianType is read separately.
      prisma.therapistProfile.findMany({ where: { isActive: true }, select: { id: true, specializations: true, user: { select: { name: true } } } }),
      prisma.appointment.findFirst({ where: { patientId: userId }, orderBy: { scheduledAt: 'desc' }, select: { therapistId: true } }),
    ])
    const clinTypeById = new Map<string, string | null>()
    try {
      const types = await prisma.therapistProfile.findMany({ where: { isActive: true }, select: { id: true, clinicianType: true } })
      for (const t of types) clinTypeById.set(t.id, t.clinicianType ?? null)
    } catch { /* 0017 not applied yet */ }
    const nameOf = (id: string | null | undefined) => (id ? therapists.find((t) => t.id === id)?.user?.name ?? null : null)
    const pp = user.patientProfile
    const assignedId = pp?.assignedTherapistId ?? latestAppt?.therapistId ?? null
    const cat = (id: string | null | undefined): CategoryAssignment => ({ id: id ?? null, name: nameOf(id) })
    return {
      userId: user.id, name: user.name ?? 'Patient', email: user.email ?? '',
      assignedTherapistId: pp?.assignedTherapistId ?? null,
      assignedTherapistName: nameOf(assignedId),
      assignments: {
        individual: cat(catIds.ind),
        couples: cat(catIds.cpl),
        psychiatry: cat(catIds.psy),
      },
      subscriptions: subs.map((s) => ({
        id: s.id, planName: s.planName, trackSlug: s.trackSlug, status: s.status,
        sessionsTotal: s.sessionsTotal, sessionsUsed: s.sessionsUsed, sessionsLeft: Math.max(0, s.sessionsTotal - s.sessionsUsed),
        createdAt: fmt(s.createdAt),
        validUntil: s.expiresAt ? fmt(s.expiresAt) : null,
        expired: Boolean(s.expiresAt && s.expiresAt.getTime() < Date.now()),
        therapistId: s.therapistId ?? null,
        therapistName: s.therapistId ? therapists.find((t) => t.id === s.therapistId)?.user?.name ?? null : null,
      })),
      therapists: therapists
        .map((t) => ({ profileId: t.id, name: t.user?.name ?? 'Clinician', clinicianType: clinTypeById.get(t.id) ?? null, specializations: t.specializations }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }
  }, null)
}

// ── Patient: per-session status + progress (admin oversight) ──────────────────
// The admin's "control of every minute thing" view for one patient: every
// session with each party's join time, together-duration and call rating, plus
// a progress snapshot from mood check-ins, journaling, tasks and sessions.

export type PatientSessionRow = {
  id: string
  clinicianName: string
  clinicianRating: number // the clinician's overall (denormalised) rating
  scheduledLabel: string
  status: string
  isPast: boolean
  patientJoinedLabel: string | null
  therapistJoinedLabel: string | null
  endedLabel: string | null
  // Minutes both parties were together in the room (max(join) → endedAt), or
  // null when the session never had both sides present with an end time.
  durationMins: number | null
  scheduledMins: number
  bothJoined: boolean
  rating: number | null // the patient's 1–5 rating of this call
  hasSummary: boolean
  summary: string | null // clinician's post-session note
  preSessionNote: string | null // what the patient wrote before the session
}

export type PatientProgress = {
  checkIns: number
  lastCheckInLabel: string | null
  avgMood: number | null // 1–5 average of recent mood check-ins
  moodTrend: { label: string; mood: number }[] // oldest → newest, up to 14
  journalCount: number
  lastJournalLabel: string | null
  openTasks: number
  doneTasks: number
  taskAdherencePct: number | null // done / (done + open)
  sessionsCompleted: number
  sessionsUpcoming: number
  avgRatingGiven: number | null // average of the ratings this patient left
  memberSinceLabel: string | null
  // Medication adherence proxy (psychiatry): active vs total prescriptions.
  medsActive: number
  medsTotal: number
  medAdherencePct: number | null
}

export type PatientActivity = {
  sessions: PatientSessionRow[]
  progress: PatientProgress
}

const timeLabel = (d: Date | null | undefined): string | null =>
  d ? fmtIST(d, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : null

/** Everything the admin needs to audit a patient's sessions and track progress. */
export async function getPatientActivity(userId: string): Promise<PatientActivity> {
  const empty: PatientActivity = {
    sessions: [],
    progress: {
      checkIns: 0, lastCheckInLabel: null, avgMood: null, moodTrend: [],
      journalCount: 0, lastJournalLabel: null, openTasks: 0, doneTasks: 0, taskAdherencePct: null,
      sessionsCompleted: 0, sessionsUpcoming: 0, avgRatingGiven: null, memberSinceLabel: null,
      medsActive: 0, medsTotal: 0, medAdherencePct: null,
    },
  }
  return safe(async () => {
    const now = Date.now()
    const [appts, moods, moodCount, journalCount, lastJournal, tasks, meds, user] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId: userId },
        orderBy: { scheduledAt: 'desc' },
        take: 200,
        include: {
          therapist: { select: { rating: true, user: { select: { name: true } } } },
          review: { select: { rating: true } },
        },
      }),
      prisma.moodEntry.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 14, select: { mood: true, createdAt: true } }),
      prisma.moodEntry.count({ where: { userId } }),
      prisma.journalEntry.count({ where: { userId } }),
      prisma.journalEntry.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
      prisma.task.findMany({ where: { userId }, select: { completedAt: true, frequency: true } }),
      prisma.medication.findMany({ where: { userId }, select: { active: true } }).catch(() => [] as { active: boolean }[]),
      prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    ])

    const sessions: PatientSessionRow[] = appts.map((a) => {
      const bothJoined = Boolean(a.patientJoinedAt && a.therapistJoinedAt)
      let durationMins: number | null = null
      if (a.patientJoinedAt && a.therapistJoinedAt && a.endedAt) {
        const start = Math.max(a.patientJoinedAt.getTime(), a.therapistJoinedAt.getTime())
        durationMins = Math.max(0, Math.round((a.endedAt.getTime() - start) / 60000))
      }
      return {
        id: a.id,
        clinicianName: a.therapist?.user?.name ?? 'Clinician',
        clinicianRating: a.therapist?.rating ?? 0,
        scheduledLabel: fmtIST(a.scheduledAt, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
        status: a.status,
        isPast: a.scheduledAt.getTime() < now,
        patientJoinedLabel: timeLabel(a.patientJoinedAt),
        therapistJoinedLabel: timeLabel(a.therapistJoinedAt),
        endedLabel: timeLabel(a.endedAt),
        durationMins,
        scheduledMins: a.durationMins,
        bothJoined,
        rating: a.review?.rating ?? null,
        hasSummary: Boolean(a.summary),
        summary: a.summary ?? null,
        preSessionNote: a.preSessionNote ?? null,
      }
    })

    const moodAsc = [...moods].reverse()
    const avgMood = moods.length ? Math.round((moods.reduce((s, m) => s + m.mood, 0) / moods.length) * 10) / 10 : null
    const ratings = appts.map((a) => a.review?.rating).filter((r): r is number => typeof r === 'number')
    const avgRatingGiven = ratings.length ? Math.round((ratings.reduce((s, r) => s + r, 0) / ratings.length) * 10) / 10 : null
    const doneTasks = tasks.filter((t) => isDoneForPeriod(t.completedAt, t.frequency)).length
    const openTasks = tasks.filter((t) => !isDoneForPeriod(t.completedAt, t.frequency)).length
    const medsActive = meds.filter((m) => m.active).length
    const medsTotal = meds.length

    return {
      sessions,
      progress: {
        checkIns: moodCount,
        lastCheckInLabel: moods[0] ? timeLabel(moods[0].createdAt) : null,
        avgMood,
        moodTrend: moodAsc.map((m) => ({ label: fmtIST(m.createdAt, { day: 'numeric', month: 'short' }), mood: m.mood })),
        journalCount,
        lastJournalLabel: lastJournal ? timeLabel(lastJournal.createdAt) : null,
        openTasks,
        doneTasks,
        taskAdherencePct: doneTasks + openTasks > 0 ? Math.round((doneTasks / (doneTasks + openTasks)) * 100) : null,
        sessionsCompleted: appts.filter((a) => a.status === 'COMPLETED').length,
        sessionsUpcoming: appts.filter((a) => a.scheduledAt.getTime() >= now && a.status !== 'CANCELLED').length,
        avgRatingGiven,
        memberSinceLabel: user?.createdAt ? fmtIST(user.createdAt, { day: 'numeric', month: 'short', year: 'numeric' }) : null,
        medsActive,
        medsTotal,
        medAdherencePct: medsTotal > 0 ? Math.round((medsActive / medsTotal) * 100) : null,
      },
    }
  }, empty)
}

// ── Patient feedback: every session rating, filterable ────────────────────────
// Each patient's post-session rating + comment, with the clinician, package type
// and session date, so an admin can read feedback by clinician, by patient, by
// rating, by recency or by package type.

export type FeedbackRow = {
  id: string
  rating: number
  comment: string | null
  createdIso: string
  createdLabel: string
  patientId: string
  patientName: string
  therapistProfileId: string
  therapistName: string
  sessionIso: string | null
  sessionLabel: string | null
  trackSlug: string | null
  packageLabel: string | null
}

export async function getFeedback(): Promise<FeedbackRow[]> {
  return safe(async () => {
    const reviews = await prisma.sessionReview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        patient: { select: { name: true } },
        therapist: { select: { user: { select: { name: true } } } },
        appointment: { select: { scheduledAt: true, consumedSubscriptionId: true } },
      },
    })
    // Resolve each rated session's package type from the subscription it consumed.
    const subIds = [...new Set(reviews.map((r) => r.appointment?.consumedSubscriptionId).filter((x): x is string => !!x))]
    const subs = subIds.length
      ? await prisma.subscription.findMany({ where: { id: { in: subIds } }, select: { id: true, trackSlug: true } })
      : []
    const trackBySub = new Map(subs.map((s) => [s.id, s.trackSlug]))
    return reviews.map((r) => {
      const track = r.appointment?.consumedSubscriptionId ? trackBySub.get(r.appointment.consumedSubscriptionId) ?? null : null
      return {
        id: r.id, rating: r.rating, comment: r.comment,
        createdIso: r.createdAt.toISOString(),
        createdLabel: fmt(r.createdAt),
        patientId: r.patientId, patientName: r.patient?.name ?? 'Patient',
        therapistProfileId: r.therapistId, therapistName: r.therapist?.user?.name ?? 'Clinician',
        sessionIso: r.appointment?.scheduledAt ? r.appointment.scheduledAt.toISOString() : null,
        sessionLabel: r.appointment?.scheduledAt ? fmt(r.appointment.scheduledAt) : null,
        trackSlug: track,
        packageLabel: track ? trackLabel(track) : null,
      }
    })
  }, [])
}

// ── Safety: platform-wide crisis oversight ────────────────────────────────────

export type CrisisRow = {
  id: string; userId: string; patientName: string; therapistName: string | null
  label: string; handoffNote: string; question: string; createdAt: string; ageHours: number; resolved: boolean
}

export async function getCrisisAlerts(): Promise<CrisisRow[]> {
  return safe(async () => {
    const rows = await prisma.crisisAlert.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
    const now = Date.now()
    return rows.map((r) => ({
      id: r.id, userId: r.userId, patientName: r.patientName ?? 'Patient', therapistName: r.therapistName ?? null,
      label: r.label, handoffNote: r.handoffNote, question: r.question,
      createdAt: fmt(r.createdAt), ageHours: Math.floor((now - r.createdAt.getTime()) / 3_600_000), resolved: r.resolved,
    }))
  }, [])
}

// ── Operations: appointments board ─────────────────────────────────────────────

export type ApptRow = {
  id: string; patientId: string; patientName: string; therapistId: string; therapistName: string
  scheduledAt: string; status: string; fee: number; isPast: boolean; hasSummary: boolean
}
export type CancelRequestRow = {
  id: string; patientId: string; patientName: string; therapistName: string
  scheduledAt: string; requestedAt: string; reason: string | null; fee: number
}
export type OpsBoard = {
  upcoming: ApptRow[]
  needsNote: ApptRow[]
  cancelRequests: CancelRequestRow[]
  therapists: { profileId: string; name: string }[]
}

export async function getOpsBoard(): Promise<OpsBoard> {
  return safe(async () => {
    const now = new Date()
    const [appts, therapists] = await Promise.all([
      prisma.appointment.findMany({
        orderBy: { scheduledAt: 'desc' }, take: 400,
        include: { patient: { select: { name: true } } },
      }),
      prisma.therapistProfile.findMany({ include: { user: { select: { name: true } } } }),
    ])
    const tName = new Map(therapists.map((t) => [t.id, t.user?.name ?? 'Clinician']))
    const dtFmt: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }
    const map = (r: (typeof appts)[number]): ApptRow => ({
      id: r.id, patientId: r.patientId, patientName: r.patient?.name ?? 'Patient',
      therapistId: r.therapistId, therapistName: tName.get(r.therapistId) ?? 'Clinician',
      scheduledAt: fmtIST(r.scheduledAt, dtFmt),
      status: r.status, fee: r.fee, isPast: r.scheduledAt.getTime() < now.getTime(), hasSummary: Boolean(r.summary),
    })
    const upcoming = appts.filter((a) => a.scheduledAt.getTime() >= now.getTime() && a.status !== 'CANCELLED').sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()).slice(0, 40).map(map)
    const needsNote = appts.filter((a) => a.scheduledAt.getTime() < now.getTime() && a.status !== 'CANCELLED' && !a.summary).slice(0, 40).map(map)
    // Clinician-requested cancellations awaiting an admin decision.
    const cancelRequests: CancelRequestRow[] = appts
      .filter((a) => a.cancelRequested && a.status !== 'CANCELLED' && a.status !== 'COMPLETED')
      .sort((a, b) => (a.cancelRequestedAt?.getTime() ?? 0) - (b.cancelRequestedAt?.getTime() ?? 0))
      .map((r) => ({
        id: r.id, patientId: r.patientId, patientName: r.patient?.name ?? 'Patient',
        therapistName: tName.get(r.therapistId) ?? 'Clinician',
        scheduledAt: fmtIST(r.scheduledAt, dtFmt),
        requestedAt: r.cancelRequestedAt ? fmtIST(r.cancelRequestedAt, dtFmt) : '—',
        reason: r.cancelReason ?? null, fee: r.fee,
      }))
    return { upcoming, needsNote, cancelRequests, therapists: therapists.map((t) => ({ profileId: t.id, name: t.user?.name ?? 'Clinician' })).sort((a, b) => a.name.localeCompare(b.name)) }
  }, { upcoming: [], needsNote: [], cancelRequests: [], therapists: [] })
}

// ── Money: revenue + payouts ────────────────────────────────────────────────────

export type PayoutRow = { profileId: string; name: string; employmentType: string; sessions: number; totalEarned: number; thisMonth: number }
export type MoneyOverview = {
  revenueAllTime: number; revenueThisMonth: number; completedSessions: number; activeSubscriptions: number
  // Whether revenue is measured from the package-purchase ledger (true) or the
  // legacy completed-session fallback used until the first payment is recorded.
  fromPackages: boolean
  payouts: PayoutRow[]
}

export async function getMoneyOverview(): Promise<MoneyOverview> {
  return safe(async () => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const [payments, completed, activeSubscriptions, clinicians] = await Promise.all([
      prisma.payment.findMany({ select: { amount: true, createdAt: true } }),
      prisma.appointment.findMany({ where: { status: 'COMPLETED' }, select: { fee: true, scheduledAt: true } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.therapistProfile.findMany({ include: { user: { select: { name: true } } } }),
    ])
    // Revenue is what patients paid for packages. Until the first purchase is
    // recorded, fall back to completed-session fees so the figures aren't blank
    // for platforms that predate the payment ledger.
    const fromPackages = payments.length > 0
    const revenueAllTime = fromPackages
      ? payments.reduce((s, p) => s + p.amount, 0)
      : completed.reduce((s, a) => s + a.fee, 0)
    const revenueThisMonth = fromPackages
      ? payments.filter((p) => p.createdAt >= monthStart).reduce((s, p) => s + p.amount, 0)
      : completed.filter((a) => a.scheduledAt >= monthStart).reduce((s, a) => s + a.fee, 0)
    const payouts = await Promise.all(clinicians.map(async (t) => {
      const e = await getTherapistEarnings(t.id)
      return { profileId: t.id, name: t.user?.name ?? 'Clinician', employmentType: (t.employmentType as string) ?? 'FULL_TIME', sessions: e.totalSessions, totalEarned: e.totalEarned, thisMonth: e.thisMonthTotal }
    }))
    return { revenueAllTime, revenueThisMonth, completedSessions: completed.length, activeSubscriptions, fromPackages, payouts: payouts.sort((a, b) => b.totalEarned - a.totalEarned) }
  }, { revenueAllTime: 0, revenueThisMonth: 0, completedSessions: 0, activeSubscriptions: 0, fromPackages: false, payouts: [] })
}

// ── Master payout: every clinician, broken down by grain ─────────────────────
// One row per (period, clinician) with the pay breakup — base session count,
// 2nd-session bonuses, 3rd-onwards bonuses, night and misc — so an admin sees
// exactly who is owed what, and why, at the day / month / year grain.

export type PayoutBreakdownRow = {
  periodKey: string
  periodLabel: string
  profileId: string
  name: string
  employmentType: string
  sessions: number
  baseTotal: number
  secondCount: number
  secondTotal: number
  thirdPlusCount: number
  thirdPlusTotal: number
  nightCount: number
  nightTotal: number
  miscTotal: number
  total: number
}

export type MasterPayout = {
  byDay: PayoutBreakdownRow[]
  byMonth: PayoutBreakdownRow[]
  byYear: PayoutBreakdownRow[]
}

export async function getMasterPayout(): Promise<MasterPayout> {
  return safe(async () => {
    const clinicians = await prisma.therapistProfile.findMany({ include: { user: { select: { name: true } } } })

    const day = new Map<string, PayoutBreakdownRow>()
    const month = new Map<string, PayoutBreakdownRow>()
    const year = new Map<string, PayoutBreakdownRow>()

    const blank = (periodKey: string, periodLabel: string, t: { id: string; name: string; employmentType: string }): PayoutBreakdownRow => ({
      periodKey, periodLabel, profileId: t.id, name: t.name, employmentType: t.employmentType,
      sessions: 0, baseTotal: 0, secondCount: 0, secondTotal: 0, thirdPlusCount: 0, thirdPlusTotal: 0,
      nightCount: 0, nightTotal: 0, miscTotal: 0, total: 0,
    })

    await Promise.all(clinicians.map(async (c) => {
      const meta = { id: c.id, name: c.user?.name ?? 'Clinician', employmentType: (c.employmentType as string) ?? 'FULL_TIME' }
      const e = await getTherapistEarnings(c.id)
      for (const l of e.lines) {
        const targets: [Map<string, PayoutBreakdownRow>, string, string][] = [
          [day, `${l.dateIso}|${c.id}`, l.dayLabel],
          [month, `${l.monthKey}|${c.id}`, l.monthLabel],
          [year, `${l.year}|${c.id}`, String(l.year)],
        ]
        for (const [map, key, label] of targets) {
          const row = map.get(key) ?? blank(key, label, meta)
          row.sessions += 1
          row.baseTotal += l.base
          if (l.sessionNumber === 2) { row.secondCount += 1; row.secondTotal += l.numberBonus }
          else if (l.sessionNumber >= 3) { row.thirdPlusCount += 1; row.thirdPlusTotal += l.numberBonus }
          if (l.night) { row.nightCount += 1; row.nightTotal += l.nightBonus }
          row.miscTotal += l.misc
          row.total += l.amount
          map.set(key, row)
        }
      }
    }))

    // Sort: most recent period first, then biggest payout.
    const sortRows = (rows: PayoutBreakdownRow[]) =>
      rows.sort((a, b) => (a.periodKey.split('|')[0] < b.periodKey.split('|')[0] ? 1 : a.periodKey.split('|')[0] > b.periodKey.split('|')[0] ? -1 : b.total - a.total))

    return {
      byDay: sortRows([...day.values()]),
      byMonth: sortRows([...month.values()]),
      byYear: sortRows([...year.values()]),
    }
  }, { byDay: [], byMonth: [], byYear: [] })
}

// ── Clinician earnings detail + statements ──────────────────────────────────────

export type EarningsBucket = { key: string; label: string; amount: number; sessions: number }
export type ClinicianEarnings = {
  profileId: string
  name: string
  employmentType: string
  totalEarned: number
  totalSessions: number
  thisMonthTotal: number
  thisMonthSessions: number
  lines: EarningLine[]
  byDay: EarningsBucket[]
  byWeek: EarningsBucket[]
  byMonth: EarningsBucket[]
}

function earningsBuckets(lines: EarningLine[], keyOf: (l: EarningLine) => { key: string; label: string }): EarningsBucket[] {
  const map = new Map<string, EarningsBucket>()
  for (const l of lines) {
    const { key, label } = keyOf(l)
    const cur = map.get(key) ?? { key, label, amount: 0, sessions: 0 }
    cur.amount += l.amount
    cur.sessions += 1
    map.set(key, cur)
  }
  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1))
}

/**
 * One clinician's earnings exactly as they see them in their own ledger, plus
 * day/week/month rollups for the admin view and downloadable statements.
 */
export async function getClinicianEarnings(profileId: string): Promise<ClinicianEarnings | null> {
  return safe(async () => {
    const profile = await prisma.therapistProfile.findUnique({
      where: { id: profileId },
      select: { id: true, employmentType: true, user: { select: { name: true } } },
    })
    if (!profile) return null
    const e = await getTherapistEarnings(profileId)
    return {
      profileId,
      name: profile.user?.name ?? 'Clinician',
      employmentType: (profile.employmentType as string) ?? 'FULL_TIME',
      totalEarned: e.totalEarned,
      totalSessions: e.totalSessions,
      thisMonthTotal: e.thisMonthTotal,
      thisMonthSessions: e.thisMonthSessions,
      lines: e.lines,
      byDay: earningsBuckets(e.lines, (l) => ({ key: l.dateIso, label: l.dayLabel })),
      byWeek: earningsBuckets(e.lines, (l) => ({ key: isoWeek(new Date(l.dateIso)).key, label: isoWeek(new Date(l.dateIso)).key })),
      byMonth: earningsBuckets(e.lines, (l) => ({ key: l.monthKey, label: l.monthLabel })),
    }
  }, null)
}

// ── Clinician roster: patients, sessions, calendar ──────────────────────────────

export type AdminSessionRow = {
  id: string
  patientId: string
  patientName: string
  scheduledAtIso: string
  dateIso: string // YYYY-MM-DD (local) for calendar grouping
  dateLabel: string
  timeLabel: string
  status: string
  isPast: boolean
  hasSummary: boolean
  voided: boolean
  fee: number
}
export type RosterPatient = {
  userId: string
  name: string
  email: string
  upcoming: AdminSessionRow[]
  past: AdminSessionRow[]
  total: number
}
export type ClinicianRoster = {
  profileId: string
  name: string
  patients: RosterPatient[]
  sessions: AdminSessionRow[] // every session, for the calendar
}

/** A clinician's full roster: patients with their past/future sessions + a flat list for the calendar. */
export async function getClinicianRoster(profileId: string): Promise<ClinicianRoster | null> {
  return safe(async () => {
    const profile = await prisma.therapistProfile.findUnique({ where: { id: profileId }, select: { id: true, user: { select: { name: true } } } })
    if (!profile) return null
    const appts = await prisma.appointment.findMany({
      where: { therapistId: profileId },
      orderBy: { scheduledAt: 'desc' },
      include: { patient: { select: { id: true, name: true, email: true } } },
    })
    const now = Date.now()
    const rows: AdminSessionRow[] = appts.map((a) => {
      const d = a.scheduledAt
      return {
        id: a.id,
        patientId: a.patientId,
        patientName: a.patient?.name ?? 'Patient',
        scheduledAtIso: d.toISOString(),
        dateIso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dateLabel: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        timeLabel: d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
        status: a.status,
        isPast: d.getTime() < now,
        hasSummary: !!a.summary,
        voided: a.status === 'CANCELLED',
        fee: a.fee,
      }
    })

    const byPatient = new Map<string, RosterPatient>()
    for (const a of appts) {
      const id = a.patientId
      if (!byPatient.has(id)) byPatient.set(id, { userId: id, name: a.patient?.name ?? 'Patient', email: a.patient?.email ?? '', upcoming: [], past: [], total: 0 })
    }
    for (const r of rows) {
      const p = byPatient.get(r.patientId)!
      ;(r.isPast ? p.past : p.upcoming).push(r)
      p.total += 1
    }
    // Upcoming should read soonest-first; past newest-first (rows already desc).
    for (const p of byPatient.values()) p.upcoming.reverse()

    return {
      profileId,
      name: profile.user?.name ?? 'Clinician',
      patients: [...byPatient.values()].sort((a, b) => a.name.localeCompare(b.name)),
      sessions: rows,
    }
  }, null)
}

// ── Revenue reporting (package sales, CA-audit depth) ───────────────────────────

const KIND_LABEL: Record<string, string> = {
  package: 'Session pack', first_session: 'First session', calmplus: 'Calm+',
}

/** ISO-8601 week key like "2026-W30" (weeks start Monday). */
function isoWeek(d: Date): { key: string; label: string } {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = t.getUTCDay() || 7
  t.setUTCDate(t.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  const key = `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
  return { key, label: key }
}

// One money-in line — the audit grain. Every field a CA (or a disbursement API)
// would want to reconcile a payment.
export type RevenueLine = {
  id: string
  isoDateTime: string // full timestamp
  dateIso: string // YYYY-MM-DD
  dayLabel: string
  weekKey: string
  monthKey: string // YYYY-MM
  monthLabel: string
  year: number
  userId: string
  patientName: string
  patientEmail: string
  kind: string // package | first_session | calmplus
  kindLabel: string
  trackSlug: string
  planName: string
  amount: number
  subscriptionId: string
}

export type RevenueBucket = { key: string; label: string; amount: number; count: number }
// A time period (day/week/month/year) with its total AND the per-package breakup
// within that period.
export type RevenuePackageLine = { name: string; amount: number; count: number }
export type RevenuePeriod = { key: string; label: string; amount: number; count: number; packages: RevenuePackageLine[] }
export type RevenueReport = {
  hasData: boolean
  totalAllTime: number
  totalThisMonth: number
  totalThisYear: number
  orders: number
  lines: RevenueLine[]
  byDay: RevenuePeriod[]
  byWeek: RevenuePeriod[]
  byMonth: RevenuePeriod[]
  byYear: RevenuePeriod[]
  byPackage: RevenueBucket[]
}

/** The full package-sales ledger (most recent first) as audit line items. */
export async function getRevenueLines(): Promise<RevenueLine[]> {
  return safe(async () => {
    const rows = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })
    return rows.map((p) => {
      const d = p.createdAt
      return {
        id: p.id,
        isoDateTime: d.toISOString(),
        dateIso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        dayLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        weekKey: isoWeek(d).key,
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        monthLabel: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        year: d.getFullYear(),
        userId: p.userId,
        patientName: p.user?.name ?? 'Patient',
        patientEmail: p.user?.email ?? '',
        kind: p.kind,
        kindLabel: KIND_LABEL[p.kind] ?? p.kind,
        trackSlug: p.trackSlug ?? '',
        planName: p.planName ?? '',
        amount: p.amount,
        subscriptionId: p.subscriptionId ?? '',
      }
    })
  }, [])
}

function bucketBy(lines: RevenueLine[], keyOf: (l: RevenueLine) => { key: string; label: string }): RevenueBucket[] {
  const map = new Map<string, RevenueBucket>()
  for (const l of lines) {
    const { key, label } = keyOf(l)
    const cur = map.get(key) ?? { key, label, amount: 0, count: 0 }
    cur.amount += l.amount
    cur.count += 1
    map.set(key, cur)
  }
  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1))
}

const packageNameOf = (l: RevenueLine) => l.planName || l.kindLabel

// Group into time periods, each carrying its total and a per-package breakup.
function periodBy(lines: RevenueLine[], keyOf: (l: RevenueLine) => { key: string; label: string }): RevenuePeriod[] {
  const map = new Map<string, { key: string; label: string; amount: number; count: number; pkg: Map<string, RevenuePackageLine> }>()
  for (const l of lines) {
    const { key, label } = keyOf(l)
    let e = map.get(key)
    if (!e) { e = { key, label, amount: 0, count: 0, pkg: new Map() }; map.set(key, e) }
    e.amount += l.amount
    e.count += 1
    const name = packageNameOf(l)
    const p = e.pkg.get(name) ?? { name, amount: 0, count: 0 }
    p.amount += l.amount
    p.count += 1
    e.pkg.set(name, p)
  }
  return [...map.values()]
    .sort((a, b) => (a.key < b.key ? 1 : -1)) // most recent period first
    .map((e) => ({
      key: e.key, label: e.label, amount: e.amount, count: e.count,
      packages: [...e.pkg.values()].sort((a, b) => b.amount - a.amount),
    }))
}

/** Revenue rolled up across every grain, for the Revenue page. */
export async function getRevenueReport(): Promise<RevenueReport> {
  const lines = await getRevenueLines()
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const byPackage = bucketBy(lines, (l) => ({ key: packageNameOf(l), label: packageNameOf(l) }))
    .sort((a, b) => b.amount - a.amount)
  return {
    hasData: lines.length > 0,
    totalAllTime: lines.reduce((s, l) => s + l.amount, 0),
    totalThisMonth: lines.filter((l) => l.monthKey === monthKey).reduce((s, l) => s + l.amount, 0),
    totalThisYear: lines.filter((l) => l.year === now.getFullYear()).reduce((s, l) => s + l.amount, 0),
    orders: lines.length,
    lines,
    byDay: periodBy(lines, (l) => ({ key: l.dateIso, label: l.dayLabel })),
    byWeek: periodBy(lines, (l) => ({ key: l.weekKey, label: l.weekKey })),
    byMonth: periodBy(lines, (l) => ({ key: l.monthKey, label: l.monthLabel })),
    byYear: periodBy(lines, (l) => ({ key: String(l.year), label: String(l.year) })),
    byPackage,
  }
}

// ── Content moderation ─────────────────────────────────────────────────────────

export type BlogModRow = { slug: string; title: string; author: string; role: string; published: boolean; date: string }
export type CommentModRow = { id: string; author: string; role: string; body: string; postId: string; date: string }
export type CommunityModRow = { id: string; title: string; author: string; role: string; createdAt: string; comments: CommentModRow[] }

export async function getBlogsForModeration(): Promise<BlogModRow[]> {
  // Narrow select: a not-yet-migrated column on prod would otherwise make the
  // full-row SELECT throw and hide every real post behind the [] fallback.
  return safe(async () => {
    await ensureSampleContent()
    const rows = await prisma.blogPost.findMany({
      orderBy: { publishedAt: 'desc' }, take: 200,
      select: { slug: true, title: true, authorName: true, authorRole: true, published: true, publishedAt: true },
    })
    return rows.map((r) => ({ slug: r.slug, title: r.title, author: r.authorName, role: r.authorRole, published: r.published, date: r.publishedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }))
  }, [])
}

export async function getCommunityForModeration(): Promise<CommunityModRow[]> {
  return safe(async () => {
    await ensureSampleContent()
    const rows = await prisma.communityPost.findMany({
      orderBy: { createdAt: 'desc' }, take: 60,
      select: {
        id: true, title: true, authorName: true, authorRole: true, createdAt: true,
        comments: { orderBy: { createdAt: 'asc' }, select: { id: true, authorName: true, authorRole: true, body: true, postId: true, createdAt: true } },
      },
    })
    return rows.map((p) => ({
      id: p.id, title: p.title, author: p.authorName, role: String(p.authorRole), createdAt: fmt(p.createdAt),
      comments: p.comments.map((c) => ({ id: c.id, author: c.authorName, role: String(c.authorRole), body: c.body, postId: c.postId, date: fmt(c.createdAt) })),
    }))
  }, [])
}

// ── Config: forms library ───────────────────────────────────────────────────────

export type FormRow = { id: string; slug: string; title: string; kind: string; category: string | null; autoSend: boolean; active: boolean; fields: number }

export async function getFormsLibrary(): Promise<FormRow[]> {
  return safe(async () => {
    const rows = await prisma.formTemplate.findMany({ orderBy: { title: 'asc' } })
    return rows.map((r) => ({
      id: r.id, slug: r.slug, title: r.title, kind: String(r.kind), category: r.category ? String(r.category) : null,
      autoSend: r.autoSend, active: r.active, fields: Array.isArray(r.fields) ? (r.fields as unknown[]).length : 0,
    }))
  }, [])
}
