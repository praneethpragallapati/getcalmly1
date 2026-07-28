/**
 * Patient session ratings. A rating is submitted after a completed session and
 * drives the clinician's public rating: TherapistProfile.rating and totalReviews
 * are recomputed as the real average of patient feedback on every write, so the
 * figure is never hand-set.
 */
import { prisma } from '@/lib/prisma'

/** Recompute and store a clinician's rating aggregate from their reviews. */
export async function recomputeTherapistRating(therapistId: string): Promise<void> {
  const agg = await prisma.sessionReview.aggregate({
    where: { therapistId },
    _avg: { rating: true },
    _count: { _all: true },
  })
  const count = agg._count._all
  const avg = agg._avg.rating ?? 0
  await prisma.therapistProfile.update({
    where: { id: therapistId },
    // Round to one decimal for display; 0 when there are no reviews yet.
    data: { rating: count === 0 ? 0 : Math.round(avg * 10) / 10, totalReviews: count },
  })
}

export type SubmitReviewResult = { ok: boolean; error?: string }

/**
 * Record (or update) a patient's rating for one of their own completed sessions.
 * Ownership + "session has happened" are enforced here; the clinician's rating
 * aggregate is refreshed in the same call.
 */
export async function submitReview(
  userId: string,
  appointmentId: string,
  rating: number,
  comment?: string,
): Promise<SubmitReviewResult> {
  const stars = Math.round(rating)
  if (!(stars >= 1 && stars <= 5)) return { ok: false, error: 'Pick between 1 and 5 stars.' }

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, patientId: userId }, // ownership gate
    select: { id: true, therapistId: true, scheduledAt: true, status: true },
  })
  if (!appt) return { ok: false, error: 'Session not found.' }
  const happened = appt.status === 'COMPLETED' || appt.scheduledAt.getTime() < Date.now()
  if (!happened) return { ok: false, error: 'You can rate a session once it has taken place.' }
  if (appt.status === 'CANCELLED') return { ok: false, error: 'This session was cancelled.' }

  const cleanComment = comment?.trim().slice(0, 1000) || null
  await prisma.sessionReview.upsert({
    where: { appointmentId },
    create: { appointmentId, patientId: userId, therapistId: appt.therapistId, rating: stars, comment: cleanComment },
    update: { rating: stars, comment: cleanComment },
  })
  await recomputeTherapistRating(appt.therapistId)
  return { ok: true }
}
