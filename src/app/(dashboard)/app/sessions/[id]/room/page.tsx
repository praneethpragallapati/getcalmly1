import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSessionDetail } from '@/lib/sessions'
import { getDashboardData } from '@/lib/dashboard'
import { getHmsMeetingUrl } from '@/lib/hms'
import { HmsRoom } from '@/components/dashboard/HmsRoom'

export const metadata = { title: 'Session room' }

export default async function RoomPage({ params }: PageProps<'/app/sessions/[id]/room'>) {
  const { id } = await params
  const [s, dash] = await Promise.all([getSessionDetail(id), getDashboardData()])
  if (!s) notFound()

  // Patient joins as guest; the clinician joins the same room as host.
  const meetingUrl = await getHmsMeetingUrl(s.roomId, dash.name, 'guest')

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

      <HmsRoom roomId={s.roomId} meetingUrl={meetingUrl} backHref="/app/sessions" />
    </>
  )
}
