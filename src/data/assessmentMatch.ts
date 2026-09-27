/**
 * Rank clinicians for a pre-assessment: what the patient needs against what
 * each clinician offers. Pure, so the public results page (in the browser) and
 * the signed-in matcher (on the server) rank exactly the same way.
 *
 *   each need the clinician covers          +3
 *   each therapy style they work in         +1.5
 *   preferred language                      +2
 *   preferred gender                        +2 (a mismatch is -1, not a veto)
 *   risk, or a High / Elevated result       crisis skills +3 each, and
 *                                           seniority (8+ yrs +2, 5+ yrs +1)
 *   rating                                  a small tiebreak only
 *
 * The path gates who is eligible at all: Psychiatry shows psychiatrists only;
 * Individual, Child and Couples show therapists, preferring those who list
 * child or couples work for those paths.
 */
import { offers, overlap } from '@/data/careTaxonomy'
import type { FlowId, Level } from '@/data/assessments'

export type MatchCandidate = {
  id: string
  name: string
  designation: string
  isPsychiatrist: boolean
  specializations: string[]
  languages: string[]
  gender: 'female' | 'male' | null
  yearsExp: number
  rating: number
}

export type MatchRequest = {
  flow: FlowId
  needs: string[]
  styles: string[]
  level: Level
  risk: 0 | 1 | 2
  genderPref?: string | null
  language?: string | null
}

export type RankedMatch<C extends MatchCandidate> = {
  clinician: C
  score: number
  /** Needs this clinician covers, in the patient's order. */
  matched: string[]
  /** Styles this clinician works in. */
  styleMatched: string[]
  /** Crisis or safety skills that counted (only when risk was raised). */
  safetyMatched: string[]
}

const SAFETY = ['Crisis intervention', 'DBT', 'Trauma-informed care']

function wantsGender(pref: string | null | undefined): 'female' | 'male' | null {
  const p = (pref ?? '').toLowerCase()
  if (p === 'female' || p.includes('woman')) return 'female'
  if (p === 'male' || p.includes('man')) return 'male'
  return null
}

export function rankClinicians<C extends MatchCandidate>(pool: C[], req: MatchRequest, limit = 3): RankedMatch<C>[] {
  const psychPath = req.flow === 'psychiatry'
  const eligible = pool.filter((c) => (psychPath ? c.isPsychiatrist : !c.isPsychiatrist))
  // Child and Couples prefer the clinicians who list that work; if nobody does
  // yet, fall back to every therapist rather than showing an empty page.
  const gateNeed = req.flow === 'child' ? 'Child & adolescent therapy' : req.flow === 'couple' ? 'Couples therapy' : null
  const gated = gateNeed ? eligible.filter((c) => offers(c.specializations, gateNeed)) : eligible
  const candidates = gated.length ? gated : eligible

  const gender = wantsGender(req.genderPref)
  const lang = req.language?.toLowerCase() ?? null
  const serious = req.risk > 0 || req.level === 'High' || req.level === 'Elevated'

  const ranked = candidates.map((c) => {
    const matched = overlap(c.specializations, req.needs)
    const styleMatched = overlap(c.specializations, req.styles)
    const safetyMatched = serious ? overlap(c.specializations, SAFETY) : []
    let score = matched.length * 3 + styleMatched.length * 1.5
    if (lang && c.languages.some((l) => l.toLowerCase() === lang)) score += 2
    if (gender) score += c.gender === gender ? 2 : c.gender ? -1 : 0
    if (serious) {
      score += safetyMatched.length * 3
      score += c.yearsExp >= 8 ? 2 : c.yearsExp >= 5 ? 1 : 0
    }
    score += Math.min(1, (c.rating || 0) * 0.2)
    return { clinician: c, score, matched, styleMatched, safetyMatched }
  })

  ranked.sort((a, b) => b.score - a.score || b.clinician.yearsExp - a.clinician.yearsExp)
  return ranked.slice(0, limit)
}
