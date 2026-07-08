'use client'

import Link from 'next/link'
import { SERVICE_ICONS } from '@/components/site/serviceIcons'

// Ordered by how people actually arrive: core 1:1 care first, the medical
// layer next, then relationships, life-stage, tools, and specialised care.
const branches = [
  {
    slug: 'therapy',
    icon: '🧠',
    accent: '#C8553D',
    pale: 'rgba(200,85,61,.08)',
    title: 'Therapy That Stays With You',
    tagline: "You've been the strong one long enough. This hour is yours.",
    desc: 'Whether it\'s anxiety that won\'t quiet down, a sadness you can\'t explain, or stress that\'s seeping into everything, a therapist gives you a private space to work through it. One conversation at a time.',
    items: ['Anxiety & Overthinking', 'Depression', 'Stress & Burnout', 'Trauma & Grief', 'OCD', 'Anger', 'Sleep Issues', 'Life Transitions'],
    expert: 'A licensed clinical psychologist, matched to you',
    app: 'Calm+ app for mood tracking & journaling between sessions',
  },
  {
    slug: 'psychiatry',
    icon: '💊',
    accent: '#1A7F7A',
    pale: 'rgba(26,127,122,.08)',
    title: 'Psychiatry, Without the Stigma',
    tagline: "You did the work and still feel stuck. That's chemistry, not failure.",
    desc: 'Our licensed psychiatrists evaluate, diagnose, and when needed, prescribe medication alongside therapy. Getting a second opinion? We do that too.',
    items: ['Diagnosis & Evaluation', 'Medication Management', 'Second Opinion', 'Follow-up Care', 'OCD / Bipolar / Schizophrenia', 'ADHD (Adult)'],
    expert: 'A licensed psychiatrist who coordinates with your therapist',
    app: 'In-app medication reminders & symptom tracking',
  },
  {
    slug: 'couples',
    icon: '💑',
    accent: '#7C5CBF',
    pale: 'rgba(124,92,191,.08)',
    title: 'Couples, Reconnected',
    tagline: 'Before you give up on each other, give one honest hour a chance.',
    desc: 'Every couple hits walls. Communication that used to flow easily now leads to arguments. Or maybe the silence has become louder than words. Couples therapy helps you find your way back to each other.',
    items: ['Communication & Conflict', 'Rebuilding Trust', 'Separation / Divorce', 'Breakup Support', 'Pre-marital Counselling', 'Intimacy Concerns'],
    expert: 'An EFT & Gottman-informed couples therapist',
    app: 'Shared exercises & check-ins you can do together between sessions',
  },
  {
    slug: 'child',
    icon: '🌱',
    accent: '#3D9E72',
    pale: 'rgba(61,158,114,.08)',
    title: 'Care for Growing Minds',
    tagline: 'You knew something was off. Trust that. So do we.',
    desc: 'Kids and teenagers are navigating enormous pressures, exams, social anxiety, family change, identity questions. A child therapist gives them a judgment-free space to understand what they\'re feeling and why.',
    items: ['Anxiety & Worry', 'Low Mood', 'Exam Stress', 'ADHD Support', 'Behavioural Challenges', 'Adolescent Identity', 'Grief & Loss', 'Family Change'],
    expert: 'A child & adolescent specialist who works with you too',
    app: 'Parent resources & gentle progress updates in the app',
  },
  {
    slug: 'maternal',
    icon: '🤱',
    accent: '#D98C5F',
    pale: 'rgba(217,140,95,.10)',
    title: 'Motherhood, Held',
    tagline: 'Everyone asks about the baby. We ask about you.',
    desc: 'Becoming a mother changes everything, your body, your sleep, your sense of who you are. The exhaustion, the anxiety, the guilt for not feeling the way you "should", none of it means you\'re failing. It means you need support, and that\'s allowed.',
    items: ['Prenatal Anxiety', 'Postpartum Depression', 'Birth Trauma', 'Identity & Role Shift', 'Parenting Overwhelm', 'Pregnancy Loss & Grief', 'Fertility Stress'],
    expert: 'A perinatal mental health specialist',
    app: 'Daily check-ins to lean on through the fourth trimester',
  },
  {
    slug: 'assessments',
    icon: '📋',
    accent: '#C9973A',
    pale: 'rgba(201,151,58,.08)',
    title: 'Finally, Answers',
    tagline: 'Stop guessing why your mind works the way it does.',
    desc: 'Standardised assessments that help you understand yourself, or your child, better. These aren\'t labels, they\'re tools. A good assessment leads to a better plan.',
    items: ['ADHD Assessment', 'Anxiety & Depression Screening', 'Personality Profile', 'Emotional Intelligence', 'Career Maturity (Students)', 'Couples Assessment', 'Occupational Stress'],
    expert: 'A qualified clinical psychologist who walks you through results',
    app: 'Digital reports you keep and revisit anytime',
  },
  {
    slug: 'specialised',
    icon: '🫶',
    accent: '#C04B8A',
    pale: 'rgba(192,75,138,.08)',
    title: 'Care Built Around You',
    tagline: "You shouldn't have to explain your whole world before someone gets it.",
    desc: 'Some experiences need a professional who truly understands the context, not a generalist. Whether you\'re navigating chronic illness, gender identity, or supporting someone in crisis, we have the right person.',
    items: ['LGBTQIA+ Affirmative Care', 'Chronic / Terminal Illness', 'Grief & Bereavement', 'Geriatric Mental Health', 'Clinical Supervision for Professionals'],
    expert: 'A context-trained specialist, no need to explain yourself first',
    app: 'Calm+ tools tailored to your situation',
  },
]

