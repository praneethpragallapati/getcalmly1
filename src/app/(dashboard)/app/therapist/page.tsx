import Link from 'next/link'
import {
  Star, ShieldCheck, Languages, CalendarDays, Video, MessageCircle,
  Sparkles, UserPlus, Clock, FileText,
} from 'lucide-react'
import { getMyCareTeam, type CareSlot } from '@/lib/therapist'

export default async function TherapistPage() {
  const team = await getMyCareTeam()
  const activeCount = team.slots.filter((s) => s.hasPack).length

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">My Care Team</h1>
        <span className="page-meta">
          {activeCount > 0 ? `${activeCount} active ${activeCount === 1 ? 'package' : 'packages'}` : 'Your experts by package'}
        </span>
      </div>

      {/* Next session (global) */}
      {team.nextSessionWhen && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CalendarDays size={17} /> Next session
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div className="doc-name" style={{ fontSize: 15 }}>{team.nextSessionWhen}</div>
            {team.nextSessionId && (
              <Link href={`/app/sessions/${team.nextSessionId}/room`} className="btn btn-primary">
                <Video size={16} /> Join session
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="stack" style={{ gap: 16 }}>
        {team.slots.map((slot) => <CareSlotCard key={slot.key} slot={slot} assessmentDone={team.assessmentDone} />)}
      </div>
    </>
  )
}

function CareSlotCard({ slot, assessmentDone }: { slot: CareSlot; assessmentDone: boolean }) {
  // No expert and no package for this kind → nudge to buy.
  if (!slot.expert && !slot.hasPack) {
    return (
      <div className="card" style={{ border: '1.5px dashed var(--c-line)', background: 'transparent' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46,
            borderRadius: 12, background: 'var(--c-green-pale, #E5F4EE)', color: 'var(--c-green, #3D9E72)', flexShrink: 0,
          }}>
            <UserPlus size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="doc-name" style={{ fontSize: 17 }}>{slot.label}</div>
            <div className="doc-sub" style={{ fontSize: 13.5 }}>{slot.blurb} You don&apos;t have a {slot.label.toLowerCase()} package yet.</div>
          </div>
          <Link href={slot.buyHref} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
            Buy a package
          </Link>
        </div>
      </div>
    )
  }

  // Package held but no clinician attached yet.
  if (!slot.expert) {
    return (
      <div className="card">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 46, height: 46,
            borderRadius: 12, background: 'rgba(201,151,58,.12)', color: 'var(--c-gold, #C9973A)', flexShrink: 0,
          }}>
            <Sparkles size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="doc-name" style={{ fontSize: 17 }}>{slot.label}</div>
            <div className="doc-sub" style={{ fontSize: 13.5 }}>
              {assessmentDone
                ? 'We’re matching you with the right expert. You’ll be notified as soon as your clinician is assigned.'
                : 'Complete your quick assessment and we’ll match you with the right expert.'}
            </div>
          </div>
          {slot.sessionsLeft !== null && (
            <span className="ther-chip"><Clock size={13} /> {slot.sessionsLeft} left</span>
          )}
          {!assessmentDone && (
            <Link href="/app/assessment" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Take assessment
            </Link>
          )}
        </div>
      </div>
    )
  }

  // Package held with an attached expert.
  const t = slot.expert
  const firstName = t.name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '').split(' ')[0] || t.name
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--c-green, #3D9E72)' }}>{slot.label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {slot.hasPack
            ? <span className="ther-chip"><Clock size={13} /> {slot.sessionsLeft} of {slot.sessionsTotal} left</span>
            : <Link href={slot.buyHref} className="ther-chip" style={{ textDecoration: 'none' }}>No active package · get one</Link>}
          <Link href={`/app/sessions?with=${t.profileId}`} className="btn btn-primary btn-sm"><CalendarDays size={14} /> Book</Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <span className="ther-avatar">{t.initials}</span>
        <div style={{ minWidth: 0 }}>
          <div className="doc-name" style={{ fontSize: 20 }}>{t.name}</div>
          <div className="doc-sub" style={{ fontSize: 14 }}>{t.designation} · {t.yearsExp} yrs</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {t.reviews > 0 && (
              <span className="ther-chip"><Star size={13} fill="currentColor" /> {t.rating} ({t.reviews})</span>
            )}
            {t.rciVerified && <span className="ther-chip verified"><ShieldCheck size={13} /> RCI Verified</span>}
            {t.nmcVerified && <span className="ther-chip verified"><ShieldCheck size={13} /> NMC Verified</span>}
          </div>
        </div>
      </div>

      {t.bio && <p style={{ fontSize: 14, color: 'var(--c-gray-d)', lineHeight: 1.65, margin: '18px 0 0' }}>{t.bio}</p>}

      <div className="ther-meta" style={{ marginTop: 16 }}>
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

      {t.specializations.length > 0 && (
        <div className="tag-row" style={{ marginTop: 14 }}>
          {t.specializations.map((s) => <span className="tag" key={s}>{s}</span>)}
        </div>
      )}

      {/* Quick actions, scoped to this expert */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--c-line)' }}>
        <div className="muted" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
          Quick actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          <Link href={`/app/sessions?with=${t.profileId}`} className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <CalendarDays size={16} /> Book with {firstName}
          </Link>
          <Link href="/app/sessions" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <FileText size={16} /> Manage sessions
          </Link>
          <Link href="/app/calm-ai" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <MessageCircle size={16} /> Prepare with Calm AI
          </Link>
        </div>
      </div>
    </div>
  )
}
