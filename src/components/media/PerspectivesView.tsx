import { VideoCard } from '@/components/media/VideoLightbox'
import type { PerspectiveSectionView } from '@/lib/perspectives'

const HEAD = "'Big Shoulders Display', sans-serif"
const coral = '#C8553D'
const ink = '#141E29'

/**
 * The Perspectives showcase — a dark, editorial hero over section rails of
 * YouTube talks. Used in Calm Club and on the public site. Sections flagged
 * "coming soon" carry a chip and, when they have no videos yet, a teaser tile.
 */
export function PerspectivesView({ sections, onDark = true }: { sections: PerspectiveSectionView[]; onDark?: boolean }) {
  const anyComingSoon = sections.some((s) => s.comingSoon)
  return (
    <div>
      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, padding: 'clamp(28px, 5vw, 48px)', background: `radial-gradient(ellipse 70% 60% at 85% 10%, rgba(200,85,61,.35), transparent 55%), radial-gradient(ellipse 50% 50% at 5% 70%, rgba(200,85,61,.14), transparent 60%), ${ink}`, color: '#fff', marginBottom: 26 }}>
        <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#F0B7A8', margin: 0 }}>Calm Club · Perspectives</p>
        <h1 style={{ fontFamily: HEAD, fontSize: 'clamp(30px, 5.5vw, 52px)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.5px', margin: '10px 0 12px', maxWidth: 640 }}>
          Voices worth <span style={{ color: '#F6A38C', fontWeight: 700 }}>sitting with.</span>
        </h1>
        <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.72)', margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
          Founders, clinicians and members — short talks on the things that actually move mental health forward.
        </p>
        {anyComingSoon && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 18, background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '7px 14px', borderRadius: 999 }}>
            ✨ Coming soon — we&apos;re curating the first talks now
          </span>
        )}
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
        {sections.map((s) => (
          <section key={s.id}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 700, color: onDark ? '#1C2B3A' : '#1C2B3A', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  {s.title}
                  {s.comingSoon && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: coral, background: 'rgba(200,85,61,.1)', padding: '3px 9px', borderRadius: 999 }}>Coming soon</span>}
                </h2>
                {s.description && <p style={{ fontSize: 13.5, color: '#6B7D8E', margin: '4px 0 0' }}>{s.description}</p>}
              </div>
            </div>

            {s.videos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {s.videos.map((v) => <VideoCard key={v.id} video={v} accent={coral} />)}
              </div>
            ) : (
              <div style={{ border: '1.5px dashed rgba(28,43,58,.16)', borderRadius: 16, padding: '26px 22px', textAlign: 'center', color: '#8595a4', background: 'rgba(28,43,58,.02)' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🎬</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#5A6B7A' }}>Talks arriving soon</div>
                <div style={{ fontSize: 12.5, marginTop: 2 }}>We&apos;re lining up the first videos for this section.</div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
