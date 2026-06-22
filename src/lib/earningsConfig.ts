/**
 * Therapist earnings pay structure. Stored as a single DB row (id="default") so
 * an admin can edit it; these defaults are the commercial values and double as
 * the fallback when the row is missing.
 *
 * A completed session pays:
 *   base + session-number bonus + (night bonus if a night-slot session) + misc
 * where the session-number bonus is 0 for the 1st session with a patient, the
 * 2nd-session bonus for the 2nd, and the 3rd-onwards bonus from the 3rd on.
 */
import { prisma } from '@/lib/prisma'

export type EarningsConfigValues = {
  baseFee: number
  secondSessionBonus: number
  thirdOnwardsBonus: number
  miscBonus: number
  nightSessionBonus: number
}

export const EARNINGS_DEFAULTS: EarningsConfigValues = {
  baseFee: 600,
  secondSessionBonus: 50,
  thirdOnwardsBonus: 100,
  miscBonus: 0,
  nightSessionBonus: 200,
}

export async function getEarningsConfig(): Promise<EarningsConfigValues> {
  try {
    const row = await prisma.earningsConfig.findUnique({ where: { id: 'default' } })
    if (!row) return EARNINGS_DEFAULTS
    return {
      baseFee: row.baseFee,
      secondSessionBonus: row.secondSessionBonus,
      thirdOnwardsBonus: row.thirdOnwardsBonus,
      miscBonus: row.miscBonus,
      nightSessionBonus: row.nightSessionBonus,
    }
  } catch {
    return EARNINGS_DEFAULTS
  }
}

/** Persist edited values (admin only — caller must gate on role). */
export async function updateEarningsConfig(
  values: EarningsConfigValues,
  updatedBy: string | null
): Promise<void> {
  const clean = {
    baseFee: Math.max(0, Math.round(values.baseFee)),
    secondSessionBonus: Math.max(0, Math.round(values.secondSessionBonus)),
    thirdOnwardsBonus: Math.max(0, Math.round(values.thirdOnwardsBonus)),
    miscBonus: Math.max(0, Math.round(values.miscBonus)),
    nightSessionBonus: Math.max(0, Math.round(values.nightSessionBonus)),
  }
  await prisma.earningsConfig.upsert({
    where: { id: 'default' },
    update: { ...clean, updatedBy },
    create: { id: 'default', ...clean, updatedBy },
  })
}

/** A night-slot session: starts at or after 9 PM, or before 6 AM (local). */
export function isNightSession(scheduledAt: Date): boolean {
  const h = scheduledAt.getHours()
  return h >= 21 || h < 6
}

/** Pay for a single completed session given its per-patient ordinal (1-based). */
export function sessionPay(
  config: EarningsConfigValues,
  sessionNumber: number,
  night: boolean
): number {
  const numberBonus =
    sessionNumber >= 3 ? config.thirdOnwardsBonus : sessionNumber === 2 ? config.secondSessionBonus : 0
  return config.baseFee + numberBonus + (night ? config.nightSessionBonus : 0) + config.miscBonus
}
