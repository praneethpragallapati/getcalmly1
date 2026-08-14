'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { markSessionJoined } from '@/app/(dashboard)/app/actions'

// Managed video via Jitsi's embed (external_api.js). No signaling server or
// hand-rolled WebRTC to maintain, and a real Jitsi instance ships TURN so calls
// connect across strict NATs. The instance is configurable so production can
// point at a self-hosted / 8x8 JaaS deployment instead of the public one.
//
// The room name is derived from the appointment's unguessable roomId, so only
// the two people holding the session link land in the same room.
const JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JitsiApi = any
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    JitsiMeetExternalAPI?: any
  }
}

let scriptPromise: Promise<void> | null = null
function loadJitsiScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.JitsiMeetExternalAPI) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://${JITSI_DOMAIN}/external_api.js`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => { scriptPromise = null; reject(new Error('load')) }
    document.body.appendChild(s)
  })
  return scriptPromise
}

export function JitsiRoom({
  roomId,
  displayName,
  backHref,
}: {
  roomId: string
  displayName: string
  backHref: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<JitsiApi | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    // Record this side's join for the strict completion rule (best-effort).
    void markSessionJoined(roomId)

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.JitsiMeetExternalAPI) return
        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          // A stable, unguessable room shared by both participants.
          roomName: `getcalmly-${roomId}`,
          parentNode: containerRef.current,
          width: '100%',
          height: 640,
          userInfo: { displayName },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
          },
        })
        apiRef.current = api
        setStatus('ready')
      })
      .catch(() => { if (!cancelled) setStatus('error') })

    return () => {
      cancelled = true
      try { apiRef.current?.dispose() } catch { /* already gone */ }
      apiRef.current = null
    }
  }, [roomId, displayName])

  return (
    <div className="call-room">
      {status === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', justifyContent: 'center', color: 'var(--c-gray-d)' }}>
          <Loader2 className="spin" size={20} /> Connecting to the session room…
        </div>
      )}
      {status === 'error' && (
        <div className="call-error" style={{ margin: '16px 0' }}>
          We couldn’t load the video room. Check your connection and refresh, or{' '}
          <Link href={backHref} className="link-action">go back</Link>.
        </div>
      )}
      <div
        ref={containerRef}
        style={{ width: '100%', minHeight: status === 'ready' ? 640 : 0, borderRadius: 16, overflow: 'hidden' }}
      />
      <p className="call-note">
        🔒 This is a private video room for your session. getCalmly never records or stores the call.
      </p>
    </div>
  )
}
