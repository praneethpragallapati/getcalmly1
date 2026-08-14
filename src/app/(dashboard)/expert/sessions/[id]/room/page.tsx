import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTherapistContext, getExpertRoom } from '@/lib/expert'
import { JitsiRoom } from '@/components/dashboard/JitsiRoom'

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

      <JitsiRoom roomId={room.roomId} displayName={room.therapistName} backHref="/expert/schedule" />
    </>
  )
}
