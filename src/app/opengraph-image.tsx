import { ImageResponse } from 'next/og'

export const alt =
  'getCalmly: Mental Healthcare, Powered by Experts, Personalized by AI'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand palette (mirrors src/app/globals.css)
const CORAL = '#C8553D'
const CORAL_L = '#E8896F'
const CHARCOAL = '#1C2B3A'
const BG = '#FFF8F5'
const GRAY = '#5A6A7A'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: `radial-gradient(1200px 600px at 85% -10%, rgba(200,85,61,0.12), transparent 60%), ${BG}`,
          fontFamily: 'sans-serif',
        }}
      >
        {/* pill */}
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#FDEAE6',
              border: '1px solid rgba(200,85,61,0.25)',
              color: '#A8432D',
              borderRadius: 40,
              padding: '12px 24px',
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            First session · just ₹999
          </div>
        </div>

        {/* headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 118,
              fontWeight: 800,
              letterSpacing: '-4px',
              lineHeight: 1,
              color: CHARCOAL,
            }}
          >
            You don&apos;t have to
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 118,
              fontWeight: 800,
              letterSpacing: '-4px',
              lineHeight: 1.05,
              color: CORAL,
            }}
          >
            figure this out alone.
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 30,
              fontWeight: 400,
              color: GRAY,
              maxWidth: 900,
            }}
          >
            Licensed therapists &amp; psychiatrists, with the world&apos;s first
            context-aware mental health AI.
          </div>
        </div>

        {/* wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 34, fontWeight: 400, color: GRAY }}>get</span>
          <span
            style={{
              fontSize: 58,
              fontWeight: 800,
              color: CORAL,
              letterSpacing: '-2px',
            }}
          >
            Calmly.
          </span>
          <span style={{ fontSize: 26, color: CORAL_L, marginLeft: 16 }}>
            getcalmly.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
