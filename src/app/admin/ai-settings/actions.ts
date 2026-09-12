'use server'

import { getSessionUser } from '@/lib/session'
import { setAiConfig } from '@/lib/ai/settings'

/** Save the admin AI settings. Admin-only; the store coerces/validates the shape. */
export async function saveAiSettings(config: unknown): Promise<{ ok: boolean; error?: string }> {
  const u = await getSessionUser()
  if (!u?.id || u.role !== 'ADMIN') return { ok: false, error: 'Not authorized.' }
  try {
    await setAiConfig(config)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save settings.' }
  }
}
