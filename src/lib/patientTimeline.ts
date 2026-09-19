/**
 * A member's history as one chronological timeline, rather than a flat list of
 * sessions with everything else scattered across other cards.
 *
 * Merges four sources into one ordered stream:
 *   · the account being created
 *   · every session (with the clinician who took it, and how it ended)
 *   · every package bought or granted, with what was paid
 *   · every change of clinician
 *
 * On the last one: there is no assignment-history table, so a change of expert
 * is DERIVED from the sequence of sessions — when consecutive sessions were
 * taken by different clinicians, the member changed hands between them. That
 * catches every change that actually affected care, which is the useful set; a
 * reassignment made and then undone before any session happened leaves no trace,
 * and the UI says the date is "around" the following session for that reason.
 */
import { prisma } from '@/lib/prisma'
import { fmtIST } from '@/lib/tz'

export type TimelineKind = 'joined' | 'session' | 'package' | 'expert_change'

export type TimelineEvent = {
  id: string
  kind: TimelineKind
  /** Sort key. */
  at: Date
  dateLabel: string
  title: string
  detail: string | null
  /** Money in rupees, when the event involved a payment. */
  amount?: number | null
  /** For sessions: whether it counted, was cancelled, etc. */
  status?: string | null
}

const money = (n: number) => `₹${n.toLocaleString('en-IN')}`
const stamp = (d: Date) =>
  fmtIST(d, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })

export async function getPatientTimeline(userId: string): Promise<TimelineEvent[]> {
  try {
    const [user, appts, subs, payments] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true, name: true } }),
      prisma.appointment.findMany({
        where: { patientId: userId },
        orderBy: { scheduledAt: 'asc' },
        select: {
          id: true, scheduledAt: true, status: true, durationMins: true, fee: true,
          therapistId: true, therapist: { select: { user: { select: { name: true } } } },
        },
      }),
      prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { id: true, createdAt: true, planName: true, sessionsTotal: true, trackSlug: true, status: true },
      }),
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        select: { id: true, createdAt: true, amount: true, kind: true, planName: true },
      }),
    ])

    const events: TimelineEvent[] = []

    if (user?.createdAt) {
      events.push({
        id: `joined-${userId}`,
        kind: 'joined',
        at: user.createdAt,
        dateLabel: stamp(user.createdAt),
        title: 'Joined getCalmly',
        detail: null,
      })
    }

    // Money is matched to its package by nearest-in-time, not by id: a payment
    // records the subscription it topped up, but a package can be granted with
    // no payment at all, and reading them as one row when they are minutes apart
    // is what an admin actually wants to see.
    const usedPayments = new Set<string>()
    for (const s of subs) {
      const near = payments.find(
        (p) => !usedPayments.has(p.id) && Math.abs(p.createdAt.getTime() - s.createdAt.getTime()) < 5 * 60_000,
      )
      if (near) usedPayments.add(near.id)
      events.push({
        id: `sub-${s.id}`,
        kind: 'package',
        at: s.createdAt,
        dateLabel: stamp(s.createdAt),
        title: near ? `Bought ${s.planName}` : `${s.planName} added`,
        detail: [
          s.sessionsTotal > 0 ? `${s.sessionsTotal} session${s.sessionsTotal === 1 ? '' : 's'}` : null,
          s.trackSlug,
          near ? null : 'no payment recorded',
        ].filter(Boolean).join(' · ') || null,
        amount: near?.amount ?? null,
        status: s.status,
      })
    }
    // Payments with no package within five minutes still belong on the timeline.
    for (const p of payments) {
      if (usedPayments.has(p.id)) continue
      events.push({
        id: `pay-${p.id}`,
        kind: 'package',
        at: p.createdAt,
        dateLabel: stamp(p.createdAt),
        title: `Paid ${money(p.amount)}`,
        detail: [p.planName, p.kind].filter(Boolean).join(' · ') || null,
        amount: p.amount,
      })
    }

    let previousTherapist: { id: string; name: string } | null = null
    for (const a of appts) {
      const name = a.therapist?.user?.name ?? 'a clinician'
      // Cancelled sessions never happened, so they can't mark a handover.
      if (a.status !== 'CANCELLED' && a.therapistId) {
        if (previousTherapist && previousTherapist.id !== a.therapistId) {
          events.push({
            id: `switch-${a.id}`,
            kind: 'expert_change',
            at: a.scheduledAt,
            dateLabel: stamp(a.scheduledAt),
            title: `Changed expert — ${previousTherapist.name} → ${name}`,
            detail: 'Around this session; derived from who took each session.',
          })
        }
        previousTherapist = { id: a.therapistId, name }
      }
      events.push({
        id: `appt-${a.id}`,
        kind: 'session',
        at: a.scheduledAt,
        dateLabel: stamp(a.scheduledAt),
        title: `Session with ${name}`,
        detail: `${a.durationMins} min`,
        status: a.status,
      })
    }

    return events.sort((x, y) => y.at.getTime() - x.at.getTime())
  } catch {
    return []
  }
}
