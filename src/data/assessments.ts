/**
 * The four pre-assessments: Individual therapy, Psychiatry, Child and Couples.
 *
 * Questions, options and scoring follow the clinical team's forms. Every option
 * that points at a kind of help carries `needs`: labels from the shared
 * specialization list (data/careTaxonomy), which is what clinicians pick when
 * they apply. Matching is the overlap between the two.
 *
 * Scoring, as specified:
 *   multi-select concern questions  +1 per selection (`scoreEach`)
 *   single-select scored questions  the option's `score`
 *   the safety question             0 = no, 1 = occasionally, 2 = yes
 * Bands turn the total into a level and a message.
 */

export type FlowId = 'adult' | 'psychiatry' | 'child' | 'couple'

export type Option = {
  label: string
  hint?: string
  score?: number
  needs?: string[]
  styles?: string[]
  /** Picking it clears the others (and vice versa), e.g. "Not sure". */
  exclusive?: boolean
}

export type Question = {
  id: string
  /** Short section name shown above the question. */
  section: string
  /** The question, with the part to stress wrapped in *asterisks*. */
  title: string
  hint?: string
  kind: 'single' | 'multi' | 'text' | 'prefs'
  options?: Option[]
  scoreEach?: boolean
  /** The safety question: its score drives the risk messages and flags. */
  risk?: boolean
  optional?: boolean
  /** Preferences asked on a `prefs` step. */
  prefs?: ('gender' | 'language' | 'timing')[]
  /** "Other" free text shown when this option is picked. */
  otherOption?: string
}

export type Level = 'Mild' | 'Moderate' | 'High' | 'Elevated'

export type Flow = {
  id: FlowId
  name: string
  blurb: string
  /** Needs every patient on this path has (e.g. couples work for Couples). */
  baseNeeds: string[]
  questions: Question[]
  /** Upper bound (inclusive) of Mild, Moderate and High; above is Elevated. */
  bands: [number, number, number]
  levelName: Record<Level, string>
  message: Record<Level, string>
}

export const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi']
export const TIMINGS = ['Morning', 'Afternoon', 'Evening', 'Flexible']

// ── Shared adult questions (Individual therapy and Psychiatry) ─────────────────

const feelingOptions: Option[] = [
  { label: 'Frequent worry and overthinking', needs: ['Anxiety & overthinking'] },
  { label: 'Ongoing stress and feeling overwhelmed', needs: ['Stress & burnout'] },
  { label: 'Low mood and difficulty managing emotions', needs: ['Depression & low mood', 'Emotional regulation'] },
  { label: 'Frequent irritability and anger outbursts', needs: ['Anger management', 'Emotional regulation'] },
  { label: 'Struggling with relationship issues', needs: ['Relationship issues'] },
  { label: 'Struggling with habits or addictive patterns', needs: ['Habits & addiction'] },
  { label: 'Processing past trauma or loss', needs: ['Trauma & PTSD', 'Grief & loss'] },
  { label: 'Feeling unsure about life or career decisions', needs: ['Life & career decisions'] },
  { label: 'Personal growth and self-understanding', needs: ['Personal growth'] },
  { label: 'Emotional wellbeing in pregnancy or after birth', needs: ['Pregnancy & postpartum'] },
  { label: 'Parenting challenges and stress', needs: ['Parenting support'] },
  { label: 'Gender identity or LGBTQIA+ related concerns', needs: ['LGBTQIA+ affirmative'] },
  { label: 'Support during the adoption process', needs: ['Adoption support'] },
  { label: "I'm unsure what kind of support I need" },
]

const areasQuestion: Question = {
  id: 'areas',
  section: 'Your life',
  title: 'Which parts of life feel *most affected*?',
  hint: 'Choose as many as you like.',
  kind: 'multi',
  scoreEach: true,
  options: [
    { label: 'Work or studies' },
    { label: 'Relationships', needs: ['Relationship issues'] },
    { label: 'Family', needs: ['Family conflict'] },
    { label: 'Personal confidence', needs: ['Self-esteem & confidence'] },
    { label: 'Sleep', needs: ['Sleep difficulties'] },
    { label: 'Physical health' },
    { label: 'A bit of everything' },
  ],
}

