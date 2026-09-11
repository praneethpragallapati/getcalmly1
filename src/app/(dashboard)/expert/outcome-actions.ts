'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getTherapistContext } from '@/lib/expert'
import { recordScore } from '@/lib/outcomes/store'

export type OutcomeInput = {
  /** CGI-Improvement 1-7 (milestone rating). */
  cgi?: number
  /** Quick per-session progress: 2 better, 1 same, 0 worse. */
  sessionProgress?: number
  /** C-SSRS ideation level 0-6 (safety). */
  cssrs?: number
  /** Goal Attainment 0-10. */
  gas?: number
}

/**
 * Record one or more clinician assessments (ClinRO) against a session. Any one
 * of them satisfies the "note + assessment" pay gate. The session must belong
 * to the signed-in clinician and the named patient.
 */
export async function recordSessionOutcome(
  appointmentId: string,
  patientId: string,
  input: OutcomeInput,
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Not signed in as a clinician.' }

  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, therapistId: ctx.therapistProfileId, patientId },
    select: { id: true },
  })
  if (!appt) return { ok: false, error: 'Session not found.' }

  const writes: Array<Promise<void>> = []
  const add = (scale: string, v: number | undefined, lo: number, hi: number) => {
    if (typeof v === 'number' && v >= lo && v <= hi) {
      writes.push(recordScore({ userId: patientId, scale, score: v, source: 'clinician', sessionId: appointmentId }))
    }
  }
  add('CGI', input.cgi, 1, 7)
  add('CSSRS', input.cssrs, 0, 6)
  add('GAS', input.gas, 0, 10)
  add('SESSIONPROG', input.sessionProgress, 0, 2)

  if (writes.length === 0) return { ok: false, error: 'Record at least one rating.' }
  try {
    await Promise.all(writes)
  } catch {
    return { ok: false, error: 'Could not save the assessment. Please try again.' }
  }

  revalidatePath('/expert/schedule')
  revalidatePath('/expert')
  revalidatePath(`/expert/patients/${patientId}`)
  return { ok: true }
}
