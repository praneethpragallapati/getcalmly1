'use server'

import { getSessionUser } from '@/lib/session'
import { saveMemberEssentials, type MemberExtras } from '@/lib/memberOnboarding'

/**
 * Save the one-time details for the signed-in member.
 *
 * Carries everything the profile page holds, not just the required set, so the
 * member is asked once rather than chased later for the rest.
 */
export async function completeMemberProfile(input: {
  name: string
  email?: string | null
  dateOfBirth: string
  emergencyName: string
  emergencyPhone: string
  emergencyRelation?: string | null
} & MemberExtras): Promise<{ ok: boolean; error?: string }> {
  const user = await getSessionUser()
  if (!user?.id) return { ok: false, error: 'Please sign in.' }
  // Only members have this profile; a clinician or admin landing here is a bug,
  // not something to write patient data for.
  if (user.role === 'THERAPIST' || user.role === 'ADMIN') {
    return { ok: false, error: 'This form is for member accounts.' }
  }
  return saveMemberEssentials(user.id, input)
}
