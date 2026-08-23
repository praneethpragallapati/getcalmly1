'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Question = {
  id: string
  text: string
  hint?: string
  type: 'single' | 'multi' | 'scale'
  layout?: 'list' | 'grid' | 'chips'
  options?: string[]
  maxSelect?: number
  concern?: string
  risk?: boolean
  /** map an option label → matching tags */
  tagMap?: Record<string, string[]>
}

const SCALE = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']


const adultQuestions: Question[] = [
  {
    id: 'focus',
    text: 'What feels heaviest right now?',
    hint: 'Pick up to 3, this helps us find the right professional for you.',
    type: 'multi',
    maxSelect: 3,
    concern: 'Primary Concerns',
    options: [
      'Anxiety & constant worry',
      'Sadness or low mood',
      'Work or career stress',
      'Relationship difficulties',
      'Family conflict',
      'Loneliness',
      'Self-worth & confidence',
      'Sleep problems',
      'Grief or a recent loss',
      'Something from my past',
      'A big life change',
      'Anger or irritability',
    ],
    tagMap: {
      'Anxiety & constant worry': ['anxiety', 'panic'],
      'Sadness or low mood': ['low-mood', 'depression'],
      'Work or career stress': ['work-stress', 'burnout', 'career'],
      'Relationship difficulties': ['relationships', 'couples'],
      'Family conflict': ['family', 'conflict'],
      'Loneliness': ['loneliness'],
      'Self-worth & confidence': ['self-esteem', 'confidence'],
      'Sleep problems': ['sleep'],
      'Grief or a recent loss': ['grief', 'loss'],
      'Something from my past': ['trauma'],
      'A big life change': ['life-transitions'],
      'Anger or irritability': ['anger'],
    },
  },
  {
    id: 'duration',
    text: 'How long have you been feeling this way?',
    type: 'single',
    layout: 'grid',
    options: ['Less than 2 weeks', '2–4 weeks', '1–3 months', 'More than 3 months'],
  },
  {
    id: 'mood',
    text: 'How would you rate your overall mood lately?',
    type: 'scale',
    concern: 'Low Mood',
  },
  {
    id: 'sleep',
    text: 'How has your sleep been?',
    type: 'single',
    layout: 'grid',
    options: ['Sleeping well', 'Hard to fall asleep', 'Waking through the night', 'Sleeping too much'],
    concern: 'Sleep Difficulties',
    tagMap: {
      'Hard to fall asleep': ['sleep'],
      'Waking through the night': ['sleep'],
      'Sleeping too much': ['sleep', 'low-mood'],
    },
  },
  {
    id: 'interest',
    text: 'Are you still enjoying the things you usually do?',
    type: 'single',
    layout: 'grid',
    options: ['Yes, mostly', 'A little less', 'Much less than before', 'Not at all'],
    concern: 'Loss of Interest',
    tagMap: {
      'Much less than before': ['low-mood', 'depression'],
      'Not at all': ['low-mood', 'depression'],
    },
  },
  {
    id: 'stress',
    text: 'How overwhelmed have you felt recently?',
    type: 'scale',
    concern: 'Stress & Burnout',
  },
  {
    id: 'physical',
    text: 'Have you noticed any of these in your body?',
    hint: 'Select any that apply.',
    type: 'multi',
    options: ['Racing heart', 'Tight chest', 'Constant fatigue', 'Appetite changes', 'Headaches', 'Trouble concentrating', 'Restlessness', 'None of these'],
    tagMap: {
      'Racing heart': ['anxiety', 'panic'],
      'Tight chest': ['anxiety', 'panic'],
      'Constant fatigue': ['low-mood', 'depression'],
      'Trouble concentrating': ['anxiety', 'low-mood'],
      'Restlessness': ['anxiety'],
    },
  },
  {
    id: 'support',
    text: 'How are the people around you right now?',
    type: 'single',
    layout: 'grid',
    options: ['I feel well supported', 'Some support', 'Very little support', 'I feel quite alone'],
    tagMap: {
      'Very little support': ['loneliness'],
      'I feel quite alone': ['loneliness'],
    },
  },
  {
    id: 'coping',
    // Subtle risk screen, phrased gently, no explicit wording.
    text: 'Over the last two weeks, how often have things felt like too much to carry?',
    type: 'single',
    layout: 'grid',
    options: ['Rarely', 'Some days', 'More than half the days', 'Almost every day'],
    risk: true,
  },
  {
    id: 'prior',
    text: 'Have you spoken to a mental health professional before?',
    type: 'single',
    layout: 'grid',
    options: ['Yes', 'No'],
  },
  {
    id: 'gender',
    text: 'Any preference for your professional?',
    hint: 'Totally optional, we\'ll honour it where we can.',
    type: 'single',
    layout: 'grid',
    options: ['No preference', 'Prefer a woman', 'Prefer a man'],
  },
]

