import { VideoCard } from '@/components/media/VideoLightbox'
import type { GuidedTrackView } from '@/lib/guided'

const HEAD = "'Big Shoulders Display', sans-serif"
const teal = '#2C7A6B'
const ink = '#13241f'

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null

/**
 * Guided calm — admin-authored guided video tracks under Care. Tracks are public
 * or assigned by a clinician (with a validity). A calm, teal-toned counterpart to
 * Perspectives. Tracks flagged "coming soon" carry a chip.
 */
export function GuidedView({ tracks }: { tracks: GuidedTrackView[] }) {
  return (
    <div>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, padding: 'clamp(28px, 5vw, 48px)', background: `radial-gradient(ellipse 70% 60% at 85% 12%, rgba(44,122,107,.4), transparent 55%), radial-gradient(ellipse 50% 50% at 6% 74%, rgba(44,122,107,.16), transparent 60%), ${ink}`, color: '#fff', marginBottom: 26 }}>
        <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#9FE0CF', margin: 0 }}>Care · Guided calm</p>
        <h1 style={{ fontFamily: HEAD, fontSize: 'clamp(30px, 5.5vw, 52px)', fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.5px', margin: '10px 0 12px', maxWidth: 640 }}>
          Practices to <span style={{ color: '#8FE3D0', fontWeight: 700 }}>steady you.</span>
        </h1>
        <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,.72)', margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
          Guided breathing, grounding and sleep tracks — some open to everyone, some hand-picked for you by your clinician.
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 18, background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '7px 14px', borderRadius: 999 }}>
          ✨ Coming soon — the first guided tracks are on the way
        </span>
      </div>

      {tracks.length === 0 ? (
        <div style={{ border: '1.5px dashed rgba(28,43,58,.16)', borderRadius: 18, padding: '40px 24px', textAlign: 'center', color: '#8595a4' }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>🧘</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#5A6B7A' }}>Your guided tracks will appear here</div>
          <div style={{ fontSize: 13, marginTop: 4, maxWidth: 420, marginInline: 'auto', lineHeight: 1.5 }}>
            Public tracks and any your clinician assigns to you will show up in this space.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
          {tracks.map((t) => {
            const until = fmtDate(t.validUntil)
            return (
              <section key={t.id}>
                <div style={{ marginBottom: 14 }}>
                  <h2 style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 700, color: '#1C2B3A', margin: 0, display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {t.title}
                    {t.comingSoon && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: teal, background: 'rgba(44,122,107,.1)', padding: '3px 9px', borderRadius: 999 }}>Coming soon</span>}
                    {t.assigned && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: teal, padding: '3px 10px', borderRadius: 999 }}>Assigned to you{until ? ` · until ${until}` : ''}</span>}
                    {!t.assigned && t.isPublic && <span style={{ fontSize: 11, fontWeight: 700, color: '#5A6B7A', background: 'rgba(28,43,58,.06)', padding: '3px 10px', borderRadius: 999 }}>Open to all</span>}
                  </h2>
                  {t.description && <p style={{ fontSize: 13.5, color: '#6B7D8E', margin: '4px 0 0' }}>{t.description}</p>}
                </div>
                {t.videos.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                    {t.videos.map((v) => <VideoCard key={v.id} video={v} accent={teal} />)}
                  </div>
                ) : (
                  <div style={{ border: '1.5px dashed rgba(28,43,58,.16)', borderRadius: 16, padding: '24px', textAlign: 'center', color: '#8595a4', background: 'rgba(28,43,58,.02)' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#5A6B7A' }}>Videos arriving soon for this track.</div>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
