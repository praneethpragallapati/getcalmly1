import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSessionDetail } from '@/lib/sessions'
import { getDashboardData } from '@/lib/dashboard'
import { getHmsMeetingUrl } from '@/lib/hms'
import { joinPhase, meetingBounds, callHardEnd } from '@/lib/meetingWindow'
import { HmsRoom } from '@/components/dashboard/HmsRoom'
import { RoomWindowNotice } from '@/components/dashboard/RoomWindowNotice'

export const metadata = { title: 'Session room' }
export const dynamic = 'force-dynamic'

export default async function RoomPage({ params }: PageProps<'/app/sessions/[id]/room'>) {
  const { id } = await params
  const [s, dash] = await Promise.all([getSessionDetail(id), getDashboardData()])
  if (!s) notFound()

  // Authoritative join-window gate: no pre-join, and no fresh join once the
  // window (start + duration) has closed — but someone already in can re-enter.
  const { start } = meetingBounds(s.scheduledISO ?? '', s.durationMins)
  const phase = joinPhase(s.scheduledISO ?? '', s.durationMins, Date.now(), s.joinedThisSide)
  const blocked =
    s.status === 'CANCELLED' ? 'cancelled' :
    s.status === 'COMPLETED' ? 'completed' :
    phase === 'early' ? 'early' :
    phase === 'closed' ? 'closed' : null

  // Only mint the meeting URL when the room is actually joinable.
  const meetingUrl = blocked ? null : await getHmsMeetingUrl(s.roomId, dash.name, 'guest')
  // Two-hour ceiling, anchored to the first join by either side so a reload
  // cannot buy more time.
  const hardEndISO = new Date(callHardEnd(s.firstJoinISO, Date.now())).toISOString()

  return (
    <>
      <div className="page-head">
        <div>
          <Link
            href={`/app/sessions/${s.id}`}
            className="link-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
          >
            <ArrowLeft size={14} /> Session details
          </Link>
          <h1 className="page-title">Video session</h1>
          <span className="page-meta">
            {s.expert} · {s.when}
          </span>
        </div>
      </div>

      {blocked ? (
        <RoomWindowNotice
          variant={blocked}
          scheduledISO={s.scheduledISO ?? ''}
          startMs={start}
          whenLabel={s.when}
          backHref="/app/sessions"
        />
      ) : (
        <HmsRoom roomId={s.roomId} meetingUrl={meetingUrl} backHref="/app/sessions" roomHref={`/app/sessions/${s.id}/room`} title={s.expert} hardEndISO={hardEndISO} />
      )}
    </>
  )
}
