/**
 * Therapist earnings pay structure. Stored as a single DB row (id="default") so
 * an admin can edit it; these defaults are the commercial values and double as
 * the fallback when the row is missing.
 *
 * A completed session pays:
 *   base(service) + session-number bonus + (night bonus if a night-slot session)
 *   + (Saturday / Sunday bonus if held on that day, in IST) + misc
 * where base(service) is the base fee for the session's service type (individual
 * therapy, couples therapy, or psychiatry), and the session-number bonus is 0 for
 * the 1st session with a patient, the 2nd-session bonus for the 2nd, and the
 * 3rd-onwards bonus from the 3rd on.
 */
import { prisma } from '@/lib/prisma'
import { istParts } from '@/lib/tz'
import type { WeekendDay } from '@/lib/earningsSlot'

export { slotLabel, type WeekendDay } from '@/lib/earningsSlot'

/** The three service types that carry their own base fee. */
export type ServiceType = 'individual' | 'couples' | 'psychiatry'

export const SERVICE_LABEL: Record<ServiceType, string> = {
  individual: 'Individual therapy',
  couples: 'Couples therapy',
  psychiatry: 'Psychiatry',
}

export type EarningsConfigValues = {
  baseFeeIndividual: number
  baseFeeCouples: number
  baseFeePsychiatry: number
  secondSessionBonus: number
  thirdOnwardsBonus: number
  miscBonus: number
  nightSessionBonus: number
  saturdayBonus: number
  sundayBonus: number
}

export const EARNINGS_DEFAULTS: EarningsConfigValues = {
  baseFeeIndividual: 600,
  baseFeeCouples: 900,
  baseFeePsychiatry: 800,
  secondSessionBonus: 50,
  thirdOnwardsBonus: 100,
  miscBonus: 0,
  nightSessionBonus: 200,
  // Off until an admin sets them, so turning the feature on changes no one's pay.
  saturdayBonus: 0,
  sundayBonus: 0,
}

// Per-therapist overrides (any field null → fall back to the global config).
export type TherapistEarningsOverrides = {
  baseFeeIndividual?: number | null
  baseFeeCouples?: number | null
  baseFeePsychiatry?: number | null
  secondSessionBonus?: number | null
  thirdOnwardsBonus?: number | null
  miscBonus?: number | null
  nightSessionBonus?: number | null
  saturdayBonus?: number | null
  sundayBonus?: number | null
}

/**
 * The effective pay structure for one clinician: the global config with any
 * per-therapist override applied. This is what both the admin editor and the
 * clinician's own earnings ledger read, so the two never diverge.
 */
export function effectiveEarningsConfig(
  global: EarningsConfigValues,
  o: TherapistEarningsOverrides | null | undefined
): EarningsConfigValues {
  if (!o) return global
  const pick = (v: number | null | undefined, fallback: number) => (v == null ? fallback : v)
  return {
    baseFeeIndividual: pick(o.baseFeeIndividual, global.baseFeeIndividual),
    baseFeeCouples: pick(o.baseFeeCouples, global.baseFeeCouples),
    baseFeePsychiatry: pick(o.baseFeePsychiatry, global.baseFeePsychiatry),
    secondSessionBonus: pick(o.secondSessionBonus, global.secondSessionBonus),
    thirdOnwardsBonus: pick(o.thirdOnwardsBonus, global.thirdOnwardsBonus),
    miscBonus: pick(o.miscBonus, global.miscBonus),
    nightSessionBonus: pick(o.nightSessionBonus, global.nightSessionBonus),
    saturdayBonus: pick(o.saturdayBonus, global.saturdayBonus),
    sundayBonus: pick(o.sundayBonus, global.sundayBonus),
  }
}

/** The base fee for a given service type. */
export function baseFeeFor(config: EarningsConfigValues, service: ServiceType): number {
  return service === 'couples'
    ? config.baseFeeCouples
    : service === 'psychiatry'
      ? config.baseFeePsychiatry
      : config.baseFeeIndividual
}

