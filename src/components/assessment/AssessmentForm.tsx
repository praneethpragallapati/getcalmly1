'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmergencyModal from './EmergencyModal'

type Question = {
  id: string
  text: string
  type: 'single' | 'multi' | 'scale'
  options?: string[]
  concern?: string // area of concern this question maps to when answered negatively
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
    text: 'Are you experiencing any physical symptoms?',
    type: 'multi',
    options: ['Headaches', 'Fatigue', 'Appetite changes', 'Chest tightness', 'None'],
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
    case 'child':
      return childQuestions
    case 'couple':
      return coupleQuestions
    case 'psychiatry':
      return psychiatryQuestions
    default:
      return adultQuestions
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
    if (q.risk && value.toLowerCase() === 'yes') {
      setShowEmergency(true)
    }
  }

  const toggleMulti = (value: string) => {
    setAnswers((a) => {
      const current = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : []
      if (value === 'None') return { ...a, [q.id]: ['None'] }
      const without = current.filter((v) => v !== 'None')
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
    if (step < questions.length - 1) {
      setStep((s) => s + 1)
    } else {
      finish()
    }
  }

  const finish = () => {
    const { severity, concerns, riskFlag } = score(questions, answers)
    sessionStorage.setItem(
      'assess_result',
      JSON.stringify({ type, severity, concerns, riskFlag, answers })
    )
    router.push('/assess/results')
  }

  return (
    <section className="min-h-[80vh] bg-[#FFF8F5] py-16 px-4">
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2 text-sm font-semibold text-[#C8553D]">
            <span>Step 3 of 3 — Pre-assessment</span>
            <span>
              {step + 1} / {questions.length}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C8553D] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {q.risk && (
            <span className="inline-block text-xs font-semibold text-[#d9534f] bg-[#fdf2f2] px-3 py-1 rounded-full mb-3">
              Confidential safety check
            </span>
          )}
          <h2 className="text-2xl font-bold text-[#1C2B3A] mb-6">{q.text}</h2>

          {q.type === 'scale' && (
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {SCALE.map((label) => (
                <button
                  key={label}
                  onClick={() => setSingle(label)}
                  className={`px-3 py-4 rounded-xl text-sm font-medium border-2 transition ${
                    answers[q.id] === label
                      ? 'border-[#C8553D] bg-[#FDEAE6] text-[#C8553D]'
                      : 'border-gray-200 hover:border-[#C8553D] text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {q.type === 'single' && (
            <div className="space-y-3">
              {q.options!.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSingle(opt)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition ${
                    answers[q.id] === opt
                      ? 'border-[#C8553D] bg-[#FDEAE6] text-[#C8553D] font-semibold'
                      : 'border-gray-200 hover:border-[#C8553D] text-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.type === 'multi' && (
            <div className="space-y-3">
              {q.options!.map((opt) => {
                const selected =
                  Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(opt)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition flex items-center gap-3 ${
                      selected
                        ? 'border-[#C8553D] bg-[#FDEAE6] text-[#C8553D] font-semibold'
                        : 'border-gray-200 hover:border-[#C8553D] text-gray-700'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                        selected ? 'bg-[#C8553D] border-[#C8553D] text-white' : 'border-gray-300'
                      }`}
                    >
                      {selected ? '✓' : ''}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => (step === 0 ? router.push('/assess/step2') : setStep((s) => s - 1))}
              className="text-sm text-gray-500 hover:text-[#C8553D]"
            >
              ← Back
            </button>
            <button
              onClick={next}
              disabled={!isAnswered()}
              className="bg-[#C8553D] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#A8432D] transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === questions.length - 1 ? 'See My Results' : 'Next'}
            </button>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          This pre-assessment is a screening tool, not a clinical diagnosis. A qualified
          professional will review your needs.
        </p>
      </div>
    </section>
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
      // For mood/satisfaction, low is worse; for stress/severity/impairment, high is worse.
      const inverted = ['mood', 'satisfaction', 'school'].includes(q.id)
      const sev = inverted ? 4 - idx : idx
      points += sev
      if (sev >= 3 && q.concern) concerns.push(q.concern)
    } else if (q.type === 'single' && typeof a === 'string' && q.options && q.concern) {
      const idx = q.options.indexOf(a)
      max += q.options.length - 1
      // later options generally indicate more difficulty
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
