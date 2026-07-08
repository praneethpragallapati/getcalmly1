'use client'

import Link from 'next/link'
import { BlogLeadCard, BlogCard } from '@/components/blog/BlogList'
import { CommunityPostCard } from '@/components/community/CommunityFeed'
import type { BlogPostView } from '@/lib/blog'
import type { CommunityPostView } from '@/lib/community'

const HEAD_FONT = "'Big Shoulders Display', sans-serif"
const CORAL = '#C8553D'
const CHARCOAL = '#1C2B3A'

/**
 * "Real Talk" — getCalmly's content hub, laid out as a magazine landing:
 * one shared hero, then a featured-articles section and a community-highlights
 * section stacked in a single scroll. The full experiences live at /blog and
 * /community; this page is the front door to both.
 */
export default function RealTalkHub({
  blogPosts,
  communityPosts,
}: {
  blogPosts: BlogPostView[]
  communityPosts: CommunityPostView[]
}) {
  const [lead, ...more] = blogPosts
  const gridPosts = more.slice(0, 3)
  const circlePosts = communityPosts.slice(0, 3)

  return (
    <div style={{ background: '#FFFCFA' }}>
      {/* ── Shared hero ─────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.12), transparent 60%), #141E29',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '72vh',
          padding: '128px 24px 80px',
          textAlign: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -120,
            left: '12%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,85,61,0.10), transparent 65%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -160,
            right: '8%',
            width: 460,
            height: 460,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(61,158,114,0.10), transparent 65%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: CORAL,
              marginBottom: 18,
            }}
          >
            The getCalmly content hub
          </p>
          <h1
            style={{
              fontFamily: HEAD_FONT,
              fontSize: 'clamp(52px, 10vw, 100px)',
              fontWeight: 300,
              color: '#fff',
              lineHeight: 0.98,
              letterSpacing: '-0.5px',
              marginBottom: 20,
            }}
          >
            Real Talk
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 18,
              maxWidth: 580,
              margin: '0 auto 40px',
              lineHeight: 1.65,
            }}
          >
            Honest, evidence-based reads from our clinicians — and a safe, moderated community
            where you&apos;re not the only one who&apos;s felt this way.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#read" style={heroCta(true)}>
              ✦ Read the articles
            </a>
            <a href="#circles" style={heroCta(false)}>
              Step into the circles
            </a>
          </div>
        </div>
      </section>

      {/* ── Latest reads ────────────────────────────────────────────── */}
      <section
        id="read"
        style={{ maxWidth: 1120, margin: '0 auto', padding: '72px 24px 0', scrollMarginTop: 68 }}
      >
        <SectionHeader
          kicker="From our clinicians"
          title="The latest reads"
          linkHref="/blog"
          linkLabel="All articles →"
        />
        {lead && <BlogLeadCard post={lead} />}
        {gridPosts.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 26,
              marginTop: 26,
            }}
          >
            {gridPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', padding: '40px 0 0' }}>
          <Link href="/blog" style={sectionCta(false)}>
            Read all {blogPosts.length} articles
          </Link>
        </div>
      </section>

      {/* ── From the circles ────────────────────────────────────────── */}
      <section id="circles" style={{ padding: '88px 0 0', scrollMarginTop: 68 }}>
        <div style={{ background: '#F7F1EC', padding: '64px 24px 80px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <SectionHeader
              kicker="The circles"
              title="You're not the only one"
              linkHref="/community"
              linkLabel="Visit the circles →"
            />
            <p style={{ fontSize: 15.5, color: '#5A6A7A', lineHeight: 1.65, margin: '-16px 0 30px' }}>
              A moderated space where members, therapists and psychiatrists talk honestly. Read
              freely — join to take part.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {circlePosts.map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <Link href="/community" style={sectionCta(true)}>
                Step into the circles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({
  kicker,
  title,
  linkHref,
  linkLabel,
}: {
  kicker: string
  title: string
  linkHref: string
  linkLabel: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 30,
      }}
    >
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: CORAL,
            marginBottom: 10,
          }}
        >
          {kicker}
        </p>
        <h2
          style={{
            fontFamily: HEAD_FONT,
            fontSize: 'clamp(32px, 5vw, 46px)',
            fontWeight: 300,
            color: CHARCOAL,
            lineHeight: 1.02,
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      <Link
        href={linkHref}
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: CORAL,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          paddingBottom: 4,
        }}
      >
        {linkLabel}
      </Link>
    </div>
  )
}

function heroCta(primary: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '14px 30px',
    borderRadius: 50,
    fontSize: 15,
    fontWeight: 700,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
    color: '#fff',
    background: primary ? CORAL : 'rgba(255,255,255,0.08)',
    border: primary ? '1.5px solid transparent' : '1.5px solid rgba(255,255,255,0.22)',
    boxShadow: primary ? '0 6px 22px rgba(200,85,61,.4)' : 'none',
  }
}

function sectionCta(primary: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '14px 32px',
    borderRadius: 50,
    fontSize: 15,
    fontWeight: 700,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
    color: primary ? '#fff' : CORAL,
    background: primary ? CORAL : 'transparent',
    border: `1.5px solid ${primary ? CORAL : 'rgba(200,85,61,.45)'}`,
    boxShadow: primary ? '0 6px 22px rgba(200,85,61,.35)' : 'none',
  }
}
