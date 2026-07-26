import Link from 'next/link'
import { Star, ShieldCheck, Languages, CalendarDays, Video, MessageCircle, FileText } from 'lucide-react'
import { getMyTherapist } from '@/lib/therapist'

export default async function TherapistPage() {
  const t = await getMyTherapist()

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">My Therapist</h1>
        <span className="page-meta">Your dedicated expert</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <span className="ther-avatar">{t.initials}</span>
            <div>
              <div className="doc-name" style={{ fontSize: 22 }}>
                {t.name}
              </div>
              <div className="doc-sub" style={{ fontSize: 14 }}>
                {t.designation} · {t.yearsExp} yrs
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <span className="ther-chip">
                  <Star size={13} fill="currentColor" /> {t.rating} ({t.reviews})
                </span>
                {t.rciVerified && (
                  <span className="ther-chip verified">
                    <ShieldCheck size={13} /> RCI Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: 'var(--c-gray-d)', lineHeight: 1.65, margin: '20px 0' }}>
            {t.bio}
          </p>

          <div className="ther-meta">
            <div>
              <div className="lbl">QUALIFICATIONS</div>
              <div className="val">{t.qualifications}</div>
            </div>
            <div>
              <div className="lbl" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Languages size={12} /> LANGUAGES
              </div>
              <div className="val">{t.languages.join(', ')}</div>
            </div>
          </div>

          <div className="tag-row" style={{ marginTop: 16 }}>
            {t.specializations.map((s) => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <CalendarDays size={17} /> Next session
            </div>
            {t.nextSessionWhen ? (
              <>
                <div className="doc-name" style={{ fontSize: 15 }}>{t.nextSessionWhen}</div>
                <div className="doc-sub" style={{ marginBottom: 14 }}>with {t.name}</div>
                {t.nextSessionId && (
                  <Link
                    href={`/app/sessions/${t.nextSessionId}/room`}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Video size={16} /> Join session
                  </Link>
                )}
              </>
            ) : (
              <p className="muted">No upcoming session booked.</p>
            )}
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Quick actions</div>
            <div className="stack" style={{ gap: 10 }}>
              <Link href="/app/sessions" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <CalendarDays size={16} /> Book or manage sessions
              </Link>
              <Link href="/app/calm-ai" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                <MessageCircle size={16} /> Prepare with Calm AI
              </Link>
              {t.nextSessionId && (
                <Link
                  href={`/app/sessions/${t.nextSessionId}`}
                  className="btn btn-outline"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <FileText size={16} /> Add a pre-session note
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
