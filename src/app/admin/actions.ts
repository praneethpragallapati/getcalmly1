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
