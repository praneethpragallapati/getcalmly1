import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTherapistContext, getExpertRoom } from '@/lib/expert'
import { getHmsMeetingUrl } from '@/lib/hms'
import { joinPhase, meetingBounds } from '@/lib/meetingWindow'
import { HmsRoom } from '@/components/dashboard/HmsRoom'
import { RoomWindowNotice } from '@/components/dashboard/RoomWindowNotice'

export const metadata = { title: 'Session room' }
export const dynamic = 'force-dynamic'

/**
 * The clinician's video room. Mirrors the patient room, but lives under the
 * expert layout so a therapist isn't bounced to /expert by the patient-area
 * guard. Both sides connect to the same roomId; labels are flipped so the
 * clinician sees the patient as the remote party.
 */
export default async function ExpertRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getTherapistContext()
  if (!ctx) redirect('/login')

  const room = await getExpertRoom(ctx.therapistProfileId, id)
  if (!room) notFound()

  // Same authoritative join-window gate as the patient side.
  const { start } = meetingBounds(room.scheduledISO, room.durationMins)
  const phase = joinPhase(room.scheduledISO, room.durationMins, Date.now(), room.joinedThisSide)
  const blocked =
    room.status === 'CANCELLED' ? 'cancelled' :
    room.status === 'COMPLETED' ? 'completed' :
    phase === 'early' ? 'early' :
    phase === 'closed' ? 'closed' : null

  // Clinician joins as host; the patient joins the same room as guest.
  const meetingUrl = blocked ? null : await getHmsMeetingUrl(room.roomId, room.therapistName, 'host')

  return (
    <>
      <div className="page-head">
        <div>
          <Link
            href="/expert/schedule"
            className="link-action"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}
          >
            <ArrowLeft size={14} /> Back to schedule
          </Link>
          <h1 className="page-title">Video session</h1>
          <span className="page-meta">
            {room.patientName} · {room.when}
          </span>
        </div>
      </div>

      {blocked ? (
        <RoomWindowNotice
          variant={blocked}
          scheduledISO={room.scheduledISO}
          startMs={start}
          whenLabel={room.when}
          backHref="/expert/schedule"
        />
      ) : (
        <HmsRoom roomId={room.roomId} meetingUrl={meetingUrl} backHref="/expert/schedule" roomHref={`/expert/sessions/${id}/room`} title={room.patientName} />
      )}
    </>
  )
}
