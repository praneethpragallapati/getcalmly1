'use client'

import { Fragment, useMemo, useState } from 'react'
import { Download, ChevronDown, IndianRupee, CalendarDays, TrendingUp } from 'lucide-react'
import type { Earnings, EarningLine } from '@/lib/expert'
import { fmtIST } from '@/lib/tz'
import { addressOneLine, legalName, supportEmail } from '@/config/site'

const coral = '#C8553D'
const charcoal = '#1C2B3A'

function inr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

type Grain = 'daily' | 'monthly' | 'yearly'
type Bucket = { key: string; label: string; lines: EarningLine[]; total: number; sessions: number }

function group(lines: EarningLine[], grain: Grain): Bucket[] {
  const map = new Map<string, Bucket>()
  for (const l of lines) {
    const key = grain === 'daily' ? l.dateIso : grain === 'monthly' ? l.monthKey : String(l.year)
    const label = grain === 'daily' ? l.dayLabel : grain === 'monthly' ? l.monthLabel : String(l.year)
    const b = map.get(key) ?? { key, label, lines: [], total: 0, sessions: 0 }
    b.lines.push(l)
    b.total += l.amount
    b.sessions += 1
    map.set(key, b)
  }
  // Keys are ISO-ish and sort lexicographically newest-last, so reverse for desc.
  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1))
}

