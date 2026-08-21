'use client'

import { useMemo, useState, useTransition } from 'react'
import { Download, Paperclip, Plus, Trash2 } from 'lucide-react'
import { MoneyFlowChart, CategoryBars, Legend } from './MoneyCharts'
import { addLedgerEntry, deleteLedgerEntry } from '@/app/admin/finance/actions'
import { LEDGER_CATEGORIES, MONEY_IN_COLOR, MONEY_OUT_COLOR } from '@/lib/ledger'
import type { MoneyReport, LedgerRow } from '@/lib/ledger'
import { useToast } from '@/components/ui/Toast'

const RUPEE = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
const MAX_BILL_BYTES = 2_500_000

/** CSV with the fields quoted — a note containing a comma must not shift columns. */
function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const cell = (v: string | number | null) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))].join('\n')
}

function download(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function DownloadBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="btn btn-outline btn-sm" onClick={onClick} title={`Download ${label} as CSV`}>
      <Download size={13} /> CSV
    </button>
  )
}

/** A figure with its comparison, stated as a direction rather than a bare delta. */
function Compare({ label, now, before, period }: { label: string; now: number; before: number; period: string }) {
  const delta = now - before
  const pct = before > 0 ? Math.round((delta / before) * 100) : null
  const up = delta > 0
  return (
    <div>
      <div className="muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--c-charcoal)', lineHeight: 1.1 }}>
        {RUPEE(now)}
      </div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>
        {before === 0 && now === 0
          ? `nothing ${period}`
          : `${up ? '▲' : delta < 0 ? '▼' : '='} ${RUPEE(Math.abs(delta))}${pct != null ? ` (${Math.abs(pct)}%)` : ''} vs ${period}`}
      </div>
    </div>
  )
}

