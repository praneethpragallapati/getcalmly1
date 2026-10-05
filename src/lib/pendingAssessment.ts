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
import { loginWithCodeHref } from '@/lib/loginLink'
import { legacySeverity, type AssessmentResult, type VisitorDetails } from '@/data/assessments'

export const RESULT_KEY = 'assess_result_v2'
export const DETAILS_KEY = 'assess_details_v1'
const SAVED_KEY = 'assess_saved_v1'
/** The care type a visitor tapped Book session for on the results page. */
const BOOK_KEY = 'assess_book_v1'

/**
 * Book session on the results page: the match is made for that care type, so
 * the visitor lands on their first session with the clinician already chosen.
 * Saving again is safe (the profile is upserted), so a save made earlier
 * without a care type is redone with one.
 */
export async function saveForBooking(track: string): Promise<void> {
  try {
    sessionStorage.setItem(BOOK_KEY, track)
    sessionStorage.removeItem(SAVED_KEY)
  } catch { /* ignore */ }
  await savePendingAssessment().catch(() => {})
}

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/**
 * Details taken before sign-in (direct booking): kept in this tab and saved
 * right after sign-in by savePendingAssessment, like the assessment's.
 */
export function queueDetailsForSignIn(details: VisitorDetails): void {
  try {
    sessionStorage.setItem(DETAILS_KEY, JSON.stringify(details))
    sessionStorage.removeItem(SAVED_KEY)
  } catch { /* private mode: /welcome asks for them after sign-in instead */ }
}

/** Sign-in link for after the assessment: the number from its details step is
 *  filled in and the code sent straight away. */
export function signInAfterAssessmentHref(next: string): string {
  return loginWithCodeHref(read<VisitorDetails>(DETAILS_KEY)?.phone, next)
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
      forTrack: (() => { try { return sessionStorage.getItem(BOOK_KEY) } catch { return null } })(),
    }).catch(() => null)
    // Signed out, the action refuses: leave it pending for after sign-in.
    if (res?.ok) {
      try { sessionStorage.setItem(SAVED_KEY, '1') } catch { /* ignore */ }
    }
  }
}
