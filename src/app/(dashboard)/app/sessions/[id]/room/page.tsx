import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSessionDetail } from '@/lib/sessions'
import { getDashboardData } from '@/lib/dashboard'
import { JitsiRoom } from '@/components/dashboard/JitsiRoom'

export const metadata = { title: 'Session room' }

export default async function RoomPage({ params }: PageProps<'/app/sessions/[id]/room'>) {
  const { id } = await params
  const [s, dash] = await Promise.all([getSessionDetail(id), getDashboardData()])
  if (!s) notFound()

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

      <JitsiRoom roomId={s.roomId} displayName={dash.name} backHref="/app/sessions" />
    </>
  )
}
