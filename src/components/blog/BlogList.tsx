'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import type { BlogPostView } from '@/lib/blog'
import BlogCover from '@/components/blog/BlogCover'
import { blogImage } from '@/data/blogImages'

// Tasteful gradient "cover" varied by the post's primary tag/category.
const tagGradients: Record<string, { from: string; to: string }> = {
  anxiety: { from: '#2E4A5C', to: '#1C2B3A' },
  postpartum: { from: '#7A4A52', to: '#3E2A38' },
  'men-mental-health': { from: '#2D4A45', to: '#1C302C' },
  cbt: { from: '#5A4A6E', to: '#2E2740' },
  grief: { from: '#3A4A6E', to: '#222B45' },
}

export function coverFor(tag: string) {
  return tagGradients[tag] ?? { from: '#2E4A5C', to: '#1C2B3A' }
}

export function initials(name: string) {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function BlogList({ posts }: { posts: BlogPostView[] }) {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => Array.from(new Set(posts.flatMap((p) => p.tags))), [posts])

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesTag = activeTag ? p.tags.includes(activeTag) : true
      const q = search.toLowerCase()
      const matchesSearch =
        q === '' ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q)
      return matchesTag && matchesSearch
    })
  }, [posts, search, activeTag])

  const [lead, ...rest] = filtered

  return (
    <div style={{ background: '#FFFCFA', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse 65% 75% at 88% 8%, rgba(200,85,61,.28), transparent 55%), radial-gradient(ellipse 45% 60% at 4% 80%, rgba(200,85,61,.12), transparent 60%), #141E29',
          padding: '124px 24px 56px',
          textAlign: 'center',
        }}
      >
        {/* gradient glow orbs */}
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
              color: '#C8553D',
              marginBottom: 18,
            }}
          >
            From our experts
          </p>
          <h1
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 'clamp(40px, 6vw, 62px)',
              fontWeight: 300,
              color: '#fff',
              lineHeight: 0.98,
              letterSpacing: '-0.5px',
              marginBottom: 18,
            }}
          >
            Perspectives
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 18,
              maxWidth: 560,
              margin: '0 auto 36px',
              lineHeight: 1.65,
            }}
          >
            Evidence-based reads on anxiety, grief, relationships and more, written by RCI-verified
            mental health professionals who work with real people every day.
          </p>

          {/* Search */}
          <div style={{ maxWidth: 460, margin: '0 auto', position: 'relative' }}>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 16,
                opacity: 0.7,
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px 14px 50px',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.16)',
                fontSize: 15,
                outline: 'none',
                background: 'rgba(255,255,255,0.10)',
                color: '#fff',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </section>

      {/* Tag filters + count */}
      <section
        style={{
          padding: '32px 24px 0',
          maxWidth: 1120,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <button onClick={() => setActiveTag(null)} style={chipStyle(activeTag === null)}>
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              style={chipStyle(activeTag === tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <p
          style={{
            marginTop: 18,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: '#6B7D8E',
          }}
        >
          {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
          {activeTag ? ` in “${activeTag}”` : ''}
        </p>
      </section>

      {filtered.length === 0 && (
        <p style={{ color: '#6B7D8E', textAlign: 'center', padding: '76px 24px 96px' }}>
          No articles match your search.
        </p>
      )}

      {/* Featured / lead post */}
      {lead && (
        <section style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 24px 0' }}>
          <BlogLeadCard post={lead} />
        </section>
      )}

      {/* Post grid */}
      <section
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: '28px 24px 96px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 26,
        }}
      >
        {rest.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </section>
    </div>
  )
}

/** Large split featured-article card. Shared with the Calm Club hub. */
export function BlogLeadCard({ post }: { post: BlogPostView }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <article
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
          background: '#fff',
          borderRadius: 26,
          overflow: 'hidden',
          border: '1px solid rgba(28,43,58,.07)',
          boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
          transition: 'box-shadow 0.25s, transform 0.25s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow =
            '0 18px 48px rgba(28,43,58,.12)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow =
            '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        }}
      >
        {/* Cover panel */}
        <div
          style={{
            position: 'relative',
            minHeight: 300,
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: `linear-gradient(150deg, ${coverFor(post.tags[0]).from}, ${
              coverFor(post.tags[0]).to
            })`,
            overflow: 'hidden',
          }}
        >
          <BlogCover src={blogImage(post.tags)} alt={post.title} />
          <span
            style={{
              position: 'relative',
              alignSelf: 'flex-start',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: '#fff',
              background: 'rgba(255,255,255,0.16)',
              padding: '6px 14px',
              borderRadius: 999,
              backdropFilter: 'blur(4px)',
            }}
          >
            Featured · {post.tags[0]}
          </span>
          <span
            aria-hidden
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 160,
              fontWeight: 900,
              lineHeight: 1,
              color: 'rgba(255,255,255,0.10)',
              position: 'absolute',
              right: 18,
              bottom: -34,
            }}
          >
            {initials(post.author)}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '36px 38px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {post.tags.map((t) => (
              <span key={t} style={tagPillStyle}>
                {t}
              </span>
            ))}
          </div>
          <h2
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 'clamp(26px, 3.4vw, 38px)',
              fontWeight: 300,
              color: '#1C2B3A',
              lineHeight: 1.08,
              margin: 0,
            }}
          >
            {post.title}
          </h2>
          <p style={{ fontSize: 16, color: '#5a6a78', lineHeight: 1.7, margin: 0 }}>
            {post.excerpt}
          </p>
          <div style={{ marginTop: 'auto', paddingTop: 18 }}>
            <AuthorRow post={post} />
          </div>
        </div>
      </article>
    </Link>
  )
}

