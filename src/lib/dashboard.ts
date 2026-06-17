import { demoDashboard, type DashboardData, type PlanTierName } from '@/data/dashboardDemo'

/**
 * Tenure-based membership tier from cumulative paid months (#18). Kept here so
 * the same rule is used wherever a tier badge is shown.
 */
export function tierForMonths(paidMonths: number): PlanTierName {
  if (paidMonths >= 24) return 'Platinum'
  if (paidMonths >= 12) return 'Gold'
  if (paidMonths >= 6) return 'Silver'
  if (paidMonths >= 3) return 'Bronze'
  return 'Starter'
}

/**
 * The signed-in patient's dashboard data.
 *
 * Today this returns bundled demo data so the app renders without a live DB or
 * session — the same fallback approach used by blog/community. Once patient auth
 * + seed data land, this is where the per-patient DB assembly (profile,
 * subscription, mood, sessions, tasks, journals, meds, privacy) plugs in, behind
 * a try/catch that falls back to `demoDashboard`.
 */
export async function getDashboardData(): Promise<DashboardData> {
  return demoDashboard
}