const childQuestions: Question[] = [
  {
    id: 'age',
    text: 'How old is your child?',
    type: 'single',
    layout: 'grid',
    options: ['Under 6', '6–10', '11–14', '15–17'],
    tagMap: { 'Under 6': ['child'], '6–10': ['child'], '11–14': ['adolescent'], '15–17': ['adolescent'] },
  },
  {
    id: 'focus',
    text: 'What are you noticing most?',
    hint: 'Pick up to 3.',
    type: 'multi',
    maxSelect: 3,
    concern: 'Child Wellbeing',
    options: ['Worry or anxiety', 'Low mood', 'Exam or school stress', 'Trouble focusing', 'Behaviour changes', 'Withdrawing from others', 'Sleep changes', 'After a difficult event'],
    tagMap: {
      'Worry or anxiety': ['anxiety', 'child'],
      'Low mood': ['low-mood', 'child'],
      'Exam or school stress': ['exam-stress', 'academic', 'school'],
      'Trouble focusing': ['adhd', 'school'],
      'Behaviour changes': ['behaviour'],
      'Withdrawing from others': ['low-mood', 'loneliness'],
      'Sleep changes': ['sleep'],
      'After a difficult event': ['trauma'],
    },
  },
  {
    id: 'duration',
    text: 'How long have you noticed these changes?',
    type: 'single',
    layout: 'grid',
    options: ['Less than 2 weeks', '2–4 weeks', '1–3 months', 'More than 3 months'],
  },
  {
    id: 'school',
    text: 'How is your child doing at school lately?',
    type: 'scale',
    concern: 'Academic Difficulties',
  },
  {
    id: 'coping',
    text: 'Over the last two weeks, how often has your child seemed overwhelmed or withdrawn?',
    type: 'single',
    layout: 'grid',
    options: ['Rarely', 'Some days', 'More than half the days', 'Almost every day'],
    risk: true,
  },
  {
    id: 'gender',
    text: 'Any preference for your child\'s therapist?',
    hint: 'Totally optional, we\'ll honour it where we can.',
    type: 'single',
    layout: 'grid',
    options: ['No preference', 'Prefer a woman', 'Prefer a man'],
  },
]

