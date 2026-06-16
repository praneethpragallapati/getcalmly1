'use client'

const helplines = [
  { name: 'iCall (TISS)', number: '9152987821', tel: '+919152987821' },
  { name: 'Asra (24/7)', number: '+91-22-27546669', tel: '+912227546669' },
  { name: 'One Life (24/7)', number: '78930-78930', tel: '+917893078930' },
  { name: 'CHILDLINE', number: '1098', tel: '1098' },
]

export default function EmergencyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4" style={{ background: 'rgba(28,43,58,.85)', backdropFilter: 'blur(8px)' }}>
      <div style={{
        background: '#1C2B3A',
        borderRadius: 24,
        maxWidth: 480,
        width: '100%',
        padding: '36px 32px',
        boxShadow: '0 32px 80px rgba(0,0,0,.5)',
        border: '1.5px solid rgba(200,85,61,.25)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🫂</div>
          <h2 style={{
            fontFamily: "'Big Shoulders Display',sans-serif",
            fontWeight: 900,
            fontSize: 28,
            color: '#fff',
            letterSpacing: '-0.5px',
            marginBottom: 10,
          }}>
            Thank you for trusting us.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', lineHeight: 1.65, fontWeight: 300 }}>
            We&apos;re glad you&apos;re here. If things feel particularly heavy right now, talking to someone immediately can help. These services are free and available around the clock.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {helplines.map((h) => (
            <a
              key={h.name}
              href={`tel:${h.tel}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(200,85,61,.2)',
                borderRadius: 12,
                padding: '12px 16px',
                textDecoration: 'none',
                transition: 'background .2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(200,85,61,.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,.8)' }}>{h.name}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#E8896F', letterSpacing: '.3px' }}>{h.number}</span>
            </a>
          ))}
        </div>

        <div style={{
          background: 'rgba(200,85,61,.1)',
          border: '1px solid rgba(200,85,61,.2)',
          borderRadius: 12,
          padding: '12px 16px',
          fontSize: 13,
          color: 'rgba(255,255,255,.5)',
          lineHeight: 1.6,
          marginBottom: 24,
        }}>
          Our care team will prioritise connecting you with a professional. getCalmly is not intended for emergency intervention.
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <a
            href={`tel:${helplines[0].tel}`}
            style={{
              flex: 1,
              background: '#C8553D',
              color: '#fff',
              textAlign: 'center',
              padding: '13px 20px',
              borderRadius: 50,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(200,85,61,.35)',
            }}
          >
            Call iCall now
          </a>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,.08)',
              border: '1.5px solid rgba(255,255,255,.15)',
              color: 'rgba(255,255,255,.8)',
              padding: '13px 20px',
              borderRadius: 50,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Continue booking
          </button>
        </div>
      </div>
    </div>
  )
}
