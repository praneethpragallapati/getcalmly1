import {
  demoDashboard,
  type CareCategoryName,
  type DashMedication,
  type PlanTierName,
  type PrivacyFlags,
} from '@/data/dashboardDemo'
import { prisma } from '@/lib/prisma'
import { getSessionUserId, getPrivacy } from '@/lib/patient'
import { tierForMonths, firstNameFrom } from '@/lib/dashboard'

/**
 * Account-area data (plan/billing, care category, privacy, medications). Same
 * DB-with-fallback pattern as the rest of the dashboard: real per-patient rows
 * when signed in, bundled demo otherwise. A patient only ever reads their own.
 */

export type AccountPlan = {
  category: CareCategoryName
  planName: string
  tier: PlanTierName
  paidMonths: number
  sessionsTotal: number
  sessionsUsed: number
  minutesTotal: number | null
  minutesUsed: number | null
  renewsOn: string | null
  startedOn: string
  daysOnPlatform: number
}

export type Account = {
  name: string
  fullName: string // the raw stored name ('' when unset), for the editable field
  email: string | null
  plan: AccountPlan
  privacy: PrivacyFlags
}

const CATEGORY_LABEL: Record<string, CareCategoryName> = {
  INDIVIDUAL: 'Individual',
  COUPLE: 'Couple',
  KIDS: 'Kids',
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export async function getAccount(): Promise<Account> {
  const base: Account = {
    name: demoDashboard.name,
    fullName: '',
    email: null,
    plan: {
      category: demoDashboard.category,
      planName: demoDashboard.planName,
      tier: demoDashboard.tier,
      paidMonths: demoDashboard.paidMonths,
      sessionsTotal: demoDashboard.sessionsTotal,
      sessionsUsed: demoDashboard.sessionsUsed,
      minutesTotal: demoDashboard.minutesTotal,
      minutesUsed: demoDashboard.minutesUsed,
      renewsOn: demoDashboard.renewsOn,
      startedOn: demoDashboard.startedOn,
      daysOnPlatform: demoDashboard.daysOnPlatform,
    },
    privacy: demoDashboard.privacy,
  }

  const userId = await getSessionUserId()
  if (!userId) return base

  // Identity first, in its own guard: a signed-in patient must never fall back
  // to the demo account, even if the queries below fail (e.g. schema drift).
  let user: { name: string | null; email: string | null; createdAt: Date } | null = null
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    })
  } catch {
    /* fall through with a blank, unnamed account */
  }

  const account: Account = { ...base }
  account.name = firstNameFrom(user?.name, user?.email)
  account.fullName = user?.name ?? ''
  account.email = user?.email ?? null
  // A real "no active plan" state — never the demo plan — using the patient's
  // actual account age. A subscription overwrites it below.
  account.plan = {
    category: 'Individual', // placeholder; the UI hides the category line when sessionsTotal is 0
    planName: 'No active plan',
    tier: 'Starter',
    paidMonths: 0,
    sessionsTotal: 0,
    sessionsUsed: 0,
    minutesTotal: null,
    minutesUsed: null,
    renewsOn: null,
    startedOn: user?.createdAt ? fmtDate(user.createdAt) : '—',
    daysOnPlatform: user?.createdAt
      ? Math.max(1, Math.floor((Date.now() - user.createdAt.getTime()) / 86_400_000))
      : 0,
  }

  try {
    // Independently resilient: a failing privacy read must not wipe the plan
    // (and vice-versa), so the sidebar never wrongly shows "No active plan".
    const [sub, privacy] = await Promise.all([
      prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        // Narrow select: don't pull columns a not-yet-applied migration adds.
        select: {
          category: true, planName: true, paidMonths: true, sessionsTotal: true,
          sessionsUsed: true, minutesTotal: true, minutesUsed: true, renewsAt: true, startedAt: true,
        },
      }).catch(() => null),
      getPrivacy(userId).catch(() => account.privacy),
    ])
    account.privacy = privacy

    if (sub) {
      const startedAt = sub.startedAt
      account.plan = {
        category: CATEGORY_LABEL[sub.category] ?? 'Individual',
        planName: sub.planName,
        tier: tierForMonths(sub.paidMonths),
        paidMonths: sub.paidMonths,
        sessionsTotal: sub.sessionsTotal,
        sessionsUsed: sub.sessionsUsed,
        minutesTotal: sub.minutesTotal,
        minutesUsed: sub.minutesUsed,
        renewsOn: sub.renewsAt ? fmtDate(sub.renewsAt) : null,
        startedOn: fmtDate(startedAt),
        daysOnPlatform: Math.max(
          1,
          Math.floor((Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24))
        ),
      }
    }
    return account
  } catch {
    // Subscription/privacy failed: return the personalized empty account, not demo.
    return account
  }
}

export type PatientProfileEdit = {
  name: string
  email: string | null
  phone: string | null
  photoUrl: string | null
  gender: string | null
  dateOfBirth: string | null // yyyy-mm-dd for the date input
  preferredLanguage: string | null
  emergencyName: string | null
  emergencyPhone: string | null
  emergencyRelation: string | null
}

/** The signed-in patient's editable profile fields (everything except email). */
export async function getPatientProfileForEdit(): Promise<PatientProfileEdit | null> {
  const userId = await getSessionUserId()
  if (!userId) return null
  try {
    const [user, profile] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, phone: true, image: true } }),
      prisma.patientProfile
        .findUnique({
          where: { userId },
          select: {
            gender: true, dateOfBirth: true, preferredLanguage: true,
            emergencyName: true, emergencyPhone: true, emergencyRelation: true,
          },
        })
        .catch(() => null),
    ])
    return {
      name: user?.name ?? '',
      email: user?.email ?? null,
      phone: user?.phone ?? null,
      photoUrl: user?.image ?? null,
      gender: profile?.gender ?? null,
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : null,
      preferredLanguage: profile?.preferredLanguage ?? null,
      emergencyName: profile?.emergencyName ?? null,
      emergencyPhone: profile?.emergencyPhone ?? null,
      emergencyRelation: profile?.emergencyRelation ?? null,
    }
  } catch {
    return null
  }
}

export async function getMedications(): Promise<DashMedication[]> {
  const userId = await getSessionUserId()
  if (!userId) return demoDashboard.medications // logged-out: bundled demo

  // A signed-in patient sees ONLY their own prescriptions — no meds means an
  // empty list, never the demo Sertraline row.
  try {
    const rows = await prisma.medication.findMany({
      where: { userId },
      orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    })
    return rows.map<DashMedication>((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage ?? undefined,
      frequency: m.frequency ?? undefined,
      times: m.times,
      durationDays: m.durationDays ?? undefined,
      prescribedBy: m.prescribedBy ?? undefined,
      active: m.active,
    }))
  } catch {
    return []
  }
}
