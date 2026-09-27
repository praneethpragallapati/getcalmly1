/**
 * The newest TherapistProfile columns, read defensively.
 *
 * saturdayBonus / sundayBonus (migration 0046) and matchingEligible /
 * directBookingEligible (0047) reach a database through the deploy-time
 * migration or the ensureContactSchema self-heal. Until one of those has run,
 * any query that names them throws, and that took the admin clinician list
 * (empty) and clinician pages (404) down with it. So they are never selected
 * alongside the main row: this reads them separately and falls back to the
 * defaults the columns would have (no weekend bonus override, eligible for
 * both), so a missing column changes nothing instead of breaking the page.
 */
import { prisma } from '@/lib/prisma'
import { ensureContactSchema } from '@/lib/contactSchema'

export type TherapistExtras = {
  saturdayBonus: number | null
  sundayBonus: number | null
  matchingEligible: boolean
  directBookingEligible: boolean
}

export const EXTRAS_DEFAULT: TherapistExtras = {
  saturdayBonus: null,
  sundayBonus: null,
  matchingEligible: true,
  directBookingEligible: true,
}

export async function getTherapistExtras(ids: string[]): Promise<Map<string, TherapistExtras>> {
  const out = new Map<string, TherapistExtras>()
  if (ids.length === 0) return out
  try {
    const rows = await prisma.therapistProfile.findMany({
      where: { id: { in: ids } },
      select: { id: true, saturdayBonus: true, sundayBonus: true, matchingEligible: true, directBookingEligible: true },
    })
    for (const r of rows) {
      out.set(r.id, {
        saturdayBonus: r.saturdayBonus ?? null,
        sundayBonus: r.sundayBonus ?? null,
        matchingEligible: r.matchingEligible ?? true,
        directBookingEligible: r.directBookingEligible ?? true,
      })
    }
  } catch (e) {
    console.error('[therapistExtras] newer clinician columns unreadable (migrations 0046/0047 not applied yet); using defaults', e)
  }
  return out
}

export async function getOneTherapistExtras(id: string): Promise<TherapistExtras> {
  return (await getTherapistExtras([id])).get(id) ?? EXTRAS_DEFAULT
}

/**
 * Write the newest columns on their own, after the main save. Adds the columns
 * first if the database lacks them. Returns false (never throws) if they still
 * cannot be written, so the rest of a clinician's save is never lost to them.
 */
export async function saveTherapistExtras(
  id: string,
  patch: Partial<Pick<TherapistExtras, 'saturdayBonus' | 'sundayBonus' | 'matchingEligible' | 'directBookingEligible'>>,
): Promise<boolean> {
  const data = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined))
  if (Object.keys(data).length === 0) return true
  try {
    await ensureContactSchema().catch(() => {})
    await prisma.therapistProfile.update({ where: { id }, data })
    return true
  } catch (e) {
    console.error('[therapistExtras] could not save newer clinician columns (migrations 0046/0047?)', e)
    return false
  }
}
