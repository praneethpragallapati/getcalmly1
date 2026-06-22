import { redirect } from 'next/navigation'
import { UserPlus, MessageSquare } from 'lucide-react'
import { getTherapistContext, getSupervision, type SupervisionRelationship } from '@/lib/expert'
import { linkSupervisee, postSupervisionNote } from '../actions'

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

  const { supervising, supervisedBy } = await getSupervision(ctx.therapistProfileId)

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Supervision</div>
        <div className="page-meta">
          Supervising {supervising.length} · supervised by {supervisedBy.length}
        </div>
      </div>

      {/* Add a supervisee */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Add an associate to supervise</div>
        <p className="muted" style={{ marginBottom: 12 }}>
          Enter the registered email of a therapist on getCalmly. You&apos;ll be able to share case notes and
          support them between sessions.
        </p>
        <form action={linkSupervisee} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="entry-input" type="email" name="email" placeholder="associate@example.com" required style={{ maxWidth: 280 }} />
          <button type="submit" className="btn btn-primary btn-sm">
            <UserPlus size={14} /> Add associate
          </button>
        </form>
      </div>

      <div>
        <div className="section-title" style={{ margin: '4px 0 12px' }}>People you supervise</div>
        {supervising.length === 0 && (
          <div className="card"><p className="muted">You aren&apos;t supervising anyone yet.</p></div>
        )}
        <div className="stack">
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
