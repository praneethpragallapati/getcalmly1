'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

/**
 * A clinician's session note, collapsed by default.
 *
 * Notes are written in the structured SOAP form the note composer produces
 * (SUBJECTIVE / OBJECTIVE / ASSESSMENT / RISK / PLAN / NEXT SESSION FOCUS). Left
 * as raw text it renders as one long wall on the page, which is why it's
 * collapsed: the header shows what the note is and one line of it, and the whole
 * thing opens on click. Free-text notes written before that format existed still
 * render — they just come through as a single unlabelled block.
 */

type Section = { label: string; body: string }

const SECTION_LABEL: Record<string, string> = {
  SUBJECTIVE: 'Presenting concerns & focus',
  OBJECTIVE: 'Observations / mental status',
  ASSESSMENT: 'Clinical impression & progress',
  RISK: 'Risk',
  PLAN: 'Interventions & homework',
  'NEXT SESSION FOCUS': 'Focus next session',
}

/**
 * Split a composed note back into its parts. Each block starts with a known
 * heading, optionally followed by " — <subtitle>", then a colon. Anything before
 * the first heading (or a note with no headings at all) is kept as-is.
 */
export function parseSessionNote(raw: string): Section[] {
  const text = raw.trim()
  if (!text) return []
  const headings = Object.keys(SECTION_LABEL)
  const pattern = new RegExp(`^(${headings.join('|')})\\b[^\\n:]*:\\s*`, 'gm')

  const marks: { label: string; start: number; bodyStart: number }[] = []
  for (const m of text.matchAll(pattern)) {
    if (m.index === undefined) continue
    marks.push({ label: m[1], start: m.index, bodyStart: m.index + m[0].length })
  }
  if (marks.length === 0) return [{ label: '', body: text }]

  const out: Section[] = []
  if (marks[0].start > 0) {
    const preamble = text.slice(0, marks[0].start).trim()
    if (preamble) out.push({ label: '', body: preamble })
  }
  marks.forEach((mk, i) => {
    const end = i + 1 < marks.length ? marks[i + 1].start : text.length
    const body = text.slice(mk.bodyStart, end).trim()
    if (body) out.push({ label: SECTION_LABEL[mk.label] ?? mk.label, body })
  })
  return out
}

/** The first meaningful line, for the collapsed preview. */
function previewOf(sections: Section[]): string {
  const first = sections.find((s) => s.body.trim())
  return first ? first.body.replace(/\s+/g, ' ').slice(0, 110) : ''
}

export function SessionNote({
  note,
  title = 'Session note',
  meta,
  defaultOpen = false,
}: {
  note: string
  title?: string
  /** e.g. the date and who wrote it. */
  meta?: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const sections = parseSessionNote(note)
  if (sections.length === 0) return null
  const preview = previewOf(sections)

  return (
    <div style={{ border: '1px solid rgba(28,43,58,.1)', borderRadius: 11, overflow: 'hidden', background: '#fff' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', gap: 9, padding: '11px 13px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <span style={{ color: 'var(--c-gray, #8E9EAE)', flexShrink: 0, marginTop: 1 }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: 'var(--c-charcoal, #1C2B3A)' }}>
            {title}
            {meta && <span className="muted" style={{ fontWeight: 500 }}> · {meta}</span>}
          </span>
          {!open && preview && (
            <span
              className="muted"
              style={{ display: 'block', fontSize: 12.5, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {preview}…
            </span>
          )}
        </span>
        <span className="link-action" style={{ fontSize: 12, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {open ? 'Hide' : 'Read'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '2px 13px 14px 38px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map((sec, i) => (
            <div key={i}>
              {sec.label && (
                <div
                  style={{
                    fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                    color: 'var(--c-gray, #8E9EAE)', marginBottom: 3,
                  }}
                >
                  {sec.label}
                </div>
              )}
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#3A4A5A', whiteSpace: 'pre-wrap' }}>{sec.body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
