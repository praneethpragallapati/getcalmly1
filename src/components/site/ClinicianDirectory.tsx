'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Clinician } from '@/data/clinicians'

const charcoal = '#1C2B3A'
const charcoalL = '#5F6E7D'
const cream = '#F6F3EF'

type FilterKey = 'all' | 'Psychologist' | 'Psychiatrist'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All clinicians' },
  { key: 'Psychologist', label: 'Psychologists' },
  { key: 'Psychiatrist', label: 'Psychiatrists' },
]

export default function ClinicianDirectory({ clinicians }: { clinicians: Clinician[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')

  // Only offer the type filter when the roster actually spans both types.
  const showFilters = new Set(clinicians.map((c) => c.type)).size > 1

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clinicians.filter((c) => {
      if (filter !== 'all' && c.type !== filter) return false
      if (!q) return true
      const haystack = [
        c.name, c.title, c.type, c.credential,
        ...c.specializations, ...c.tags, ...c.languages,
      ].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [clinicians, filter, query])

  return (
    <div>
      {/* ── Search + filter bar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 34 }}>
        <div style={{ position: 'relative', maxWidth: 560 }}>
          <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 16, opacity: 0.5 }} aria-hidden>
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, concern or specialty — e.g. anxiety, couples, sleep"
            aria-label="Search clinicians"
            style={{
              width: '100%', padding: '15px 18px 15px 46px', borderRadius: 50,
              border: '1.5px solid #E4DDD4', background: '#fff', fontSize: 15,
              color: charcoal, outline: 'none', fontFamily: "'DM Sans', sans-serif",
              boxSizing: 'border-box', boxShadow: '0 2px 10px rgba(28,43,58,.04)',
            }}
          />
        </div>
        <div style={{ display: showFilters ? 'flex' : 'none', gap: 10, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '9px 18px', borderRadius: 50, cursor: 'pointer',
                  fontSize: 13.5, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                  border: active ? '1.5px solid #C8553D' : '1.5px solid #E4DDD4',
                  background: active ? '#C8553D' : '#fff',
                  color: active ? '#fff' : charcoalL,
                  transition: 'all .15s ease',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: charcoalL, marginBottom: 20, fontWeight: 600 }}>
        {results.length} {results.length === 1 ? 'clinician' : 'clinicians'}
        {filter !== 'all' ? ` · ${filter}s` : ''}
        {query.trim() ? ` matching “${query.trim()}”` : ''}
      </p>

      {results.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center', background: '#fff',
          borderRadius: 20, border: '1px solid #EDE6DD',
        }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: charcoal, marginBottom: 6 }}>
            No clinicians match that search.
          </p>
          <p style={{ fontSize: 14, color: charcoalL }}>
            Try a broader term, or clear the filter to see everyone.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gap: 22,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}>
          {results.map((c) => (
            <ClinicianCard key={c.slug} c={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClinicianCard({ c }: { c: Clinician }) {
  return (
    <Link
      href={`/clinicians/${c.slug}`}
      style={{
        display: 'flex', flexDirection: 'column', textDecoration: 'none',
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        border: '1px solid #EDE6DD', boxShadow: '0 4px 18px rgba(28,43,58,.05)',
        transition: 'transform .18s ease, box-shadow .18s ease',
      }}
      className="clinician-card-link"
    >
      {/* Photo or initial monogram */}
      {c.photo ? (
        <div
          role="img"
          aria-label={c.name}
          style={{
            width: '100%', aspectRatio: '1 / 1',
            background: `#E7E2DD url('${c.photo}') center 18%/cover`,
          }}
        />
      ) : (
        <div style={{
          width: '100%', aspectRatio: '1 / 1', display: 'grid', placeItems: 'center',
          background: `linear-gradient(150deg, ${c.accent}1f, ${c.accent}0a)`,
        }}>
          <span style={{
            fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
            fontSize: 68, color: c.accent, letterSpacing: '-1px', lineHeight: 1,
          }}>
            {c.initials}
          </span>
        </div>
      )}

      <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase',
            color: c.accent, background: `${c.accent}14`, padding: '3px 9px', borderRadius: 999,
          }}>
            {c.type}
          </span>
        </div>
        <h3 style={{
          fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
          fontSize: 24, color: charcoal, letterSpacing: '-.3px', lineHeight: 1, margin: '0 0 6px',
        }}>
          {c.name}
        </h3>
        <p style={{ fontSize: 12.5, fontWeight: 600, color: '#B8482F', lineHeight: 1.4, margin: '0 0 12px' }}>
          {c.title}
        </p>
        <p style={{ fontSize: 12.5, color: charcoalL, lineHeight: 1.4, margin: '0 0 14px' }}>
          {c.yearsExp} yrs experience · {c.languages.join(', ')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
          {c.specializations.slice(0, 3).map((s) => (
            <span key={s} style={{
              fontSize: 11, fontWeight: 600, color: charcoalL,
              background: 'rgba(28,43,58,.05)', padding: '4px 10px', borderRadius: 999,
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
