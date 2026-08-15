'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { markSessionJoined } from '@/app/(dashboard)/app/actions'

/**
 * 100ms video, embedded via the prebuilt meeting URL (an iframe) so there's no
 * heavy client SDK to bundle. The URL is minted server-side with a role-scoped
 * room code; media + TURN are handled by 100ms. The call stays inside the app
 * chrome. When `meetingUrl` is null, 100ms isn't configured yet.
 */
export function HmsRoom({
  roomId,
  meetingUrl,
  backHref,
}: {
  roomId: string
  meetingUrl: string | null
  backHref: string
}) {
  useEffect(() => {
    // Record this side's join, then keep a presence heartbeat while the call is
    // open (every 20s). "Time together" is measured from these pings, so a call
    // that ends early counts only the minutes actually spent — not the whole
    // scheduled slot. Best-effort; a missed ping just shortens the measured time.
    void markSessionJoined(roomId)
    const iv = setInterval(() => { void markSessionJoined(roomId) }, 20_000)
    const onVisible = () => { if (document.visibilityState === 'visible') void markSessionJoined(roomId) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(iv); document.removeEventListener('visibilitychange', onVisible) }
  }, [roomId])

  if (!meetingUrl) {
    return (
      <div className="call-room">
        <div className="call-error" style={{ margin: '16px 0' }}>
          Video isn’t set up yet. Please try again shortly, or{' '}
          <Link href={backHref} className="link-action">go back</Link>.
        </div>
      </div>
    )
  }

  return (
    <div className="call-room">
      <iframe
        src={meetingUrl}
        title="Session video"
        allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
        style={{ width: '100%', height: 660, border: 'none', borderRadius: 16, background: '#0b0f14' }}
      />
      <p className="call-note">
        🔒 This is a private video room for your session. getCalmly never records or stores the call.
      </p>
    </div>
  )
}
