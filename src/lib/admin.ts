/**
 * Admin portal data access. ADMIN-role only; every page and action must gate on
 * getAdminSession() first. Read helpers fail soft (return zeros/empties) so the
 * portal renders even if a query hiccups.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { designationOf } from '@/lib/expert'
import { getEarningsConfig } from '@/lib/earningsConfig'

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
}

export async function getClinicians(): Promise<ClinicianRow[]> {
  return safe(async () => {
    const rows = await prisma.therapistProfile.findMany({ include: { user: { select: { name: true, email: true } } } })
    return rows
      .map((r) => ({
        profileId: r.id, name: r.user?.name ?? 'Clinician', email: r.user?.email ?? '',
        designation: designationOf(r.specializations), employmentType: (r.employmentType as string) ?? 'FULL_TIME',
        isActive: r.isActive, isVerified: r.isVerified, rating: r.rating, totalReviews: r.totalReviews,
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
  globalFees: { individual: number; couples: number; psychiatry: number }
  supervisors: { linkId: string; name: string }[]
  supervisees: { linkId: string; name: string }[]
  patients: { userId: string; name: string }[]
  allTherapists: { profileId: string; name: string }[]
}

export async function getClinicianDetail(profileId: string): Promise<ClinicianDetail | null> {
  return safe(async () => {
    const p = await prisma.therapistProfile.findUnique({ where: { id: profileId }, include: { user: { select: { id: true, name: true, email: true } } } })
    if (!p) return null
    const config = await getEarningsConfig()
    const [links, apptPatients, assigned, allT] = await Promise.all([
      prisma.supervisionLink.findMany({
        where: { OR: [{ supervisorId: profileId }, { superviseeId: profileId }] },
        include: { supervisor: { include: { user: { select: { name: true } } } }, supervisee: { include: { user: { select: { name: true } } } } },
      }),
      prisma.appointment.findMany({ where: { therapistId: profileId }, select: { patientId: true, patient: { select: { name: true } } }, distinct: ['patientId'] }),
      prisma.patientProfile.findMany({ where: { assignedTherapistId: profileId }, select: { userId: true, user: { select: { name: true } } } }),
      prisma.therapistProfile.findMany({ include: { user: { select: { name: true } } } }),
    ])
    const patientMap = new Map<string, string>()
    for (const a of apptPatients) patientMap.set(a.patientId, a.patient?.name ?? 'Patient')
    for (const a of assigned) patientMap.set(a.userId, a.user?.name ?? 'Patient')

    return {
      profileId: p.id, userId: p.user?.id ?? '', name: p.user?.name ?? 'Clinician', email: p.user?.email ?? '',
      designation: designationOf(p.specializations), bio: p.bio, qualifications: p.qualifications, languages: p.languages,
      specializations: p.specializations, rciNumber: p.rciNumber, yearsExp: p.yearsExp, sessionFee: p.sessionFee,
      employmentType: (p.employmentType as string) ?? 'FULL_TIME', isActive: p.isActive, isVerified: p.isVerified,
      rating: p.rating, totalReviews: p.totalReviews,
      baseFeeIndividual: p.baseFeeIndividual ?? null, baseFeeCouples: p.baseFeeCouples ?? null, baseFeePsychiatry: p.baseFeePsychiatry ?? null,
      globalFees: { individual: config.baseFeeIndividual, couples: config.baseFeeCouples, psychiatry: config.baseFeePsychiatry },
      supervisors: links.filter((l) => l.superviseeId === profileId).map((l) => ({ linkId: l.id, name: l.supervisor.user?.name ?? 'Clinician' })),
      supervisees: links.filter((l) => l.supervisorId === profileId).map((l) => ({ linkId: l.id, name: l.supervisee.user?.name ?? 'Clinician' })),
      patients: [...patientMap.entries()].map(([userId, name]) => ({ userId, name })),
      allTherapists: allT.filter((t) => t.id !== profileId).map((t) => ({ profileId: t.id, name: t.user?.name ?? 'Clinician' })).sort((a, b) => a.name.localeCompare(b.name)),
    }
  }, null)
}

// ── Patients & subscriptions ───────────────────────────────────────────────────

export type PatientRow = { userId: string; name: string; email: string; activePlans: number }

export async function getPatients(): Promise<PatientRow[]> {
  return safe(async () => {
    const users = await prisma.user.findMany({ where: { role: 'PATIENT' }, select: { id: true, name: true, email: true }, orderBy: { createdAt: 'desc' }, take: 200 })
    const subs = await prisma.subscription.groupBy({ by: ['userId'], where: { status: 'ACTIVE' }, _count: { _all: true } })
    const countByUser = new Map(subs.map((s) => [s.userId, s._count._all]))
    return users.map((u) => ({ userId: u.id, name: u.name ?? 'Patient', email: u.email ?? '', activePlans: countByUser.get(u.id) ?? 0 }))
  }, [])
}

export type SubscriptionRow = {
  id: string; planName: string; trackSlug: string; status: string
  sessionsTotal: number; sessionsUsed: number; sessionsLeft: number; createdAt: string
}
export type PatientDetail = {
  userId: string; name: string; email: string
  assignedTherapistId: string | null; assignedTherapistName: string | null
  subscriptions: SubscriptionRow[]
  therapists: { profileId: string; name: string }[]
}

export async function getPatientDetail(userId: string): Promise<PatientDetail | null> {
  return safe(async () => {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, patientProfile: { select: { assignedTherapistId: true } } } })
    if (!user) return null
    const [subs, therapists, latestAppt] = await Promise.all([
      prisma.subscription.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      prisma.therapistProfile.findMany({ where: { isActive: true }, include: { user: { select: { name: true } } } }),
      prisma.appointment.findFirst({ where: { patientId: userId }, orderBy: { scheduledAt: 'desc' }, select: { therapistId: true } }),
    ])
    const assignedId = user.patientProfile?.assignedTherapistId ?? latestAppt?.therapistId ?? null
    const assignedName = assignedId ? therapists.find((t) => t.id === assignedId)?.user?.name ?? null : null
    return {
      userId: user.id, name: user.name ?? 'Patient', email: user.email ?? '',
      assignedTherapistId: user.patientProfile?.assignedTherapistId ?? null,
      assignedTherapistName: assignedName,
      subscriptions: subs.map((s) => ({
        id: s.id, planName: s.planName, trackSlug: s.trackSlug, status: s.status,
        sessionsTotal: s.sessionsTotal, sessionsUsed: s.sessionsUsed, sessionsLeft: Math.max(0, s.sessionsTotal - s.sessionsUsed),
        createdAt: fmt(s.createdAt),
      })),
      therapists: therapists.map((t) => ({ profileId: t.id, name: t.user?.name ?? 'Clinician' })).sort((a, b) => a.name.localeCompare(b.name)),
    }
  }, null)
}
