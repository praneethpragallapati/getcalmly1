/**
 * Outcome-measurement instrument catalog.
 *
 * This is the single source of truth for every measure GetCalmly tracks: the
 * validated self-report scales (PROM), the clinician-rated ones (ClinRO), their
 * items, scoring, severity bands and the plain-language description shown to the
 * patient. Scores are stored in the AssessmentScore table keyed by `scale`.
 *
 * Clinical thresholds follow the CHO Outcome-Measurement spec. Note: GAD-7's
 * range is 0-21 (not 0-27); the severity bands below are the correct GAD-7 bands.
 */

export type OutcomeType = 'PROM' | 'CLINRO'
/** Which way "better" points, so a chart and a verdict read correctly. */
export type Direction = 'lower_better' | 'higher_better' | 'improvement'
export type BandTone = 'good' | 'mild' | 'warn' | 'bad'

export type Band = { min: number; max: number; label: string; tone: BandTone }
export type Choice = { value: number; label: string }
export type Item = { key: string; text: string }

export type Instrument = {
  /** Value stored in AssessmentScore.scale. */
  id: string
  /** Full clinical name. */
  name: string
  /** Short label for chips and chart headers. */
  short: string
  type: OutcomeType
  direction: Direction
  /** Score range for the axis. */
  min: number
  max: number
  /** Self-report items (for PROM forms). Empty for single-rating instruments. */
  items: Item[]
  /** The response scale shared by all items. */
  choices: Choice[]
  /** Severity bands, ordered low→high score. */
  bands: Band[]
  /** At or above this score = clinically significant (symptom scales). */
  clinicalCutoff?: number
  /** Below this score = remission / recovery. */
  remissionBelow?: number
  /** Point change that counts as reliable (not noise). */
  reliableChange?: number
  /** Show a trajectory chart for this measure. */
  chartable: boolean
  /** Patient-facing one-liner: what this is. No jargon. */
  blurb: string
  /** Patient-facing: what the number denotes (which way is good). */
  denotes: string
}

// ── Shared response scales ───────────────────────────────────────────────────

