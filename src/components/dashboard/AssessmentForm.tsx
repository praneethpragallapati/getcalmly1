'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { saveAssessment } from '@/app/(dashboard)/app/actions'

// Kept in sync with the register questionnaire and lib/matching keyword map.
const CONCERNS: { slug: string; label: string }[] = [
  { slug: 'anxiety', label: 'Anxiety' },
  { slug: 'depression', label: 'Low mood / depression' },
  { slug: 'stress', label: 'Stress & burnout' },
  { slug: 'relationships', label: 'Relationships' },
  { slug: 'trauma', label: 'Trauma & grief' },
  { slug: 'sleep', label: 'Sleep' },
  { slug: 'self-worth', label: 'Self-worth' },
  { slug: 'anger', label: 'Anger' },
  { slug: 'postpartum', label: 'Motherhood / postpartum' },
  { slug: 'other', label: 'Something else' },
]
const LANGS = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Malayalam', 'Kannada', 'Gujarati', 'Punjabi']

export function AssessmentForm({
  initialConcerns,
  initialPrimary,
  initialLanguage,
}: {
  initialConcerns: string[]
  initialPrimary: string | null
  initialLanguage: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [concerns, setConcerns] = useState<string[]>(initialConcerns)
  const [primary, setPrimary] = useState<string | null>(initialPrimary ?? initialConcerns[0] ?? null)
  const [language, setLanguage] = useState<string>(initialLanguage ?? 'English')
  const [msg, setMsg] = useState<string | null>(null)

  function toggle(slug: string) {
    setConcerns((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      if (!next.includes(primary ?? '')) setPrimary(next[0] ?? null)
      return next
    })
  }

  function submit() {
    setMsg(null)
    startTransition(async () => {
      const res = await saveAssessment({ concerns, primary, language })
      if (res.ok) router.push('/app/therapist')
      else setMsg(res.error ?? 'Something went wrong.')
    })
  }

  return (
    <div className="stack" style={{ gap: 16, maxWidth: 640 }}>
      <div className="card">
        <div className="section-title">What would you like support with?</div>
        <p className="muted" style={{ marginTop: 6, marginBottom: 14 }}>
          Pick everything that applies. We use this to match you with the right expert.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CONCERNS.map((c) => {
            const on = concerns.includes(c.slug)
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggle(c.slug)}
                style={{
                  padding: '9px 14px', borderRadius: 999, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: on ? '1.5px solid var(--c-coral, #C8553D)' : '1.5px solid var(--c-line, #E2E8F0)',
                  background: on ? 'var(--c-coral-pale, #FFF1EC)' : 'var(--c-white, #fff)',
                  color: on ? 'var(--c-coral, #C8553D)' : 'var(--c-gray-d, #6B7D8E)',
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      {concerns.length > 1 && (
        <div className="card">
          <div className="section-title">Which is the main one?</div>
          <select value={primary ?? ''} onChange={(e) => setPrimary(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--c-line)', fontFamily: 'inherit', fontSize: 15, background: 'var(--c-white)', color: 'var(--c-charcoal)' }}>
            {concerns.map((s) => (
              <option key={s} value={s}>{CONCERNS.find((c) => c.slug === s)?.label ?? s}</option>
            ))}
          </select>
        </div>
      )}

      <div className="card">
        <div className="section-title">Preferred language</div>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}
          style={{ marginTop: 10, width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--c-line)', fontFamily: 'inherit', fontSize: 15, background: 'var(--c-white)', color: 'var(--c-charcoal)' }}>
          {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {msg && <div style={{ fontSize: 13, color: 'var(--c-coral)' }}>{msg}</div>}

      <div>
        <button className="btn btn-primary" disabled={pending || concerns.length === 0} onClick={submit}>
          <Check size={16} /> {pending ? 'Matching…' : 'Save & match my expert'}
        </button>
      </div>
    </div>
  )
}