const selfRiskQuestion: Question = {
  id: 'safety',
  section: 'Your safety',
  title: 'Lately, have you had thoughts of *harming yourself*, or felt life is not worth living?',
  hint: 'Your answer stays private and helps us look after you properly.',
  kind: 'single',
  risk: true,
  options: [
    { label: 'No', score: 0 },
    { label: 'Occasionally', score: 1 },
    { label: 'Yes', score: 2 },
  ],
}

// ── The four flows ──────────────────────────────────────────────────────────────

export const FLOWS: Record<FlowId, Flow> = {
  adult: {
    id: 'adult',
    name: 'Individual Therapy',
    blurb: 'A safe space to talk things through, understand your feelings and work on what matters to you.',
    baseNeeds: [],
    bands: [4, 11, 17],
    levelName: { Mild: 'Mild', Moderate: 'Moderate', High: 'High', Elevated: 'Elevated' },
    message: {
      Mild: 'A self-help toolkit and a first consultation can help you clarify your next steps.',
      Moderate: 'Some regular support will help, with a clinician keeping an eye on how things move.',
      High: 'Active support from a clinical psychologist is recommended.',
      Elevated: 'Intensive, well-rounded care is recommended, and we will prioritise it.',
    },
    questions: [
      {
        id: 'feeling',
        section: 'How you feel',
        title: 'What best describes how you have been *feeling lately*?',
        hint: 'Choose everything that fits. There are no wrong answers.',
        kind: 'multi',
        scoreEach: true,
        options: feelingOptions,
      },
      areasQuestion,
      {
        id: 'style',
        section: 'Your therapist',
        title: 'What kind of *therapist approach* would suit you?',
        hint: 'Choose as many as you like.',
        kind: 'multi',
        options: [
          { label: 'Someone warm and supportive', styles: ['Warm & supportive'] },
          { label: 'Practical tools and coping strategies', styles: ['Practical tools & coping skills'] },
          { label: 'Deep understanding of my patterns', styles: ['Understanding deeper patterns'] },
          { label: 'A structured plan with goals', styles: ['Structured & goal-led'] },
          { label: "I'm not sure, help me figure it out", exclusive: true },
        ],
      },
      { id: 'prefs', section: 'Preferences', title: 'A few *preferences*', hint: 'All optional. We honour them wherever we can.', kind: 'prefs', prefs: ['gender', 'language', 'timing'], optional: true },
      selfRiskQuestion,
    ],
  },

  psychiatry: {
    id: 'psychiatry',
    name: 'Psychiatry',
    blurb: 'A medical view of what you are going through, and whether medication could help.',
    baseNeeds: ['Psychiatric evaluation', 'Medication management'],
    bands: [4, 11, 17],
    levelName: { Mild: 'Mild', Moderate: 'Moderate', High: 'High', Elevated: 'Elevated' },
    message: {
      Mild: 'A self-help toolkit and a consultation can help clarify your next steps.',
      Moderate: 'Regular monitoring and the right intervention will help.',
      High: 'Active care that brings therapy and medical support together is recommended.',
      Elevated: 'Intensive care that brings therapy and medical support together is recommended, and we will prioritise it.',
    },
    questions: [
      {
        id: 'feeling',
        section: 'How you feel',
        title: 'What best describes how you have been *feeling lately*?',
        hint: 'Choose everything that fits. There are no wrong answers.',
        kind: 'multi',
        scoreEach: true,
        options: [...feelingOptions, { label: 'Something else' }],
        otherOption: 'Something else',
      },
      areasQuestion,
      selfRiskQuestion,
      { id: 'prefs', section: 'Preferences', title: 'A few *preferences*', hint: 'All optional. We honour them wherever we can.', kind: 'prefs', prefs: ['gender', 'language', 'timing'], optional: true },
    ],
  },

  child: {
    id: 'child',
    name: 'Child',
    blurb: 'Gentle, age-right support for your child or teen, with you involved every step of the way.',
    baseNeeds: ['Child & adolescent therapy'],
    bands: [3, 6, 9],
    levelName: { Mild: 'Mild', Moderate: 'Moderate', High: 'High', Elevated: 'Elevated' },
    message: {
      Mild: 'A few sessions can help your child find their footing, with tools you can use at home too.',
      Moderate: 'Regular sessions will help, with a therapist keeping an eye on how things change.',
      High: 'Active support from a child specialist is recommended.',
      Elevated: 'Focused, well-rounded care from a senior child specialist is recommended, and we will prioritise it.',
    },
    questions: [
      {
        id: 'age',
        section: 'About your child',
        title: 'How *old* is your child?',
        kind: 'single',
        options: [{ label: '4 to 6 years' }, { label: '7 to 10 years' }, { label: '11 to 13 years' }, { label: '14 to 17 years' }],
      },
      {
        id: 'childGender',
        section: 'About your child',
        title: "What is your child's *gender*?",
        kind: 'single',
        options: [{ label: 'Boy' }, { label: 'Girl' }, { label: 'Prefer not to say' }],
      },
      {
        id: 'feeling',
        section: 'How they feel',
        title: "What best describes your child's *feelings*, or what you would like support with?",
        hint: 'Choose everything that fits.',
        kind: 'multi',
        scoreEach: true,
        options: [
          { label: 'Often feels worried or anxious', needs: ['Child anxiety & worry'] },
          { label: 'Seems low and withdrawn', needs: ['Child low mood & withdrawal'] },
          { label: 'Frequent anger outbursts', needs: ['Behavioural challenges', 'Emotional regulation'] },
          { label: 'Difficulty with attention and focus', needs: ['ADHD & attention'] },
          { label: 'Trouble sleeping', needs: ['Sleep difficulties'] },
          { label: 'Difficulty making friends', needs: ['Friendships & social skills'] },
          { label: 'Behavioural challenges at home', needs: ['Behavioural challenges'] },
          { label: 'Has been through a stressful or upsetting experience', needs: ['Child trauma'] },
          { label: 'Too much screen time', needs: ['Screen time & routines'] },
          { label: 'Low confidence', needs: ['Self-esteem & confidence'] },
          { label: 'Parenting challenges', needs: ['Parenting support'] },
          { label: "I'm not sure what it is, but something doesn't feel right" },
        ],
      },
      {
        id: 'goals',
        section: 'Hopes',
        title: 'What *positive change* are you hoping to see?',
        hint: 'Choose as many as you like.',
        kind: 'multi',
        options: [
          { label: 'More confidence', needs: ['Self-esteem & confidence'] },
          { label: 'Better emotional regulation', needs: ['Emotional regulation'] },
          { label: 'Improved focus in school', needs: ['School & learning'] },
          { label: 'Better relationships with family or friends', needs: ['Friendships & social skills'] },
          { label: 'Healthier routines and habits', needs: ['Screen time & routines'] },
        ],
      },
      {
        id: 'safety',
        section: 'Their safety',
        title: 'Have you noticed signs your child may feel *unsafe*, or talk about not wanting to live?',
        hint: 'Your answer stays private and helps us look after your child properly.',
        kind: 'single',
        risk: true,
        options: [
          { label: 'No', score: 0 },
          { label: 'Occasionally', score: 1 },
          { label: 'Yes', score: 2 },
          { label: 'Not sure', score: 0 },
        ],
      },
      {
        id: 'style',
        section: 'Their therapist',
        title: 'What kind of therapist would your child feel *most comfortable* with?',
        hint: 'Choose as many as you like.',
        kind: 'multi',
        options: [
          { label: 'Warm and gentle', styles: ['Warm & supportive'] },
          { label: 'Playful and engaging', styles: ['Playful & creative'] },
          { label: 'Practical and structured', styles: ['Structured & goal-led', 'Practical tools & coping skills'] },
          { label: 'Someone who helps them understand their emotions', styles: ['Understanding deeper patterns'] },
          { label: "I'm not sure yet", exclusive: true },
        ],
      },
      { id: 'prefs', section: 'Preferences', title: 'A few *preferences*', hint: 'All optional. We honour them wherever we can.', kind: 'prefs', prefs: ['gender', 'language', 'timing'], optional: true },
      {
        id: 'note',
        section: 'Anything else',
        title: 'Anything you would like to share to help the therapist *understand your child*?',
        hint: 'Optional. A few lines is plenty.',
        kind: 'text',
        optional: true,
      },
    ],
  },

  couple: {
    id: 'couple',
    name: 'Couples',
    blurb: 'Space for both of you to be heard, to reconnect and to find a way forward together.',
    baseNeeds: ['Couples therapy'],
    bands: [6, 12, 17],
    levelName: { Mild: 'Mild', Moderate: 'Moderate', High: 'Significant', Elevated: 'Severe' },
    message: {
      Mild: 'Self-help resources, plus a consultation to understand your concerns better.',
      Moderate: 'Couples therapy is recommended.',
      High: 'Couples therapy is recommended.',
      Elevated: 'Couples therapy is recommended, and we will prioritise it.',
    },
    questions: [
      {
        id: 'feeling',
        section: 'What brings you',
        title: 'What *brings you here* today?',
        hint: 'Choose everything that fits.',
        kind: 'multi',
        scoreEach: true,
        options: [
          { label: 'Frequent arguments or ongoing conflicts', needs: ['Conflict & communication'] },
          { label: 'Feeling emotionally distant or disconnected', needs: ['Emotional distance'] },
          { label: 'Trust issues', needs: ['Trust & infidelity'] },
          { label: 'Different expectations or values', needs: ['Conflict & communication'] },
          { label: 'Life changes affecting the relationship', needs: ['Life & career decisions'] },
          { label: 'Intimacy concerns', needs: ['Intimacy concerns'] },
          { label: 'Stress from work, family or finances', needs: ['Stress & burnout'] },
          { label: 'Considering separation, or unsure about the future', needs: ['Separation & breakups'] },
          { label: 'Going through a breakup', needs: ['Separation & breakups'] },
          { label: "Not sure, but something feels off" },
        ],
      },
      {
        id: 'who',
        section: 'Who',
        title: 'Who would like *support*?',
        kind: 'single',
        options: [{ label: 'Both of us, together' }, { label: 'One of us, on behalf of the relationship' }],
      },
      {
        id: 'state',
        section: 'Where you are',
        title: 'How would you describe your *relationship* right now?',
        kind: 'single',
        options: [
          { label: 'Mostly stable, with occasional challenges', score: 0 },
          { label: 'Some ongoing difficulties', score: 1 },
          { label: 'Frequent conflict or emotional distance', score: 2 },
          { label: 'Significant strain or uncertainty', score: 3 },
        ],
      },
      {
        id: 'safety',
        section: 'Your safety',
        title: 'How *safe* does the relationship feel right now?',
        hint: 'Your answer stays private and helps us look after you properly.',
        kind: 'single',
        risk: true,
        options: [
          { label: 'Safe and respectful', score: 0 },
          { label: 'Some tension, but generally safe', score: 1 },
          { label: 'Often tense, somewhat unsafe', score: 2 },
          { label: 'Unsafe and highly distressing', score: 3 },
        ],
      },
      {
        id: 'improve',
        section: 'Hopes',
        title: 'What would you like to *improve*?',
        hint: 'Choose as many as you like.',
        kind: 'multi',
        scoreEach: true,
        options: [
          { label: 'Better communication', needs: ['Conflict & communication'] },
          { label: 'Emotional closeness', needs: ['Emotional distance'] },
          { label: 'Rebuilding trust', needs: ['Trust & infidelity'] },
          { label: 'Resolving conflict', needs: ['Conflict & communication'] },
          { label: 'Understanding each other better' },
          { label: 'Strengthening the relationship' },
        ],
      },
      {
        id: 'style',
        section: 'Your therapist',
        title: 'What *communication style* would you like from your therapist?',
        kind: 'single',
        options: [
          { label: 'Gentle and reflective', styles: ['Warm & supportive'] },
          { label: 'Direct and structured', styles: ['Structured & goal-led', 'Direct & honest'] },
          { label: 'A balanced approach' },
        ],
      },
      { id: 'prefs', section: 'Preferences', title: 'A few *preferences*', hint: 'All optional. We honour them wherever we can.', kind: 'prefs', prefs: ['language', 'timing'], optional: true },
    ],
  },
}

