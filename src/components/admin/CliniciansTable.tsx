'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Search, Star } from 'lucide-react'
import type { ClinicianRow } from '@/lib/admin'
import { expertCode } from '@/lib/ids'

const charcoal = '#1C2B3A'
const purple = '#6D5BD0'
const idChip: React.CSSProperties = { fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: purple, background: 'rgba(109,91,208,.1)', padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }
const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 13.5, fontFamily: 'inherit', color: charcoal, background: '#fff' }

type Sort = 'name' | 'rating' | 'sessions'

export function CliniciansTable({ rows }: { rows: ClinicianRow[] }) {
  const [q, setQ] = useState('')
  const [designation, setDesignation] = useState('')
  const [employment, setEmployment] = useState('')
  const [lang, setLang] = useState('')
  const [status, setStatus] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sort, setSort] = useState<Sort>('name')

  const designations = useMemo(() => Array.from(new Set(rows.map((r) => r.designation).filter(Boolean))).sort(), [rows])
  const languages = useMemo(() => Array.from(new Set(rows.flatMap((r) => r.languages))).sort(), [rows])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const min = Number(minRating) || 0
    let list = rows.filter((r) => {
      if (needle) {
        const hay = `${r.name} ${r.email} ${expertCode(r.profileId)} ${r.specializations.join(' ')}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      if (designation && r.designation !== designation) return false
      if (employment && r.employmentType !== employment) return false
      if (lang && !r.languages.includes(lang)) return false
      if (status === 'active' && !r.isActive) return false
      if (status === 'inactive' && r.isActive) return false
      if (status === 'verified' && !r.isVerified) return false
      if (status === 'unverified' && r.isVerified) return false
      if (min && r.rating < min) return false
      return true
    })
    list = [...list].sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'sessions') return b.sessionsCompleted - a.sessionsCompleted
      return Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name)
    })
    return list
  }, [rows, q, designation, employment, lang, status, minRating, sort])

  const activeFilters = [designation, employment, lang, status, minRating].filter(Boolean).length + (q.trim() ? 1 : 0)

  return (
    <div className="stack">
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 220px', minWidth: 190 }}>
          <div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Search name, email, ID, specialty</div>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#8E9EAE' }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Rohan, E-7B2Q08, anxiety…" style={{ ...field, width: '100%', paddingLeft: 34, boxSizing: 'border-box' }} />
          </div>
        </div>
        {designations.length > 0 && (
          <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Designation</div>
            <select value={designation} onChange={(e) => setDesignation(e.target.value)} style={{ ...field, minWidth: 150 }}>
              <option value="">All</option>
              {designations.map((d) => <option key={d} value={d}>{d}</option>)}
            </select></div>
        )}
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Employment</div>
          <select value={employment} onChange={(e) => setEmployment(e.target.value)} style={{ ...field, minWidth: 120 }}>
            <option value="">Any</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
          </select></div>
        {languages.length > 0 && (
          <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Language</div>
            <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ ...field, minWidth: 120 }}>
              <option value="">All languages</option>
              {languages.map((l) => <option key={l} value={l}>{l}</option>)}
            </select></div>
        )}
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Status</div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...field, minWidth: 130 }}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Min. rating</div>
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ ...field, minWidth: 100 }}>
            <option value="">Any</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3">3.0+</option>
          </select></div>
        <div><div className="muted" style={{ fontSize: 11, marginBottom: 3 }}>Sort</div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} style={{ ...field, minWidth: 140 }}>
            <option value="name">Name (A–Z)</option>
            <option value="rating">Highest rated</option>
            <option value="sessions">Most sessions</option>
          </select></div>
        {activeFilters > 0 && (
          <button className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, padding: '9px 12px' }}
            onClick={() => { setQ(''); setDesignation(''); setEmployment(''); setLang(''); setStatus(''); setMinRating(''); setSort('name') }}>
            Clear filters
          </button>
        )}
      </div>

      <div className="page-meta" style={{ fontSize: 12.5 }}>
        Showing {filtered.length} of {rows.length} clinician{rows.length === 1 ? '' : 's'}{activeFilters > 0 ? ` · ${activeFilters} filter${activeFilters === 1 ? '' : 's'} active` : ''}
      </div>

      {filtered.length === 0 ? (
        <div className="card"><p className="muted">No clinicians match these filters.</p></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.map((c) => (
            <Link key={c.profileId} href={`/admin/therapists/${c.profileId}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', borderBottom: '1px solid rgba(28,43,58,.07)', textDecoration: 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{c.name}</span>
                  <span style={idChip}>{expertCode(c.profileId)}</span>
                  {!c.isActive && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#C0504B', background: 'rgba(192,80,75,.1)', padding: '2px 8px', borderRadius: 20 }}>Inactive</span>}
                  {!c.isVerified && <span style={{ fontSize: 10.5, fontWeight: 700, color: '#C9973A', background: 'rgba(201,151,58,.12)', padding: '2px 8px', borderRadius: 20 }}>Unverified</span>}
                </div>
                <div className="muted" style={{ fontSize: 12.5 }}>{c.designation} · {c.email}{c.sessionsCompleted > 0 ? ` · ${c.sessionsCompleted} sessions` : ''}</div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: c.employmentType === 'PART_TIME' ? '#1A7F7A' : '#3E6E9C', background: c.employmentType === 'PART_TIME' ? 'rgba(26,127,122,.1)' : 'rgba(62,110,156,.1)', padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                {c.employmentType === 'PART_TIME' ? 'Part-time' : 'Full-time'}
              </span>
              {c.totalReviews > 0 && (
                <span className="muted" style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  <Star size={12} style={{ color: '#C9973A' }} /> {c.rating.toFixed(1)}
                </span>
              )}
              <ChevronRight size={16} style={{ color: '#8E9EAE', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
