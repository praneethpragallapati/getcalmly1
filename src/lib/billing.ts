/**
 * Package purchases. The key rule (per product): buying a package never resets a
 * patient's balance — new sessions are ADDED to whatever they already have, and
 * validity is extended. This works whether the current plan is active, expired,
 * or absent, so an expired plan is "renewed" by topping up the same record.
 */
import { prisma } from '@/lib/prisma'
import { packsFor, type BuyableTrack } from '@/data/pricing'

export type { BuyableTrack } from '@/data/pricing'

const PLAN_NAME: Record<BuyableTrack, string> = {
  therapy: 'Therapy',
  psychiatry: 'Psychiatry',
}

function tierEnum(paidMonths: number): 'STARTER' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' {
  if (paidMonths >= 24) return 'PLATINUM'
  if (paidMonths >= 12) return 'GOLD'
  if (paidMonths >= 6) return 'SILVER'
  if (paidMonths >= 3) return 'BRONZE'
  return 'STARTER'
}

function addMonths(from: Date, months: number): Date {
  const d = new Date(from)
  d.setMonth(d.getMonth() + months)
  return d
}

export type BuyResult = { ok: boolean; sessionsTotal?: number; sessionsRemaining?: number; error?: string }

/**
 * Apply a pack purchase for a patient, additively. Tops up the patient's most
 * recent subscription (any status) in place — preserving sessionsUsed so the
 * remaining balance grows by the pack size — or creates the first one.
 */
export async function buyPackageFor(patientId: string, track: BuyableTrack, packIndex: number): Promise<BuyResult> {
  const packs = packsFor(track)
  const pack = packs[packIndex]
  if (!pack) return { ok: false, error: 'Unknown package.' }

  const existing = await prisma.subscription.findFirst({
    where: { userId: patientId },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()

  if (existing) {
    const paidMonths = existing.paidMonths + pack.months
    // Extend from whichever is later: now, or the current expiry (so unused time
    // isn't lost when topping up an still-active plan).
    const base = existing.expiresAt && existing.expiresAt > now ? existing.expiresAt : now
    const expiresAt = addMonths(base, pack.months)
    const sessionsTotal = existing.sessionsTotal + pack.sessions

    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: 'ACTIVE',
        trackSlug: track,
        planName: `${PLAN_NAME[track]} ${pack.sessions}-session pack`,
        paidMonths,
        tier: tierEnum(paidMonths),
        sessionsTotal,
        expiresAt,
        renewsAt: expiresAt,
      },
    })
    return { ok: true, sessionsTotal, sessionsRemaining: Math.max(0, sessionsTotal - existing.sessionsUsed) }
  }

  const expiresAt = addMonths(now, pack.months)
  await prisma.subscription.create({
    data: {
      userId: patientId,
      category: 'INDIVIDUAL',
      trackSlug: track,
      planName: `${PLAN_NAME[track]} ${pack.sessions}-session pack`,
      status: 'ACTIVE',
      tier: tierEnum(pack.months),
      paidMonths: pack.months,
      sessionsTotal: pack.sessions,
      sessionsUsed: 0,
      startedAt: now,
      expiresAt,
      renewsAt: expiresAt,
    },
  })
  return { ok: true, sessionsTotal: pack.sessions, sessionsRemaining: pack.sessions }
}
