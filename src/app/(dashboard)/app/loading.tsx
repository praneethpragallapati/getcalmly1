import { Loader2 } from 'lucide-react'

/** Lightweight loading state shown while a dashboard page fetches on the server. */
export default function AppLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: '50vh',
        color: 'var(--c-gray)',
      }}
    >
      <Loader2 size={26} className="spin" />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Loading…</span>
    </div>
  )
}
