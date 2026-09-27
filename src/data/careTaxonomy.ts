/**
 * The one vocabulary for what clinicians offer and what patients need.
 *
 * Clinicians pick from SPECIALIZATION_GROUPS (and THERAPY_STYLES) when they
 * apply, when an admin creates them, and when they edit their own profile. The
 * pre-assessment maps every answer onto the same labels, so matching is a plain
 * overlap: what the patient needs against what the clinician offers.
 *
 * Labels are stored as-is in TherapistProfile.specializations, so they must
 * never contain a comma (several editors round-trip the list as CSV).
 *
 * `keywords` lets older, free-typed specializations ("CBT", "Anxiety", "Couple
 * work") still count towards a match until those clinicians re-pick from the list.
 */

export type Specialization = { label: string; keywords: string[] }
export type SpecializationGroup = { group: string; items: Specialization[] }

export const SPECIALIZATION_GROUPS: SpecializationGroup[] = [
  {
    group: 'Emotional wellbeing',
    items: [
      { label: 'Anxiety & overthinking', keywords: ['anxiety', 'anxious', 'worry', 'overthink', 'panic', 'cbt'] },
      { label: 'Stress & burnout', keywords: ['stress', 'burnout', 'overwhelm', 'work'] },
      { label: 'Depression & low mood', keywords: ['depress', 'low mood', 'mood'] },
      { label: 'Emotional regulation', keywords: ['emotion', 'regulation', 'dbt'] },
      { label: 'Anger management', keywords: ['anger', 'irritab'] },
      { label: 'Self-esteem & confidence', keywords: ['self-esteem', 'self esteem', 'self-worth', 'confidence'] },
      { label: 'Sleep difficulties', keywords: ['sleep', 'insomnia'] },
      { label: 'OCD', keywords: ['ocd', 'obsessive', 'intrusive'] },
      { label: 'Eating concerns', keywords: ['eating', 'body image'] },
    ],
  },
  {
    group: 'Life & relationships',
    items: [
      { label: 'Relationship issues', keywords: ['relationship'] },
      { label: 'Family conflict', keywords: ['family'] },
      { label: 'Life & career decisions', keywords: ['career', 'life transition', 'transition', 'adjustment', 'decision'] },
      { label: 'Personal growth', keywords: ['growth', 'self-understanding', 'self understanding', 'coaching'] },
      { label: 'Grief & loss', keywords: ['grief', 'loss', 'bereave'] },
      { label: 'Trauma & PTSD', keywords: ['trauma', 'ptsd', 'abuse'] },
      { label: 'Habits & addiction', keywords: ['addict', 'habit', 'substance', 'alcohol'] },
      { label: 'Pregnancy & postpartum', keywords: ['perinatal', 'postpartum', 'pregnan', 'maternal'] },
      { label: 'Parenting support', keywords: ['parent'] },
      { label: 'Adoption support', keywords: ['adopt'] },
      { label: 'LGBTQIA+ affirmative', keywords: ['lgbt', 'queer', 'gender identity'] },
      { label: 'Older adults', keywords: ['geriatric', 'older adult', 'elderly'] },
    ],
  },
  {
    group: 'Children & teens',
    items: [
      { label: 'Child anxiety & worry', keywords: ['child anxiety'] },
      { label: 'Child low mood & withdrawal', keywords: ['child depression', 'child mood'] },
      { label: 'ADHD & attention', keywords: ['adhd', 'attention', 'focus'] },
      { label: 'Behavioural challenges', keywords: ['behaviour', 'behavior', 'conduct'] },
      { label: 'Friendships & social skills', keywords: ['social skill', 'friend', 'peer'] },
      { label: 'School & learning', keywords: ['school', 'academic', 'exam', 'learning'] },
      { label: 'Screen time & routines', keywords: ['screen', 'gaming', 'routine'] },
      { label: 'Child trauma', keywords: ['child trauma', 'play therapy'] },
      { label: 'Child & adolescent therapy', keywords: ['child', 'adolescent', 'teen', 'paediatric', 'pediatric'] },
    ],
  },
  {
    group: 'Couples',
    items: [
      { label: 'Couples therapy', keywords: ['couple', 'marital', 'marriage', 'eft'] },
      { label: 'Conflict & communication', keywords: ['communication', 'conflict'] },
      { label: 'Emotional distance', keywords: ['disconnect', 'distance'] },
      { label: 'Trust & infidelity', keywords: ['trust', 'infidelity', 'affair'] },
      { label: 'Intimacy concerns', keywords: ['intimacy', 'sexual'] },
      { label: 'Separation & breakups', keywords: ['separation', 'divorce', 'breakup', 'break-up'] },
      { label: 'Pre-marital counselling', keywords: ['pre-marital', 'premarital'] },
    ],
  },
  {
    group: 'Psychiatry',
    items: [
      { label: 'Psychiatric evaluation', keywords: ['psychiatr', 'evaluation', 'diagnos'] },
      { label: 'Medication management', keywords: ['medication', 'pharmaco', 'prescri'] },
      { label: 'Mood disorders', keywords: ['bipolar', 'mood disorder'] },
      { label: 'Severe mental illness', keywords: ['psychosis', 'schizo', 'severe mental'] },
      { label: 'Child & adolescent psychiatry', keywords: ['child psychiatr', 'adolescent psychiatr'] },
    ],
  },
  {
    group: 'Crisis & safety',
    items: [
      { label: 'Crisis intervention', keywords: ['crisis', 'suicid', 'self-harm', 'self harm', 'risk'] },
      { label: 'DBT', keywords: ['dbt', 'dialectical'] },
      { label: 'Trauma-informed care', keywords: ['trauma-informed', 'trauma informed'] },
    ],
  },
]

/** How a clinician tends to work, matched against the style a patient asks for. */
export const THERAPY_STYLES: Specialization[] = [
  { label: 'Warm & supportive', keywords: ['warm', 'supportive', 'person-centred', 'person-centered', 'humanistic'] },
  { label: 'Practical tools & coping skills', keywords: ['practical', 'coping', 'cbt', 'skills'] },
  { label: 'Understanding deeper patterns', keywords: ['psychodynamic', 'insight', 'pattern', 'schema'] },
  { label: 'Structured & goal-led', keywords: ['structured', 'goal', 'solution-focused', 'solution focused'] },
  { label: 'Playful & creative', keywords: ['play', 'art', 'creative', 'expressive'] },
  { label: 'Direct & honest', keywords: ['direct'] },
]

export const ALL_SPECIALIZATIONS: Specialization[] = SPECIALIZATION_GROUPS.flatMap((g) => g.items)
export const ALL_OFFERINGS: Specialization[] = [...ALL_SPECIALIZATIONS, ...THERAPY_STYLES]
const BY_LABEL = new Map(ALL_OFFERINGS.map((s) => [s.label, s]))

/** Whether a clinician's specialization list covers one needed label. */
export function offers(clinicianSpecs: string[], need: string): boolean {
  if (clinicianSpecs.includes(need)) return true
  const kws = BY_LABEL.get(need)?.keywords ?? [need.toLowerCase()]
  // Legacy free text only: exact picks from the list are handled above, and a
  // picked label must not match a different need through a shared word.
  const legacy = clinicianSpecs.filter((s) => !BY_LABEL.has(s)).join(' | ').toLowerCase()
  return legacy.length > 0 && kws.some((k) => legacy.includes(k))
}

/** The needs a clinician covers, in the order they were asked for. */
export function overlap(clinicianSpecs: string[], needs: string[]): string[] {
  return needs.filter((n) => offers(clinicianSpecs, n))
}
