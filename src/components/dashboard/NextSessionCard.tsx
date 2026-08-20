import Link from 'next/link'
import { Video, CalendarDays, FileText } from 'lucide-react'
import { LocalTime } from '@/components/dashboard/LocalTime'
import type { DashboardData } from '@/data/dashboardDemo'

/**
 * The narrow "what's next" companion beside the check-in: join today's session,
 * see the next one, or book a first. Compact by design — it shares a band with
 * the check-in, so it states one thing and gives one action.
 */
export function NextSessionCard({ d }: { d: DashboardData }) {
  const s = d.todaySession
  if (s) {
    return (
      <div className="next-card next-card-live">
        <div className="next-eyebrow live">● TODAY</div>
        <div className="next-when">
          <LocalTime iso={s.scheduledISO} fallback={s.when.split('·').pop()?.trim() ?? ''} options={{ hour: 'numeric', minute: '2-digit' }} />
        </div>
        <div className="next-who">{s.expert}</div>
        <div className="next-sub">{s.expertRole} · {s.durationMins} min · #{s.sessionNo}</div>
        <Link href={`/app/sessions/${s.id}/room`} className="btn btn-primary next-btn">
          <Video size={16} /> Join session
        </Link>
        <Link href={`/app/sessions/${s.id}`} className="next-link">
          <FileText size={13} /> Add a pre-session note
        </Link>
      </div>
    )
  }

  if (d.nextSession) {
    return (
      <div className="next-card">
        <div className="next-eyebrow">NEXT SESSION</div>
        <div className="next-when">
          <LocalTime iso={d.nextSession.scheduledISO} fallback={d.nextSession.when} />
        </div>
        <div className="next-who">{d.nextSession.expert}</div>
        <div className="next-sub">{d.nextSession.durationMins} min</div>
        <Link href="/app/sessions" className="btn btn-outline next-btn">
          <CalendarDays size={16} /> Manage session
        </Link>
      </div>
    )
  }

  return (
    <div className="next-card">
      <div className="next-eyebrow">YOUR CARE</div>
      <div className="next-when next-when-sm">No session booked</div>
      <div className="next-sub">
        Book one with your care team whenever you&apos;re ready.
      </div>
      <Link href="/app/therapist" className="btn btn-primary next-btn">
        <Video size={16} /> Book a session
      </Link>
    </div>
  )
}
