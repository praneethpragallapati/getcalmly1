'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateEarningsConfig, type EarningsConfigValues } from '@/lib/earningsConfig'

async function requireAdmin(): Promise<{ name: string | null } | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { role?: string; name?: string | null } | undefined
  if (user?.role !== 'ADMIN') return null
  return { name: user.name ?? null }
}

export type AdminResult = { ok: boolean; error?: string }

/** Save the editable earnings pay structure. ADMIN only. */
export async function saveEarningsConfig(values: EarningsConfigValues): Promise<AdminResult> {
  const admin = await requireAdmin()
  if (!admin) return { ok: false, error: 'Admin access required.' }
  try {
    await updateEarningsConfig(values, admin.name)
    revalidatePath('/admin/earnings')
    revalidatePath('/expert/earnings')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save the configuration.' }
  }
}

// ── Supervision assignments (admin-only) ────────────────────────────────────
// Only admins may assign or de-assign a doctor to a supervising doctor.

export async function assignSupervisionAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return
  const supervisorId = String(formData.get('supervisorId') ?? '')
  const superviseeId = String(formData.get('superviseeId') ?? '')
  const { adminAssignSupervision } = await import('@/lib/expert')
  await adminAssignSupervision(supervisorId, superviseeId)
  revalidatePath('/admin/supervision')
  revalidatePath('/expert/supervision')
}

export async function removeSupervisionAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()
  if (!admin) return
  const linkId = String(formData.get('linkId') ?? '')
  if (!linkId) return
  const { adminRemoveSupervision } = await import('@/lib/expert')
  await adminRemoveSupervision(linkId)
  revalidatePath('/admin/supervision')
  revalidatePath('/expert/supervision')
}
