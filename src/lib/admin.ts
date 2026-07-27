/**
 * Admin portal data access. ADMIN-role only; every page and action must gate on
 * getAdminSession() first. Read helpers fail soft (return zeros/empties) so the
 * portal renders even if a query hiccups.
 */
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
