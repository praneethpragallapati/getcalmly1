import Link from 'next/link'
import { FileText, Check, ChevronRight, Activity } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { getMyForms } from '@/lib/forms'
import { dueInstruments } from '@/lib/outcomes/pulse'
import { INSTRUMENTS } from '@/lib/outcomes/instruments'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { countOpenActivities } from '@/lib/dashboard'
import { taskTabsWithBadges } from '@/lib/taskTabs'

const KIND_LABEL: Record<string, string> = {
  INTAKE: 'Intake',
  CONSENT: 'Consent',
  INFO: 'Information',
  FEEDBACK: 'Feedback',
}

export default async function FormsPage() {
  const userId = await getSessionUserId()
  const forms = userId ? await getMyForms(userId) : []
  const due = userId ? await dueInstruments(userId).catch(() => []) : []
  const pending = forms.filter((f) => f.status === 'PENDING')
  const completed = forms.filter((f) => f.status === 'COMPLETED')
  const openActivities = userId ? await countOpenActivities(userId) : 0

  return (
    <>
      <SectionTabs
        eyebrow="Tasks"
        title="Forms"
        meta={pending.length > 0 ? `${pending.length} to complete` : 'All caught up'}
        tabs={taskTabsWithBadges(openActivities, pending.length)}
        active="/app/forms"
      />

      <div className="stack" style={{ maxWidth: 720 }}>
        {due.length > 0 && (
          <Link href="/app/pulse" className="card pattern" style={{ textDecoration: 'none', borderColor: 'rgba(200,85,61,.25)' }}>
            <span className="pattern-ic t-coral"><Activity size={16} /></span>
            <div style={{ flex: 1 }}>
              <div className="pattern-title">{due.length} Pulse {due.length === 1 ? 'check' : 'checks'} due</div>
              <div className="pattern-sub">{due.map((idn) => INSTRUMENTS[idn]?.short.replace(/\s*\(.*\)/, '')).filter(Boolean).join(' · ')}</div>
            </div>
            <ChevronRight size={18} className="muted" />
          </Link>
        )}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>To complete</div>
          {pending.length === 0 && <p className="muted">Nothing waiting on you right now.</p>}
          {pending.map((f) => (
            <Link key={f.id} href={`/app/forms/${f.id}`} className="pattern" style={{ textDecoration: 'none' }}>
              <span className="pattern-ic t-gold">
                <FileText size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <div className="pattern-title">{f.title}</div>
                <div className="pattern-sub">
                  {KIND_LABEL[f.kind] ?? f.kind} · sent {f.sentLabel}
                  {f.assignedBy && f.assignedBy !== 'Auto' ? ` by ${f.assignedBy}` : ''}
                </div>
              </div>
              <ChevronRight size={18} className="muted" />
            </Link>
          ))}
        </div>

        {completed.length > 0 && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Completed</div>
            {completed.map((f) => (
              <Link key={f.id} href={`/app/forms/${f.id}`} className="pattern" style={{ textDecoration: 'none' }}>
                <span className="pattern-ic t-green">
                  <Check size={16} />
                </span>
                <div style={{ flex: 1 }}>
                  <div className="pattern-title">{f.title}</div>
                  <div className="pattern-sub">
                    {KIND_LABEL[f.kind] ?? f.kind} · completed {f.completedLabel}
                  </div>
                </div>
                <ChevronRight size={18} className="muted" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
