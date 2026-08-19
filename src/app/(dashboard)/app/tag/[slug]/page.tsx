import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTagHub } from '@/lib/tagHub'
import { tagLabel, isKnownTag, TAGS } from '@/data/tags'
import { CommunityPostCard } from '@/components/community/CommunityFeed'
import { VideoCard } from '@/components/media/VideoLightbox'

export const dynamic = 'force-dynamic'

const HEAD = "'Big Shoulders Display', sans-serif"
const coral = '#C8553D'

/**
 * One tag, everything about it — Real Talk discussions, Perspectives essays and
 * Perspectives talks side by side. Reachable from any tag chip in the app.
 */
export default async function TagHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isKnownTag(slug)) notFound()
  const hub = await getTagHub(slug)
  const label = tagLabel(slug)

  return (
    <>
      <Link href="/app/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B7D8E', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', marginBottom: 14 }}>
        <ArrowLeft size={15} /> Back to Real Talk
      </Link>

      <div className="page-head" style={{ marginBottom: 18 }}>
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          #{label}
          <span style={{ fontSize: 12.5, fontWeight: 700, color: coral, background: 'rgba(200,85,61,.1)', padding: '3px 10px', borderRadius: 999 }}>
            {hub.total} {hub.total === 1 ? 'thing' : 'things'}
          </span>
        </div>
        <div className="page-meta">Discussions, essays and talks on {label.toLowerCase()} — all in one place.</div>
      </div>

      {hub.total === 0 && (
        <div className="card"><p className="muted">Nothing tagged #{label} yet. Be the first — start a discussion in Real Talk.</p></div>
      )}

      {hub.posts.length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <h2 style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, color: '#1C2B3A', margin: '0 0 12px' }}>
            Real Talk · {hub.posts.length}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720 }}>
            {hub.posts.map((p) => <CommunityPostCard key={p.id} post={p} base="/app/community" />)}
          </div>
        </section>
      )}

      {hub.blogs.length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <h2 style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, color: '#1C2B3A', margin: '0 0 12px' }}>
            Read · {hub.blogs.length}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {hub.blogs.map((b) => (
              <Link key={b.slug} href={`/blog/${b.slug}`} style={{ textDecoration: 'none' }}>
                <article className="card" style={{ height: '100%' }}>
                  <h3 style={{ fontFamily: HEAD, fontSize: 18, fontWeight: 800, color: '#1C2B3A', lineHeight: 1.25, margin: '0 0 6px' }}>{b.title}</h3>
                  <p className="muted" style={{ fontSize: 12.5, margin: 0 }}>{b.readTime}</p>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {hub.videos.length > 0 && (
        <section style={{ marginBottom: 30 }}>
          <h2 style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, color: '#1C2B3A', margin: '0 0 12px' }}>
            Watch · {hub.videos.length}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {hub.videos.map((v) => <VideoCard key={v.id} video={v} accent={coral} />)}
          </div>
        </section>
      )}

      {/* Browse other tags */}
      <section>
        <h2 style={{ fontFamily: HEAD, fontSize: 20, fontWeight: 700, color: '#1C2B3A', margin: '0 0 10px' }}>Browse other tags</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {TAGS.filter((t) => t.slug !== slug).slice(0, 24).map((t) => (
            <Link key={t.slug} href={`/app/tag/${t.slug}`} style={{ textDecoration: 'none', fontSize: 12.5, fontWeight: 600, padding: '5px 12px', borderRadius: 999, background: 'rgba(28,43,58,.06)', color: '#1C2B3A' }}>
              {t.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
