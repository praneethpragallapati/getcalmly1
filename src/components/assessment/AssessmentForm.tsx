'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import {
  FLOWS, LANGUAGES, TIMINGS, isFlowId, scoreAssessment, legacySeverity,
  type Answers, type Prefs, type Question, type AssessmentResult,
} from '@/data/assessments'
import { PATH_LOOK } from './AssessmentStep1'

/** What the in-app version saves to the patient's profile. */
export type AssessmentSavePayload = {
  type: string
  tags: string[]
  language: string | null
  genderPref: string | null
  severity: string
  riskFlag: boolean
  risk?: number
  styles?: string[]
  note?: string | null
}

export const RESULT_KEY = 'assess_result_v2'

/** "What is *this*?" → ["What is ", <em>this</em>, "?"] */
function emphasise(text: string) {
  return text.split('*').map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))
}

export default function AssessmentForm({
  type,
  onComplete,
  startHref = '/assess',
}: {
  type: string
  onComplete?: (payload: AssessmentSavePayload) => Promise<{ ok: boolean; error?: string }>
  startHref?: string
}) {
  const router = useRouter()
  const flow = FLOWS[isFlowId(type) ? type : 'adult']
  const qs = flow.questions
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [prefs, setPrefs] = useState<Prefs>({})
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const q: Question = qs[step]
  const last = step === qs.length - 1
  const accent = PATH_LOOK[flow.id].color

  const value = answers[q.id]
  const picked: string[] = Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []
  const answered = q.optional || (q.kind === 'text' ? Boolean(value) : picked.length > 0)

  const finish = useCallback(() => {
    const result: AssessmentResult = scoreAssessment(flow, answers, prefs)
    if (onComplete) {
      setSaving(true)
      setSaveErr(null)
      void onComplete({
        type: flow.id,
        tags: result.needs,
        language: prefs.language ?? null,
        genderPref: prefs.gender ?? null,
        severity: legacySeverity(result.level),
        riskFlag: result.risk > 0,
        risk: result.risk,
        styles: result.styles,
        note: result.note ?? null,
      }).then((res) => {
        // Details are asked here, as the last step before the match is shown
        // (/welcome passes straight through once they are on file).
        if (res.ok) router.push(`/welcome?next=${encodeURIComponent('/app/therapist')}`)
        else { setSaving(false); setSaveErr(res.error ?? 'Could not save your answers. Please try again.') }
      })
      return
    }
    try { sessionStorage.setItem(RESULT_KEY, JSON.stringify(result)) } catch { /* private mode: results page asks to retake */ }
    // Sign in (if needed) and share a few details as the last step, then the
    // results. The answers wait in this tab's sessionStorage meanwhile.
    router.push(`/welcome?next=${encodeURIComponent('/assess/results')}`)
  }, [flow, answers, prefs, onComplete, router])

  const next = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    if (last) finish()
    else setStep((s) => s + 1)
  }, [last, finish])

  const back = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    if (step === 0) router.push(startHref)
    else setStep((s) => s - 1)
  }

  const pickSingle = useCallback((label: string) => {
    setAnswers((a) => ({ ...a, [q.id]: label }))
    // A single answer moves on by itself after a beat, so the choice registers.
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => {
      if (step === qs.length - 1) return
      setStep((s) => s + 1)
    }, 280)
  }, [q.id, step, qs.length])

  const toggleMulti = useCallback((label: string) => {
    const opt = q.options?.find((o) => o.label === label)
    setAnswers((a) => {
      const cur = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : []
      const exclusive = new Set(q.options?.filter((o) => o.exclusive).map((o) => o.label))
      let nextVals: string[]
      if (cur.includes(label)) nextVals = cur.filter((v) => v !== label)
      else if (opt?.exclusive) nextVals = [label]
      else nextVals = [...cur.filter((v) => !exclusive.has(v)), label]
      return { ...a, [q.id]: nextVals }
    })
  }, [q])

  // Number keys pick an option; Enter continues.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT')) return
      if (e.key === 'Enter' && answered) { e.preventDefault(); next(); return }
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1 || !q.options || n > q.options.length) return
      const label = q.options[n - 1].label
      if (q.kind === 'single') pickSingle(label)
      else if (q.kind === 'multi') toggleMulti(label)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, answered, next, pickSingle, toggleMulti])

  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current) }, [])

  const setPref = (k: keyof Prefs, v: string) => setPrefs((p) => ({ ...p, [k]: p[k] === v ? undefined : v }))

  return (
    <div className="pa" style={{ '--pa-accent': accent } as React.CSSProperties}>
      <div className="pa-inner pa-inner-q">
        <div className="pa-top">
          <span className="pa-pathtag">{flow.name}</span>
          <button type="button" className="pa-change" onClick={() => router.push(startHref)}>Change path</button>
        </div>
        <div className="pa-bar" aria-hidden>
          {qs.map((_, i) => <span key={i} className={i < step ? 'done' : i === step ? 'now' : ''} />)}
        </div>
        <p className="pa-count"><b>{q.section}</b>Question {step + 1} of {qs.length}</p>

        <div className="pa-stage" key={q.id}>
          <h1 className="pa-q">{emphasise(q.title)}</h1>
          {q.hint && <p className="pa-hint">{q.hint}</p>}

          {q.kind === 'single' && (
            <div className="pa-rows" role="radiogroup" aria-label={q.title.replace(/\*/g, '')}>
              {q.options!.map((o, i) => {
                const on = picked.includes(o.label)
                return (
                  <button key={o.label} type="button" role="radio" aria-checked={on} className={`pa-row${on ? ' on' : ''}`} onClick={() => pickSingle(o.label)}>
                    <span className="pa-key">{i + 1}</span>
                    <span className="pa-row-t">{o.label}</span>
                  </button>
                )
              })}
            </div>
          )}

          {q.kind === 'multi' && (
            <div className="pa-chips" role="group" aria-label={q.title.replace(/\*/g, '')}>
              {q.options!.map((o) => {
                const on = picked.includes(o.label)
                return (
                  <button key={o.label} type="button" aria-pressed={on} className={`pa-chip${on ? ' on' : ''}`} onClick={() => toggleMulti(o.label)}>
                    <span className="pa-tick">✓</span>
                    {o.label}
                  </button>
                )
              })}
              {q.otherOption && picked.includes(q.otherOption) && (
                <input
                  className="pa-other"
                  autoFocus
                  maxLength={160}
                  placeholder="Tell us in a few words"
                  value={typeof answers[`${q.id}_other`] === 'string' ? (answers[`${q.id}_other`] as string) : ''}
                  onChange={(e) => setAnswers((a) => ({ ...a, [`${q.id}_other`]: e.target.value }))}
                />
              )}
            </div>
          )}

          {q.kind === 'prefs' && (
            <div className="pa-prefs">
              {q.prefs?.includes('gender') && (
                <div>
                  <p className="pa-pref-l">{flow.id === 'child' ? "Your child's therapist" : 'Your clinician'}</p>
                  <div className="pa-pills">
                    {['No preference', 'Female', 'Male'].map((g) => (
                      <button key={g} type="button" className={`pa-pill${prefs.gender === g ? ' on' : ''}`} onClick={() => setPref('gender', g)}>{g}</button>
                    ))}
                  </div>
                </div>
              )}
              {q.prefs?.includes('language') && (
                <div>
                  <p className="pa-pref-l">Language</p>
                  <div className="pa-pills">
                    {LANGUAGES.map((l) => (
                      <button key={l} type="button" className={`pa-pill${prefs.language === l ? ' on' : ''}`} onClick={() => setPref('language', l)}>{l}</button>
                    ))}
                  </div>
                </div>
              )}
              {q.prefs?.includes('timing') && (
                <div>
                  <p className="pa-pref-l">Best time for sessions</p>
                  <div className="pa-pills">
                    {TIMINGS.map((t) => (
                      <button key={t} type="button" className={`pa-pill${prefs.timing === t ? ' on' : ''}`} onClick={() => setPref('timing', t)}>{t}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {q.kind === 'text' && (
            <textarea
              className="pa-text"
              maxLength={1500}
              placeholder="For example: what has changed recently, what helps, or anything they love doing."
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            />
          )}
        </div>

        <div className="pa-nav">
          <button type="button" className="pa-back" onClick={back}>← Back</button>
          <button type="button" className="pa-next" disabled={!answered || saving} onClick={next}>
            {last ? (saving ? 'Finding your match…' : onComplete ? 'Match my clinician' : 'See my matches') : q.optional && !(q.kind === 'prefs' ? Object.values(prefs).some(Boolean) : picked.length || value) ? 'Skip' : 'Continue'}
            <ArrowRight size={17} />
          </button>
        </div>
        {q.options && q.kind !== 'text' && (
          <p className="pa-keys">Tip: press <kbd>1</kbd> to <kbd>{Math.min(9, q.options.length)}</kbd> to choose, <kbd>Enter</kbd> to continue.</p>
        )}
        {saveErr && <p className="pa-foot" style={{ color: '#A8432D' }}>{saveErr}</p>}
      </div>
    </div>
  )
}
