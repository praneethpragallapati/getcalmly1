import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UserPlus, MessageSquare } from 'lucide-react'
import {
  getTherapistContext, getSupervision, getSuperviseeCaseloads, type SupervisionRelationship,
} from '@/lib/expert'
import { postSupervisionNote } from '../actions'

function RelationshipCard({ rel, canAddNote }: { rel: SupervisionRelationship; canAddNote: boolean }) {
  return (
    <div className="card">
      <div className="section-title" style={{ marginBottom: 10 }}>{rel.counterpartName}</div>

      {rel.notes.length === 0 && <p className="muted">No supervision notes yet.</p>}
      {rel.notes.map((n) => (
        <div key={n.id} className="pattern" style={{ alignItems: 'flex-start' }}>
          <span className="pattern-ic t-purple">
            <MessageSquare size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <div className="pattern-title">
              {n.authorName}
              {n.patientName ? ` · re: ${n.patientName}` : ''}
            </div>
            <div className="pattern-sub">{n.content}</div>
            <div className="pattern-sub">{n.createdAt.toLocaleString('en-IN')}</div>
          </div>
        </div>
      ))}

      <form action={postSupervisionNote} className="stack" style={{ gap: 8, marginTop: 12 }}>
        <input type="hidden" name="linkId" value={rel.linkId} />
        <textarea
          className="entry-input"
          name="content"
          placeholder={canAddNote ? 'Share a supervision note…' : 'Reply to your supervisor…'}
          style={{ minHeight: 60 }}
          required
        />
        <button type="submit" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
          Add note
        </button>
      </form>
    </div>
  )
}

export default async function SupervisionPage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const [{ supervising, supervisedBy }, superviseeCaseloads] = await Promise.all([
    getSupervision(ctx.therapistProfileId),
    getSuperviseeCaseloads(ctx.therapistProfileId),
  ])

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Supervision</div>
        <div className="page-meta">
          Supervising {supervising.length} · supervised by {supervisedBy.length} · assignments managed by getCalmly admins
        </div>
      </div>

      <div>
        <div className="section-title" style={{ margin: '4px 0 12px' }}>People you supervise</div>
        {supervising.length === 0 && (
          <div className="card">
            <p className="muted">
              You aren&apos;t supervising anyone yet. Supervision assignments are made by getCalmly admins.
              Contact the clinical team to be set up as a supervisor.
            </p>
          </div>
        )}
        <div className="stack">
          {superviseeCaseloads.map((sc) => (
            <div key={sc.superviseeId} className="card">
              <div className="section-title" style={{ marginBottom: 4 }}>{sc.superviseeName}&apos;s caseload</div>
              <p className="muted" style={{ marginBottom: 10 }}>
                As their supervisor you have full visibility of these patients.
              </p>
              {sc.patients.length === 0 && <p className="muted">No patients yet.</p>}
              {sc.patients.map((p) => (
                <Link key={p.patientId} href={`/expert/patients/${p.patientId}`} className="pattern" style={{ textDecoration: 'none' }}>
                  <span className={`pattern-ic ${p.moodTrend === 'declining' ? 't-coral' : p.moodTrend === 'improving' ? 't-green' : 't-purple'}`}>
                    <UserPlus size={16} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="pattern-title">{p.name}</div>
                    <div className="pattern-sub">
                      {p.trackLabel} · Mood {p.moodTrend} · Sessions {p.sessionsDone}/{p.sessionsTotal}
                      {p.openCrisisCount > 0 ? ` · ⚠ ${p.openCrisisCount} open alert(s)` : ''}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ))}
          {supervising.map((rel) => (
            <RelationshipCard key={rel.linkId} rel={rel} canAddNote />
          ))}
        </div>
      </div>

      <div>
        <div className="section-title" style={{ margin: '4px 0 12px' }}>Your supervisors</div>
        {supervisedBy.length === 0 && (
          <div className="card"><p className="muted">No one supervises your cases yet.</p></div>
        )}
        <div className="stack">
          {supervisedBy.map((rel) => (
            <RelationshipCard key={rel.linkId} rel={rel} canAddNote={false} />
          ))}
        </div>
      </div>
    </div>
  )
}