/** PHQ-9 / GAD-7 frequency scale (0-3). */
const FREQ_0_3: Choice[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

/** K10 frequency scale (1-5). */
const FREQ_1_5: Choice[] = [
  { value: 1, label: 'None of the time' },
  { value: 2, label: 'A little of the time' },
  { value: 3, label: 'Some of the time' },
  { value: 4, label: 'Most of the time' },
  { value: 5, label: 'All of the time' },
]

/** WHO-5 wellbeing scale (0-5, higher = better). */
const WHO5_SCALE: Choice[] = [
  { value: 5, label: 'All of the time' },
  { value: 4, label: 'Most of the time' },
  { value: 3, label: 'More than half the time' },
  { value: 2, label: 'Less than half the time' },
  { value: 1, label: 'Some of the time' },
  { value: 0, label: 'At no time' },
]

// ── The catalog ──────────────────────────────────────────────────────────────

export const INSTRUMENTS: Record<string, Instrument> = {
  PHQ9: {
    id: 'PHQ9',
    name: 'Patient Health Questionnaire-9',
    short: 'Depression (PHQ-9)',
    type: 'PROM',
    direction: 'lower_better',
    min: 0,
    max: 27,
    choices: FREQ_0_3,
    items: [
      { key: 'q1', text: 'Little interest or pleasure in doing things' },
      { key: 'q2', text: 'Feeling down, depressed, or hopeless' },
      { key: 'q3', text: 'Trouble falling or staying asleep, or sleeping too much' },
      { key: 'q4', text: 'Feeling tired or having little energy' },
      { key: 'q5', text: 'Poor appetite or overeating' },
      { key: 'q6', text: 'Feeling bad about yourself, or that you are a failure or have let people down' },
      { key: 'q7', text: 'Trouble concentrating on things' },
      { key: 'q8', text: 'Moving or speaking slowly, or being fidgety or restless' },
      { key: 'q9', text: 'Thoughts that you would be better off dead, or of hurting yourself' },
    ],
    bands: [
      { min: 0, max: 4, label: 'Minimal', tone: 'good' },
      { min: 5, max: 9, label: 'Mild', tone: 'mild' },
      { min: 10, max: 14, label: 'Moderate', tone: 'warn' },
      { min: 15, max: 19, label: 'Moderately severe', tone: 'warn' },
      { min: 20, max: 27, label: 'Severe', tone: 'bad' },
    ],
    clinicalCutoff: 10,
    remissionBelow: 5,
    reliableChange: 6,
    chartable: true,
    blurb: 'A 9-question check of depression symptoms over the last two weeks.',
    denotes: 'Lower is better. Under 5 means minimal symptoms; 10 or more is clinically significant.',
  },

  GAD7: {
    id: 'GAD7',
    name: 'Generalised Anxiety Disorder-7',
    short: 'Anxiety (GAD-7)',
    type: 'PROM',
    direction: 'lower_better',
    min: 0,
    max: 21,
    choices: FREQ_0_3,
    items: [
      { key: 'q1', text: 'Feeling nervous, anxious, or on edge' },
      { key: 'q2', text: 'Not being able to stop or control worrying' },
      { key: 'q3', text: 'Worrying too much about different things' },
      { key: 'q4', text: 'Trouble relaxing' },
      { key: 'q5', text: 'Being so restless that it is hard to sit still' },
      { key: 'q6', text: 'Becoming easily annoyed or irritable' },
      { key: 'q7', text: 'Feeling afraid, as if something awful might happen' },
    ],
    bands: [
      { min: 0, max: 4, label: 'Minimal', tone: 'good' },
      { min: 5, max: 9, label: 'Mild', tone: 'mild' },
      { min: 10, max: 14, label: 'Moderate', tone: 'warn' },
      { min: 15, max: 21, label: 'Severe', tone: 'bad' },
    ],
    clinicalCutoff: 10,
    remissionBelow: 5,
    reliableChange: 6,
    chartable: true,
    blurb: 'A 7-question check of anxiety symptoms over the last two weeks.',
    denotes: 'Lower is better. Under 5 means minimal anxiety; 10 or more is clinically significant.',
  },

  K10: {
    id: 'K10',
    name: 'Kessler Psychological Distress Scale',
    short: 'Distress (K10)',
    type: 'PROM',
    direction: 'lower_better',
    min: 10,
    max: 50,
    choices: FREQ_1_5,
    items: [
      { key: 'q1', text: 'About how often did you feel tired out for no good reason?' },
      { key: 'q2', text: 'About how often did you feel nervous?' },
      { key: 'q3', text: 'How often did you feel so nervous that nothing could calm you down?' },
      { key: 'q4', text: 'About how often did you feel hopeless?' },
      { key: 'q5', text: 'About how often did you feel restless or fidgety?' },
      { key: 'q6', text: 'How often did you feel so restless you could not sit still?' },
      { key: 'q7', text: 'About how often did you feel depressed?' },
      { key: 'q8', text: 'About how often did you feel that everything was an effort?' },
      { key: 'q9', text: 'How often did you feel so sad that nothing could cheer you up?' },
      { key: 'q10', text: 'About how often did you feel worthless?' },
    ],
    bands: [
      { min: 10, max: 19, label: 'Likely well', tone: 'good' },
      { min: 20, max: 24, label: 'Mild distress', tone: 'mild' },
      { min: 25, max: 29, label: 'Moderate distress', tone: 'warn' },
      { min: 30, max: 50, label: 'Severe distress', tone: 'bad' },
    ],
    clinicalCutoff: 20,
    remissionBelow: 20,
    reliableChange: 6,
    chartable: true,
    blurb: 'A 10-question check of overall psychological distress in the last 30 days.',
    denotes: 'Lower is better. 10 to 19 suggests you are doing well; 30 or more is severe distress.',
  },

  WHO5: {
    id: 'WHO5',
    name: 'WHO-5 Well-Being Index',
    short: 'Wellbeing (WHO-5)',
    type: 'PROM',
    direction: 'higher_better',
    min: 0,
    max: 25,
    choices: WHO5_SCALE,
    items: [
      { key: 'q1', text: 'I have felt cheerful and in good spirits' },
      { key: 'q2', text: 'I have felt calm and relaxed' },
      { key: 'q3', text: 'I have felt active and vigorous' },
      { key: 'q4', text: 'I woke up feeling fresh and rested' },
      { key: 'q5', text: 'My daily life has been filled with things that interest me' },
    ],
    bands: [
      { min: 0, max: 7, label: 'Very low', tone: 'bad' },
      { min: 8, max: 12, label: 'Low', tone: 'warn' },
      { min: 13, max: 25, label: 'Good', tone: 'good' },
    ],
    clinicalCutoff: 13,
    reliableChange: 3,
    chartable: true,
    blurb: 'A short 5-question check of positive wellbeing over the last two weeks.',
    denotes: 'Higher is better. It is shown as a percentage; at or below 50% suggests low wellbeing.',
  },

  GAS: {
    id: 'GAS',
    name: 'Goal Attainment',
    short: 'Goal progress',
    type: 'PROM',
    direction: 'higher_better',
    min: 0,
    max: 10,
    choices: [],
    items: [],
    bands: [
      { min: 0, max: 2, label: 'Moving backward', tone: 'bad' },
      { min: 3, max: 4, label: 'Not moving yet', tone: 'warn' },
      { min: 5, max: 6, label: 'Slow progress', tone: 'mild' },
      { min: 7, max: 8, label: 'On the right track', tone: 'good' },
      { min: 9, max: 10, label: 'Almost there', tone: 'good' },
    ],
    chartable: true,
    blurb: 'How close you feel to what you hoped to achieve in therapy, rated 0 to 10.',
    denotes: 'Higher is better. It tracks progress toward your own goals, not symptoms.',
  },

  CGI: {
    id: 'CGI',
    name: 'Clinical Global Impression - Improvement',
    short: 'Clinician rating (CGI)',
    type: 'CLINRO',
    direction: 'improvement',
    min: 1,
    max: 7,
    choices: [
      { value: 1, label: 'Very much improved' },
      { value: 2, label: 'Much improved' },
      { value: 3, label: 'Minimally improved' },
      { value: 4, label: 'No change' },
      { value: 5, label: 'Minimally worse' },
      { value: 6, label: 'Much worse' },
      { value: 7, label: 'Very much worse' },
    ],
    items: [],
    bands: [
      { min: 1, max: 2, label: 'Improving', tone: 'good' },
      { min: 3, max: 4, label: 'Review approach', tone: 'warn' },
      { min: 5, max: 7, label: 'Escalate', tone: 'bad' },
    ],
    chartable: false,
    blurb: 'Your therapist’s overall rating of how your treatment is going.',
    denotes: 'Lower is better. 1 to 2 is improving; 5 or higher prompts a clinical review.',
  },

  CSSRS: {
    id: 'CSSRS',
    name: 'Columbia Suicide Severity Rating Scale',
    short: 'Safety (C-SSRS)',
    type: 'CLINRO',
    direction: 'lower_better',
    min: 0,
    max: 6,
    choices: [
      { value: 0, label: 'No ideation' },
      { value: 1, label: 'Wish to be dead' },
      { value: 2, label: 'Non-specific active thoughts' },
      { value: 3, label: 'Active thoughts with method, no intent' },
      { value: 4, label: 'Active thoughts with some intent' },
      { value: 5, label: 'Intent with a plan' },
      { value: 6, label: 'Preparatory behaviour' },
    ],
    items: [],
    bands: [
      { min: 0, max: 2, label: 'Low risk', tone: 'warn' },
      { min: 3, max: 3, label: 'Moderate risk', tone: 'warn' },
      { min: 4, max: 6, label: 'High risk', tone: 'bad' },
    ],
    chartable: false,
    blurb: 'A safety screening the clinician records if any thoughts of self-harm come up.',
    denotes: 'Lower is better. Higher levels trigger the platform safety protocol.',
  },
}

/** Instrument ids the patient self-reports through a Pulse form. */
export const PROM_FORM_IDS = ['PHQ9', 'GAD7', 'K10', 'WHO5'] as const

/** Look up an instrument by its stored scale id. */
export function instrument(id: string): Instrument | null {
  return INSTRUMENTS[id] ?? null
}

/** The severity band a score falls into, or null. */
export function bandFor(id: string, score: number): Band | null {
  const inst = INSTRUMENTS[id]
  if (!inst) return null
  return inst.bands.find((b) => score >= b.min && score <= b.max) ?? null
}

/** Sum item answers into a raw score, ignoring unanswered items. */
export function sumScore(answers: Record<string, number>): number {
  return Object.values(answers).reduce((a, v) => a + (Number.isFinite(v) ? v : 0), 0)
}

/** WHO-5 is reported as a 0-100% index (raw x 4). */
export function who5Percent(raw: number): number {
  return Math.round(raw * 4)
}
