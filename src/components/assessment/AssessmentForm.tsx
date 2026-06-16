'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmergencyModal from './EmergencyModal'

type Question = {
  id: string
  text: string
  type: 'single' | 'multi' | 'scale'
  options?: string[]
  concern?: string
  risk?: boolean
}

const SCALE = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']

const adultQuestions: Question[] = [
  {
    id: 'duration',
    text: 'How long have you been experiencing these challenges?',
    type: 'single',
    options: ['Less than 2 weeks', '2–4 weeks', '1–3 months', 'More than 3 months'],
  },
  {
    id: 'mood',
    text: 'How would you rate your overall mood in the past two weeks?',
    type: 'scale',
    concern: 'Low Mood',
  },
  {
    id: 'sleep',
    text: 'How has your sleep been recently?',
    type: 'single',
    options: ['Sleep is fine', 'Difficulty falling asleep', 'Waking frequently', 'Sleeping too much'],
    concern: 'Sleep Difficulties',
  },
  {
    id: 'interest',
    text: 'How are you feeling about daily activities you usually enjoy?',
    type: 'single',
    options: ['Enjoying them', 'Less interest than usual', 'Minimal interest', 'No interest at all'],
    concern: 'Loss of Interest',
  },
  {
    id: 'stress',
    text: 'How would you rate your stress levels?',
    type: 'scale',
    concern: 'Stress & Burnout',
  },
  {
    id: 'physical',
    text: 'Are you experiencing any physical symptoms? Select all that apply.',
    type: 'multi',
    options: ['Headaches', 'Fatigue', 'Appetite changes', 'Chest tightness', 'None of these'],
  },
  {
    id: 'prior',
    text: 'Have you seen a mental health professional before?',
    type: 'single',
    options: ['Yes', 'No'],
  },
  {
    id: 'risk',
    text: 'Have you had any thoughts of harming yourself or ending your life in the recent past?',
    type: 'single',
    options: ['No', 'Yes'],
    risk: true,
  },
  {
    id: 'language',
    text: 'What is your preferred language for sessions?',
    type: 'single',
    options: ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi', 'Other'],
  },
  {
    id: 'time',
    text: 'What is your preferred session time?',
    type: 'single',
    options: ['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–9pm)'],
  },
]

const childQuestions: Question[] = [
  {
    id: 'age',
    text: 'How old is your child?',
    type: 'single',
    options: ['Under 6', '6–10', '11–14', '15–17'],
  },
  {
    id: 'concern',
    text: 'What is your main area of concern?',
    type: 'single',
    options: ['Anxiety / Worry', 'Low mood', 'Exam / Academic stress', 'Behavioural difficulties', 'Major life event'],
    concern: 'Child Wellbeing',
  },
  {
    id: 'duration',
    text: 'How long have you noticed these changes?',
    type: 'single',
    options: ['Less than 2 weeks', '2–4 weeks', '1–3 months', 'More than 3 months'],
  },
  {
    id: 'school',
    text: 'How is your child doing at school recently?',
    type: 'scale',
    concern: 'Academic Difficulties',
  },
  {
    id: 'risk',
    text: 'Has your child expressed any thoughts of self-harm or not wanting to live?',
    type: 'single',
    options: ['No', 'Yes'],
    risk: true,
  },
  {
    id: 'language',
    text: 'Preferred language for sessions?',
    type: 'single',
    options: ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi', 'Other'],
  },
]

const coupleQuestions: Question[] = [
  {
    id: 'concern',
    text: 'What best describes your main concern as a couple?',
    type: 'single',
    options: ['Communication issues', 'Frequent conflict', 'Trust concerns', 'Considering separation', 'Pre-marital guidance'],
    concern: 'Relationship Concerns',
  },
  {
    id: 'duration',
    text: 'How long have these concerns been present?',
    type: 'single',
    options: ['Less than a month', '1–3 months', '3–6 months', 'More than 6 months'],
  },
  {
    id: 'satisfaction',
    text: 'How would you rate your current relationship satisfaction?',
    type: 'scale',
    concern: 'Relationship Satisfaction',
  },
  {
    id: 'both',
    text: 'Are both partners willing to attend sessions?',
    type: 'single',
    options: ['Yes, both of us', 'Only me for now', 'Unsure'],
  },
  {
    id: 'language',
    text: 'Preferred language for sessions?',
    type: 'single',
    options: ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi', 'Other'],
  },
]

