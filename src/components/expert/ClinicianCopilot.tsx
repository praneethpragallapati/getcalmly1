'use client'

import { useState, useTransition } from 'react'
import { Sparkles } from 'lucide-react'
import { generateCopilotBrief } from '@/app/(dashboard)/expert/actions'

const HEADINGS = ['Since last session', 'Score changes', 'From previous sessions', 'What may be helping', 'Watch for']

/** Render the brief with its headings emphasised and line breaks preserved. */
function Brief({ text }: { text: string }) {
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {text.split('\n').filter((l) => l.trim()).map((line, i) => {
        const heading = HEADINGS.find((h) => line.trim().toLowerCase().startsWith(h.toLowerCase()))
        if (heading) {
          const rest = line.trim().slice(heading.length).replace(/^:\s*/, '')
          return (
            <div key={i}>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.02em', color: 'var(--c-coral-d)' }}>{heading}</span>
              {rest && <span style={{ fontSize: 13.5, color: 'var(--c-charcoal)', lineHeight: 1.55 }}> — {rest}</span>}
            </div>
          )
        }
        return <p key={i} style={{ fontSize: 13.5, color: 'var(--c-charcoal)', lineHeight: 1.55, margin: 0 }}>{line}</p>
      })}
    </div>
  )
}

export function ClinicianCopilot({ patientId }: { patientId: string }) {
  const [brief, setBrief] = useState<string | null>(null)
  const [firstSession, setFirstSession] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, start] = useTransition()

  return (
    <div className="card tint-green">
      <div className="prov-row">
        <span className="section-title" style={{ fontSize: 18, marginBottom: 0 }}>Clinician Copilot</span>
        <span className="prov-badge">Progress since last session</span>
      </div>
      <p className="muted" style={{ marginTop: 4 }}>
        A concise, factual brief for today&apos;s session, drawn from the measures, previous session notes, mood and engagement.
      </p>
      <button
        className="btn btn-primary btn-sm"
        disabled={busy}
        onClick={() => start(async () => {
          setError(null)
          const res = await generateCopilotBrief(patientId)
          if (res.ok && res.brief) { setBrief(res.brief); setFirstSession(Boolean(res.firstSession)) }
          else setError(res.error ?? 'Could not generate the brief.')
        })}
      >
        <Sparkles size={15} /> {busy ? 'Generating…' : brief ? 'Regenerate brief' : 'Generate brief'}
      </button>
      {error && <p style={{ marginTop: 10, color: 'var(--c-coral-d)', fontWeight: 600, fontSize: 13 }}>{error}</p>}
      {brief && (
        <>
          {firstSession && <p className="muted" style={{ marginTop: 12, marginBottom: 0, fontSize: 12 }}>First session — summarising everything leading up to today.</p>}
          <Brief text={brief} />
        </>
      )}
    </div>
  )
}
