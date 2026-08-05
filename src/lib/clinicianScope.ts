/**
 * Pure (no DB) helpers that decide which care type a clinician can be mapped to.
 * The `clinicianType` field is the mapping scope: "Psychiatrist" → psychiatry,
 * "Couples therapist" → couples, anything else (Therapist / Psychologist /
 * Counsellor) → individual therapy. Specializations are a secondary signal.
 *
 * Kept prisma-free so both server code and client components can import it.
 */
export type CareTrack = 'therapy' | 'couples' | 'psychiatry'

export function isPsychiatrist(clinicianType: string | null, specializations: string[]): boolean {
  const ct = (clinicianType ?? '').toLowerCase()
  const spec = specializations.join(' ').toLowerCase()
  return ct.includes('psychiatr') || spec.includes('psychiatr') || spec.includes('medication management')
}

export function isCouplesClinician(clinicianType: string | null, specializations: string[]): boolean {
  const ct = (clinicianType ?? '').toLowerCase()
  const spec = specializations.join(' ').toLowerCase()
  return ct.includes('couple') || spec.includes('couple') || spec.includes('marital') || spec.includes('eft')
}

/** Does this clinician fit the requested care track? */
export function clinicianMatchesTrack(
  clinicianType: string | null,
  specializations: string[],
  track: CareTrack,
): boolean {
  const psych = isPsychiatrist(clinicianType, specializations)
  if (track === 'psychiatry') return psych
  if (track === 'couples') return isCouplesClinician(clinicianType, specializations) && !psych
  // therapy: any non-psychiatrist clinician (psychologist / counsellor / therapist).
  return !psych
}

/** Admin care-type key → the matching care track. */
export const CATEGORY_TO_TRACK: Record<'individual' | 'couples' | 'psychiatry', CareTrack> = {
  individual: 'therapy',
  couples: 'couples',
  psychiatry: 'psychiatry',
}
