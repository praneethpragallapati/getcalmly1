import {
  demoDashboard,
  type CareCategoryName,
  type DashMedication,
  type PlanTierName,
  type PrivacyFlags,
} from '@/data/dashboardDemo'
import { prisma } from '@/lib/prisma'
import { getSessionUserId, getPrivacy } from '@/lib/patient'
import { tierForMonths } from '@/lib/dashboard'

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

  try {
    const [user, sub, privacy] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
      prisma.subscription.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      }),
      getPrivacy(userId),
    ])

    const account: Account = { ...base, privacy }
    if (user?.name) account.name = user.name.split(' ')[0]
    account.email = user?.email ?? null

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
    return base
  }
}

export async function getMedications(): Promise<DashMedication[]> {
  const userId = await getSessionUserId()
  if (!userId) return demoDashboard.medications

  try {
    const rows = await prisma.medication.findMany({
      where: { userId },
      orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    })
    if (rows.length === 0) return demoDashboard.medications
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
    return demoDashboard.medications
  }
}
