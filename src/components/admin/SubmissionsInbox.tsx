'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileCheck2, Inbox, Building2, ChevronDown, Check, UserPlus } from 'lucide-react'
import { setApplicationStatus, setContactHandled, setLeadHandled } from '@/app/admin/actions'
import type { ApplicationRow, ContactRow, LeadRow } from '@/lib/admin'

const charcoal = '#1C2B3A'
const coral = '#C8553D'

const STATUS_LABEL: Record<string, string> = {
  APPLIED: 'Applied', INTERVIEW_SCHEDULED: 'Interview scheduled', UNDER_REVIEW: 'Under review', APPROVED: 'Approved', REJECTED: 'Rejected',
}
const STATUS_COLOR: Record<string, string> = {
  APPLIED: '#6B7D8E', INTERVIEW_SCHEDULED: '#3E6E9C', UNDER_REVIEW: '#C9973A', APPROVED: '#2C7A57', REJECTED: '#C0504B',
}

type Tab = 'applications' | 'contact' | 'enterprise'

export function SubmissionsInbox({
  applications, contacts, leads,
}: {
  applications: ApplicationRow[]; contacts: ContactRow[]; leads: LeadRow[]
}) {
  const newContacts = contacts.filter((c) => !c.handled).length
  const newLeads = leads.filter((l) => !l.handled).length
  const pendingApps = applications.filter((a) => !['APPROVED', 'REJECTED'].includes(a.status)).length
  const [tab, setTab] = useState<Tab>('applications')

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge: number }[] = [
    { key: 'applications', label: 'Applications', icon: <FileCheck2 size={15} />, badge: pendingApps },
    { key: 'contact', label: 'Contact', icon: <Inbox size={15} />, badge: newContacts },
    { key: 'enterprise', label: 'Enterprise', icon: <Building2 size={15} />, badge: newLeads },
  ]

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Submissions</div>
        <div className="page-meta">Clinician applications, contact messages and enterprise leads from the website</div>
      </div>

      <div style={{ display: 'inline-flex', gap: 4, background: 'rgba(28,43,58,.05)', padding: 4, borderRadius: 10, alignSelf: 'flex-start' }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            border: 'none', cursor: 'pointer', padding: '9px 16px', borderRadius: 7, fontSize: 13.5, fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
            background: tab === t.key ? '#fff' : 'transparent', color: tab === t.key ? coral : '#8E9EAE',
            boxShadow: tab === t.key ? '0 1px 5px rgba(28,43,58,.12)' : 'none',
          }}>
            {t.icon}{t.label}
            {t.badge > 0 && <span style={{ fontSize: 10.5, fontWeight: 800, color: '#fff', background: coral, borderRadius: 20, padding: '1px 7px' }}>{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'applications' && <Applications rows={applications} />}
      {tab === 'contact' && <Contacts rows={contacts} />}
      {tab === 'enterprise' && <Leads rows={leads} />}
    </div>
  )
}