export async function getEarningsConfig(): Promise<EarningsConfigValues> {
  try {
    const row = await prisma.earningsConfig.findUnique({ where: { id: 'default' } })
    if (!row) return EARNINGS_DEFAULTS
    return {
      // Fall back to the legacy single baseFee for individual when the new
      // column is still at its default and the legacy value was customised.
      baseFeeIndividual: row.baseFeeIndividual ?? row.baseFee ?? EARNINGS_DEFAULTS.baseFeeIndividual,
      baseFeeCouples: row.baseFeeCouples ?? EARNINGS_DEFAULTS.baseFeeCouples,
      baseFeePsychiatry: row.baseFeePsychiatry ?? EARNINGS_DEFAULTS.baseFeePsychiatry,
      secondSessionBonus: row.secondSessionBonus,
      thirdOnwardsBonus: row.thirdOnwardsBonus,
      miscBonus: row.miscBonus,
      nightSessionBonus: row.nightSessionBonus,
      saturdayBonus: row.saturdayBonus ?? EARNINGS_DEFAULTS.saturdayBonus,
      sundayBonus: row.sundayBonus ?? EARNINGS_DEFAULTS.sundayBonus,
    }
  } catch {
    return EARNINGS_DEFAULTS
  }
}

/** Persist edited values (admin only, caller must gate on role). */
export async function updateEarningsConfig(
  values: EarningsConfigValues,
  updatedBy: string | null
): Promise<void> {
  const nn = (n: number) => Math.max(0, Math.round(n))
  const clean = {
    baseFeeIndividual: nn(values.baseFeeIndividual),
    baseFeeCouples: nn(values.baseFeeCouples),
    baseFeePsychiatry: nn(values.baseFeePsychiatry),
    secondSessionBonus: nn(values.secondSessionBonus),
    thirdOnwardsBonus: nn(values.thirdOnwardsBonus),
    miscBonus: nn(values.miscBonus),
    nightSessionBonus: nn(values.nightSessionBonus),
    saturdayBonus: nn(values.saturdayBonus),
    sundayBonus: nn(values.sundayBonus),
  }
  await prisma.earningsConfig.upsert({
    where: { id: 'default' },
    // Keep the legacy baseFee mirrored to the individual fee so old readers stay sane.
    update: { ...clean, baseFee: clean.baseFeeIndividual, updatedBy },
    create: { id: 'default', ...clean, baseFee: clean.baseFeeIndividual, updatedBy },
  })
}

/**
 * A night-slot session: starts at or after 11 PM, or before 6 AM — read in IST,
 * NOT the server timezone. `getHours()` follows the server clock (UTC on Vercel),
 * so a 10:00 am IST session (04:30 UTC) was wrongly flagged as night; istParts
 * pins it to the India wall clock.
 */
export function isNightSession(scheduledAt: Date): boolean {
  const h = istParts(scheduledAt).hour
  return h >= 23 || h < 6
}

/** 'sat' / 'sun' when the session falls on a weekend day in IST, else null. */
export function weekendDayOf(scheduledAt: Date): WeekendDay | null {
  const dow = istParts(scheduledAt).dow
  return dow === 6 ? 'sat' : dow === 0 ? 'sun' : null
}

/** The Saturday or Sunday bonus for a session on that day (0 on weekdays). */
export function weekendBonusFor(config: EarningsConfigValues, day: WeekendDay | null): number {
  return day === 'sat' ? config.saturdayBonus : day === 'sun' ? config.sundayBonus : 0
}

/** The session-number bonus for a given per-patient ordinal (1-based). */
export function numberBonusFor(config: EarningsConfigValues, sessionNumber: number): number {
  return sessionNumber >= 3 ? config.thirdOnwardsBonus : sessionNumber === 2 ? config.secondSessionBonus : 0
}

/** Pay for a single completed session given its service type, per-patient ordinal, slot and day. */
export function sessionPay(
  config: EarningsConfigValues,
  service: ServiceType,
  sessionNumber: number,
  night: boolean,
  weekend: WeekendDay | null = null
): number {
  return (
    baseFeeFor(config, service) +
    numberBonusFor(config, sessionNumber) +
    (night ? config.nightSessionBonus : 0) +
    weekendBonusFor(config, weekend) +
    config.miscBonus
  )
}