const coupleQuestions: Question[] = [
  {
    id: 'focus',
    text: 'What brings you in as a couple?',
    hint: 'Pick up to 3.',
    type: 'multi',
    maxSelect: 3,
    concern: 'Relationship Concerns',
    options: ['Communication issues', 'Frequent conflict', 'Trust concerns', 'Growing apart', 'Considering separation', 'Intimacy', 'Parenting differences', 'Pre-marital guidance'],
    tagMap: {
      'Communication issues': ['communication', 'couples'],
      'Frequent conflict': ['conflict', 'couples'],
      'Trust concerns': ['trust', 'couples'],
      'Growing apart': ['couples', 'relationships'],
      'Considering separation': ['separation', 'couples'],
      'Intimacy': ['couples', 'relationships'],
      'Parenting differences': ['family', 'couples'],
      'Pre-marital guidance': ['pre-marital', 'couples'],
    },
  },
  {
    id: 'duration',
    text: 'How long have these concerns been present?',
    type: 'single',
    layout: 'grid',
    options: ['Less than a month', '1–3 months', '3–6 months', 'More than 6 months'],
  },
  {
    id: 'satisfaction',
    text: 'How would you rate your relationship satisfaction right now?',
    type: 'scale',
    concern: 'Relationship Satisfaction',
  },
  {
    id: 'both',
    text: 'Are both partners open to attending sessions?',
    type: 'single',
    layout: 'grid',
    options: ['Yes, both of us', 'Only me for now', 'Unsure'],
  },
  {
    id: 'gender',
    text: 'Any preference for your professional?',
    hint: 'Totally optional, we\'ll honour it where we can.',
    type: 'single',
    layout: 'grid',
    options: ['No preference', 'Prefer a woman', 'Prefer a man'],
  },
]

const psychiatryQuestions: Question[] = [
  {
    id: 'focus',
    text: 'What brings you to seek psychiatric support?',
    hint: 'Pick up to 3.',
    type: 'multi',
    maxSelect: 3,
    concern: 'Psychiatric Evaluation',
    options: ['Persistent low mood', 'Severe anxiety or panic', 'Sleep problems', 'Intrusive thoughts', 'Mood swings', 'Existing diagnosis / refill', 'Focus & attention', 'Second opinion'],
    tagMap: {
      'Persistent low mood': ['low-mood', 'depression', 'medication'],
      'Severe anxiety or panic': ['anxiety', 'panic', 'medication'],
      'Sleep problems': ['sleep', 'medication'],
      'Intrusive thoughts': ['ocd', 'medication'],
      'Mood swings': ['bipolar', 'medication'],
      'Existing diagnosis / refill': ['medication', 'psychiatry'],
      'Focus & attention': ['adhd', 'medication'],
      'Second opinion': ['psychiatry'],
    },
  },
  {
    id: 'medication',
    text: 'Are you currently taking any psychiatric medication?',
    type: 'single',
    layout: 'grid',
    options: ['No', 'Yes, currently', 'Previously, not now'],
  },
  {
    id: 'severity',
    text: 'How much are these symptoms affecting your daily life?',
    type: 'scale',
    concern: 'Functional Impairment',
  },
  {
    id: 'coping',
    text: 'Over the last two weeks, how often have things felt like too much to carry?',
    type: 'single',
    layout: 'grid',
    options: ['Rarely', 'Some days', 'More than half the days', 'Almost every day'],
    risk: true,
  },
  {
    id: 'gender',
    text: 'Any preference for your professional?',
    hint: 'Totally optional, we\'ll honour it where we can.',
    type: 'single',
    layout: 'grid',
    options: ['No preference', 'Prefer a woman', 'Prefer a man'],
  },
]

function getQuestions(type: string): Question[] {
  switch (type) {
    case 'child': return childQuestions
    case 'couple': return coupleQuestions
    case 'psychiatry': return psychiatryQuestions
    default: return adultQuestions
  }
}

// In-app mode: a signed-in patient takes the SAME questionnaire, but instead of
// stashing the result in sessionStorage and showing the public results page, we
// persist it to their profile and match a clinician. The parent passes the
// server action as `onComplete`.
type AssessmentResultPayload = {
  type: string
  tags: string[]
  language: string | null
  genderPref: string | null
  severity: string
  riskFlag: boolean
}

