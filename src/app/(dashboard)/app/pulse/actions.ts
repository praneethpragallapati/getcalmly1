'use server'

import { revalidatePath } from 'next/cache'
import { getSessionUserId } from '@/lib/patient'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'
import { recordScore } from '@/lib/outcomes/store'

export type PulseResult = { ok: boolean; error?: string; score?: number; band?: string | null }

/**
 * Submit a patient self-report (PROM) Pulse. Answers are keyed by item key with
 * numeric values from the instrument's choice scale. The raw score is the sum.
 */
export async function submitPulse(instrumentId: string, answers: Record<string, number>): Promise<PulseResult> {
  const userId = await getSessionUserId()
  if (!userId) return { ok: false, error: 'Please sign in.' }

  const inst = INSTRUMENTS[instrumentId]
  if (!inst || inst.type !== 'PROM' || inst.items.length === 0) {
    return { ok: false, error: 'Unknown check.' }
  }

  // Every item must be answered with a value that item actually offers. Items
  // may carry their own choice set (GAS); otherwise the instrument's apply.
  let score = 0
  for (const item of inst.items) {
    const allowed = new Set((item.choices ?? inst.choices).map((c) => c.value))
    const v = answers[item.key]
    if (typeof v !== 'number' || !allowed.has(v)) {
      return { ok: false, error: 'Please answer every question.' }
    }
    score += v
  }

  try {
    await recordScore({ userId, scale: instrumentId, score, source: 'patient' })
  } catch {
    return { ok: false, error: 'Could not save your answers. Please try again.' }
  }

  revalidatePath('/app/progress')
  revalidatePath('/app/pulse')
  revalidatePath('/app')
  const { bandFor } = await import('@/lib/outcomes/instruments')
  return { ok: true, score, band: bandFor(instrumentId, score)?.label ?? null }
}