/** Standard grid article card. Shared with the Calm Club hub. */
export function BlogCard({ post }: { post: BlogPostView }) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
      <article
        style={{
          background: '#fff',
          borderRadius: 22,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(28,43,58,.07)',
          boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
          transition: 'box-shadow 0.22s, transform 0.22s',
          cursor: 'pointer',
          flex: 1,
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow =
            '0 18px 48px rgba(28,43,58,.12)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow =
            '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        }}
      >
        {/* Generated cover band */}
        <div
          style={{
            position: 'relative',
            height: 132,
            padding: '18px 22px',
            display: 'flex',
            alignItems: 'flex-start',
            background: `linear-gradient(140deg, ${coverFor(post.tags[0]).from}, ${
              coverFor(post.tags[0]).to
            })`,
            overflow: 'hidden',
          }}
        >
          <BlogCover src={blogImage(post.tags)} alt={post.title} />
          <span
            style={{
              position: 'relative',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.92)',
              background: 'rgba(255,255,255,0.15)',
              padding: '5px 12px',
              borderRadius: 999,
            }}
          >
            {post.tags[0]}
          </span>
          <span
            aria-hidden
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 110,
              fontWeight: 900,
              lineHeight: 1,
              color: 'rgba(255,255,255,0.12)',
              position: 'absolute',
              right: 14,
              bottom: -26,
            }}
          >
            {initials(post.author)}
          </span>
        </div>

        <div style={{ padding: '22px 24px 22px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          {/* Title */}
          <h2
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 23,
              fontWeight: 300,
              color: '#1C2B3A',
              lineHeight: 1.18,
              margin: 0,
            }}
          >
            {post.title}
          </h2>

          {/* Excerpt */}
          <p
            style={{
              fontSize: 14,
              color: '#5a6a78',
              lineHeight: 1.65,
              margin: 0,
              flexGrow: 1,
            }}
          >
            {post.excerpt}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {post.tags.map((t) => (
              <span key={t} style={tagPillStyle}>
                {t}
              </span>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #f0eae6', paddingTop: 14 }}>
            <AuthorRow post={post} />
          </div>
        </div>
      </article>
    </Link>
  )
}

function AuthorRow({
  post,
}: {
  post: { author: string; role: string; date: string; readTime: string; tags: string[] }
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(140deg, ${coverFor(post.tags[0]).from}, ${
            coverFor(post.tags[0]).to
          })`,
          color: '#fff',
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: '0.5px',
        }}
      >
        {initials(post.author)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: '#1C2B3A' }}>{post.author}</span>
        <span style={{ fontSize: 12, color: '#6B7D8E' }}>{post.role}</span>
        <span style={{ fontSize: 11.5, color: '#8a9aaa', marginTop: 3 }}>
          {post.date} · {post.readTime}
        </span>
      </div>
    </div>
  )
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '7px 16px',
    borderRadius: 999,
    border: '1.5px solid',
    borderColor: active ? '#C8553D' : '#d5cbc5',
    background: active ? '#C8553D' : 'transparent',
    color: active ? '#fff' : '#1C2B3A',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: active ? '0 4px 14px rgba(200,85,61,0.30)' : 'none',
    transition: 'all 0.15s',
  }
}

const tagPillStyle: React.CSSProperties = {
  background: '#F2ECE8',
  color: '#C8553D',
  fontSize: 11,
  fontWeight: 700,
  padding: '3px 10px',
  borderRadius: 999,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
}
