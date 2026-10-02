'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

export type InvoiceItem = { id: string; label: string; amount: number; dateLabel: string; dateIso: string }

const SHOWN = 5

/**
 * Payment history on Manage plan: the latest five, "View all" for the rest,
 * and filters for this month, this year and each earlier year with payments.
 */
export function InvoiceList({ invoices }: { invoices: InvoiceItem[] }) {
  const now = new Date()
  const thisYear = now.getFullYear()
  const earlierYears = [...new Set(invoices.map((i) => new Date(i.dateIso).getFullYear()))]
    .filter((y) => y < thisYear)
    .sort((a, b) => b - a)
  const [filter, setFilter] = useState<string>('all')
  const [all, setAll] = useState(false)

  const filtered = invoices.filter((i) => {
    const d = new Date(i.dateIso)
    if (filter === 'month') return d.getFullYear() === thisYear && d.getMonth() === now.getMonth()
    if (filter === 'year') return d.getFullYear() === thisYear
    if (filter !== 'all') return d.getFullYear() === Number(filter)
    return true
  })
  const shown = all ? filtered : filtered.slice(0, SHOWN)

  const chips: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'month', label: 'This month' },
    { key: 'year', label: 'This year' },
    ...earlierYears.map((y) => ({ key: String(y), label: String(y) })),
  ]

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div className="section-title">Invoices</div>
        <div role="group" aria-label="Filter invoices" style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', background: 'rgba(28,43,58,.05)', padding: 3, borderRadius: 999 }}>
          {chips.map((c) => {
            const on = filter === c.key
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => { setFilter(c.key); setAll(false) }}
                style={{
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
                  padding: '6px 12px', borderRadius: 999,
                  background: on ? 'var(--c-white, #fff)' : 'transparent',
                  color: on ? 'var(--c-charcoal)' : 'var(--c-gray-d)',
                  boxShadow: on ? '0 1px 4px rgba(28,43,58,.1)' : 'none',
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
        {shown.length === 0 && (
          <p className="muted" style={{ fontSize: 13.5, padding: '12px 0 2px', margin: 0 }}>No invoices for this period.</p>
        )}
        {shown.map((inv) => (
          <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid var(--c-line)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-charcoal)' }}>{inv.label}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{inv.dateLabel} · ₹{inv.amount.toLocaleString('en-IN')}</div>
            </div>
            <a href={`/app/billing/invoice/${inv.id}`} target="_blank" rel="noopener" className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Download size={14} /> Invoice
            </a>
          </div>
        ))}
      </div>

      {filtered.length > SHOWN && (
        <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => setAll((v) => !v)}>
          {all ? 'Show fewer' : `View all ${filtered.length}`}
        </button>
      )}
    </div>
  )
}
