'use server'

import { revalidatePath } from 'next/cache'
import { getTherapistContext, resolveCrisisAlert } from '@/lib/expert'

export async function resolveAlert(formData: FormData): Promise<void> {
  const alertId = String(formData.get('alertId') ?? '')
  if (!alertId) return
  const ctx = await getTherapistContext()
  if (!ctx) return
  await resolveCrisisAlert(ctx.therapistProfileId, alertId)
  revalidatePath('/expert/risk')
}
