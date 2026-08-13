'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Pin, PinOff } from 'lucide-react'
import { createPoll, deletePoll, togglePollPin } from '@/app/admin/actions'
import { useToast } from '@/components/ui/Toast'
import type { PollView } from '@/lib/polls'

const charcoal = '#1C2B3A'
const purple = '#6D5BD0'
const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', color: charcoal, background: '#fff', width: '100%', boxSizing: 'border-box' }

export function PollAdmin({ polls }: { polls: PollView[] }) {
  const router = useRouter()
  const toast = useToast()
  const [pending, start] = useTransition()
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [expiresAt, setExpiresAt] = useState('')

  const setOpt = (i: number, v: string) => setOptions((o) => o.map((x, k) => (k === i ? v : x)))
  const addOpt = () => setOptions((o) => (o.length < 8 ? [...o, ''] : o))
  const removeOpt = (i: number) => setOptions((o) => (o.length > 2 ? o.filter((_, k) => k !== i) : o))

  function create() {
    const opts = options.map((o) => o.trim()).filter(Boolean)
    if (!question.trim()) return toast.error('Add a question.')
    if (opts.length < 2) return toast.error('Add at least two options.')
    start(async () => {
      const res = await createPoll({ question, options: opts, expiresAt: expiresAt || null })
      if (res.ok) { toast.success('Poll created.'); setQuestion(''); setOptions(['', '']); setExpiresAt(''); router.refresh() }
      else toast.error(res.error ?? 'Could not create the poll.')
    })
  }

  function remove(id: string) {
    start(async () => {
      const res = await deletePoll({ id })
      if (res.ok) { toast.success('Poll deleted.'); router.refresh() }
      else toast.error(res.error ?? 'Could not delete.')
    })
  }

  function togglePin(id: string, pinned: boolean) {
    start(async () => {
      const res = await togglePollPin({ id, pinned })
      if (res.ok) { toast.success(pinned ? 'Pinned to top.' : 'Unpinned.'); router.refresh() }
      else toast.error(res.error ?? 'Could not update.')
    })
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Create a Calm Club poll</div>
        <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>
          Members see this in the Community feed and vote once. Set an expiry to close voting automatically.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640 }}>
          <div>
            <label className="muted" style={{ fontSize: 11.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>Question</label>
            <input style={field} value={question} maxLength={200} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What helps you unwind after a hard day?" />
          </div>
          <div>
            <label className="muted" style={{ fontSize: 11.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>Options (2–8)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {options.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input style={field} value={o} maxLength={80} onChange={(e) => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                  {options.length > 2 && (
                    <button onClick={() => removeOpt(i)} className="btn" style={{ border: '1.5px solid #E2E8F0', padding: '8px 9px' }} title="Remove option"><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 8 && (
              <button onClick={addOpt} className="btn" style={{ border: '1.5px solid #E2E8F0', fontSize: 12.5, padding: '7px 11px', marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Plus size={14} /> Add option
              </button>
            )}
          </div>
          <div style={{ maxWidth: 280 }}>
            <label className="muted" style={{ fontSize: 11.5, fontWeight: 600, display: 'block', marginBottom: 4 }}>Closes at <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(optional)</span></label>
            <input type="datetime-local" style={field} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
          <div>
            <button onClick={create} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>Create poll</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Polls ({polls.length})</div>
        {polls.length === 0 && <p className="muted" style={{ fontSize: 13.5 }}>No polls yet.</p>}
        <div className="stack" style={{ gap: 12 }}>
          {polls.map((p) => (
            <div key={p.id} style={{ border: '1px solid rgba(28,43,58,.1)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: charcoal, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                  {p.pinned && <span style={{ fontSize: 10.5, fontWeight: 700, color: purple, background: 'rgba(109,91,208,.1)', padding: '2px 8px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Pin size={11} /> Pinned</span>}
                  {p.question}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={() => togglePin(p.id, !p.pinned)} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: purple, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {p.pinned ? <><PinOff size={13} /> Unpin</> : <><Pin size={13} /> Pin</>}
                  </button>
                  <button onClick={() => remove(p.id)} disabled={pending} className="link-action" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0504B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 12, margin: '3px 0 10px' }}>
                {p.totalVotes} vote{p.totalVotes === 1 ? '' : 's'} · created {p.createdAtLabel}
                {p.expiresAtLabel ? (p.expired ? ` · closed ${p.expiresAtLabel}` : ` · closes ${p.expiresAtLabel}`) : ' · no expiry'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {p.options.map((opt, i) => {
                  const count = p.counts[i] ?? 0
                  const pct = p.totalVotes > 0 ? Math.round((count / p.totalVotes) * 100) : 0
                  return (
                    <div key={i} style={{ position: 'relative', border: '1px solid rgba(28,43,58,.08)', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: 'rgba(109,91,208,.1)' }} />
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 11px', fontSize: 13 }}>
                        <span style={{ color: charcoal }}>{opt}</span>
                        <span style={{ fontWeight: 700, color: purple, whiteSpace: 'nowrap' }}>{pct}% · {count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
