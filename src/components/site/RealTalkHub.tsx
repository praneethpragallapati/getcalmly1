'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import BlogCover from '@/components/blog/BlogCover'
import { blogImage } from '@/data/blogImages'
import { coverFor, initials } from '@/components/blog/BlogList'
import { RoleBadge, avatarColor } from '@/components/community/CommunityFeed'
import type { BlogPostView } from '@/lib/blog'
import type { CommunityPostView } from '@/lib/community'

const HEAD = "'Big Shoulders Display', sans-serif"
const CORAL = '#C8553D'
const CHARCOAL = '#1C2B3A'

/* ── Ambient + interaction CSS (keyframes, reveal, hover) ─────────────── */
const CSS = `
.rt-root{--rt-coral:#C8553D;--rt-gold:#E0A45C;--rt-violet:#8B6FC9;}
@keyframes rtFloat1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.15)}}
@keyframes rtFloat2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-50px,40px) scale(1.1)}}
@keyframes rtFloat3{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,50px) scale(1.2)}}
@keyframes rtShimmer{to{background-position:220% center}}
@keyframes rtMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes rtPulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(90,220,150,.5)}50%{opacity:.6;box-shadow:0 0 0 6px rgba(90,220,150,0)}}
.rt-blob{position:absolute;border-radius:50%;filter:blur(40px);pointer-events:none;will-change:transform;}
.rt-shimmer{background:linear-gradient(100deg,var(--rt-coral) 0%,var(--rt-gold) 30%,#F0C89B 50%,var(--rt-gold) 70%,var(--rt-coral) 100%);background-size:220% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;animation:rtShimmer 6s linear infinite;}
.rt-ticker-track{display:inline-flex;gap:0;white-space:nowrap;animation:rtMarquee 40s linear infinite;}
.rt-root:hover .rt-ticker-track,.rt-ticker-track:hover{animation-play-state:paused;}
.rt-dot{width:8px;height:8px;border-radius:50%;background:#5ADC96;display:inline-block;animation:rtPulse 2.2s ease-in-out infinite;}
.rt-reveal{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);}
.rt-reveal.rt-in{opacity:1;transform:none;}
.rt-card{transition:transform .28s cubic-bezier(.2,.7,.2,1),box-shadow .28s,border-color .28s;will-change:transform;}
.rt-card:hover{transform:translateY(-6px);box-shadow:0 26px 60px rgba(28,43,58,.16);}
.rt-chip{transition:transform .18s,background .18s,color .18s,border-color .18s;}
.rt-chip:hover{transform:translateY(-2px);background:var(--rt-coral);color:#fff;border-color:var(--rt-coral);}
.rt-up{transition:transform .2s;}
.rt-card:hover .rt-up{transform:translateY(-3px) scale(1.06);}
.rt-cta-btn{transition:transform .2s,box-shadow .2s,background .2s;}
.rt-cta-btn:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(200,85,61,.45);}
.rt-feat:hover .rt-feat-img{transform:scale(1.05);}
.rt-feat-img{transition:transform .5s cubic-bezier(.2,.7,.2,1);}
.rt-cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:start;}
@media(max-width:860px){.rt-cols{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(max-width:560px){.rt-cols{grid-template-columns:minmax(0,1fr);}}
@media (prefers-reduced-motion: reduce){
  .rt-blob,.rt-ticker-track,.rt-shimmer,.rt-dot{animation:none!important}
  .rt-reveal{opacity:1;transform:none;transition:none}
}
`

/** Reveal-on-scroll: adds .rt-in to every .rt-reveal as it enters the viewport. */
function useScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.rt-reveal'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('rt-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            ;(e.target as HTMLElement).classList.add('rt-in')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** Count-up number that runs once when scrolled into view. */
function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    let raf = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        const dur = 1100
        const start = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - start) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(end * eased))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(node)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [end])
  return (
    <span ref={ref}>
      {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
      {suffix}
    </span>
  )
}

/**
 * "Calm Club" — the articles + community hub. An immersive, animated
 * front door built to pull people into the community: a living hero with a
 * recent-activity ticker, a bento of featured reads, and a community showcase
 * with real social proof and a low-friction join.
 */
