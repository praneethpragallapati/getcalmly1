import Link from 'next/link'
import { Video, FileText } from 'lucide-react'
import { LocalTime } from '@/components/dashboard/LocalTime'
import { JoinButton } from '@/components/dashboard/JoinButton'
import { SessionActions } from '@/components/dashboard/SessionActions'
import type { DashboardData } from '@/data/dashboardDemo'

/** Expert's photo, or their initials when they haven't set one. */
function ExpertAvatar({ name, src, onDark = false }: { name: string; src?: string | null; onDark?: boolean }) {
  const initials = name
    .replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`ns-avatar${onDark ? ' on-dark' : ''}`} />
  ) : (
    <span className={`ns-avatar ns-avatar-fallback${onDark ? ' on-dark' : ''}`}>{initials || '?'}</span>
  )
}

/**
 * The "what's next" companion beside the check-in. Leads with the expert's face,
 * then the when, then every action for that session in one place — joining,
 * notes, rescheduling, cancelling and support — so there's no need to bounce to
 * a separate "manage session" screen for the things people actually do.
 */
export function NextSessionCard({ d }: { d: DashboardData }) {
  const s = d.todaySession
  if (s) {
    return (
      <div className="next-card next-card-live tint-coral">
        <div className="ns-top">
          <ExpertAvatar name={s.expert} src={s.expertImage} onDark />
          <div className="ns-id">
            <div className="next-eyebrow live">● TODAY</div>
            <div className="ns-name">{s.expert}</div>
            <div className="ns-role">{s.expertRole}</div>
          </div>
        </div>

        <div className="ns-when">
          <LocalTime iso={s.scheduledISO} fallback={s.when.split('·').pop()?.trim() ?? ''} options={{ hour: 'numeric', minute: '2-digit' }} />
        </div>
        <div className="ns-meta">{s.durationMins} min · session #{s.sessionNo}</div>

        <div className="ns-actions">
          {s.scheduledISO ? (
            <JoinButton
              scheduledISO={s.scheduledISO}
              durationMins={s.durationMins}
              href={`/app/sessions/${s.id}/room`}
              label="Join session"
              size="md"
            />
          ) : (
            <Link href={`/app/sessions/${s.id}/room`} className="btn btn-primary"><Video size={16} /> Join session</Link>
          )}
          <Link href={`/app/sessions/${s.id}`} className="btn btn-outline btn-sm"><FileText size={13} /> Notes</Link>
          <SessionActions id={s.id} scheduledISO={s.scheduledISO} />
        </div>
      </div>
    )
  }

  if (d.nextSession) {
    const nx = d.nextSession
    return (
      <div className="next-card tint-coral">
        <div className="ns-top">
          <ExpertAvatar name={nx.expert} src={nx.expertImage} />
          <div className="ns-id">
            <div className="next-eyebrow">NEXT SESSION</div>
            <div className="ns-name">{nx.expert}</div>
            {nx.expertRole && <div className="ns-role">{nx.expertRole}</div>}
          </div>
        </div>

        <div className="ns-when">
          <LocalTime iso={nx.scheduledISO} fallback={nx.when} />
        </div>
        <div className="ns-meta">{nx.durationMins} min</div>

        <div className="ns-actions">
          {nx.scheduledISO ? (
            <JoinButton
              scheduledISO={nx.scheduledISO}
              durationMins={nx.durationMins}
              href={`/app/sessions/${nx.id}/room`}
              label="Join session"
              size="md"
            />
          ) : (
            <Link href={`/app/sessions/${nx.id}/room`} className="btn btn-primary"><Video size={16} /> Join session</Link>
          )}
          <Link href={`/app/sessions/${nx.id}`} className="btn btn-outline btn-sm"><FileText size={13} /> Notes</Link>
          <SessionActions id={nx.id} scheduledISO={nx.scheduledISO} />
        </div>
      </div>
    )
  }

  return (
    <div className="next-card next-card-empty tint-coral">
      <div className="next-eyebrow">YOUR CARE</div>
      <div className="ns-when ns-when-sm">No session booked</div>
      <div className="ns-meta">Book one with your care team whenever you&apos;re ready.</div>
      <Link href="/app/therapist" className="btn btn-primary ns-book">
        <Video size={16} /> Book a session
      </Link>
    </div>
  )
}
