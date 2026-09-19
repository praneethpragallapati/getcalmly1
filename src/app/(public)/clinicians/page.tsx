import type { Metadata } from 'next'
import Link from 'next/link'
import ClinicianDirectory from '@/components/site/ClinicianDirectory'
import { clinicians } from '@/data/clinicians'

const charcoal = '#1C2B3A'
const cream = '#F6F3EF'

export const metadata: Metadata = {
  title: 'Our clinicians — Psychologists & Psychiatrists | getCalmly',
  description:
    'Browse the RCI-registered clinical psychologists and NMC-registered psychiatrists on getCalmly, and search by name, concern or specialty and view full profiles.',
}

export default function CliniciansPage() {
  const psychologists = clinicians.filter((c) => c.type === 'Psychologist').length
  const psychiatrists = clinicians.filter((c) => c.type === 'Psychiatrist').length

  return (
    <div style={{ background: cream, minHeight: '100vh' }}>
      {/* ── Header band ── */}
      <section style={{ background: '#101722', padding: '116px 6% 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -160, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,85,61,.16) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
          <nav style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 22, fontWeight: 600 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'rgba(255,255,255,.82)' }}>Our clinicians</span>
          </nav>
          <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#E0846C', marginBottom: 18 }}>
            Our clinicians
          </p>
          <h1 style={{
            fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 300,
            fontSize: 'clamp(36px, 5.4vw, 60px)', color: '#fff', letterSpacing: '-1.5px',
            lineHeight: 1.02, marginBottom: 22, maxWidth: 720,
          }}>
            Meet the people <span style={{ color: '#E0846C', fontWeight: 900 }}>behind your care.</span>
          </h1>
          <p style={{ fontSize: 16.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.7, maxWidth: 620, fontWeight: 300 }}>
            Every clinician here is RCI-registered (psychologists) or NMC-registered (psychiatrists),
            hand-picked and verified. Read their full profiles, or search by the concern you&apos;re carrying.
          </p>
          <div style={{ display: 'flex', gap: 28, marginTop: 30, flexWrap: 'wrap' }}>
            {psychologists > 0 && <Stat n={psychologists} label={psychologists === 1 ? 'Clinical psychologist' : 'Clinical psychologists'} />}
            {psychiatrists > 0 && <Stat n={psychiatrists} label={psychiatrists === 1 ? 'Psychiatrist' : 'Psychiatrists'} />}
          </div>
        </div>
      </section>

      {/* ── Directory ── */}
      <section style={{ padding: '54px 6% 96px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <ClinicianDirectory clinicians={clinicians} />
        </div>
      </section>

      <style>{`
        .clinician-card-link:hover{ transform: translateY(-5px); box-shadow: 0 16px 40px rgba(28,43,58,.12) !important; }
      `}</style>
    </div>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <span style={{
        fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900,
        fontSize: 34, color: '#fff', letterSpacing: '-1px', lineHeight: 1,
      }}>
        {n}
      </span>
      <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,.6)', marginLeft: 10 }}>{label}</span>
    </div>
  )
}