export default function RealTalkHub({
  blogPosts,
  communityPosts,
}: {
  blogPosts: BlogPostView[]
  communityPosts: CommunityPostView[]
}) {
  useScrollReveal()

  const [lead, ...restPosts] = blogPosts
  const secondaryPosts = restPosts.slice(0, 2)

  // Real social proof from the actual community data.
  const convos = communityPosts.length
  const replies = communityPosts.reduce((n, p) => n + p.comments, 0)
  const hearts = communityPosts.reduce((n, p) => n + p.upvotes, 0)

  // Top topics by frequency, for the browsable chips.
  const topics = useMemo(() => {
    const freq = new Map<string, number>()
    communityPosts.forEach((p) => p.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)))
    blogPosts.forEach((p) => p.tags.forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1)))
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t]) => t)
  }, [communityPosts, blogPosts])

  // Unique authors → avatar stack for the join proof.
  const voices = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const p of communityPosts) {
      if (!seen.has(p.author)) {
        seen.add(p.author)
        out.push(p.author)
      }
      if (out.length >= 6) break
    }
    return out
  }, [communityPosts])

  const ticker = communityPosts.slice(0, 8)

  // Community cards + the join CTA, split into three height-balanced columns
  // (deterministic round-robin, so no column is ever stranded short like CSS
  // column-count does). The join card is anchored to the top of the middle
  // column so it reads as the centerpiece of the showcase.
  const showcaseCols = useMemo(() => {
    const items: ({ kind: 'post'; post: CommunityPostView } | { kind: 'join' })[] = []
    communityPosts.slice(0, 8).forEach((p, i) => {
      items.push({ kind: 'post', post: p })
      if (i === 0) items.push({ kind: 'join' })
    })
    const cols: (typeof items)[] = [[], [], []]
    items.forEach((it, i) => cols[i % 3].push(it))
    return cols
  }, [communityPosts])

  return (
    <div className="rt-root" style={{ background: '#FFFCFA' }}>
      <style>{CSS}</style>

      {/* ══ HERO ══ */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse 60% 60% at 80% 12%, rgba(200,85,61,.34), transparent 60%), radial-gradient(ellipse 50% 55% at 12% 88%, rgba(139,111,201,.30), transparent 62%), radial-gradient(ellipse 40% 45% at 55% 55%, rgba(224,164,92,.14), transparent 60%), #1B1330',
          padding: '132px 24px 0',
        }}
      >
        {/* floating blobs */}
        <div className="rt-blob" style={{ top: '-60px', right: '10%', width: 340, height: 340, background: 'radial-gradient(circle, rgba(200,85,61,.5), transparent 68%)', animation: 'rtFloat1 16s ease-in-out infinite' }} />
        <div className="rt-blob" style={{ bottom: '40px', left: '4%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(139,111,201,.45), transparent 68%)', animation: 'rtFloat2 20s ease-in-out infinite' }} />
        <div className="rt-blob" style={{ top: '30%', left: '46%', width: 220, height: 220, background: 'radial-gradient(circle, rgba(224,164,92,.28), transparent 70%)', animation: 'rtFloat3 24s ease-in-out infinite' }} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: HEAD,
              fontSize: 'clamp(60px, 11vw, 132px)',
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: '-2px',
              margin: 0,
              color: '#fff',
            }}
          >
            Calm <span className="rt-shimmer">Club</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.74)', fontSize: 'clamp(16px,2.2vw,20px)', maxWidth: 620, margin: '22px auto 0', lineHeight: 1.6, fontWeight: 300 }}>
            Honest reads from our clinicians, and a community where you find out you were never the only
            one who felt this way.
          </p>

          {/* live stat pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 30 }}>
            <StatPill label="conversations" value={<CountUp end={convos} />} />
            <StatPill label="replies" value={<CountUp end={replies} />} />
            <StatPill label="hearts given" value={<CountUp end={hearts} />} />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: 'rgba(90,220,150,.12)', border: '1px solid rgba(90,220,150,.3)', color: '#8BE9B8', fontSize: 13, fontWeight: 700 }}>
              <span className="rt-dot" /> active right now
            </span>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 34 }}>
            <Link href="/community" className="rt-cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 32px', borderRadius: 50, background: CORAL, color: '#fff', fontSize: 15.5, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 26px rgba(200,85,61,.4)' }}>
              Read the conversations
            </Link>
            <Link href="/register?care=free" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 28px', borderRadius: 50, background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: 15.5, fontWeight: 600, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.2)' }}>
              ✦ Join free to take part
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 16 }}>
            Reading is open to everyone, no account needed. Sign in only to comment or post.
          </p>
        </div>

        {/* recent-activity ticker */}
        <div style={{ position: 'relative', marginTop: 46, borderTop: '1px solid rgba(255,255,255,.1)', overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)' }}>
          <div className="rt-ticker-track" style={{ padding: '14px 0' }}>
            {[...ticker, ...ticker].map((p, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 26px', color: 'rgba(255,255,255,.62)', fontSize: 13.5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: CORAL, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{p.author}</span>
                {p.title}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED READS (bento) ══ */}
      <section id="reads" style={{ maxWidth: 1160, margin: '0 auto', padding: '84px 24px 0', scrollMarginTop: 70 }}>
        <SectionHead kicker="From our clinicians" title="Fresh reads" href="/blog" linkLabel={`All ${blogPosts.length} articles →`} />

        <div className="rt-reveal" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 20 }}>
          {lead && <FeaturedRead post={lead} />}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 20 }}>
            {secondaryPosts.map((p) => (
              <SecondaryRead key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMMUNITY SHOWCASE (the conversion centerpiece) ══ */}
      <section style={{ position: 'relative', marginTop: 90, overflow: 'hidden' }}>
        <div
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 90% 6%, rgba(200,85,61,.12), transparent 60%), radial-gradient(ellipse 45% 50% at 4% 96%, rgba(139,111,201,.12), transparent 60%), #F7F1EC',
            padding: '80px 24px 96px',
          }}
        >
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            {/* headline + social proof */}
            <div className="rt-reveal" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 14px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: CORAL, marginBottom: 12 }}>The circles</p>
              <h2 style={{ fontFamily: HEAD, fontSize: 'clamp(34px, 6vw, 58px)', fontWeight: 900, color: CHARCOAL, lineHeight: 1, letterSpacing: '-1px', margin: 0 }}>
                You&apos;re not the only<br />one who&apos;s felt this way
              </h2>
              <p style={{ fontSize: 16.5, color: '#5A6A7A', lineHeight: 1.65, margin: '18px auto 0', maxWidth: 560 }}>
                A safe, moderated space where members, therapists and psychiatrists talk honestly. Read
                every conversation without an account, sign in only when you want to comment or post.
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 26, flexWrap: 'wrap', justifyContent: 'center' }}>
                <AvatarStack names={voices} />
                <span style={{ fontSize: 14, color: '#5A6A7A', fontWeight: 600 }}>
                  {voices.length ? `${voices[0].split(' ')[0]} and a growing circle are already talking` : 'A growing circle is already talking'}
                </span>
              </div>
            </div>

            {/* topic chips */}
            {topics.length > 0 && (
              <div className="rt-reveal" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', margin: '26px auto 40px', maxWidth: 720 }}>
                {topics.map((t) => (
                  <Link key={t} href="/community" className="rt-chip" style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, background: '#fff', border: '1.5px solid rgba(28,43,58,.1)', padding: '7px 15px', borderRadius: 999, textDecoration: 'none' }}>
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* posts + inline join card, balanced 3-column showcase */}
            <div className="rt-cols">
              {showcaseCols.map((col, ci) => (
                <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {col.map((it, ri) =>
                    it.kind === 'join' ? (
                      <div key="join" className="rt-reveal" style={{ transitionDelay: `${ri * 60}ms` }}>
                        <JoinCard convos={convos} />
                      </div>
                    ) : (
                      <div key={it.post.id} className="rt-reveal" style={{ transitionDelay: `${ri * 60}ms` }}>
                        <CircleCard post={it.post} />
                      </div>
                    ),
                  )}
                </div>
              ))}
            </div>

            <div className="rt-reveal" style={{ textAlign: 'center', marginTop: 26 }}>
              <Link href="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, color: CORAL, textDecoration: 'none' }}>
                See everything in the circles →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ GROWING-HUB TEASER ══ */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '70px 24px 96px' }}>
        <div className="rt-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,240px),1fr))', gap: 16 }}>
          {[
            { emoji: '🎧', label: 'Podcasts', sub: 'Real conversations, in your ears' },
            { emoji: '🎬', label: 'Video stories', sub: 'People who have been there' },
            { emoji: '🧘', label: 'Guided sessions', sub: 'Breathe, ground, reset' },
          ].map((t) => (
            <div key={t.label} style={{ position: 'relative', background: '#fff', border: '1px dashed rgba(28,43,58,.16)', borderRadius: 18, padding: '22px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 26 }}>{t.emoji}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, color: CHARCOAL, fontSize: 15 }}>{t.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: '#8B6FC9', background: 'rgba(139,111,201,.12)', padding: '2px 8px', borderRadius: 999 }}>Soon</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#8a9aaa', marginTop: 2 }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ── Sub-components ───────────────────────────────────────────────────── */

function StatPill({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 7, padding: '8px 16px', borderRadius: 999, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', backdropFilter: 'blur(6px)' }}>
      <strong style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 18, color: '#fff' }}>{value}</strong>
      <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>{label}</span>
    </span>
  )
}

function SectionHead({ kicker, title, href, linkLabel }: { kicker: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="rt-reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 26 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: CORAL, marginBottom: 8 }}>{kicker}</p>
        <h2 style={{ fontFamily: HEAD, fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 900, color: CHARCOAL, lineHeight: 1, letterSpacing: '-1px', margin: 0 }}>{title}</h2>
      </div>
      <Link href={href} style={{ fontSize: 14, fontWeight: 700, color: CORAL, textDecoration: 'none', whiteSpace: 'nowrap', paddingBottom: 4 }}>{linkLabel}</Link>
    </div>
  )
}

/** Big immersive featured article with a cover image. */
function FeaturedRead({ post }: { post: BlogPostView }) {
  const grad = coverFor(post.tags[0])
  return (
    <Link href={`/blog/${post.slug}`} className="rt-card rt-feat" style={{ textDecoration: 'none', display: 'block', position: 'relative', borderRadius: 24, overflow: 'hidden', minHeight: 420, boxShadow: '0 12px 40px rgba(28,43,58,.12)' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(150deg, ${grad.from}, ${grad.to})` }}>
        <div className="rt-feat-img" style={{ position: 'absolute', inset: 0 }}>
          <BlogCover src={blogImage(post.tags)} alt={post.title} scrim="linear-gradient(180deg, rgba(20,16,30,.15) 0%, rgba(20,16,30,.35) 45%, rgba(20,16,30,.9) 100%)" />
        </div>
      </div>
      <div style={{ position: 'relative', height: '100%', minHeight: 420, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px 34px' }}>
        <span style={{ alignSelf: 'flex-start', fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', background: 'rgba(255,255,255,.18)', padding: '6px 13px', borderRadius: 999, backdropFilter: 'blur(4px)', marginBottom: 16 }}>
          Featured · {post.tags[0]}
        </span>
        <h3 style={{ fontFamily: HEAD, fontSize: 'clamp(28px, 3.4vw, 40px)', fontWeight: 700, color: '#fff', lineHeight: 1.05, margin: 0, letterSpacing: '-0.5px' }}>{post.title}</h3>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.82)', lineHeight: 1.6, margin: '14px 0 0', maxWidth: 520, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.9)', color: CHARCOAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 15 }}>{initials(post.author)}</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{post.author}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{post.role} · {post.readTime}</div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/** Compact secondary article for the bento column. */
function SecondaryRead({ post }: { post: BlogPostView }) {
  const grad = coverFor(post.tags[0])
  return (
    <Link href={`/blog/${post.slug}`} className="rt-card" style={{ textDecoration: 'none', display: 'flex', gap: 16, background: '#fff', border: '1px solid rgba(28,43,58,.07)', borderRadius: 18, padding: 16, boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)' }}>
      <div style={{ width: 88, flexShrink: 0, borderRadius: 12, overflow: 'hidden', position: 'relative', background: `linear-gradient(140deg, ${grad.from}, ${grad.to})` }}>
        <BlogCover src={blogImage(post.tags)} alt={post.title} scrim="linear-gradient(160deg, rgba(20,16,30,.15), rgba(20,16,30,.4))" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: CORAL, marginBottom: 6 }}>{post.tags[0]}</span>
        <h4 style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, color: CHARCOAL, lineHeight: 1.1, letterSpacing: '-0.3px', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</h4>
        <p style={{ fontSize: 12, color: '#8a9aaa', margin: 'auto 0 0', paddingTop: 8 }}>{post.author} · {post.readTime}</p>
      </div>
    </Link>
  )
}

/** A rich community post card, with an accent rail and an upvote pill. */
function CircleCard({ post }: { post: CommunityPostView }) {
  const accent = avatarColor(post.author)
  return (
    <Link href={`/community/${post.id}`} className="rt-card" style={{ textDecoration: 'none', display: 'block', position: 'relative', background: '#fff', borderRadius: 18, padding: '18px 20px 18px 22px', border: '1px solid rgba(28,43,58,.07)', boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)', overflow: 'hidden' }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 800, fontSize: 15 }}>{post.author.charAt(0).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: CHARCOAL, lineHeight: 1.1 }}>{post.author}</div>
          <div style={{ fontSize: 11.5, color: '#9AABB8' }}>{post.date}</div>
        </div>
        <span style={{ marginLeft: 'auto' }}><RoleBadge role={post.role} /></span>
      </div>
      <h3 style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 700, color: CHARCOAL, lineHeight: 1.1, letterSpacing: '-0.3px', margin: '0 0 8px' }}>{post.title}</h3>
      <p style={{ fontSize: 13.5, color: '#4A5F70', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.body}</p>
      {post.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {post.tags.slice(0, 3).map((t) => (
            <span key={t} style={{ fontSize: 11, fontWeight: 600, color: '#5A6A7A', background: 'rgba(28,43,58,.05)', padding: '3px 10px', borderRadius: 999 }}>#{t}</span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14, paddingTop: 13, borderTop: '1px solid rgba(28,43,58,.07)', fontSize: 13, color: '#6B7D8E', fontWeight: 700 }}>
        <span className="rt-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: CORAL }}>▲ {post.upvotes}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>💬 {post.comments}</span>
        <span style={{ marginLeft: 'auto', color: CORAL, fontWeight: 700 }}>Read →</span>
      </div>
    </Link>
  )
}

/** The join CTA card that lives inside the community grid. */
function JoinCard({ convos }: { convos: number }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, padding: '26px 24px', color: '#fff', background: 'radial-gradient(ellipse 80% 90% at 20% 10%, rgba(224,164,92,.5), transparent 60%), linear-gradient(145deg, #C8553D, #A8432D)', boxShadow: '0 16px 40px rgba(200,85,61,.35)' }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>💬</div>
      <h3 style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 900, lineHeight: 1.02, margin: '0 0 8px', letterSpacing: '-0.5px' }}>Say the thing you&apos;ve been holding in.</h3>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,.9)', lineHeight: 1.55, margin: '0 0 18px' }}>
        {convos > 0 ? `Join ${convos} open conversations. ` : ''}Post anonymously, get real replies from people and professionals who get it.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/register?care=free" className="rt-cta-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 50, background: '#fff', color: CORAL, fontSize: 14.5, fontWeight: 800, textDecoration: 'none' }}>
          Join free — 30 seconds
        </Link>
        <Link href="/community" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '12px 20px', borderRadius: 50, background: 'rgba(255,255,255,.14)', border: '1.5px solid rgba(255,255,255,.45)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          Browse the conversations →
        </Link>
      </div>
      <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)', marginTop: 12 }}>No feed to doomscroll. Moderated, always.</p>
    </div>
  )
}

/** Overlapping avatar stack for social proof. */
function AvatarStack({ names }: { names: string[] }) {
  return (
    <div style={{ display: 'flex' }}>
      {names.map((n, i) => (
        <span
          key={n}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: avatarColor(n),
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 14,
            border: '2.5px solid #F7F1EC',
            marginLeft: i === 0 ? 0 : -12,
            zIndex: names.length - i,
          }}
        >
          {n.charAt(0).toUpperCase()}
        </span>
      ))}
    </div>
  )
}
