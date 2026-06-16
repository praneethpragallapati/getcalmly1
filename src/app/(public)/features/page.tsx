import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features | GetCalmly',
  description: 'Human care, amplified by thoughtful AI. Matching, the Calm AI companion, mood insights, smart journaling, and a clinician co-pilot. Always human-led, never automated away.',
  alternates: { canonical: '/features' },
}

const charcoal = '#1C2B3A'
const coral = '#C8553D'

/* ── In-house product mock visuals (no external images) ───────────── */

function MatchMock() {
  return (
    <div style={mockCard}>
      <p style={mockLabel}>✦ Your match · based on your assessment</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(26,127,122,.12)', color: '#1A7F7A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>AS</div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: charcoal }}>Dr. Ananya Sharma</p>
          <p style={{ fontSize: 12, color: '#6B7D8E' }}>Clinical Psychologist · 8 yrs · CBT</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
        {['Anxiety', 'Work stress', 'Hindi & English'].map((t) => (
          <span key={t} style={{ fontSize: 11, fontWeight: 600, color: coral, background: 'rgba(200,85,61,.08)', padding: '4px 10px', borderRadius: 50 }}>{t}</span>
        ))}
      </div>
      <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(61,158,114,.08)', fontSize: 12, color: '#2C7A57', fontWeight: 600 }}>96% fit with what you shared</div>
    </div>
  )
}

function ChatMock() {
  return (
    <div style={mockCard}>
      <p style={mockLabel}>Calm · 11:48 PM</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        <div style={{ alignSelf: 'flex-end', maxWidth: '80%', background: charcoal, color: '#fff', fontSize: 12.5, padding: '9px 12px', borderRadius: '12px 12px 2px 12px', lineHeight: 1.5 }}>I can&apos;t switch my head off tonight.</div>
        <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: '#F5F7FA', color: '#3A4A5A', fontSize: 12.5, padding: '9px 12px', borderRadius: '12px 12px 12px 2px', lineHeight: 1.5 }}>That sounds exhausting. Want to try a two-minute breathing reset together, or just talk it through?</div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <span style={chip}>Breathing space</span>
        <span style={chip}>Talk it through</span>
      </div>
    </div>
  )
}

function MoodMock() {
  const bars = [40, 55, 35, 70, 50, 80, 65]
  return (
    <div style={mockCard}>
      <p style={mockLabel}>This week · mood trend ↑ 12%</p>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 96, marginTop: 16 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 6, background: i === 5 ? coral : 'rgba(200,85,61,.22)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: '#A0ADB8' }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(200,85,61,.07)', fontSize: 12, color: '#9A4332', fontWeight: 600 }}>Sundays tend to dip. A short walk has helped before.</div>
    </div>
  )
}

