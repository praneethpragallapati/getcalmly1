import { redirect } from 'next/navigation'
import { BadgeCheck, Clock, Briefcase, Star, Globe, GraduationCap, IndianRupee } from 'lucide-react'
import { getTherapistContext, getTherapistProfile } from '@/lib/expert'

export const metadata = { title: 'Profile · Expert portal', robots: { index: false, follow: false } }

const coral = '#C8553D'
const charcoal = '#1C2B3A'

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

export default async function ExpertProfilePage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  const p = await getTherapistProfile(ctx.therapistProfileId)
  if (!p) redirect('/expert')

  const partTime = p.employmentType === 'PART_TIME'
  const initials = p.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Profile</div>
        <div className="page-meta">How you appear to the team, and on your blog &amp; community answers</div>
      </div>

      {/* Identity card */}
      <div className="card" style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #E8896F, #C8553D)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: charcoal }}>{p.name}</h2>
            {p.isVerified && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#3D9E72', background: 'rgba(61,158,114,.1)', padding: '3px 9px', borderRadius: 20 }}>
                <BadgeCheck size={13} /> Verified
              </span>
            )}
          </div>
          <div style={{ color: coral, fontWeight: 600, fontSize: 14.5, marginTop: 2 }}>{p.designation}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            {p.yearsExp} yrs experience · {p.isPsychiatrist ? 'NMC' : 'RCI'} {p.rciNumber}
            {p.totalReviews > 0 && (
              <> · <Star size={12} style={{ display: 'inline', verticalAlign: -1, color: '#C9973A' }} /> {p.rating.toFixed(1)} ({p.totalReviews})</>
            )}
          </div>
        </div>
        {/* Employment badge — admin-managed */}
        <div style={{ textAlign: 'right' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 700,
            padding: '9px 15px', borderRadius: 30,
            color: partTime ? '#1A7F7A' : '#3E6E9C',
            background: partTime ? 'rgba(26,127,122,.1)' : 'rgba(62,110,156,.1)',
            border: `1px solid ${partTime ? 'rgba(26,127,122,.25)' : 'rgba(62,110,156,.25)'}`,
          }}>
            {partTime ? <Clock size={15} /> : <Briefcase size={15} />}
            {partTime ? 'Part-time' : 'Full-time'}
          </span>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>
            {partTime ? 'Paid per session' : 'Salaried'} · set by admin
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* About */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 10 }}>About</div>
          <p style={{ fontSize: 14, color: 'var(--c-gray-d)', lineHeight: 1.7 }}>{p.bio}</p>
        </div>

        {/* At a glance */}
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>At a glance</div>
          <Row icon={<Briefcase size={15} />} label="Engagement" value={partTime ? 'Part-time (per session)' : 'Full-time (salaried)'} />
          <Row icon={<GraduationCap size={15} />} label="Qualifications" value={p.qualifications.join(', ') || '—'} />
          <Row icon={<Globe size={15} />} label="Languages" value={p.languages.join(', ') || '—'} />
          <Row icon={<IndianRupee size={15} />} label="Session fee" value={inr(p.sessionFee)} last />
        </div>
      </div>

      {/* Specializations */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>Specializations</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {p.specializations.map((s) => (
            <span key={s} style={{ fontSize: 13, fontWeight: 600, color: charcoal, background: 'rgba(200,85,61,.07)', border: '1px solid rgba(200,85,61,.15)', padding: '6px 13px', borderRadius: 20 }}>
              {s}
            </span>
          ))}
          {p.specializations.length === 0 && <span className="muted">None listed.</span>}
        </div>
      </div>
    </div>
  )
}

function Row({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: last ? 'none' : '1px solid rgba(28,43,58,.06)' }}>
      <span style={{ color: '#8E9EAE', flexShrink: 0 }}>{icon}</span>
      <span className="muted" style={{ fontSize: 13, width: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: charcoal, textAlign: 'right', marginLeft: 'auto' }}>{value}</span>
    </div>
  )
}
