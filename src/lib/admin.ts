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
  secondSessionBonus: number | null; thirdOnwardsBonus: number | null; miscBonus: number | null; nightSessionBonus: number | null
  globalFees: { individual: number; couples: number; psychiatry: number }
  globalBonuses: { second: number; thirdOnwards: number; misc: number; night: number }
  documentUrls: string[]
  supervisors: { linkId: string; name: string }[]
  supervisees: { linkId: string; name: string }[]
  patients: { userId: string; name: string }[]
  allTherapists: { profileId: string; name: string }[]
  reviews: { id: string; rating: number; comment: string | null; date: string }[]
}

export async function getClinicianDetail(profileId: string): Promise<ClinicianDetail | null> {
  return safe(async () => {
    const p = await prisma.therapistProfile.findUnique({ where: { id: profileId }, include: { user: { select: { id: true, name: true, email: true } } } })
    if (!p) return null
    const config = await getEarningsConfig()
    const [links, apptPatients, assigned, allT, reviews] = await Promise.all([
      prisma.supervisionLink.findMany({
        where: { OR: [{ supervisorId: profileId }, { superviseeId: profileId }] },
        include: { supervisor: { include: { user: { select: { name: true } } } }, supervisee: { include: { user: { select: { name: true } } } } },
      }),
      prisma.appointment.findMany({ where: { therapistId: profileId }, select: { patientId: true, patient: { select: { name: true } } }, distinct: ['patientId'] }),
      prisma.patientProfile.findMany({ where: { assignedTherapistId: profileId }, select: { userId: true, user: { select: { name: true } } } }),
      prisma.therapistProfile.findMany({ include: { user: { select: { name: true } } } }),
      prisma.sessionReview.findMany({ where: { therapistId: profileId }, orderBy: { createdAt: 'desc' }, take: 12, select: { id: true, rating: true, comment: true, createdAt: true } }),
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
      secondSessionBonus: p.secondSessionBonus ?? null, thirdOnwardsBonus: p.thirdOnwardsBonus ?? null,
      miscBonus: p.miscBonus ?? null, nightSessionBonus: p.nightSessionBonus ?? null,
      globalFees: { individual: config.baseFeeIndividual, couples: config.baseFeeCouples, psychiatry: config.baseFeePsychiatry },
      globalBonuses: { second: config.secondSessionBonus, thirdOnwards: config.thirdOnwardsBonus, misc: config.miscBonus, night: config.nightSessionBonus },
      documentUrls: p.documentUrls ?? [],
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
  therapistId: string | null; therapistName: string | null
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
        therapistId: s.therapistId ?? null,
        therapistName: s.therapistId ? therapists.find((t) => t.id === s.therapistId)?.user?.name ?? null : null,
      })),
      therapists: therapists.map((t) => ({ profileId: t.id, name: t.user?.name ?? 'Clinician' })).sort((a, b) => a.name.localeCompare(b.name)),
    }
  }, null)
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
export type OpsBoard = {
  upcoming: ApptRow[]
  needsNote: ApptRow[]
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
    const map = (r: (typeof appts)[number]): ApptRow => ({
      id: r.id, patientId: r.patientId, patientName: r.patient?.name ?? 'Patient',
      therapistId: r.therapistId, therapistName: tName.get(r.therapistId) ?? 'Clinician',
      scheduledAt: r.scheduledAt.toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }),
      status: r.status, fee: r.fee, isPast: r.scheduledAt.getTime() < now.getTime(), hasSummary: Boolean(r.summary),
    })
    const upcoming = appts.filter((a) => a.scheduledAt.getTime() >= now.getTime() && a.status !== 'CANCELLED').sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()).slice(0, 40).map(map)
    const needsNote = appts.filter((a) => a.scheduledAt.getTime() < now.getTime() && a.status !== 'CANCELLED' && !a.summary).slice(0, 40).map(map)
    return { upcoming, needsNote, therapists: therapists.map((t) => ({ profileId: t.id, name: t.user?.name ?? 'Clinician' })).sort((a, b) => a.name.localeCompare(b.name)) }
  }, { upcoming: [], needsNote: [], therapists: [] })
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
  return safe(async () => {
    const rows = await prisma.blogPost.findMany({ orderBy: { publishedAt: 'desc' }, take: 200 })
    return rows.map((r) => ({ slug: r.slug, title: r.title, author: r.authorName, role: r.authorRole, published: r.published, date: r.publishedAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }))
  }, [])
}

export async function getCommunityForModeration(): Promise<CommunityModRow[]> {
  return safe(async () => {
    const rows = await prisma.communityPost.findMany({ orderBy: { createdAt: 'desc' }, take: 60, include: { comments: { orderBy: { createdAt: 'asc' } } } })
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
