import Link from 'next/link'
import { FileText, Check, ChevronRight } from 'lucide-react'
import { getSessionUserId } from '@/lib/patient'
import { getMyForms } from '@/lib/forms'

const KIND_LABEL: Record<string, string> = {
  INTAKE: 'Intake',
  CONSENT: 'Consent',
  INFO: 'Information',
  FEEDBACK: 'Feedback',
}

export default async function FormsPage() {
  const userId = await getSessionUserId()
  const forms = userId ? await getMyForms(userId) : []
  const pending = forms.filter((f) => f.status === 'PENDING')
  const completed = forms.filter((f) => f.status === 'COMPLETED')

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">Forms</h1>
        <span className="page-meta">
          {pending.length > 0 ? `${pending.length} to complete` : 'All caught up'}
        </span>
      </div>

      <div className="stack" style={{ maxWidth: 720 }}>
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
