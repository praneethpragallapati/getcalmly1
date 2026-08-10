'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Search, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { CaseloadPatient, MoodTrend } from '@/lib/expert'
import { trackLabel } from '@/lib/packageLabels'
import { patientCode } from '@/lib/ids'

const TREND_ICON: Record<MoodTrend, typeof TrendingUp> = {
  improving: TrendingUp,
  declining: TrendingDown,
  stable: Minus,
  insufficient: Minus,
}
const TREND_CLASS: Record<MoodTrend, string> = {
  improving: 't-green',
  declining: 't-coral',
  stable: 't-purple',
  insufficient: 't-gold',
}
const TREND_RANK: Record<MoodTrend, number> = { declining: 0, insufficient: 1, stable: 2, improving: 3 }

const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 13.5, fontFamily: 'inherit', color: 'var(--c-ink, #1C2B3A)', background: '#fff' }

type Sort = 'name' | 'sessions' | 'attention' | 'left' | 'tenure'

export function CaseloadTable({ patients }: { patients: CaseloadPatient[] }) {
  const [q, setQ] = useState('')
  const [pkg, setPkg] = useState('')
  const [lang, setLang] = useState('')
  const [stateF, setStateF] = useState('')
  const [minSessions, setMinSessions] = useState('')
  const [minMonths, setMinMonths] = useState('')
  const [minLeft, setMinLeft] = useState('')
  const [sort, setSort] = useState<Sort>('name')

  const packages = useMemo(() => Array.from(new Set(patients.flatMap((p) => p.packageTypes))).sort(), [patients])
  const languages = useMemo(() => Array.from(new Set(patients.map((p) => p.language).filter((l): l is string => !!l))).sort(), [patients])
  const states = useMemo(() => Array.from(new Set(patients.map((p) => p.state).filter((s): s is string => !!s))).sort(), [patients])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const min = Number(minSessions) || 0
    const months = Number(minMonths) || 0
    const left = Number(minLeft) || 0
    let list = patients.filter((p) => {
      if (needle) {
        const hay = `${p.name} ${p.email} ${patientCode(p.patientId)}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (pkg && !p.packageTypes.includes(pkg)) return false
      if (lang && p.language !== lang) return false
      if (stateF && p.state !== stateF) return false
      if (min && p.sessionsCompleted < min) return false
      if (months && p.monthsHere < months) return false
      if (left && p.sessionsLeft < left) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'sessions') return b.sessionsCompleted - a.sessionsCompleted
      if (sort === 'left') return b.sessionsLeft - a.sessionsLeft
      if (sort === 'tenure') return b.monthsHere - a.monthsHere
      if (sort === 'attention') return TREND_RANK[a.moodTrend] - TREND_RANK[b.moodTrend] || b.openCrisisCount - a.openCrisisCount
      return a.name.localeCompare(b.name)
    })
    return list
  }, [patients, q, pkg, lang, stateF, minSessions, minMonths, minLeft, sort])

  const activeFilters = [pkg, lang, stateF, minSessions, minMonths, minLeft].filter(Boolean).length + (q.trim() ? 1 : 0)

  return (
    <div className="stack">
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 220px', minWidth: 190 }}>
          <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Search name, email or ID</div>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#8E9EAE' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Sana, P-9F3K21…" style={{ ...field, width: '100%', paddingLeft: 34, boxSizing: 'border-box' }} />
          </div>
        </div>
        {packages.length > 0 && (
          <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Package type</div>
            <select value={pkg} onChange={(e) => setPkg(e.target.value)} style={{ ...field, minWidth: 150 }}>
              <option value="">All packages</option>
              {packages.map((p) => <option key={p} value={p}>{trackLabel(p)}</option>)}
            </select></div>
        )}
        {languages.length > 0 && (
          <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Language</div>
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ ...field, minWidth: 130 }}>
              <option value="">All languages</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select></div>
        )}
        {states.length > 0 && (
          <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>State</div>
            <select value={stateF} onChange={(e) => setStateF(e.target.value)} style={{ ...field, minWidth: 140 }}>
              <option value="">All states</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
        )}
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Min. sessions done</div>
          <input type="number" min={0} value={minSessions} onChange={(e) => setMinSessions(e.target.value)} placeholder="0" style={{ ...field, width: 100 }} /></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Min. sessions left</div>
          <input type="number" min={0} value={minLeft} onChange={(e) => setMinLeft(e.target.value)} placeholder="0" style={{ ...field, width: 100 }} /></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Min. months here</div>
          <input type="number" min={0} value={minMonths} onChange={(e) => setMinMonths(e.target.value)} placeholder="0" style={{ ...field, width: 100 }} /></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Sort</div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} style={{ ...field, minWidth: 150 }}>
            <option value="name">Name (A–Z)</option>
            <option value="sessions">Most sessions</option>
            <option value="left">Most sessions left</option>
            <option value="tenure">Longest here</option>
            <option value="attention">Needs attention</option>
          </select></div>
        {activeFilters > 0 && (
          <button className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, padding: '9px 12px' }}
            onClick={() => { setQ(''); setPkg(''); setLang(''); setStateF(''); setMinSessions(''); setMinMonths(''); setMinLeft(''); setSort('name') }}>
            Clear filters
          </button>
        )}
      </div>

      <div className="page-meta" style={{ fontSize: 12.5 }}>
        Showing {filtered.length} of {patients.length} patient{patients.length === 1 ? '' : 's'}{activeFilters > 0 ? ` · ${activeFilters} filter${activeFilters === 1 ? '' : 's'} active` : ''}
      </div>

      <div className="card">
        {filtered.length === 0 && <p className="muted">No patients match these filters.</p>}
        {filtered.map((p) => {
          const Icon = TREND_ICON[p.moodTrend]
          return (
            <Link key={p.patientId} href={`/expert/patients/${p.patientId}`} className="pattern" style={{ textDecoration: 'none' }}>
              <span className={`pattern-ic ${TREND_CLASS[p.moodTrend]}`}>
                <Icon size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="pattern-title" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {p.name}
                  <span style={{ fontSize: 10.5, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: 'var(--c-gray-d)', background: 'rgba(28,43,58,.06)', padding: '1px 6px', borderRadius: 5 }}>{patientCode(p.patientId)}</span>
                </div>
                <div className="pattern-sub">
                  {p.trackLabel} · Mood {p.moodTrend} · {p.sessionsCompleted} completed · {p.sessionsLeft} left{p.state ? ` · ${p.state}` : ''} · {p.monthsHere} mo
                </div>
              </div>
              {p.openCrisisCount > 0 && (
                <span className="pattern-sub" style={{ color: 'var(--c-coral)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={13} /> {p.openCrisisCount} open
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
