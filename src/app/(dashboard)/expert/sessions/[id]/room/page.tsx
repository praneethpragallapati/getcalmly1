import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTherapistContext, getExpertRoom } from '@/lib/expert'
import { getHmsMeetingUrl } from '@/lib/hms'
import { HmsRoom } from '@/components/dashboard/HmsRoom'

export const metadata = { title: 'Session room' }

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

  // Clinician joins as host; the patient joins the same room as guest.
  const meetingUrl = await getHmsMeetingUrl(room.roomId, room.therapistName, 'host')

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

      <HmsRoom roomId={room.roomId} meetingUrl={meetingUrl} backHref="/expert/schedule" />
    </>
  )
}
