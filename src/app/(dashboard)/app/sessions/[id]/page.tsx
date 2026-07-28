import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Video, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react'
import { getSessionDetail } from '@/lib/sessions'
import { PreSessionNote } from '@/components/dashboard/PreSessionNote'
import { RateSession } from '@/components/dashboard/RateSession'

export default async function SessionDetailPage({ params }: PageProps<'/app/sessions/[id]'>) {
  const { id } = await params
  const s = await getSessionDetail(id)
  if (!s) notFound()

  return (
    <>
      <div className="page-head">
        <div>
          <Link
            href="/app/sessions"
            className="link-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
          >
            <ArrowLeft size={14} /> All sessions
          </Link>
          <h1 className="page-title">Session with {s.expert}</h1>
          <span className="page-meta">
            {s.when} · {s.durationMins} min
          </span>
        </div>
        {!s.isPast && (
          <Link href={`/app/sessions/${s.id}/room`} className="btn btn-primary">
            <Video size={16} /> Join session
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="stack">
          {s.isPast ? (
            <>
              <div className="card">
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={17} /> Session summary
                </div>
                {s.summary ? (
                  <p style={{ fontSize: 14, color: 'var(--c-gray-d)', lineHeight: 1.65, marginTop: 12 }}>
                    {s.summary}
                  </p>
                ) : (
                  <p className="muted" style={{ marginTop: 12 }}>
                    Your expert hasn’t added a summary for this session yet.
                  </p>
                )}
              </div>
              {s.reviewable && (
                <RateSession
                  appointmentId={s.id}
                  expert={s.expert}
                  initialRating={s.myRating}
                  initialComment={s.myReviewComment}
                />
              )}
            </>
          ) : (
            <PreSessionNote appointmentId={s.id} initial={s.preSessionNote} />
          )}
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>
            Details
          </div>
          <div className="session-card-row">
            <span className="doc-avatar">👩‍⚕️</span>
            <div>
              <div className="doc-name">{s.expert}</div>
              <div className="doc-sub">{s.expertRole}</div>
            </div>
          </div>
          <div className="session-info-grid" style={{ flexWrap: 'wrap' }}>
            <div>
              <div className="lbl">WHEN</div>
              <div className="val">{s.when}</div>
            </div>
            <div>
              <div className="lbl">DURATION</div>
              <div className="val">{s.durationMins} min</div>
            </div>
            <div>
              <div className="lbl">STATUS</div>
              <div className="val">
                {s.isPast ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--c-green)' }}>
                    <CheckCircle2 size={14} /> Completed
                  </span>
                ) : (
                  'Upcoming'
                )}
              </div>
            </div>
          </div>
          {s.tags.length > 0 && (
            <div className="tag-row" style={{ marginTop: 4 }}>
              {s.tags.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