/** Build a branded, printable statement in a new window (Save as PDF from print). */
function printStatement(opts: {
  clinicianName: string
  designation: string
  periodLabel: string
  lines: EarningLine[]
}) {
  const { clinicianName, designation, periodLabel, lines } = opts
  const total = lines.reduce((s, l) => s + l.amount, 0)
  const generated = fmtIST(new Date(), {
    day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
  const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string))
  const rows = lines
    .map(
      (l) => `<tr>
        <td>${esc(l.dayLabel)}<span class="t">${esc(l.timeLabel)}</span></td>
        <td>${esc(l.patientName)}</td>
        <td>${esc(l.serviceLabel)}</td>
        <td class="c">#${l.sessionNumber}</td>
        <td class="c">${l.night ? 'Night' : '—'}</td>
        <td class="r">${inr(l.base)}</td>
        <td class="r">${inr(l.numberBonus + l.nightBonus + l.misc)}</td>
        <td class="r b">${inr(l.amount)}</td>
      </tr>`,
    )
    .join('')

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>GetCalmly earnings statement</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}
    body{color:${charcoal};padding:40px;}
    .hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid ${coral};padding-bottom:18px;margin-bottom:22px;}
    .brand{font-weight:900;font-size:26px;letter-spacing:-1px;color:${coral};}
    .brand small{color:${charcoal};font-size:13px;font-weight:800;vertical-align:top;margin-right:1px;}
    .brand .co{color:${charcoal};}
    .meta{text-align:right;font-size:12px;color:#6B7D8E;line-height:1.6;}
    h1{font-size:19px;margin-bottom:4px;}
    .sub{font-size:13px;color:#6B7D8E;margin-bottom:20px;}
    .who{font-size:13px;color:${charcoal};margin-bottom:2px;}
    .who b{font-size:15px;}
    table{width:100%;border-collapse:collapse;margin-top:14px;font-size:12px;}
    th{text-align:left;background:#FBF3F0;color:${charcoal};padding:9px 10px;border-bottom:2px solid #EADFD9;font-size:11px;text-transform:uppercase;letter-spacing:.4px;}
    td{padding:9px 10px;border-bottom:1px solid #EEE;}
    td.c{text-align:center;} td.r{text-align:right;} td.b{font-weight:800;}
    td .t{display:block;font-size:10px;color:#9AA6B2;}
    tfoot td{border-top:2px solid ${charcoal};font-weight:900;font-size:14px;padding-top:12px;}
    .note{margin-top:22px;font-size:11px;color:#9AA6B2;line-height:1.6;border-top:1px solid #EEE;padding-top:14px;}
    @media print{body{padding:0;}}
  </style></head><body>
    <div class="hd">
      <div>
        <div class="brand"><small>get</small>Calmly<span class="co">.</span></div>
        <div style="font-size:11px;color:#9AA6B2;margin-top:4px;">Mental healthcare, powered by experts</div>
      </div>
      <div class="meta">${esc(legalName)}<br/>${esc(addressOneLine)}<br/>Generated ${esc(generated)}</div>
    </div>
    <h1>Earnings statement</h1>
    <div class="sub">${esc(periodLabel)}</div>
    <div class="who"><b>${esc(clinicianName)}</b></div>
    <div class="who" style="color:#6B7D8E;">${esc(designation)}</div>
    <table>
      <thead><tr>
        <th>Session</th><th>Patient</th><th>Service</th><th style="text-align:center">No.</th>
        <th style="text-align:center">Slot</th><th style="text-align:right">Base</th>
        <th style="text-align:right">Bonuses</th><th style="text-align:right">Earned</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:#9AA6B2;padding:24px;">No sessions in this period.</td></tr>'}</tbody>
      <tfoot><tr>
        <td colspan="7" style="text-align:right;">Total (${lines.length} session${lines.length === 1 ? '' : 's'})</td>
        <td class="r">${inr(total)}</td>
      </tr></tfoot>
    </table>
    <p class="note">This statement reflects completed sessions with a written clinical note. Amounts are computed from the platform pay structure (base fee per service + session-number bonus + night bonus + misc). For payout queries, contact ${esc(supportEmail)}.</p>
    <script>window.onload=function(){setTimeout(function(){window.print();},250);};</script>
  </body></html>`

  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return
  w.document.open()
  w.document.write(html)
  w.document.close()
}

export function EarningsView({
  earnings, clinicianName, designation,
}: {
  earnings: Earnings; clinicianName: string; designation: string
}) {
  const [grain, setGrain] = useState<Grain>('monthly')
  const [open, setOpen] = useState<string | null>(null)

  const buckets = useMemo(() => group(earnings.lines, grain), [earnings.lines, grain])
  const c = earnings.config

  const grainLabel: Record<Grain, string> = { daily: 'Day', monthly: 'Month', yearly: 'Year' }

  return (
    <div className="stack">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title">Earnings</div>
          <div className="page-meta">Per-session payouts · a session counts once its clinical note is written</div>
        </div>
        <button
          onClick={() => printStatement({ clinicianName, designation, periodLabel: 'All time', lines: earnings.lines })}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Download size={15} /> Download full statement
        </button>
      </div>

      {/* Summary */}
      <div className="grid-3">
        <div className="card">
          <div className="eyebrow">TOTAL EARNED</div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <IndianRupee size={17} /> {earnings.totalEarned.toLocaleString('en-IN')}
          </div>
          <div className="muted">{earnings.totalSessions} paid sessions to date</div>
        </div>
        <div className="card">
          <div className="eyebrow">THIS MONTH</div>
          <div className="section-title">{inr(earnings.thisMonthTotal)}</div>
          <div className="muted">{earnings.thisMonthSessions} sessions</div>
        </div>
        <div className="card">
          <div className="eyebrow">PAYOUTS</div>
          <div className="section-title">Razorpay</div>
          <div className="muted">Settled after each session is noted</div>
        </div>
      </div>

      {/* Pay structure with the three base fees */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Your pay structure</div>
        <p className="muted" style={{ marginBottom: 14 }}>
          Each session pays a base fee for its service, plus a session-number bonus, a night-slot bonus where it applies, and any misc.
        </p>
        <div className="grid-3" style={{ marginBottom: 6 }}>
          {[
            ['Individual therapy', c.baseFeeIndividual],
            ['Couples therapy', c.baseFeeCouples],
            ['Psychiatry', c.baseFeePsychiatry],
          ].map(([label, val]) => (
            <div key={label as string} style={{ background: 'rgba(200,85,61,.05)', border: '1px solid rgba(200,85,61,.15)', borderRadius: 12, padding: '14px 16px' }}>
              <div className="muted" style={{ fontSize: 12 }}>{label} · base</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: charcoal }}>{inr(val as number)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {[
            ['2nd session', c.secondSessionBonus],
            ['3rd+ session', c.thirdOnwardsBonus],
            ['Night slot · 11 PM–6 AM', c.nightSessionBonus],
            ['Misc', c.miscBonus],
          ].map(([label, val]) => (
            <span key={label as string} style={{ fontSize: 12.5, color: '#6B7D8E', background: 'rgba(28,43,58,.05)', padding: '5px 11px', borderRadius: 20 }}>
              {label}: <b style={{ color: charcoal }}>+{inr(val as number)}</b>
            </span>
          ))}
        </div>
      </div>

      {/* Grain tabs */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10 }}>
            {(['daily', 'monthly', 'yearly'] as Grain[]).map((g) => (
              <button
                key={g}
                onClick={() => { setGrain(g); setOpen(null) }}
                style={{
                  border: 'none', cursor: 'pointer', padding: '8px 18px', borderRadius: 7, fontSize: 13.5, fontWeight: 700,
                  textTransform: 'capitalize', fontFamily: 'inherit',
                  background: grain === g ? '#fff' : 'transparent',
                  color: grain === g ? coral : '#8E9EAE',
                  boxShadow: grain === g ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
                }}
              >
                {g}
              </button>
            ))}
          </div>
          <span className="muted" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {grain === 'yearly' ? <TrendingUp size={14} /> : <CalendarDays size={14} />}
            {buckets.length} {grainLabel[grain].toLowerCase()}{buckets.length === 1 ? '' : 's'} with earnings
          </span>
        </div>

        {buckets.length === 0 && (
          <p className="muted">No paid sessions yet. Sessions appear here once you complete them and write the note.</p>
        )}

        {buckets.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--c-line)' }}>
                <th style={{ padding: '8px 4px', fontWeight: 600, fontSize: 12.5, color: 'var(--c-gray-d)' }}>{grainLabel[grain]}</th>
                <th style={{ padding: '8px 4px', fontWeight: 600, fontSize: 12.5, color: 'var(--c-gray-d)' }}>Sessions</th>
                <th style={{ padding: '8px 4px', fontWeight: 600, fontSize: 12.5, color: 'var(--c-gray-d)' }}>Earned</th>
                <th style={{ padding: '8px 4px', fontWeight: 600, fontSize: 12.5, color: 'var(--c-gray-d)', textAlign: 'right' }}>Statement</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => (
                <Fragment key={b.key}>
                  <tr style={{ borderBottom: open === b.key ? 'none' : '1px solid var(--c-line)' }}>
                    <td style={{ padding: '10px 4px' }}>
                      <button
                        onClick={() => setOpen(open === b.key ? null : b.key)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: charcoal, fontFamily: 'inherit', padding: 0 }}
                      >
                        <ChevronDown size={15} style={{ transform: open === b.key ? 'rotate(180deg)' : 'none', transition: 'transform .15s', color: '#8E9EAE' }} />
                        {b.label}
                      </button>
                    </td>
                    <td style={{ padding: '10px 4px' }}>{b.sessions}</td>
                    <td style={{ padding: '10px 4px', fontWeight: 700 }}>{inr(b.total)}</td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                      <button
                        onClick={() => printStatement({ clinicianName, designation, periodLabel: b.label, lines: b.lines })}
                        className="link-action"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Download size={14} /> Download
                      </button>
                    </td>
                  </tr>
                  {open === b.key && (
                    <tr style={{ borderBottom: '1px solid var(--c-line)' }}>
                      <td colSpan={4} style={{ padding: '0 4px 12px' }}>
                        <div style={{ background: 'rgba(28,43,58,.03)', borderRadius: 10, padding: '6px 12px' }}>
                          {b.lines.map((l) => (
                            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(28,43,58,.06)', fontSize: 12.5 }}>
                              <span style={{ width: 130, color: '#6B7D8E', flexShrink: 0 }}>{l.dayLabel.replace(/, \d{4}$/, '')} · {l.timeLabel}</span>
                              <span style={{ flex: 1, fontWeight: 600, color: charcoal }}>{l.patientName}</span>
                              <span style={{ color: '#8E9EAE', width: 120 }}>{l.serviceLabel}</span>
                              <span style={{ color: '#8E9EAE', width: 60 }}>#{l.sessionNumber}{l.night ? ' · night' : ''}</span>
                              <span style={{ fontWeight: 700, width: 70, textAlign: 'right' }}>{inr(l.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
