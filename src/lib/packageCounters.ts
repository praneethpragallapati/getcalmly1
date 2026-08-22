import { prisma } from '@/lib/prisma'
import { bailErr } from '@/lib/actionLog'

/**
 * Keeping a package's session count honest.
 *
 * WHAT THE NUMBER MEANS
 * ---------------------
 * `Subscription.sessionsUsed` is meant to answer one question: how many of the
 * sessions this package paid for are spoken for. A session is spoken for from
 * the moment it is BOOKED — not when it is held — because the slot is gone
 * either way. So:
 *
 *     used  = sessions completed + sessions booked and still to come
 *     left  = total − used
 *
 * which means "used" and "completed" only differ while a booked session is
 * waiting to happen, and agree again once it does. That is what a clinician
 * reading the page expects, and it is what the booking guard needs.
 *
 * WHY IT DRIFTS
 * -------------
 * The counter is maintained by hand at four or five places — booking adds one,
 * cancelling gives one back, an auto-void after a two-minute session gives one
 * back, an admin void gives one back — and a counter maintained by hand drifts.
 * Sessions created before `consumedSubscriptionId` existed hold no slot at all,
 * so they were never counted. The result was a page reading "1/17 used" beside
 * two sessions that had plainly been held.
 *
 * WHAT THIS DOES
 * --------------
 * Rebuilds the counter from the appointments, which are the record of what
 * actually happened, and repairs the link where one is missing:
 *
 *   - The LINK is the slot. Booking writes `consumedSubscriptionId`; a refund
 *     clears it. That is why the count below has no status filter — a no-show
 *     the patient was charged for keeps its link and must keep its slot, while
 *     a voided-and-refunded session has already given the link up. Counting
 *     "non-cancelled" instead, as the admin reconcile used to, would hand back
 *     a session the patient was charged for.
 *
 *   - A session that holds no link and was not cancelled is adopted by a
 *     package of its care type that still has room, preferring the package that
 *     was live on the day. This is what brings pre-link sessions into the
 *     count. Cancelled sessions are never adopted: an unlinked cancelled
 *     session is one that was refunded, and refunded means not used.
 *
 * It only writes when something actually differs, so the common case is two
 * reads and no write.
 */

/** Map a clinician to the package track a session with them draws from. */
export function trackForClinician(
  clinicianType: string | null,
  specializations: string[],
): 'therapy' | 'couples' | 'psychiatry' {
  const ct = (clinicianType ?? '').toLowerCase()
  const spec = specializations.join(' ').toLowerCase()
  if (ct.includes('psych') || spec.includes('psychiatr') || spec.includes('medication')) return 'psychiatry'
  if (ct.includes('couple') || spec.includes('couple')) return 'couples'
  return 'therapy'
}

/** Was this package the live one on the day of that session? */
function coversDate(sub: { startedAt: Date | null; expiresAt: Date | null }, when: Date): boolean {
  if (sub.startedAt && sub.startedAt.getTime() > when.getTime()) return false
  if (sub.expiresAt && sub.expiresAt.getTime() < when.getTime()) return false
  return true
}

/**
 * Rebuild one patient's package counters from their appointments. Safe to call
 * on any read path: it is idempotent, writes nothing when the books already
 * balance, and never lets a package report more used than it holds sessions —
 * an unlinked session that no package has room for is left alone rather than
 * pushing the remaining balance negative.
 */
export async function reconcilePackageCounters(userId: string): Promise<void> {
  try {
    const [subs, appts] = await Promise.all([
      prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { id: true, trackSlug: true, sessionsTotal: true, sessionsUsed: true, startedAt: true, expiresAt: true },
      }),
      prisma.appointment.findMany({
        where: { patientId: userId },
        orderBy: { scheduledAt: 'asc' },
        select: {
          id: true,
          status: true,
          scheduledAt: true,
          consumedSubscriptionId: true,
          therapist: { select: { clinicianType: true, specializations: true } },
        },
      }),
    ])
    if (subs.length === 0) return

    const byId = new Map(subs.map((s) => [s.id, s]))
    const held = new Map<string, number>(subs.map((s) => [s.id, 0]))
    const orphans: typeof appts = []

    for (const a of appts) {
      if (a.consumedSubscriptionId && byId.has(a.consumedSubscriptionId)) {
        held.set(a.consumedSubscriptionId, (held.get(a.consumedSubscriptionId) ?? 0) + 1)
      } else if (a.status !== 'CANCELLED') {
        orphans.push(a)
      }
    }

    // Adopt the sessions that hold no slot, oldest first so the earliest session
    // takes the earliest package — the order the patient actually bought them in.
    const adopted: { appointmentId: string; subscriptionId: string }[] = []
    for (const a of orphans) {
      const track = trackForClinician(a.therapist?.clinicianType ?? null, a.therapist?.specializations ?? [])
      const room = subs.filter((s) => s.trackSlug === track && (held.get(s.id) ?? 0) < s.sessionsTotal)
      const pick = room.find((s) => coversDate(s, a.scheduledAt)) ?? room[0]
      if (!pick) continue // no package has room — leave it unlinked rather than oversell
      held.set(pick.id, (held.get(pick.id) ?? 0) + 1)
      adopted.push({ appointmentId: a.id, subscriptionId: pick.id })
    }

    const writes = [
      ...adopted.map((l) =>
        prisma.appointment.update({ where: { id: l.appointmentId }, data: { consumedSubscriptionId: l.subscriptionId } }),
      ),
      ...subs
        .filter((s) => (held.get(s.id) ?? 0) !== s.sessionsUsed)
        .map((s) => prisma.subscription.update({ where: { id: s.id }, data: { sessionsUsed: held.get(s.id) ?? 0 } })),
    ]
    if (writes.length === 0) return
    await prisma.$transaction(writes)
  } catch (e) {
    // Reporting-and-repair, never the point of the page it runs on.
    bailErr('reconcilePackageCounters', e, { userId })
  }
}