export default function AssessmentForm({
  type,
  onComplete,
}: {
  type: string
  onComplete?: (payload: AssessmentResultPayload) => Promise<{ ok: boolean; error?: string }>
}) {
  const router = useRouter()
  const questions = getQuestions(type)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  const q = questions[step]
  const progress = ((step + 1) / questions.length) * 100

  const advance = () => {
    if (step < questions.length - 1) setStep((s) => s + 1)
    else finish()
  }

  // Single-choice / scale: record + auto-advance after a short beat.
  // Risk answers are still captured and factored into the result — we just
  // don't interrupt the assessment with a helpline modal mid-flow.
  const pickSingle = (value: string) => {
    setAnswers((a) => ({ ...a, [q.id]: value }))
    setTimeout(advance, 220)
  }

  const toggleMulti = (value: string) => {
    setAnswers((a) => {
      const current = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : []
      const noneLabel = q.options?.find((o) => o.startsWith('None'))
      if (value === noneLabel) return { ...a, [q.id]: [value] }
      let without = current.filter((v) => v !== noneLabel)
      if (without.includes(value)) {
        without = without.filter((v) => v !== value)
      } else {
        if (q.maxSelect && without.length >= q.maxSelect) return a // cap reached
        without = [...without, value]
      }
      return { ...a, [q.id]: without }
    })
  }

  const isAnswered = () => {
    const v = answers[q.id]
    if (Array.isArray(v)) return v.length > 0
    return Boolean(v)
  }

  const finish = () => {
    const { severity, concerns, riskFlag, tags } = score(questions, answers)

    // In-app: persist to the patient's profile and match, then go to Care Team.
    if (onComplete) {
      // Language is no longer asked here — it is collected once at signup and
      // lives on the profile, so the assessment has no business restating it.
      const genderPref = typeof answers.gender === 'string' ? answers.gender : null
      setSaving(true)
      setSaveErr(null)
      void onComplete({ type, tags, language: null, genderPref, severity, riskFlag }).then((res) => {
        if (res.ok) router.push('/app/therapist')
        else { setSaving(false); setSaveErr(res.error ?? 'Could not save your assessment.') }
      })
      return
    }

    sessionStorage.setItem('assess_result', JSON.stringify({ type, severity, concerns, riskFlag, tags, answers }))
    router.push('/assess/results')
  }

  const scaleColors = ['#3D9E72', '#7FBD9E', '#C9973A', '#D4703A', '#C8553D']
  const isMulti = q.type === 'multi'

  return (
    <div className="assess-shell">
      <div className="assess-inner assess-inner-sm">
        {/* Progress */}
        <div className="assess-progress">
          <div className="ap-meta">
            <span className="ap-step">Pre-assessment</span>
            <span className="ap-label">{step + 1} of {questions.length}</span>
          </div>
          <div className="ap-track">
            <div className="ap-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="assess-card aq-card">
          <p className="aq-qnum">Question {step + 1}</p>
          <h2 className="aq-text">{q.text}</h2>
          {q.hint && <p className="aq-hint">{q.hint}</p>}

          {/* Scale */}
          {q.type === 'scale' && (
            <div className="aq-scale">
              {SCALE.map((label, i) => (
                <button
                  key={label}
                  onClick={() => pickSingle(label)}
                  className={`aq-scale-btn${answers[q.id] === label ? ' sel' : ''}`}
                  style={answers[q.id] === label ? { borderColor: scaleColors[i], background: scaleColors[i] + '18', color: scaleColors[i] } : {}}
                >
                  <span className="aq-scale-n">{i + 1}</span>
                  <span className="aq-scale-l">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Single, list / grid / chips */}
          {q.type === 'single' && (
            <div className={`aq-${q.layout || 'list'}`}>
              {q.options!.map((opt, i) => {
                const sel = answers[q.id] === opt
                if (q.layout === 'chips') {
                  return (
                    <button key={opt} onClick={() => pickSingle(opt)} className={`aq-chip${sel ? ' sel' : ''}`}>
                      {opt}
                    </button>
                  )
                }
                return (
                  <button key={opt} onClick={() => pickSingle(opt)} className={`aq-opt${sel ? ' sel' : ''}`}>
                    {q.layout !== 'grid' && <span className="aq-opt-letter">{String.fromCharCode(65 + i)}</span>}
                    <span className="aq-opt-text">{opt}</span>
                    {sel && <span className="aq-opt-check">✓</span>}
                  </button>
                )
              })}
            </div>
          )}

          {/* Multi, needs a Continue button */}
          {isMulti && (
            <>
              <div className="aq-multi-grid">
                {q.options!.map((opt) => {
                  const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt)
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleMulti(opt)}
                      className={`aq-pill${selected ? ' sel' : ''}`}
                    >
                      <span className={`aq-pill-check${selected ? ' on' : ''}`}>{selected ? '✓' : '+'}</span>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {q.maxSelect && (
                <p className="aq-cap">
                  {Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length : 0} / {q.maxSelect} selected
                </p>
              )}
            </>
          )}

          <div className="aq-nav">
            <button
              onClick={() =>
                step === 0
                  ? router.push(onComplete ? '/app/therapist' : '/assess/step2')
                  : setStep((s) => s - 1)
              }
              className="aq-back"
            >
              ← Back
            </button>
            {isMulti && (
              <button onClick={advance} disabled={!isAnswered() || saving} className="aq-next">
                {step === questions.length - 1 ? (onComplete ? (saving ? 'Matching…' : '✦ Match my expert') : '✦ See matches') : 'Continue →'}
              </button>
            )}
          </div>
        </div>

        {saveErr && <p className="assess-footnote" style={{ color: '#C8553D' }}>{saveErr}</p>}
        {saving && <p className="assess-footnote">Saving your answers and finding your best-fit expert…</p>}
        <p className="assess-footnote">A screening tool, not a diagnosis. A qualified professional reviews everything before your session.</p>
      </div>
    </div>
  )
}

function score(questions: Question[], answers: Record<string, string | string[]>) {
  let points = 0
  let max = 0
  const concerns: string[] = []
  const tags = new Set<string>()
  let riskFlag = false

  for (const q of questions) {
    const a = answers[q.id]

    // Collect matching tags from any tagged answers
    if (q.tagMap) {
      if (Array.isArray(a)) a.forEach((v) => q.tagMap![v]?.forEach((t) => tags.add(t)))
      else if (typeof a === 'string') q.tagMap[a]?.forEach((t) => tags.add(t))
    }

    if (q.risk) {
      if (typeof a === 'string' && (a === 'Almost every day' || a === 'More than half the days')) riskFlag = true
      // contributes to severity too
      if (typeof a === 'string') {
        const idx = ['Rarely', 'Some days', 'More than half the days', 'Almost every day'].indexOf(a)
        if (idx >= 0) { max += 3; points += idx }
      }
      continue
    }
    if (q.type === 'scale' && typeof a === 'string') {
      const idx = SCALE.indexOf(a)
      max += 4
      const inverted = ['mood', 'satisfaction', 'school'].includes(q.id)
      const sev = inverted ? 4 - idx : idx
      points += sev
      if (sev >= 3 && q.concern) concerns.push(q.concern)
    } else if (q.type === 'multi' && Array.isArray(a) && q.concern) {
      if (a.length > 0 && !(a.length === 1 && a[0].startsWith('None'))) concerns.push(q.concern)
    } else if (q.type === 'single' && typeof a === 'string' && q.options && q.concern) {
      const idx = q.options.indexOf(a)
      max += q.options.length - 1
      points += idx
      if (idx >= Math.max(1, q.options.length - 2)) concerns.push(q.concern)
    }
  }

  const ratio = max > 0 ? points / max : 0
  let severity: 'Minimal' | 'Mild' | 'Moderate' | 'Severe' = 'Minimal'
  if (riskFlag || ratio >= 0.7) severity = 'Severe'
  else if (ratio >= 0.45) severity = 'Moderate'
  else if (ratio >= 0.2) severity = 'Mild'

  return { severity, concerns: Array.from(new Set(concerns)), riskFlag, tags: Array.from(tags) }
}
