'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import type { PatientRow } from '@/lib/admin'
import { trackLabel } from '@/lib/packageLabels'
import { patientCode } from '@/lib/ids'

const charcoal = '#1C2B3A'
const purple = '#6D5BD0'
const idChip: React.CSSProperties = { fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: purple, background: 'rgba(109,91,208,.1)', padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }
const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 13.5, fontFamily: 'inherit', color: charcoal, background: '#fff' }

type Sort = 'name' | 'sessions' | 'recent' | 'left' | 'tenure'

export function PatientsTable({ rows }: { rows: PatientRow[] }) {
  const [q, setQ] = useState('')
  const [pkg, setPkg] = useState('')
  const [lang, setLang] = useState('')
  const [gender, setGender] = useState('')
  const [stateF, setStateF] = useState('')
  const [therapist, setTherapist] = useState('')
  const [minSessions, setMinSessions] = useState('')
  const [minMonths, setMinMonths] = useState('')
  const [minLeft, setMinLeft] = useState('')
  const [sort, setSort] = useState<Sort>('recent')

  const packages = useMemo(() => Array.from(new Set(rows.flatMap((r) => r.packageTypes))).sort(), [rows])
  const languages = useMemo(() => Array.from(new Set(rows.map((r) => r.language).filter((l): l is string => !!l))).sort(), [rows])
  const genders = useMemo(() => Array.from(new Set(rows.map((r) => r.gender).filter((g): g is string => !!g))).sort(), [rows])
  const states = useMemo(() => Array.from(new Set(rows.map((r) => r.state).filter((s): s is string => !!s))).sort(), [rows])
  const therapists = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of rows) if (r.therapistId) m.set(r.therapistId, r.therapistName ?? 'Clinician')
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [rows])
  const hasUnassigned = useMemo(() => rows.some((r) => !r.therapistId), [rows])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const min = Number(minSessions) || 0
    const months = Number(minMonths) || 0
    const left = Number(minLeft) || 0
    let list = rows.filter((r) => {
      if (needle) {
        const hay = `${r.name} ${r.email} ${r.registrationNo ?? ''} ${patientCode(r.userId)}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (pkg && !r.packageTypes.includes(pkg)) return false
      if (lang && r.language !== lang) return false
      if (gender && r.gender !== gender) return false
      if (stateF && r.state !== stateF) return false
      if (therapist === '__none__' && r.therapistId) return false
      if (therapist && therapist !== '__none__' && r.therapistId !== therapist) return false
      if (min && r.sessionsCompleted < min) return false
      if (months && r.monthsHere < months) return false
      if (left && r.sessionsLeft < left) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'sessions') return b.sessionsCompleted - a.sessionsCompleted
      if (sort === 'left') return b.sessionsLeft - a.sessionsLeft
      if (sort === 'tenure') return b.monthsHere - a.monthsHere
      return b.joinedIso.localeCompare(a.joinedIso)
    })
    return list
  }, [rows, q, pkg, lang, gender, stateF, therapist, minSessions, minMonths, minLeft, sort])

  const activeFilters = [pkg, lang, gender, stateF, therapist, minSessions, minMonths, minLeft].filter(Boolean).length + (q.trim() ? 1 : 0)

  return (
    <div className="stack">
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 240px', minWidth: 200 }}>
          <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Search name, email or ID</div>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#8E9EAE' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Ananya, P-9F3K21…" style={{ ...field, width: '100%', paddingLeft: 34, boxSizing: 'border-box' }} />
          </div>
        </div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Package type</div>
          <select value={pkg} onChange={(e) => setPkg(e.target.value)} style={{ ...field, minWidth: 150 }}>
            <option value="">All packages</option>
            {packages.map((p) => <option key={p} value={p}>{trackLabel(p)}</option>)}
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Therapist</div>
          <select value={therapist} onChange={(e) => setTherapist(e.target.value)} style={{ ...field, minWidth: 170 }}>
            <option value="">All therapists</option>
            {therapists.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            {hasUnassigned && <option value="__none__">— Unassigned —</option>}
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Language</div>
          <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ ...field, minWidth: 130 }}>
            <option value="">All languages</option>
            {languages.map((l) => <option key={l} value={l}>{l}</option>)}
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Gender</div>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ ...field, minWidth: 120 }}>
            <option value="">Any</option>
            {genders.map((g) => <option key={g} value={g}>{g}</option>)}
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>State</div>
          <select value={stateF} onChange={(e) => setStateF(e.target.value)} style={{ ...field, minWidth: 140 }}>
            <option value="">All states</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Min. sessions done</div>
          <input type="number" min={0} value={minSessions} onChange={(e) => setMinSessions(e.target.value)} placeholder="0" style={{ ...field, width: 100 }} /></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Min. sessions left</div>
          <input type="number" min={0} value={minLeft} onChange={(e) => setMinLeft(e.target.value)} placeholder="0" style={{ ...field, width: 100 }} /></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Min. months here</div>
          <input type="number" min={0} value={minMonths} onChange={(e) => setMinMonths(e.target.value)} placeholder="0" style={{ ...field, width: 100 }} /></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Sort</div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} style={{ ...field, minWidth: 150 }}>
            <option value="recent">Newest first</option>
            <option value="tenure">Longest here</option>
            <option value="sessions">Most sessions</option>
            <option value="left">Most sessions left</option>
            <option value="name">Name (A–Z)</option>
          </select></div>
        {activeFilters > 0 && (
          <button className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, padding: '9px 12px' }}
            onClick={() => { setQ(''); setPkg(''); setLang(''); setGender(''); setStateF(''); setTherapist(''); setMinSessions(''); setMinMonths(''); setMinLeft(''); setSort('recent') }}>
            Clear filters
          </button>
        )}
      </div>

      <div className="page-meta" style={{ fontSize: 12.5 }}>
        Showing {filtered.length} of {rows.length} patient{rows.length === 1 ? '' : 's'}{activeFilters > 0 ? ` · ${activeFilters} filter${activeFilters === 1 ? '' : 's'} active` : ''}
      </div>

      {filtered.length === 0 ? (
        <div className="card"><p className="muted">No patients match these filters.</p></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.map((p) => (
            <Link key={p.userId} href={`/admin/patients/${p.userId}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid rgba(28,43,58,.07)', textDecoration: 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{p.name}</span>
                  <span title="Member ID" style={idChip}>{p.registrationNo ?? patientCode(p.userId)}</span>
                  {p.packageTypes.map((t) => (
                    <span key={t} style={{ fontSize: 10.5, fontWeight: 700, color: '#2C7A57', background: 'rgba(61,158,114,.1)', padding: '2px 8px', borderRadius: 20 }}>{trackLabel(t)}</span>
                  ))}
                </div>
                <div className="muted" style={{ fontSize: 12.5 }}>
                  {p.email}{p.therapistName ? ` · ${p.therapistName}` : ''}{p.language ? ` · ${p.language}` : ''}{p.state ? ` · ${p.state}` : ''} · {p.monthsHere} mo here
                </div>
              </div>
              {/* Every package, named. The aggregate alone ("14 left") sat beside
                  a Psychiatry chip and an Individual therapy chip without saying
                  which one it counted, or whether it counted both. Admin is the
                  view that has to reconcile the whole picture, so it gets the
                  breakdown; an expired package is shown too, marked. */}
              <span className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap', textAlign: 'right' }}>
                {p.sessionsCompleted} done · {p.sessionsLeft} left<br />
                {p.packageLines.length > 0 ? (
                  <span style={{ fontSize: 11 }}>
                    {p.packageLines.map((l) => `${l.label} ${l.used}/${l.total}${l.active ? '' : ' (ended)'}`).join(' · ')}
                  </span>
                ) : (
                  <span style={{ fontSize: 11 }}>no package</span>
                )}
              </span>
              <ChevronRight size={16} style={{ color: '#8E9EAE', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
