import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPost, getRelatedBlogPosts } from '@/lib/blog'
import { getRelatedDiscussions } from '@/lib/community'
import BlogCover from '@/components/blog/BlogCover'
import { blogImage } from '@/data/blogImages'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getcalmly.com'

// Per-post SEO: unique title, description, canonical and social card so each
// article ranks (and previews) on its own rather than inheriting the homepage.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: 'Article not found' }

  const description = post.excerpt.slice(0, 158)
  const url = `${SITE_URL}/blog/${post.slug}`
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: { card: 'summary_large_image', title: post.title, description },
  }
}

const tagGradients: Record<string, { from: string; to: string }> = {
  anxiety: { from: '#2E4A5C', to: '#1C2B3A' },
  postpartum: { from: '#7A4A52', to: '#3E2A38' },
  'men-mental-health': { from: '#2D4A45', to: '#1C302C' },
  cbt: { from: '#5A4A6E', to: '#2E2740' },
  grief: { from: '#3A4A6E', to: '#222B45' },
}

function coverFor(tag: string) {
  return tagGradients[tag] ?? { from: '#2E4A5C', to: '#1C2B3A' }
}

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Read fresh from the database each request (falls back to bundled content).
export const dynamic = 'force-dynamic'

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  const related = await getRelatedDiscussions(post.tags, 3)
  const relatedReads = await getRelatedBlogPosts(post.tags, post.slug, 3)
  const cover = coverFor(post.tags[0])

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    keywords: post.tags.join(', '),
    articleBody: post.content.join('\n\n'),
    author: { '@type': 'Person', name: post.author, jobTitle: post.role },
    publisher: {
      '@type': 'Organization',
      name: 'getCalmly',
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <div style={{ background: '#F9F5F2', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${cover.from}, ${cover.to})`,
          padding: '64px 24px 72px',
        }}
      >
        {/* cover photo behind the gradient/orbs (falls back to gradient) */}
        <BlogCover
          src={blogImage(post.tags)}
          alt={post.title}
          scrim={`linear-gradient(160deg, ${cover.from}cc 0%, ${cover.to}e6 100%)`}
        />
        {/* gradient glow orbs */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -140,
            right: '6%',
            width: 440,
            height: 440,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,85,61,0.30), transparent 65%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -180,
            left: '4%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(61,158,114,0.22), transparent 65%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
          }}
        />
        <span
          aria-hidden
          style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontSize: 320,
            fontWeight: 900,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.05)',
            position: 'absolute',
            right: -10,
            bottom: -90,
            pointerEvents: 'none',
          }}
        >
          {initials(post.author)}
        </span>

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link
            href="/blog"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'rgba(255,255,255,0.62)',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: 30,
            }}
          >
            ← Back to blog
          </Link>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {post.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '5px 13px',
                  borderRadius: 999,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <h1
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 'clamp(34px, 6vw, 60px)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.03,
              letterSpacing: '-0.5px',
              marginBottom: 30,
            }}
          >
            {post.title}
          </h1>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.16)',
                border: '1.5px solid rgba(255,255,255,0.28)',
                color: '#fff',
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              {initials(post.author)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{post.author}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                {post.role} · {post.date} · {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article */}
      <section style={{ padding: '48px 24px', maxWidth: 768, margin: '0 auto' }}>
        <article
          style={{
            background: '#fff',
            borderRadius: 24,
            padding: 'clamp(28px, 5vw, 56px)',
            boxShadow: '0 6px 30px rgba(28,43,58,0.10)',
            marginTop: -64,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {post.content.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: 17.5,
                lineHeight: 1.82,
                color: '#2e3d4e',
                margin: 0,
                marginBottom: i < post.content.length - 1 ? 26 : 0,
                ...(i === 0
                  ? {
                      fontSize: 19,
                      color: '#1C2B3A',
                    }
                  : {}),
              }}
            >
              {i === 0 ? (
                <>
                  <span
                    style={{
                      float: 'left',
                      fontFamily: "'Big Shoulders Display', sans-serif",
                      fontSize: 68,
                      lineHeight: 0.82,
                      fontWeight: 900,
                      color: '#C8553D',
                      marginRight: 12,
                      marginTop: 6,
                    }}
                  >
                    {para.charAt(0)}
                  </span>
                  {para.slice(1)}
                </>
              ) : (
                para
              )}
            </p>
          ))}

          {/* Author bio strip */}
          <div
            style={{
              marginTop: 40,
              paddingTop: 28,
              borderTop: '1px solid #f0eae6',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(140deg, ${cover.from}, ${cover.to})`,
                color: '#fff',
                fontFamily: "'Big Shoulders Display', sans-serif",
                fontWeight: 800,
                fontSize: 19,
              }}
            >
              {initials(post.author)}
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1C2B3A' }}>{post.author}</span>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7D8E', lineHeight: 1.55 }}>
                {post.author} is a {post.role.toLowerCase()} practising on GetCalmly.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Related community discussions */}
      {related.length > 0 && (
        <section style={{ padding: '24px 24px 48px', maxWidth: 768, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#C8553D',
              marginBottom: 8,
            }}
          >
            Keep the conversation going
          </p>
          <h2
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: '#1C2B3A',
              marginBottom: 18,
            }}
          >
            Related community discussions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {related.map((r) => (
              <Link key={r.id} href={`/community/${r.id}`} className="gc-related-card" style={{ textDecoration: 'none' }}>
                <div className="gc-related-inner">
                  <span style={{ fontSize: 15, color: '#1C2B3A', fontWeight: 600, lineHeight: 1.4 }}>
                    {r.title}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#C8553D',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    View on community →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related reads (other articles with shared tags) */}
      {relatedReads.length > 0 && (
        <section style={{ padding: '8px 24px 48px', maxWidth: 768, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#C8553D', marginBottom: 8 }}>
            More on these themes
          </p>
          <h2 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 28, fontWeight: 800, color: '#1C2B3A', marginBottom: 18 }}>
            Related reads
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {relatedReads.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} style={{ textDecoration: 'none' }}>
                <article style={{ position: 'relative', height: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)' }}>
                  <div style={{ position: 'relative', height: 96, background: `linear-gradient(140deg, ${coverFor(r.tags[0]).from}, ${coverFor(r.tags[0]).to})`, overflow: 'hidden' }}>
                    <BlogCover src={blogImage(r.tags)} alt={r.title} />
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <h3 style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 17, fontWeight: 800, color: '#1C2B3A', lineHeight: 1.2, margin: '0 0 6px' }}>
                      {r.title}
                    </h3>
                    <p style={{ fontSize: 12.5, color: '#6B7D8E', margin: 0 }}>{r.readTime}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '0 24px 88px', maxWidth: 768, margin: '0 auto' }}>
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #C8553D, #A8412C)',
            borderRadius: 24,
            padding: '52px 40px',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(200,85,61,0.30)',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -120,
              right: -60,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 65%)',
              pointerEvents: 'none',
            }}
          />
          <h2
            style={{
              fontFamily: "'Big Shoulders Display', sans-serif",
              fontSize: 30,
              fontWeight: 900,
              color: '#fff',
              marginBottom: 10,
            }}
          >
            Ready to talk to someone?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Our RCI-verified clinicians are here. A free first session is all it takes to find your match.
          </p>
          <Link
            href="/pricing"
            style={{
              display: 'inline-block',
              background: '#fff',
              color: '#C8553D',
              padding: '13px 32px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            Book a session →
          </Link>
        </div>
      </section>

      {/* Hover styles for related cards (server component — CSS, not JS handlers) */}
      <style>{`
        .gc-related-card .gc-related-inner {
          background: #fff;
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          box-shadow: 0 2px 10px rgba(28,43,58,0.06);
          border: 1.5px solid #f0eae6;
          transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
        }
        .gc-related-card:hover .gc-related-inner {
          border-color: #C8553D;
          transform: translateX(4px);
          box-shadow: 0 8px 22px rgba(28,43,58,0.12);
        }
      `}</style>
    </div>
  )
}