export function FinanceView({ report, ledger }: { report: MoneyReport; ledger: LedgerRow[] }) {
  const toast = useToast()
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
  const [monthFilter, setMonthFilter] = useState<string>('ALL')

  // Entry form
  const [category, setCategory] = useState(LEDGER_CATEGORIES[0].value)
  const [amount, setAmount] = useState('')
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10))
  const [counterparty, setCounterparty] = useState('')
  const [note, setNote] = useState('')
  const [bill, setBill] = useState<{ name: string; url: string } | null>(null)
  const [billError, setBillError] = useState('')

  const shown = useMemo(
    () => ledger.filter((r) =>
      (filter === 'ALL' || r.direction === filter) &&
      (monthFilter === 'ALL' || r.occurredAt.slice(0, 7) === monthFilter)),
    [ledger, filter, monthFilter],
  )

  const proj = report.projection
  const projectedIn = proj.inPerMonth * proj.months.length
  const projectedOut = proj.outPerMonth * proj.months.length

  function pickBill(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    setBillError('')
    if (!file) return
    if (file.size > MAX_BILL_BYTES) { setBillError(`${file.name} is over 2.5 MB — attach a smaller file.`); return }
    const reader = new FileReader()
    reader.onload = () => setBill({ name: file.name, url: String(reader.result) })
    reader.readAsDataURL(file)
  }

  const save = () => {
    const n = Number(amount)
    if (!Number.isFinite(n) || n <= 0) { toast.error('Enter an amount above zero.'); return }
    start(async () => {
      const res = await addLedgerEntry({
        direction: '', // the server takes direction from the category, not from us
        category, amount: n, occurredAt,
        counterparty, note, billName: bill?.name ?? null, billUrl: bill?.url ?? null,
      })
      if (res.ok) {
        toast.success('Entry recorded')
        setAmount(''); setCounterparty(''); setNote(''); setBill(null); setOpen(false)
      } else toast.error(res.error ?? 'Could not save that entry.')
    })
  }

  const remove = (id: string) => start(async () => {
    const res = await deleteLedgerEntry(id)
    if (res.ok) toast.success('Entry removed')
    else toast.error(res.error ?? 'Could not remove that entry.')
  })

  return (
    <div className="stack">
      {/* ── Headline ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <div className="section-title" style={{ margin: 0 }}>Last 12 months</div>
          <DownloadBtn
            label="summary"
            onClick={() => download('getcalmly-money-by-month.csv', toCsv(
              ['Month', 'Money in', 'Member payments', 'Investment & other', 'Money out', 'Therapist pay', 'Other costs', 'Net'],
              report.months.map((m) => [m.label, m.in, m.revenue, m.investment, m.out, m.therapistPay, m.otherOut, m.net]),
            ))}
          />
        </div>
        <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', margin: '14px 0 18px' }}>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Money in</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: MONEY_IN_COLOR, lineHeight: 1.1 }}>
              {RUPEE(report.totals.in)}
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Money out</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: MONEY_OUT_COLOR, lineHeight: 1.1 }}>
              {RUPEE(report.totals.out)}
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Net</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--c-charcoal)', lineHeight: 1.1 }}>
              {RUPEE(report.totals.net)}
            </div>
          </div>
        </div>
        <MoneyFlowChart months={report.months} />
      </div>

      {/* ── Comparison ── */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>This month vs last</div>
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
            <Compare label="Money in" now={report.compare.monthIn} before={report.compare.prevMonthIn} period="last month" />
            <Compare label="Money out" now={report.compare.monthOut} before={report.compare.prevMonthOut} period="last month" />
          </div>
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>This year vs last</div>
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
            <Compare label="Money in" now={report.compare.yearIn} before={report.compare.prevYearIn} period="last year" />
            <Compare label="Money out" now={report.compare.yearOut} before={report.compare.prevYearOut} period="last year" />
          </div>
        </div>
      </div>

      {/* ── Where it goes ── */}
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <div className="section-title" style={{ margin: 0 }}>Where the money goes</div>
            <DownloadBtn
              label="spend by category"
              onClick={() => download('getcalmly-spend-by-category.csv', toCsv(
                ['Category', 'Amount', 'Entries'],
                report.outByCategory.map((c) => [c.label, c.amount, c.count]),
              ))}
            />
          </div>
          <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 14px' }}>
            Therapist pay is computed from completed, written-up sessions — it is not typed in here.
          </p>
          <CategoryBars rows={report.outByCategory} total={report.totals.out} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <div className="section-title" style={{ margin: 0 }}>Where it comes from</div>
            <DownloadBtn
              label="income by source"
              onClick={() => download('getcalmly-income-by-source.csv', toCsv(
                ['Source', 'Amount', 'Entries'],
                report.inByCategory.map((c) => [c.label, c.amount, c.count]),
              ))}
            />
          </div>
          <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 14px' }}>
            Member payments come from the payments table; investment is entered below.
          </p>
          <CategoryBars rows={report.inByCategory} total={report.totals.in} />
        </div>
      </div>

      {/* ── Projection ── */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Rest of {new Date().getFullYear()}</div>
        <p className="muted" style={{ fontSize: 12.5, margin: '0 0 14px' }}>
          A straight-line estimate, not a forecast: the average of the last {proj.basisMonths} completed
          month{proj.basisMonths === 1 ? '' : 's'}, carried across the {proj.months.length} month
          {proj.months.length === 1 ? '' : 's'} left. The current month is excluded because it is only part-way through.
        </p>
        {proj.months.length === 0 || proj.basisMonths === 0 ? (
          <p className="muted" style={{ fontSize: 13.5 }}>
            {proj.months.length === 0 ? 'The year is done — nothing left to project.' : 'Not enough completed months to project from yet.'}
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Projected in</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: MONEY_IN_COLOR }}>{RUPEE(projectedIn)}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{RUPEE(proj.inPerMonth)}/month</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Projected out</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: MONEY_OUT_COLOR }}>{RUPEE(projectedOut)}</div>
                <div className="muted" style={{ fontSize: 11.5 }}>{RUPEE(proj.outPerMonth)}/month</div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Projected net</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--c-charcoal)' }}>
                  {RUPEE(projectedIn - projectedOut)}
                </div>
                <div className="muted" style={{ fontSize: 11.5 }}>to 31 Dec</div>
              </div>
            </div>
            <Legend items={[{ color: MONEY_IN_COLOR, label: 'Money in' }, { color: MONEY_OUT_COLOR, label: 'Money out' }]} />
          </>
        )}
      </div>

      {/* ── The ledger ── */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div className="section-title" style={{ margin: 0 }}>Ledger</div>
            <p className="muted" style={{ fontSize: 12.5, margin: '2px 0 0' }}>
              Investment in, and every cost that isn&apos;t a session. {shown.length} of {ledger.length} shown.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <DownloadBtn
              label="ledger"
              onClick={() => download('getcalmly-ledger.csv', toCsv(
                ['Date', 'Direction', 'Category', 'Amount', 'Counterparty', 'Note', 'Bill', 'Recorded by'],
                shown.map((r) => [r.dateLabel, r.direction, r.categoryLabel, r.amount, r.counterparty, r.note, r.billName ?? '', r.createdByName]),
              ))}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen((o) => !o)}>
              <Plus size={14} /> {open ? 'Cancel' : 'Record entry'}
            </button>
          </div>
        </div>

        {open && (
          <div style={{ borderTop: '1px solid rgba(28,43,58,.08)', marginTop: 12, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <label style={{ flex: '1 1 200px' }}>
                <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>Category</div>
                <select className="entry-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <optgroup label="Money in">
                    {LEDGER_CATEGORIES.filter((c) => c.direction === 'IN').map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Money out">
                    {LEDGER_CATEGORIES.filter((c) => c.direction === 'OUT').map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </optgroup>
                </select>
              </label>
              <label style={{ flex: '1 1 140px' }}>
                <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>Amount (₹)</div>
                <input className="entry-input" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" />
              </label>
              <label style={{ flex: '1 1 160px' }}>
                <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>Date it moved</div>
                <input className="entry-input" type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <label style={{ flex: '1 1 220px' }}>
                <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>Who paid / who was paid</div>
                <input className="entry-input" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} placeholder="e.g. Google Ads, or a founder's name" />
              </label>
              <label style={{ flex: '2 1 260px' }}>
                <div className="muted" style={{ fontSize: 11.5, marginBottom: 3 }}>What it was for</div>
                <input className="entry-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
              </label>
            </div>
            <div>
              <div className="muted" style={{ fontSize: 11.5, marginBottom: 4 }}>Bill / receipt (≤ 2.5 MB)</div>
              <input type="file" accept="image/*,application/pdf" onChange={pickBill} style={{ fontSize: 13 }} />
              {bill && (
                <span style={{ marginLeft: 10, fontSize: 12.5, color: 'var(--c-charcoal)' }}>
                  <Paperclip size={12} /> {bill.name}
                  <button type="button" onClick={() => setBill(null)} className="link-action" style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>remove</button>
                </span>
              )}
              {billError && <p style={{ color: 'var(--c-coral-d)', fontSize: 12.5, marginTop: 6 }}>{billError}</p>}
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={pending} style={{ alignSelf: 'flex-start' }}>
              {pending ? 'Saving…' : 'Record it'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 10px' }}>
          {(['ALL', 'IN', 'OUT'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className="btn btn-outline btn-sm"
              style={filter === f ? { background: 'var(--c-coral-cta)', color: '#fff', borderColor: 'transparent' } : undefined}>
              {f === 'ALL' ? 'All' : f === 'IN' ? 'Money in' : 'Money out'}
            </button>
          ))}
          <select className="entry-input" style={{ maxWidth: 170 }} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            <option value="ALL">Every month</option>
            {report.months.slice().reverse().map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>

        {shown.length === 0 ? (
          <p className="muted" style={{ fontSize: 13.5 }}>Nothing recorded for that filter.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--c-gray-d)' }}>
                  <th style={{ padding: '8px 10px 8px 0', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Counterparty</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '8px 10px', fontWeight: 600 }}>Bill</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} style={{ borderTop: '1px solid rgba(28,43,58,.07)' }}>
                    <td style={{ padding: '9px 10px 9px 0', whiteSpace: 'nowrap' }}>{r.dateLabel}</td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <i style={{ width: 8, height: 8, borderRadius: 2, background: r.direction === 'IN' ? MONEY_IN_COLOR : MONEY_OUT_COLOR }} />
                        {r.categoryLabel}
                      </span>
                      {r.note && <div className="muted" style={{ fontSize: 11.5 }}>{r.note}</div>}
                    </td>
                    <td style={{ padding: '9px 10px' }}>{r.counterparty ?? '—'}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {r.direction === 'IN' ? '+' : '−'}{RUPEE(r.amount)}
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      {r.hasBill
                        ? <a className="link-action" href={`/admin/finance/bill/${r.id}`} target="_blank" rel="noopener noreferrer">
                            <Paperclip size={12} /> {r.billName}
                          </a>
                        : <span className="muted">—</span>}
                    </td>
                    <td style={{ padding: '9px 0 9px 10px', textAlign: 'right' }}>
                      <button type="button" onClick={() => remove(r.id)} disabled={pending}
                        aria-label="Remove entry" title="Remove"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
