'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Star } from 'lucide-react'
import type { FeedbackRow } from '@/lib/admin'
import { trackLabel } from '@/lib/packageLabels'
import { patientCode, expertCode } from '@/lib/ids'

const charcoal = '#1C2B3A'
const purple = '#6D5BD0'
const gold = '#C9973A'
const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 13.5, fontFamily: 'inherit', color: charcoal, background: '#fff' }
const idChip: React.CSSProperties = { fontSize: 10.5, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: purple, background: 'rgba(109,91,208,.1)', padding: '1px 6px', borderRadius: 5, whiteSpace: 'nowrap' }

function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, whiteSpace: 'nowrap' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} style={{ color: i <= n ? gold : '#DDE3EA', fill: i <= n ? gold : 'none' }} />
      ))}
    </span>
  )
}

type Sort = 'recent' | 'session' | 'high' | 'low'
const DAY = 86400000

export function FeedbackTable({ rows }: { rows: FeedbackRow[] }) {
  const [q, setQ] = useState('')
  const [clinician, setClinician] = useState('')
  const [pkg, setPkg] = useState('')
  const [rating, setRating] = useState('')
  const [recency, setRecency] = useState('')
  const [withComment, setWithComment] = useState(false)
  const [sort, setSort] = useState<Sort>('recent')

  const clinicians = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of rows) m.set(r.therapistProfileId, r.therapistName)
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [rows])
  const packages = useMemo(() => Array.from(new Set(rows.map((r) => r.trackSlug).filter((s): s is string => !!s))).sort(), [rows])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const now = Date.now()
    const window = recency ? Number(recency) * DAY : 0
    let list = rows.filter((r) => {
      if (needle) {
        const hay = `${r.patientName} ${r.therapistName} ${r.comment ?? ''} ${patientCode(r.patientId)} ${expertCode(r.therapistProfileId)}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (clinician && r.therapistProfileId !== clinician) return false
      if (pkg && r.trackSlug !== pkg) return false
      if (rating && r.rating !== Number(rating)) return false
      if (withComment && !r.comment) return false
      if (window && now - new Date(r.createdIso).getTime() > window) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'high') return b.rating - a.rating || b.createdIso.localeCompare(a.createdIso)
      if (sort === 'low') return a.rating - b.rating || b.createdIso.localeCompare(a.createdIso)
      if (sort === 'session') return (b.sessionIso ?? '').localeCompare(a.sessionIso ?? '')
      return b.createdIso.localeCompare(a.createdIso)
    })
    return list
  }, [rows, q, clinician, pkg, rating, recency, withComment, sort])

  const avg = filtered.length ? (filtered.reduce((s, r) => s + r.rating, 0) / filtered.length) : 0
  const activeFilters = [clinician, pkg, rating, recency].filter(Boolean).length + (q.trim() ? 1 : 0) + (withComment ? 1 : 0)

  return (
    <div className="stack">
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 220px', minWidth: 190 }}>
          <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Search patient, clinician or comment</div>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#8E9EAE' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Ananya, calm, P-9F3K21…" style={{ ...field, width: '100%', paddingLeft: 34, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Clinician</div>
          <select value={clinician} onChange={(e) => setClinician(e.target.value)} style={{ ...field, minWidth: 160 }}>
            <option value="">All clinicians</option>
            {clinicians.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select></div>
        {packages.length > 0 && (
          <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Package type</div>
            <select value={pkg} onChange={(e) => setPkg(e.target.value)} style={{ ...field, minWidth: 140 }}>
              <option value="">All packages</option>
              {packages.map((p) => <option key={p} value={p}>{trackLabel(p)}</option>)}
            </select></div>
        )}
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Rating</div>
          <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ ...field, minWidth: 110 }}>
            <option value="">Any</option>
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★ (4)</option>
            <option value="3">★★★ (3)</option>
            <option value="2">★★ (2)</option>
            <option value="1">★ (1)</option>
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Recency</div>
          <select value={recency} onChange={(e) => setRecency(e.target.value)} style={{ ...field, minWidth: 130 }}>
            <option value="">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Sort</div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} style={{ ...field, minWidth: 150 }}>
            <option value="recent">Newest feedback</option>
            <option value="session">Recent session</option>
            <option value="low">Lowest rating</option>
            <option value="high">Highest rating</option>
          </select></div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#4A5F70', cursor: 'pointer', paddingBottom: 9 }}>
          <input type="checkbox" checked={withComment} onChange={(e) => setWithComment(e.target.checked)} style={{ width: 15, height: 15, accentColor: purple, cursor: 'pointer' }} />
          Written comment only
        </label>
        {activeFilters > 0 && (
          <button className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, padding: '9px 12px' }}
            onClick={() => { setQ(''); setClinician(''); setPkg(''); setRating(''); setRecency(''); setWithComment(false); setSort('recent') }}>
            Clear filters
          </button>
        )}
      </div>

      <div className="page-meta" style={{ fontSize: 12.5, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Showing {filtered.length} of {rows.length} rating{rows.length === 1 ? '' : 's'}</span>
        {filtered.length > 0 && <span>Average <b style={{ color: gold }}>★ {avg.toFixed(2)}</b></span>}
      </div>

      {filtered.length === 0 ? (
        <div className="card"><p className="muted">No feedback matches these filters.</p></div>
      ) : (
        <div className="stack">
          {filtered.map((r) => (
            <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Stars n={r.rating} />
                <span className="muted" style={{ fontSize: 12 }}>{r.createdLabel}</span>
              </div>
              {r.comment ? (
                <p style={{ fontSize: 14, color: '#3A4A5A', lineHeight: 1.6, margin: 0 }}>&ldquo;{r.comment}&rdquo;</p>
              ) : (
                <p className="muted" style={{ fontSize: 13, fontStyle: 'italic', margin: 0 }}>Rated, no written comment.</p>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', fontSize: 12.5, color: '#5A6A7A', paddingTop: 8, borderTop: '1px solid rgba(28,43,58,.07)' }}>
                <Link href={`/admin/patients/${r.patientId}`} style={{ color: charcoal, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {r.patientName} <span style={idChip}>{patientCode(r.patientId)}</span>
                </Link>
                <span>→</span>
                <Link href={`/admin/therapists/${r.therapistProfileId}`} style={{ color: charcoal, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {r.therapistName} <span style={idChip}>{expertCode(r.therapistProfileId)}</span>
                </Link>
                {r.packageLabel && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#2C7A57', background: 'rgba(61,158,114,.1)', padding: '2px 8px', borderRadius: 20 }}>{r.packageLabel}</span>}
                {r.sessionLabel && <span className="muted" style={{ marginLeft: 'auto', fontSize: 12 }}>Session {r.sessionLabel}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
