/**
 * A website assessment taken while signed out waits in this tab's
 * sessionStorage (answers + the five details) until the visitor signs in, by
 * tapping Book session or Sign up on the results page. This saves both to their
 * account then, details first, so they are never asked for them again.
 *
 * Safe to call any time: it does nothing while signed out (the server actions
 * refuse), and once saved it does not save again.
 */
import { saveAssessmentResult } from '@/app/(dashboard)/app/actions'
import { completeMemberProfile } from '@/app/(public)/welcome/actions'
import { legacySeverity, type AssessmentResult, type VisitorDetails } from '@/data/assessments'

export const RESULT_KEY = 'assess_result_v2'
export const DETAILS_KEY = 'assess_details_v1'
const SAVED_KEY = 'assess_saved_v1'

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export async function savePendingAssessment(): Promise<void> {
  try {
    if (sessionStorage.getItem(SAVED_KEY)) return
  } catch {
    return
  }
  const result = read<AssessmentResult>(RESULT_KEY)
  const details = read<VisitorDetails>(DETAILS_KEY)
  if (!result && !details) return

  if (details) {
    await completeMemberProfile({
      name: details.name, email: details.email, phone: details.phone,
      dateOfBirth: details.dateOfBirth, gender: details.gender,
    }).catch(() => null)
  }
  if (result) {
    const res = await saveAssessmentResult({
      type: result.flow,
      tags: result.needs,
      language: result.prefs?.language ?? null,
      genderPref: result.prefs?.gender ?? null,
      severity: legacySeverity(result.level),
      riskFlag: result.risk > 0,
      risk: result.risk,
      styles: result.styles,
      note: result.note ?? null,
    }).catch(() => null)
    // Signed out, the action refuses: leave it pending for after sign-in.
    if (res?.ok) {
      try { sessionStorage.setItem(SAVED_KEY, '1') } catch { /* ignore */ }
    }
  }
}
