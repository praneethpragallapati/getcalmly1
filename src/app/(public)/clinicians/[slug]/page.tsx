import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { clinicians, getClinician } from '@/data/clinicians'
import BookSessionButton from '@/components/site/BookSessionButton'

const charcoal = '#1C2B3A'
const charcoalL = '#5F6E7D'
const cream = '#F6F3EF'

export function generateStaticParams() {
  return clinicians.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getClinician(slug)
  if (!c) return { title: 'Clinician not found | getCalmly.' }
  return {
    title: `${c.name} — ${c.title} | getCalmly.`,
    description: c.intro.slice(0, 155),
  }
}

export default async function ClinicianProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getClinician(slug)
  if (!c) notFound()

  const headingFont = "'Big Shoulders Display', sans-serif"

  return (
    <div style={{ background: cream, minHeight: '100vh' }}>
      {/* ── Intro: photo left, warm introduction right ── */}
      <section style={{ background: '#101722', padding: '108px 6% 68px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -140, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${c.accent}28 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative' }}>
          <Link
            href="/clinicians"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,.72)', textDecoration: 'none', marginBottom: 30 }}
          >
            <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>&larr;</span> Back to all clinicians
          </Link>

          <div className="clin-profile-grid">
            {/* Photo */}
            <div>
              {c.photo ? (
                <div
                  role="img"
                  aria-label={c.name}
                  style={{
                    width: '100%', aspectRatio: '4 / 5', borderRadius: 22,
                    background: `#E7E2DD url('${c.photo}') center 15%/cover`,
                    boxShadow: '0 30px 70px -30px rgba(0,0,0,.6)',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '4 / 5', borderRadius: 22, display: 'grid', placeItems: 'center',
                  background: `linear-gradient(150deg, ${c.accent}44, ${c.accent}14)`,
                  boxShadow: '0 30px 70px -30px rgba(0,0,0,.6)',
                }}>
                  <span style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 120, color: '#fff', letterSpacing: '-2px' }}>
                    {c.initials}
                  </span>
                </div>
              )}
            </div>

            {/* Warm, informal intro */}
            <div>
              <span style={{
                fontSize: 11.5, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase',
                color: '#fff', background: `${c.accent}`, padding: '5px 12px', borderRadius: 999,
              }}>
                {c.type}
              </span>
              <h1 style={{
                fontFamily: headingFont, fontWeight: 900, fontSize: 'clamp(38px, 5vw, 56px)',
                color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.02, margin: '20px 0 6px',
              }}>
                {c.name}
              </h1>
              <p style={{ fontSize: 15.5, fontWeight: 600, color: '#E0846C', marginBottom: 6 }}>{c.title}</p>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.62)', marginBottom: 22 }}>{c.credential}</p>

              <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,.82)', lineHeight: 1.8, fontWeight: 300, marginBottom: 26 }}>
                {c.intro}
              </p>

              <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap', marginBottom: 30 }}>
                <MetaOnDark big={`${c.yearsExp}+`} label="years of experience" />
                <MetaOnDark big={c.languages.join(' · ')} label={c.languages.length > 1 ? 'languages' : 'language'} />
              </div>

              <BookSessionButton slug={c.slug} name={c.name} accent={c.accent} />
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)', marginTop: 12, lineHeight: 1.5 }}>
                Booking directly with {firstName(c.name)} — you&apos;ll go straight to your details and payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specializations ── */}
      <section style={{ padding: '72px 6% 20px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <h2 style={{ fontFamily: headingFont, fontWeight: 300, fontSize: 'clamp(26px, 4vw, 36px)', color: charcoal, letterSpacing: '-.5px', marginBottom: 8 }}>
            What {firstName(c.name)} <span style={{ color: c.accent, fontWeight: 900 }}>works with.</span>
          </h2>
          <p style={{ fontSize: 15, color: charcoalL, lineHeight: 1.7, maxWidth: 560, marginBottom: 26 }}>
            The concerns and areas of care {firstName(c.name)} sees most often.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {c.specializations.map((s) => (
              <span key={s} style={{
                fontSize: 14.5, fontWeight: 700, color: c.accent,
                background: `color-mix(in srgb, ${c.accent} 8%, transparent)`,
                border: `1px solid color-mix(in srgb, ${c.accent} 22%, transparent)`,
                padding: '11px 20px', borderRadius: 50,
              }}>
                {s}
              </span>
            ))}
          </div>
          {c.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {c.tags.map((t) => (
                <span key={t} style={{
                  fontSize: 12.5, fontWeight: 600, color: charcoalL,
                  background: 'rgba(28,43,58,.05)', padding: '6px 13px', borderRadius: 999,
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Meet Dr X + Education/Experience ── */}
      {(c.bio || c.education || c.experience) && (
        <section style={{ padding: '56px 6% 20px' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gap: 52 }} className="clin-bio-grid">
            {c.bio && (
              <div>
                <h2 style={{ fontFamily: headingFont, fontWeight: 300, fontSize: 'clamp(26px, 4vw, 36px)', color: charcoal, letterSpacing: '-.5px', marginBottom: 20 }}>
                  Meet {firstName(c.name)}.
                </h2>
                {c.bio.map((para, i) => (
                  <p key={i} style={{ fontSize: 16, color: '#3A4A5A', lineHeight: 1.85, marginBottom: 16, fontWeight: 300 }}>
                    {para}
                  </p>
                ))}
              </div>
            )}

            {(c.education || c.experience) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {c.education && (
                  <CredList title="Education" items={c.education} accent={c.accent} icon="🎓" />
                )}
                {c.experience && (
                  <CredList title="Experience" items={c.experience} accent={c.accent} icon="💼" />
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {c.testimonials && c.testimonials.length > 0 && (
        <section style={{ padding: '64px 6% 40px', marginTop: 40, background: '#fff', borderTop: '1px solid #EDE6DD', borderBottom: '1px solid #EDE6DD' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: c.accent, marginBottom: 12 }}>
              In their words
            </p>
            <h2 style={{ fontFamily: headingFont, fontWeight: 300, fontSize: 'clamp(26px, 4vw, 38px)', color: charcoal, letterSpacing: '-.5px', marginBottom: 34, maxWidth: 620 }}>
              What people say about working with <span style={{ color: c.accent, fontWeight: 900 }}>{firstName(c.name)}.</span>
            </h2>
            <div style={{ display: 'grid', gap: 22, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {c.testimonials.map((t, i) => (
                <figure key={i} style={{
                  margin: 0, background: cream, borderRadius: 20, padding: '26px 26px 24px',
                  border: `1px solid color-mix(in srgb, ${c.accent} 16%, transparent)`,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <span style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 40, color: `${c.accent}5c`, lineHeight: 0.5, height: 22 }} aria-hidden>“</span>
                  <blockquote style={{ margin: 0, fontSize: 15, color: '#3A4A5A', lineHeight: 1.72 }}>
                    “{t.text}”
                  </blockquote>
                  <figcaption style={{ marginTop: 18, fontSize: 13.5 }}>
                    <span style={{ fontWeight: 800, color: charcoal }}>{t.author}</span>
                    <span style={{ color: charcoalL }}> · {t.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#A0968B', marginTop: 22, fontStyle: 'italic' }}>
              Feedback is shared with consent and lightly edited for privacy.
            </p>
          </div>
        </section>
      )}

      {/* ── Closing CTA ── */}
      <section style={{ padding: '72px 6% 96px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: headingFont, fontWeight: 300, fontSize: 'clamp(28px, 4.4vw, 42px)', color: charcoal, letterSpacing: '-.6px', lineHeight: 1.08, marginBottom: 28 }}>
            Ready when you are.
          </h2>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <BookSessionButton slug={c.slug} name={c.name} accent={c.accent} />
          </div>
        </div>
      </section>

      <style>{`
        .clin-profile-grid{ display:grid; grid-template-columns: 380px 1fr; gap:56px; align-items:center; }
        .clin-bio-grid{ grid-template-columns: 1.4fr 1fr; }
        @media (max-width: 860px){
          .clin-profile-grid{ grid-template-columns: 1fr; gap:32px; }
          .clin-bio-grid{ grid-template-columns: 1fr; gap:34px; }
        }
      `}</style>
    </div>
  )
}

function firstName(name: string) {
  // "Dr. Riya Lokesh" → "Dr. Riya"
  const parts = name.split(' ')
  return parts.slice(0, 2).join(' ')
}

function MetaOnDark({ big, label }: { big: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 26, color: '#fff', lineHeight: 1 }}>
        {big}
      </div>
      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function CredList({ title, items, accent, icon }: { title: string; items: string[]; accent: string; icon: string }) {
  return (
    <div>
      <h3 style={{
        fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: 22,
        color: charcoal, letterSpacing: 0, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span aria-hidden>{icon}</span> {title}
      </h3>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it) => (
          <li key={it} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ color: accent, fontWeight: 800, fontSize: 14, flexShrink: 0, marginTop: 2 }}>—</span>
            <span style={{ fontSize: 14.5, color: '#3A4A5A', lineHeight: 1.55 }}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