function Applications({ rows }: { rows: ApplicationRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [openId, setOpenId] = useState<string | null>(null)

  function update(id: string, status: string, notes: string) {
    startTransition(async () => { await setApplicationStatus({ id, status, notes }); router.refresh() })
  }

  if (rows.length === 0) return <Empty label="No clinician applications yet." />
  return (
    <div className="card" style={{ padding: 0 }}>
      {rows.map((a) => (
        <div key={a.id} style={{ borderBottom: '1px solid rgba(28,43,58,.07)' }}>
          <button onClick={() => setOpenId(openId === a.id ? null : a.id)} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <ChevronDown size={16} style={{ color: '#8E9EAE', transform: openId === a.id ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{a.fullName}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{a.council} · {a.registrationNo || 'no reg. no.'} · {a.yearsExp} yrs · {a.createdAt}</div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: STATUS_COLOR[a.status], background: `${STATUS_COLOR[a.status]}1a`, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' }}>{STATUS_LABEL[a.status] ?? a.status}</span>
          </button>
          {openId === a.id && (
            <div style={{ padding: '4px 20px 20px 50px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Field label="Email" value={a.email} />
              <Field label="Phone" value={a.phone} />
              {a.specializations.length > 0 && <Field label="Specialisations" value={a.specializations.join(', ')} />}
              {a.languages.length > 0 && <Field label="Languages" value={a.languages.join(', ')} />}
              {a.qualifications.length > 0 && <Field label="Qualifications" value={a.qualifications.join(', ')} />}
              {a.preferredInterviewAt && <Field label="Preferred interview" value={a.preferredInterviewAt} />}
              {a.bio && <Field label="Bio" value={a.bio} />}
              <StatusEditor appId={a.id} initialStatus={a.status} initialNotes={a.reviewerNotes ?? ''} pending={pending} onSave={(s, n) => update(a.id, s, n)} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StatusEditor({ appId, initialStatus, initialNotes, pending, onSave }: { appId: string; initialStatus: string; initialNotes: string; pending: boolean; onSave: (s: string, n: string) => void }) {
  const [status, setStatus] = useState(initialStatus)
  const [notes, setNotes] = useState(initialNotes)
  const field: React.CSSProperties = { border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 13.5, fontFamily: 'inherit', color: charcoal }
  return (
    <div style={{ marginTop: 6, paddingTop: 12, borderTop: '1px solid rgba(28,43,58,.07)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...field, background: '#fff' }}>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Reviewer notes (interview outcome, verification…)" style={{ ...field, resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button onClick={() => onSave(status, notes)} disabled={pending} className="btn btn-primary" style={{ opacity: pending ? 0.6 : 1 }}>Save</button>
        {status === 'APPROVED' && (
          <Link href={`/admin/create?fromApp=${appId}`} className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1.5px solid ${coral}`, color: coral }}>
            <UserPlus size={14} /> Create clinician account
          </Link>
        )}
      </div>
    </div>
  )
}

function Contacts({ rows }: { rows: ContactRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  if (rows.length === 0) return <Empty label="No contact messages yet." />
  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows.map((c) => (
        <div key={c.id} className="card" style={{ opacity: c.handled ? 0.6 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{c.name}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{c.email}{c.phone ? ` · ${c.phone}` : ''} · {c.createdAt}</div>
            </div>
            <button onClick={() => startTransition(async () => { await setContactHandled({ id: c.id, handled: !c.handled }); router.refresh() })} disabled={pending}
              className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {c.handled ? 'Reopen' : <><Check size={14} /> Mark handled</>}
            </button>
          </div>
          <p style={{ fontSize: 14, color: '#3A4A5A', lineHeight: 1.6, marginTop: 8, whiteSpace: 'pre-wrap' }}>{c.message}</p>
        </div>
      ))}
    </div>
  )
}

function Leads({ rows }: { rows: LeadRow[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  if (rows.length === 0) return <Empty label="No enterprise leads yet." />
  return (
    <div className="stack" style={{ gap: 10 }}>
      {rows.map((l) => (
        <div key={l.id} className="card" style={{ opacity: l.handled ? 0.6 : 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: charcoal }}>{l.name}{l.organisation ? ` · ${l.organisation}` : ''}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>{l.email}{l.phone ? ` · ${l.phone}` : ''} · {l.createdAt}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                {[l.sector, l.teamSize && `${l.teamSize} people`].filter(Boolean).join(' · ')}
              </div>
            </div>
            <button onClick={() => startTransition(async () => { await setLeadHandled({ id: l.id, handled: !l.handled }); router.refresh() })} disabled={pending}
              className="link-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {l.handled ? 'Reopen' : <><Check size={14} /> Mark handled</>}
            </button>
          </div>
          {l.message && <p style={{ fontSize: 14, color: '#3A4A5A', lineHeight: 1.6, marginTop: 8, whiteSpace: 'pre-wrap' }}>{l.message}</p>}
        </div>
      ))}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, fontSize: 13.5 }}>
      <span className="muted" style={{ width: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ color: charcoal }}>{value}</span>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return <div className="card"><p className="muted">{label}</p></div>
}
