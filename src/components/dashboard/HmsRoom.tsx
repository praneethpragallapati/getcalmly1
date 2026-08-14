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
    // Record this side's join for the strict completion rule (best-effort).
    void markSessionJoined(roomId)
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