function JournalMock() {
  return (
    <div style={mockCard}>
      <p style={mockLabel}>Your journal · Thursday</p>
      <p style={{ fontSize: 13.5, color: charcoal, fontWeight: 700, marginTop: 10, lineHeight: 1.5 }}>&ldquo;Today was hard but I didn&apos;t spiral. That&apos;s new.&rdquo;</p>
      <p style={{ fontSize: 12, color: '#6B7D8E', marginTop: 10 }}>Themes noticed in your words:</p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
        {['self-compassion', 'boundary-setting', 'resilience'].map((t) => (
          <span key={t} style={{ fontSize: 11, fontWeight: 600, color: '#7C5CBF', background: 'rgba(124,92,191,.1)', padding: '4px 10px', borderRadius: 50 }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

function BriefMock() {
  return (
    <div style={mockCard}>
      <p style={mockLabel}>Pre-session brief · for Dr. Ananya</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
        {[
          ['Mood', 'Up since last session, dipped midweek'],
          ['Homework', 'Completed thought-record 4 of 5 days'],
          ['Journal', 'Boundary-setting came up twice'],
          ['PHQ-9', '11 → 8 over three weeks'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>
            <span style={{ width: 64, color: '#8E9EAE', flexShrink: 0, fontWeight: 600 }}>{k}</span>
            <span style={{ color: '#3A4A5A', lineHeight: 1.45 }}>{v}</span>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: 11, color: '#A0ADB8' }}>AI-drafted · reviewed by your clinician</p>
    </div>
  )
}

const detailed = [
  { eyebrow: 'Matching', title: 'The right professional, the first time', body: 'A short assessment reads what you are going through, the language you think in, and your budget, then pairs you with a licensed professional who genuinely fits. No scrolling through dozens of profiles and hoping.', visual: <MatchMock /> },
  { eyebrow: 'Calm AI', title: 'Support for the in-between moments', body: 'Therapy is an hour a week. Life happens in all the hours between. Calm is a gentle, always-available space to talk things through and steady yourself, and it knows when to point you toward real help.', visual: <ChatMock /> },
  { eyebrow: 'Mood & insights', title: 'Tracking that actually does something', body: 'Log mood, energy and sleep in seconds. We surface the patterns you would miss and act on them, nudging a breathing exercise after a few low days, or gently suggesting a session after a fortnight.', visual: <MoodMock /> },
  { eyebrow: 'Journaling', title: 'Write freely, see clearly', body: 'Journal however you like. Calm reflects the patterns back in your own words, the thoughts that keep circling and the moments that lift you, drawing on CBT principles. Always reflections, never a diagnosis.', visual: <JournalMock /> },
  { eyebrow: 'Clinician co-pilot', title: 'Your therapist walks in already caught up', body: 'Before each session your professional sees a brief of your week, mood trend, homework and journal themes. Less time spent recapping, more spent on you. Every AI summary is human-reviewed first.', visual: <BriefMock /> },
]

export default function FeaturesPage() {
  return (
    <div style={{ background: '#F9F5F2' }}>
      {/* Hero */}
      <section style={{ background: charcoal, padding: '84px 24px 72px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -100, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,158,114,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.5, color: 'rgba(255,255,255,.45)', marginBottom: 18 }}>How GetCalmly works</p>
          <h1 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(40px, 7vw, 66px)', color: '#fff', lineHeight: 1.0, letterSpacing: '-2px', marginBottom: 22 }}>
            Human care.<br /><span style={{ color: coral }}>Amplified by AI.</span>
          </h1>
          <p style={{ fontSize: 17.5, color: 'rgba(255,255,255,.66)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto', fontWeight: 300 }}>
            Real therapy with licensed professionals sits at the heart of everything. The technology around it makes that care easier to reach, easier to stay with, and a little more personal. The AI never replaces your therapist. It helps them help you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <Link href="/pricing" style={ctaPrimary}>✦ Book a session</Link>
            <Link href="/assess" style={ctaGhost}>Take the free assessment</Link>
          </div>
        </div>
      </section>

      {/* Philosophy strip (with icons) */}
      <section style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '44px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            ['🫶', 'Human-led, always', 'AI assists. Licensed clinicians decide. Every clinical output is reviewed by a human.'],
            ['🎛️', 'Opt-in by design', 'Every AI feature is optional. Turn any of it off, anytime, without losing your care.'],
            ['🔐', 'Private & compliant', 'Encrypted records and consent management, built to India\'s DPDP Act 2023 from day one.'],
          ].map(([icon, t, d]) => (
            <div key={t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF1EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: charcoal, marginBottom: 5 }}>{t}</p>
                <p style={{ fontSize: 13.5, color: '#6B7D8E', lineHeight: 1.6 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed alternating feature rows */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '72px 24px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
          {detailed.map((f, i) => (
            <div key={f.title} className="feat-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
              <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: coral, textTransform: 'uppercase', marginBottom: 12 }}>{f.eyebrow}</p>
                <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 800, fontSize: 'clamp(26px, 3.4vw, 36px)', color: charcoal, letterSpacing: '-0.5px', lineHeight: 1.08, marginBottom: 14 }}>{f.title}</h2>
                <p style={{ fontSize: 15.5, color: '#6B7D8E', lineHeight: 1.7 }}>{f.body}</p>
              </div>
              <div style={{ order: i % 2 === 0 ? 2 : 1 }}>{f.visual}</div>
            </div>
          ))}
        </div>
      </section>

      {/* App download */}
      <section style={{ background: charcoal, marginTop: 64, padding: '72px 24px', overflow: 'hidden' }}>
        <div className="app-row" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#1FB6A8', textTransform: 'uppercase', marginBottom: 14 }}>The app</p>
            <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 'clamp(30px, 5vw, 46px)', color: '#fff', letterSpacing: '-1px', lineHeight: 1.04, marginBottom: 16 }}>
              Your care, in your pocket.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.66)', lineHeight: 1.7, marginBottom: 22, fontWeight: 300 }}>
              The app is where your care actually lives day to day. Check in, talk to Calm, journal, and join sessions, all in one place. And because it is with you, the gentle reminders and personalised nudges arrive exactly when they help most.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
              {['Daily check-ins that take seconds', 'Calm AI a tap away, whenever you need it', 'Timely nudges, personalised to your patterns', 'Join sessions and see your progress'].map((t) => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: '#1FB6A8', fontWeight: 800 }}>✓</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,.78)' }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[['', 'App Store'], ['▶', 'Google Play']].map(([icon, store]) => (
                <div key={store} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.16)', borderRadius: 12, padding: '10px 18px' }}>
                  <span style={{ fontSize: 18 }}>{icon || ''}</span>
                  <div style={{ lineHeight: 1.1 }}>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,.5)' }}>Coming soon to</p>
                    <p style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{store}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone frame */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 248, background: '#0F1C28', borderRadius: 36, padding: 10, border: '1.5px solid rgba(255,255,255,.12)', boxShadow: '0 30px 60px rgba(0,0,0,.4)' }}>
              <div style={{ background: '#F9F5F2', borderRadius: 28, padding: '18px 14px', height: 420, overflow: 'hidden' }}>
                <p style={{ fontSize: 11, color: '#8E9EAE', fontWeight: 600 }}>Good morning, Priya</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: charcoal, marginTop: 2 }}>How are you today?</p>
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  {['😣', '😕', '🙂', '😊', '😄'].map((e, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 10, background: i === 3 ? '#FFF1EC' : '#fff', border: i === 3 ? '1.5px solid rgba(200,85,61,.4)' : '1px solid #EEF0F3', fontSize: 16 }}>{e}</div>
                  ))}
                </div>
                <div style={{ marginTop: 14, background: charcoal, borderRadius: 14, padding: '14px' }}>
                  <p style={{ fontSize: 10, color: '#1FB6A8', fontWeight: 700 }}>TODAY&apos;S SESSION · 3:00 PM</p>
                  <p style={{ fontSize: 13, color: '#fff', fontWeight: 700, marginTop: 4 }}>Dr. Ananya Sharma</p>
                  <div style={{ marginTop: 10, background: '#1FB6A8', color: '#062a26', fontSize: 11, fontWeight: 800, textAlign: 'center', padding: '7px', borderRadius: 8 }}>Join session</div>
                </div>
                <div style={{ marginTop: 12, background: '#fff', borderRadius: 14, padding: '12px', border: '1px solid #EEF0F3' }}>
                  <p style={{ fontSize: 10, color: coral, fontWeight: 700 }}>CALM AI</p>
                  <p style={{ fontSize: 11.5, color: '#3A4A5A', marginTop: 4, lineHeight: 1.45 }}>Mondays look tougher for you. Want a 5-minute reset before your day starts?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#fff', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: 38, color: charcoal, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Care that remembers you.
          </h2>
          <p style={{ fontSize: 15.5, color: '#6B7D8E', lineHeight: 1.7, marginBottom: 30 }}>
            Start free, meet your match, and let the rest take care of itself.
          </p>
          <Link href="/pricing" style={ctaPrimary}>✦ Book a session</Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 760px) {
          .feat-row { grid-template-columns: 1fr !important; gap: 22px !important; }
          .feat-row > div:first-child { order: 1 !important; }
          .feat-row > div:last-child { order: 2 !important; }
          .app-row { grid-template-columns: 1fr !important; gap: 36px !important; }
        }
      `}</style>
    </div>
  )
}

const mockCard: React.CSSProperties = {
  background: '#fff', borderRadius: 18, padding: '20px', border: '1.5px solid rgba(0,0,0,.07)',
  boxShadow: '0 16px 44px rgba(28,43,58,.10)',
}
const mockLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: 0.4, color: '#A0ADB8', textTransform: 'uppercase' }
const chip: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#3A4A5A', background: '#F5F7FA', padding: '6px 11px', borderRadius: 50 }
const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: coral, color: '#fff',
  padding: '15px 30px', borderRadius: 50, fontSize: 15.5, fontWeight: 700, textDecoration: 'none',
  fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.35)',
}
const ctaGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)',
  color: 'rgba(255,255,255,.85)', padding: '15px 26px', borderRadius: 50, fontSize: 15.5, fontWeight: 600,
  textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", border: '1.5px solid rgba(255,255,255,.16)',
}
