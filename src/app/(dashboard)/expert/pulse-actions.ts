'use server'

import { revalidatePath } from 'next/cache'
import { getTherapistContext, ownsPatient } from '@/lib/expert'
import { assignPulse, removePulse } from '@/lib/outcomes/pulse'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'

const ALLOWED_RECURRENCE = ['DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'EVERY', 'EVEN', 'ODD']

/** Assign (or update) a Pulse check for a patient the clinician owns. */
export async function assignPulseCheck(
  patientId: string,
  instrumentId: string,
  recurrence: string,
  expiryIso: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Not signed in as a clinician.' }
  if (!(await ownsPatient(ctx.therapistProfileId, patientId))) return { ok: false, error: 'Not your patient.' }

  const inst = INSTRUMENTS[instrumentId]
  if (!inst || inst.type !== 'PROM' || inst.items.length === 0) return { ok: false, error: 'That check cannot be assigned.' }
  if (!ALLOWED_RECURRENCE.includes(recurrence)) return { ok: false, error: 'Pick a valid frequency.' }

  let expiresAt: Date | null = null
  if (expiryIso) {
    const d = new Date(expiryIso)
    if (!Number.isNaN(d.getTime())) expiresAt = d
  }
  try {
    await assignPulse(patientId, instrumentId, recurrence, expiresAt, ctx.therapistProfileId)
  } catch {
    return { ok: false, error: 'Could not assign this check.' }
  }
  revalidatePath(`/expert/patients/${patientId}`)
  return { ok: true }
}

/** Remove a Pulse assignment. */
export async function removePulseCheck(patientId: string, instrumentId: string): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getTherapistContext()
  if (!ctx) return { ok: false, error: 'Not signed in.' }
  if (!(await ownsPatient(ctx.therapistProfileId, patientId))) return { ok: false, error: 'Not your patient.' }
  try {
    await removePulse(patientId, instrumentId)
  } catch {
    return { ok: false, error: 'Could not remove this check.' }
  }
  revalidatePath(`/expert/patients/${patientId}`)
  return { ok: true }
}