export const FLOW_ORDER: FlowId[] = ['adult', 'psychiatry', 'child', 'couple']

export function isFlowId(v: string | undefined | null): v is FlowId {
  return v === 'adult' || v === 'psychiatry' || v === 'child' || v === 'couple'
}

// ── Scoring ─────────────────────────────────────────────────────────────────────

export type Answers = Record<string, string | string[]>
export type Prefs = { gender?: string; language?: string; timing?: string }

export type AssessmentResult = {
  flow: FlowId
  score: number
  level: Level
  /** 0 none, 1 some concern, 2 serious concern (drives messages and flags). */
  risk: 0 | 1 | 2
  /** What the patient needs, in shared-taxonomy labels, most important first. */
  needs: string[]
  /** Therapy styles they asked for, in shared-taxonomy labels. */
  styles: string[]
  /** The concerns they picked, in their own words, for the summary. */
  concerns: string[]
  prefs: Prefs
  note?: string
}

export function scoreAssessment(flow: Flow, answers: Answers, prefs: Prefs): AssessmentResult {
  let score = 0
  let riskScore = 0
  const needs: string[] = [...flow.baseNeeds]
  const styles: string[] = []
  const concerns: string[] = []

  for (const q of flow.questions) {
    const a = answers[q.id]
    const picked = (Array.isArray(a) ? a : typeof a === 'string' ? [a] : [])
      .map((label) => q.options?.find((o) => o.label === label))
      .filter((o): o is Option => Boolean(o))
    for (const o of picked) {
      o.needs?.forEach((n) => { if (!needs.includes(n)) needs.push(n) })
      o.styles?.forEach((s) => { if (!styles.includes(s)) styles.push(s) })
    }
    if (q.id === 'feeling') concerns.push(...picked.map((o) => o.label))
    if (q.scoreEach) score += picked.length
    else if (q.kind === 'single' && picked[0]?.score !== undefined) {
      score += picked[0].score
      if (q.risk) riskScore = picked[0].score
    }
  }

  const [mild, moderate, high] = flow.bands
  const level: Level = score <= mild ? 'Mild' : score <= moderate ? 'Moderate' : score <= high ? 'High' : 'Elevated'
  // Couples' safety runs 0 to 3: "somewhat unsafe" and above is the serious band.
  const risk: 0 | 1 | 2 = flow.id === 'couple'
    ? (riskScore >= 2 ? 2 : 0)
    : (riskScore >= 2 ? 2 : riskScore === 1 ? 1 : 0)

  const note = typeof answers.note === 'string' && answers.note.trim() ? answers.note.trim().slice(0, 1500) : undefined
  return { flow: flow.id, score, level, risk, needs, styles, concerns, prefs, note }
}

/** The legacy severity words the rest of the app still reads. */
export function legacySeverity(level: Level): 'Mild' | 'Moderate' | 'Severe' {
  return level === 'Mild' ? 'Mild' : level === 'Moderate' ? 'Moderate' : 'Severe'
}
