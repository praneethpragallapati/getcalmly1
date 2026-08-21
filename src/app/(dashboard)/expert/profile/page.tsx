import { redirect } from 'next/navigation'
import { BadgeCheck, Clock, Briefcase, Star, Globe, GraduationCap, UsersRound, IdCard } from 'lucide-react'
import Link from 'next/link'
import { getTherapistContext, getTherapistProfile, getRatingBreakdown, getSupervision } from '@/lib/expert'
import { ProfileEditToggle } from '@/components/expert/ProfileEditToggle'
import { ChangePasswordCard } from '@/components/dashboard/ChangePasswordCard'
import { DetailGrid, formatAddress, formatEmergencyContact } from '@/components/ui/DetailGrid'
import { fmtIST } from '@/lib/tz'

export const metadata = { title: 'Profile · Expert portal', robots: { index: false, follow: false } }

const coral = '#C8553D'
const charcoal = '#1C2B3A'

export default async function ExpertProfilePage() {
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')
  const p = await getTherapistProfile(ctx.therapistProfileId)
  if (!p) redirect('/expert')
  const [ratings, supervision] = await Promise.all([
    getRatingBreakdown(ctx.therapistProfileId),
    getSupervision(ctx.therapistProfileId),
  ])

  const partTime = p.employmentType === 'PART_TIME'
  const initials = p.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="stack">
      <div className="page-head">
        <div className="page-title">Profile</div>
        <div className="page-meta">How you appear to the team, and on your blog &amp; community answers</div>
      </div>

      <ProfileEditToggle
        name={p.name}
        bio={p.bio}
        gender={p.gender}
        qualifications={p.qualifications}
        languages={p.languages}
        specializations={p.specializations}
        rciNumber={p.rciNumber}
        council={p.isPsychiatrist ? 'NMC' : 'RCI'}
        yearsExp={p.yearsExp}
        isVerified={p.isVerified}
        photoUrl={p.photoUrl}
        phone={p.phone}
        dateOfBirth={p.dateOfBirth}
        country={p.country}
        state={p.state}
        city={p.city}
        addressLine1={p.addressLine1}
        addressLine2={p.addressLine2}
        postalCode={p.postalCode}
        emergencyName={p.emergencyName}
        emergencyPhone={p.emergencyPhone}
        emergencyRelation={p.emergencyRelation}
      >
      {/* Identity card */}
      <div className="card" style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        {p.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photoUrl} alt="" style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #E8896F, #C8553D)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, flexShrink: 0 }}>
            {initials}
          </div>
        )}
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
          <Row icon={<IdCard size={15} />} label={`${p.isPsychiatrist ? 'NMC' : 'RCI'} registration`} value={p.rciNumber} />
          <Row icon={<GraduationCap size={15} />} label="Qualifications" value={p.qualifications.join(', ') || '—'} />
          <Row icon={<Globe size={15} />} label="Languages" value={p.languages.join(', ') || '—'} last />
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
      {/* Your rating — always present, including the "no ratings yet" case: a
          clinician should be able to look up how they're doing without having
          to already have feedback. */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Your rating</div>
        <p className="muted" style={{ fontSize: 12.5, margin: '0 0 14px' }}>
          From patients who rated a completed session with you. Averages are computed from these
          ratings and can&apos;t be edited by anyone.
        </p>
        {ratings.total === 0 ? (
          <p className="muted">
            No ratings yet. Patients are invited to rate a session once it&apos;s marked complete.
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, lineHeight: 1, color: charcoal }}>
                  {ratings.average.toFixed(1)}
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  {ratings.total} rating{ratings.total === 1 ? '' : 's'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const n = ratings.counts[star - 1]
                  const pct = Math.round((n / ratings.total) * 100)
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                      <span className="muted" style={{ fontSize: 12, width: 34, flexShrink: 0 }}>
                        {star} <Star size={10} style={{ display: 'inline', verticalAlign: -1 }} />
                      </span>
                      <span style={{ flex: 1, height: 7, background: 'rgba(28,43,58,.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: '#C9973A', borderRadius: 4 }} />
                      </span>
                      <span className="muted" style={{ fontSize: 12, width: 26, textAlign: 'right', flexShrink: 0 }}>{n}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {ratings.recentComments.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(28,43,58,.08)' }}>
                <div className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
                  Recent comments
                </div>
                {ratings.recentComments.map((c, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#C9973A' }}>
                      {'★'.repeat(c.rating)}<span style={{ color: 'rgba(28,43,58,.2)' }}>{'★'.repeat(5 - c.rating)}</span>
                    </div>
                    <p style={{ fontSize: 13.5, color: 'var(--c-gray-d)', lineHeight: 1.6, margin: '2px 0 0' }}>{c.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Supervision — who supervises this clinician and who they supervise.
          Assignments are admin-made, so this is a summary that links out. */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>Supervision</div>
        <p className="muted" style={{ fontSize: 12.5, margin: '0 0 14px' }}>
          Supervision pairings are set by the getCalmly clinical team.
        </p>
        <div className="grid-2" style={{ alignItems: 'start', gap: 16 }}>
          <div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Your supervisors
            </div>
            {supervision.supervisedBy.length === 0 ? (
              <p className="muted" style={{ fontSize: 13.5 }}>No one supervises your cases.</p>
            ) : (
              supervision.supervisedBy.map((r) => (
                <div key={r.linkId} className="pattern" style={{ padding: '8px 0' }}>
                  <span className="pattern-ic t-purple"><UsersRound size={15} /></span>
                  <div>
                    <div className="pattern-title">{r.counterpartName}</div>
                    <div className="pattern-sub">{r.notes.length} supervision note{r.notes.length === 1 ? '' : 's'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              You supervise
            </div>
            {supervision.supervising.length === 0 ? (
              <p className="muted" style={{ fontSize: 13.5 }}>You aren&apos;t supervising anyone.</p>
            ) : (
              supervision.supervising.map((r) => (
                <div key={r.linkId} className="pattern" style={{ padding: '8px 0' }}>
                  <span className="pattern-ic t-green"><UsersRound size={15} /></span>
                  <div>
                    <div className="pattern-title">{r.counterpartName}</div>
                    <div className="pattern-sub">{r.notes.length} supervision note{r.notes.length === 1 ? '' : 's'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <Link href="/expert/supervision" className="link-action" style={{ display: 'inline-block', marginTop: 12 }}>
          Open supervision →
        </Link>
      </div>

      {/* Contact & address — admin-visible, never shown on the patient-facing card */}
      <div className="card">
        <div className="section-title">Contact &amp; address</div>
        <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 0' }}>
          Held for the admin team — payroll, compliance and reaching you in an emergency. Patients never see this.
        </p>
        <DetailGrid
          fields={[
            { label: 'Email', value: p.email },
            { label: 'Phone', value: p.phone },
            { label: 'Date of birth', value: p.dateOfBirth ? fmtIST(new Date(p.dateOfBirth), { day: 'numeric', month: 'short', year: 'numeric' }) : null },
            { label: 'Address', value: formatAddress(p) },
            { label: 'Emergency contact', value: formatEmergencyContact(p) },
          ]}
        />
      </div>
      </ProfileEditToggle>

      <ChangePasswordCard />
    </div>
  )
}

function Row({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: last ? 'none' : '1px solid rgba(28,43,58,.06)' }}>
      <span style={{ color: 'var(--c-gray)', flexShrink: 0 }}>{icon}</span>
      <span className="muted" style={{ fontSize: 13, width: 130, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: charcoal, textAlign: 'right', marginLeft: 'auto' }}>{value}</span>
    </div>
  )
}
