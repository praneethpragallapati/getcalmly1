/**
 * Cross-cutting account-security helpers: the forced first-login password change
 * for admin-created accounts, and the check the dashboard layouts use to enforce
 * it. Kept separate from account.ts (which is patient billing/data).
 */
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'

/** Whether this user was created with a temp password and still owes a change. */
export async function mustChangePassword(userId: string): Promise<boolean> {
  try {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { mustChangePassword: true } })
    return u?.mustChangePassword ?? false
  } catch {
    return false
  }
}

/**
 * Change the signed-in user's own password. When the account already has a
 * password, the current one must match. Clears the mustChangePassword flag.
 */
export async function changeOwnPassword(
  userId: string,
  current: string,
  next: string,
): Promise<{ ok: boolean; error?: string; role?: string }> {
  if (next.length < 8) return { ok: false, error: 'Use at least 8 characters.' }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true, role: true } })
    if (!user) return { ok: false, error: 'Account not found.' }
    if (user.passwordHash && !verifyPassword(current, user.passwordHash)) {
      return { ok: false, error: 'Your current password is incorrect.' }
    }
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashPassword(next), mustChangePassword: false },
    })
    return { ok: true, role: user.role }
  } catch {
    return { ok: false, error: 'Could not update your password.' }
  }
}
