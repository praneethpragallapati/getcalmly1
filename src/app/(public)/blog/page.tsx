'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

const posts = [
  {
    slug: 'when-anxiety-feels-like-intuition',
    title: 'When Anxiety Feels Like Intuition',
    excerpt:
      'I spent years trusting my "gut" — only to realise I was mistaking chronic worry for wisdom. Here is how I learned to tell the difference in my sessions.',
    author: 'Dr. Meera Krishnan',
    role: 'Clinical Psychologist',
    date: '12 June 2026',
    readTime: '6 min read',
    tags: ['anxiety', 'self-awareness', 'therapy'],
    cover: null,
  },
  {
    slug: 'postpartum-is-not-just-baby-blues',
    title: 'Postpartum Is Not Just Baby Blues',
    excerpt:
      'New mothers are told to "enjoy every moment," but no one talks about the fog, the guilt, or the rage. As a therapist and a mother, I want to change that.',
    author: 'Dr. Shruti Agarwal',
    role: 'Perinatal Mental Health Specialist',
    date: '8 June 2026',
    readTime: '8 min read',
    tags: ['postpartum', 'mothers-health', 'depression'],
    cover: null,
  },
  {
    slug: 'why-men-in-india-dont-go-to-therapy',
    title: "Why Men in India Don't Go to Therapy (And What Shifts That)",
    excerpt:
      "My male clients rarely walk in by choice. Most come because someone who loves them asked them to. That first conversation is everything — here's what I've learnt.",
    author: 'Dr. Rahul Nair',
    role: 'Counselling Psychologist',
    date: '3 June 2026',
    readTime: '7 min read',
    tags: ['men-mental-health', 'stigma', 'relationships'],
    cover: null,
  },
  {
    slug: 'the-truth-about-cbt',
    title: 'The Truth About CBT That No One Mentions in the Brochure',
    excerpt:
      'Cognitive Behavioural Therapy works. But it also asks you to challenge thoughts that feel completely true. My clients often hate the first few weeks — and then something shifts.',
    author: 'Dr. Ananya Sharma',
    role: 'Clinical Psychologist, CBT Specialist',
    date: '28 May 2026',
    readTime: '9 min read',
    tags: ['cbt', 'therapy', 'anxiety', 'depression'],
    cover: null,
  },
  {
    slug: 'grief-has-no-timeline',
    title: 'Grief Has No Timeline',
    excerpt:
      'A year after the loss, people expect you to be "over it." But grief is not linear — and as someone who has sat with hundreds of grieving clients, I can tell you: there is no right way through it.',
    author: 'Dr. Fathima Zahra',
    role: 'Grief & Trauma Counsellor',
    date: '20 May 2026',
    readTime: '6 min read',
    tags: ['grief', 'loss', 'self-awareness'],
    cover: null,
  },
]

const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)))

export default function BlogPage() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

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
  }, [search, activeTag])

  return (
    <div style={{ background: '#F9F5F2', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          background: '#1C2B3A',
          padding: '72px 24px 48px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#C8553D',
            marginBottom: 16,
          }}
        >
          The getCalmly blog
        </p>
        <h1
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.04,
            marginBottom: 16,
          }}
        >
          Perspectives from our clinicians
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: 17,
            maxWidth: 540,
            margin: '0 auto 32px',
            lineHeight: 1.65,
          }}
        >
          Evidence-based reads on anxiety, grief, relationships and more — written by RCI-verified
          mental health professionals who work with real people every day.
        </p>

        {/* Search */}
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              fontSize: 15,
              outline: 'none',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </section>

      {/* Tag filters */}
      <section
        style={{
          padding: '24px 24px 0',
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => setActiveTag(null)}
          style={{
            padding: '6px 16px',
            borderRadius: 999,
            border: '1.5px solid',
            borderColor: activeTag === null ? '#C8553D' : '#d5cbc5',
            background: activeTag === null ? '#C8553D' : 'transparent',
            color: activeTag === null ? '#fff' : '#1C2B3A',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              border: '1.5px solid',
              borderColor: activeTag === tag ? '#C8553D' : '#d5cbc5',
              background: activeTag === tag ? '#C8553D' : 'transparent',
              color: activeTag === tag ? '#fff' : '#1C2B3A',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tag}
          </button>
        ))}
      </section>

      {/* Post grid */}
      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '32px 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
        }}
      >
        {filtered.length === 0 && (
          <p style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center', padding: '48px 0' }}>
            No articles match your search.
          </p>
        )}
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: 'none', display: 'flex' }}
          >
            <article
              style={{
                background: '#fff',
                borderRadius: 20,
                padding: '28px 28px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxShadow: '0 2px 12px rgba(28,43,58,0.07)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer',
                flex: 1,
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  '0 8px 28px rgba(28,43,58,0.14)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow =
                  '0 2px 12px rgba(28,43,58,0.07)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {post.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: '#F2ECE8',
                      color: '#C8553D',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 999,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: "'Big Shoulders Display', sans-serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#1C2B3A',
                  lineHeight: 1.2,
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

              {/* Author + meta */}
              <div
                style={{
                  borderTop: '1px solid #f0eae6',
                  paddingTop: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1C2B3A' }}>
                  {post.author}
                </span>
                <span style={{ fontSize: 12, color: '#8a9aaa' }}>{post.role}</span>
                <span style={{ fontSize: 12, color: '#8a9aaa', marginTop: 4 }}>
                  {post.date} · {post.readTime}
                </span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </div>
  )
}