const psychiatryQuestions: Question[] = [
  {
    id: 'reason',
    text: 'What brings you to seek psychiatric support?',
    type: 'single',
    options: ['Persistent low mood', 'Severe anxiety / panic', 'Sleep problems', 'Existing diagnosis / refill', 'Second opinion'],
    concern: 'Psychiatric Evaluation',
  },
  {
    id: 'medication',
    text: 'Are you currently taking any psychiatric medication?',
    type: 'single',
    options: ['No', 'Yes — currently', 'Previously, not now'],
  },
  {
    id: 'severity',
    text: 'How much are these symptoms affecting your daily life?',
    type: 'scale',
    concern: 'Functional Impairment',
  },
  {
    id: 'risk',
    text: 'Have you had any thoughts of harming yourself or ending your life in the recent past?',
    type: 'single',
    options: ['No', 'Yes'],
    risk: true,
  },
  {
    id: 'language',
    text: 'Preferred language for consultation?',
    type: 'single',
    options: ['Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi', 'Other'],
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

export default function AssessmentForm({ type }: { type: string }) {
  const router = useRouter()
  const questions = getQuestions(type)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [showEmergency, setShowEmergency] = useState(false)

  const q = questions[step]
  const progress = ((step + 1) / questions.length) * 100

  const setSingle = (value: string) => {
    setAnswers((a) => ({ ...a, [q.id]: value }))
    if (q.risk && value.toLowerCase() === 'yes') setShowEmergency(true)
  }

  const toggleMulti = (value: string) => {
    setAnswers((a) => {
      const current = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : []
      if (value === 'None of these') return { ...a, [q.id]: ['None of these'] }
      const without = current.filter((v) => v !== 'None of these')
      const next = without.includes(value)
        ? without.filter((v) => v !== value)
        : [...without, value]
      return { ...a, [q.id]: next }
    })
  }

  const isAnswered = () => {
    const v = answers[q.id]
    if (Array.isArray(v)) return v.length > 0
    return Boolean(v)
  }

  const next = () => {
    if (step < questions.length - 1) setStep((s) => s + 1)
    else finish()
  }

  const finish = () => {
    const { severity, concerns, riskFlag } = score(questions, answers)
    sessionStorage.setItem('assess_result', JSON.stringify({ type, severity, concerns, riskFlag, answers }))
    router.push('/assess/results')
  }

  const scaleLabels = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  const scaleColors = ['#3D9E72', '#7FBD9E', '#C9973A', '#D4703A', '#C8553D']

  return (
    <div className="assess-shell">
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      <div className="assess-inner assess-inner-sm">
        {/* Progress */}
        <div className="assess-progress">
          <div className="ap-meta">
            <span className="ap-step">Step 3 of 3 — Pre-assessment</span>
            <span className="ap-label">{step + 1} of {questions.length}</span>
          </div>
          <div className="ap-track">
            <div className="ap-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="ap-dots">
            <span className="ap-dot done" />
            <span className="ap-dot done" />
            <span className="ap-dot active" />
          </div>
        </div>

        <div className="assess-card aq-card">
          {q.risk && (
            <div className="aq-risk-badge">🔒 Confidential safety check</div>
          )}

          <p className="aq-qnum">Q{step + 1}</p>
          <h2 className="aq-text">{q.text}</h2>

          {/* Scale */}
          {q.type === 'scale' && (
            <div className="aq-scale">
              {scaleLabels.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setSingle(label)}
                  className={`aq-scale-btn${answers[q.id] === label ? ' sel' : ''}`}
                  style={answers[q.id] === label ? { borderColor: scaleColors[i], background: scaleColors[i] + '18', color: scaleColors[i] } : {}}
                >
                  <span className="aq-scale-n">{i + 1}</span>
                  <span className="aq-scale-l">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Single select */}
          {q.type === 'single' && (
            <div className="aq-opts">
              {q.options!.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => setSingle(opt)}
                  className={`aq-opt${answers[q.id] === opt ? ' sel' : ''}`}
                >
                  <span className="aq-opt-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="aq-opt-text">{opt}</span>
                  {answers[q.id] === opt && <span className="aq-opt-check">✓</span>}
                </button>
              ))}
            </div>
          )}

          {/* Multi select */}
          {q.type === 'multi' && (
            <div className="aq-opts">
              {q.options!.map((opt, i) => {
                const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(opt)}
                    className={`aq-opt${selected ? ' sel' : ''}`}
                  >
                    <span className={`aq-check-box${selected ? ' checked' : ''}`}>{selected ? '✓' : ''}</span>
                    <span className="aq-opt-text">{opt}</span>
                  </button>
                )
              })}
              <p className="aq-multi-hint">Select all that apply</p>
            </div>
          )}

          <div className="aq-nav">
            <button
              onClick={() => step === 0 ? router.push('/assess/step2') : setStep((s) => s - 1)}
              className="aq-back"
            >
              ← Back
            </button>
            <button
              onClick={next}
              disabled={!isAnswered()}
              className="aq-next"
            >
              {step === questions.length - 1 ? '✦ See My Results' : 'Next →'}
            </button>
          </div>
        </div>

        <p className="assess-footnote">This pre-assessment is a screening tool, not a clinical diagnosis. A qualified professional will review your needs.</p>
      </div>
    </div>
  )
}

function score(questions: Question[], answers: Record<string, string | string[]>) {
  let points = 0
  let max = 0
  const concerns: string[] = []
  let riskFlag = false

  for (const q of questions) {
    const a = answers[q.id]
    if (q.risk) {
      if (typeof a === 'string' && a.toLowerCase() === 'yes') riskFlag = true
      continue
    }
    if (q.type === 'scale' && typeof a === 'string') {
      const idx = SCALE.indexOf(a)
      max += 4
      const inverted = ['mood', 'satisfaction', 'school'].includes(q.id)
      const sev = inverted ? 4 - idx : idx
      points += sev
      if (sev >= 3 && q.concern) concerns.push(q.concern)
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

  return { severity, concerns: Array.from(new Set(concerns)), riskFlag }
}