export default function ServicesPage() {
  return (
    <div style={{ background: '#FFFCFA', minHeight: '100vh' }}>
      {/* Hero, full-bleed charcoal */}
      <section style={{ background: 'radial-gradient(ellipse 65% 75% at 88% 8%, rgba(192,75,138,.26), transparent 55%), radial-gradient(ellipse 45% 60% at 4% 80%, rgba(200,85,61,.14), transparent 60%), #2F1C2A', padding: '124px 48px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -150, right: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(192,75,138,.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#C8553D', textTransform: 'uppercase', marginBottom: 20 }}>What we offer</p>
          <h1 style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontWeight: 300,
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: '#fff',
            lineHeight: 1.0,
            letterSpacing: '-2px',
            marginBottom: 18,
            maxWidth: 760,
          }}>
            However you&apos;re hurting, there&apos;s a way through.
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.75, marginBottom: 28, fontWeight: 300, maxWidth: 620 }}>
            We don&apos;t believe in one-size-fits-all mental health. No two stories are the same, so neither is the care. Every path below pairs a real expert with the Calm+ app, mood check-ins, journaling and Calm AI, so you&apos;re supported in the session and every day in between.
          </p>
          <Link href="/assess" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#C8553D', color: '#fff', padding: '15px 30px',
            borderRadius: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none',
            fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.4)',
          }}>
            ✦ Take the assessment
          </Link>
        </div>
      </section>

      {/* Service branches grid */}
      <section style={{ padding: '94px 48px 84px', maxWidth: 1200, margin: '0 auto' }}>
        <div className="m-stack" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}>
          {branches.map((b) => {
            const Icon = SERVICE_ICONS[b.slug]
            return (
            <Link
              key={b.slug}
              href={`/services/${b.slug}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{
                background: '#fff',
                borderRadius: 20,
                padding: '28px 28px 24px',
                border: '1px solid rgba(28,43,58,.07)',
                boxShadow: '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)',
                transition: 'transform .2s, box-shadow .2s',
                height: '100%',
                cursor: 'pointer',
              }}
                onMouseOver={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-4px)'
                  el.style.boxShadow = '0 18px 48px rgba(28,43,58,.12)'
                }}
                onMouseOut={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'none'
                  el.style.boxShadow = '0 1px 2px rgba(28,43,58,.04), 0 10px 28px rgba(28,43,58,.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, background: b.pale,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={23} color={b.accent} strokeWidth={1.9} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 21, fontWeight: 700, color: '#1C2B3A', marginBottom: 4, letterSpacing: '-0.2px' }}>{b.title}</p>
                    <p style={{ fontSize: 13, color: b.accent, fontWeight: 600, lineHeight: 1.4 }}>{b.tagline}</p>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: '#6B7D8E', lineHeight: 1.65, marginBottom: 18 }}>{b.desc}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {b.items.slice(0, 4).map((it) => (
                    <span key={it} style={{
                      fontSize: 12, padding: '5px 10px', borderRadius: 50,
                      background: b.pale, color: b.accent, fontWeight: 600,
                    }}>{it}</span>
                  ))}
                  {b.items.length > 4 && (
                    <span style={{ fontSize: 12, padding: '5px 10px', borderRadius: 50, background: '#F5F7FA', color: '#8E9EAE', fontWeight: 600 }}>
                      +{b.items.length - 4} more
                    </span>
                  )}
                </div>

                {/* Dual support: a real expert + the app between sessions */}
                <div style={{ borderTop: '1px solid rgba(0,0,0,.06)', paddingTop: 16, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>🧑‍⚕️</span>
                    <span style={{ fontSize: 12.5, color: '#5A6B7A', lineHeight: 1.5 }}>{b.expert}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>📱</span>
                    <span style={{ fontSize: 12.5, color: '#5A6B7A', lineHeight: 1.5 }}>{b.app}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: b.accent, fontSize: 13, fontWeight: 700 }}>
                  Learn more <span style={{ fontSize: 16 }}>→</span>
                </div>
              </div>
            </Link>
            )
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: 'radial-gradient(ellipse 65% 55% at 88% 8%, rgba(192,75,138,.26), transparent 55%), radial-gradient(ellipse 45% 50% at 4% 62%, rgba(200,85,61,.14), transparent 60%), #2F1C2A', padding: '76px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#C8553D', textTransform: 'uppercase', marginBottom: 16 }}>Not sure where to start?</p>
          <h2 style={{
            fontFamily: "'Big Shoulders Display', sans-serif",
            fontWeight: 300, fontSize: 36, color: '#fff', marginBottom: 16, letterSpacing: '-0.5px',
          }}>
            Let us find the right fit for you.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, marginBottom: 32 }}>
            Our 5-minute assessment matches you with the right professional, by what you&apos;re going through, your language preference, and your budget.
          </p>
          <Link href="/assess" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#C8553D', color: '#fff', padding: '15px 32px',
            borderRadius: 50, fontSize: 16, fontWeight: 700, textDecoration: 'none',
            fontFamily: "'DM Sans', sans-serif", boxShadow: '0 8px 24px rgba(200,85,61,.35)',
          }}>
            ✦ Start free assessment
          </Link>
        </div>
      </section>
    </div>
  )
}
