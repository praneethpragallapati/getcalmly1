'use client'

import Link from 'next/link'
import { coverFor, initials } from '@/components/blog/BlogList'
import { RoleBadge, avatarColor } from '@/components/community/CommunityFeed'
import type { BlogPostView } from '@/lib/blog'
import type { CommunityPostView } from '@/lib/community'

const HEAD_FONT = "'Big Shoulders Display', sans-serif"
const CORAL = '#C8553D'
const CHARCOAL = '#1C2B3A'

const cardShadow = '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)'
const cardShadowHover = '0 18px 48px rgba(28,43,58,.12)'

/**
 * "Real Talk", getCalmly's content hub, laid out like a marketplace hub:
 * a short warm hero band, then compact rows (header + "view all" + three
 * small cards) so several content types fit on one screen. New content
 * types (podcasts, videos…) slot in as additional <HubRow>s.
 */
export default function RealTalkHub({
  blogPosts,
  communityPosts,
}: {
  blogPosts: BlogPostView[]
  communityPosts: CommunityPostView[]
}) {
  return (
    <div style={{ background: '#FFFCFA' }}>
      {/* ── Compact hero band (warm terracotta, not charcoal) ────────── */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse 65% 75% at 88% 10%, rgba(232,137,111,.30), transparent 58%), radial-gradient(ellipse 45% 60% at 4% 80%, rgba(217,140,74,.16), transparent 60%), #331D18',
          padding: '124px 24px 54px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#E8896F',
            marginBottom: 14,
          }}
        >
          The getCalmly content hub
        </p>
        <h1
          style={{
            fontFamily: HEAD_FONT,
            fontSize: 'clamp(42px, 7vw, 68px)',
            fontWeight: 300,
            color: '#fff',
            lineHeight: 0.98,
            letterSpacing: '-0.5px',
            marginBottom: 14,
          }}
        >
          Real Talk
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 16.5,
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Honest reads from our clinicians, and a community where you&apos;re not the only one
          who&apos;s felt this way.
        </p>
      </section>

      {/* ── Content rows ─────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '44px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 48,
        }}
      >
        <HubRow
          kicker="From our clinicians"
          title="Latest reads"
          linkHref="/blog"
          linkLabel={`All ${blogPosts.length} articles →`}
        >
          {blogPosts.slice(0, 3).map((post) => (
            <CompactArticleCard key={post.slug} post={post} />
          ))}
        </HubRow>

        <HubRow
          kicker="The circles"
          title="From the community"
          linkHref="/community"
          linkLabel="Visit the circles →"
        >
          {communityPosts.slice(0, 3).map((post) => (
            <CompactCircleCard key={post.id} post={post} />
          ))}
        </HubRow>

        {/* Future rows (podcasts, videos…) drop in here as more <HubRow>s. */}
      </div>
    </div>
  )
}

/** One compact hub row: section header with a "view all" link + a 3-up card grid. */
function HubRow({
  kicker,
  title,
  linkHref,
  linkLabel,
  children,
}: {
  kicker: string
  title: string
  linkHref: string
  linkLabel: string
  children: React.ReactNode
}) {
  return (
    // .lp-page gives bare <section>s 152px padding, this row manages its own spacing.
    <section style={{ padding: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: CORAL,
              marginBottom: 6,
            }}
          >
            {kicker}
          </p>
          <h2
            style={{
              fontFamily: HEAD_FONT,
              fontSize: 'clamp(26px, 3.6vw, 34px)',
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
            paddingBottom: 3,
          }}
        >
          {linkLabel}
        </Link>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 18,
        }}
      >
        {children}
      </div>
    </section>
  )
}

function hoverLift(e: React.MouseEvent, on: boolean) {
  const el = e.currentTarget as HTMLElement
  el.style.boxShadow = on ? cardShadowHover : cardShadow
  el.style.transform = on ? 'translateY(-3px)' : 'translateY(0)'
}

/** Small article card: gradient thumb, tag, two-line title, author + read time. */
function CompactArticleCard({ post }: { post: BlogPostView }) {
  const grad = coverFor(post.tags[0])
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
      <article
        style={{
          flex: 1,
          background: '#fff',
          borderRadius: 18,
          padding: '18px 20px',
          border: '1px solid rgba(28,43,58,.07)',
          boxShadow: cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'box-shadow 0.22s, transform 0.22s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => hoverLift(e, true)}
        onMouseLeave={(e) => hoverLift(e, false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              flexShrink: 0,
              background: `linear-gradient(140deg, ${grad.from}, ${grad.to})`,
              color: 'rgba(255,255,255,.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: HEAD_FONT,
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            {initials(post.author)}
          </div>
          <span
            style={{
              background: '#F2ECE8',
              color: CORAL,
              fontSize: 10.5,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 999,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            {post.tags[0]}
          </span>
        </div>
        <h3
          style={{
            fontFamily: HEAD_FONT,
            fontSize: 20,
            fontWeight: 300,
            color: CHARCOAL,
            lineHeight: 1.18,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </h3>
        <p style={{ fontSize: 12.5, color: '#8a9aaa', margin: 'auto 0 0', paddingTop: 2 }}>
          {post.author} · {post.readTime}
        </p>
      </article>
    </Link>
  )
}

/** Small community card: author + role, two-line title, votes/comments meta. */
function CompactCircleCard({ post }: { post: CommunityPostView }) {
  return (
    <Link href={`/community/${post.id}`} style={{ textDecoration: 'none', display: 'flex' }}>
      <article
        style={{
          flex: 1,
          background: '#fff',
          borderRadius: 18,
          padding: '18px 20px',
          border: '1px solid rgba(28,43,58,.07)',
          boxShadow: cardShadow,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'box-shadow 0.22s, transform 0.22s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => hoverLift(e, true)}
        onMouseLeave={(e) => hoverLift(e, false)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flexShrink: 0,
              background: avatarColor(post.author),
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: HEAD_FONT,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {post.author.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 700, fontSize: 13.5, color: CHARCOAL }}>{post.author}</span>
          <RoleBadge role={post.role} />
        </div>
        <h3
          style={{
            fontFamily: HEAD_FONT,
            fontSize: 19,
            fontWeight: 300,
            color: CHARCOAL,
            lineHeight: 1.2,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.title}
        </h3>
        <p
          style={{
            fontSize: 12.5,
            color: '#8a9aaa',
            margin: 'auto 0 0',
            paddingTop: 2,
            fontWeight: 600,
          }}
        >
          ▲ {post.upvotes} · 💬 {post.comments} · {post.date}
        </p>
      </article>
    </Link>
  )
}
