'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { changeOwnPassword } from '@/lib/accountSecurity'

export async function changeMyPassword(input: { current: string; next: string }): Promise<{ ok: boolean; error?: string; role?: string }> {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return { ok: false, error: 'Please sign in again.' }
  return changeOwnPassword(userId, input.current, input.next)
}
