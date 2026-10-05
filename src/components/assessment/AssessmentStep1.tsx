import Link from 'next/link'
import { UserRound, Pill, Baby, HeartHandshake, ArrowRight } from 'lucide-react'
import { FLOWS, FLOW_ORDER, type FlowId } from '@/data/assessments'
import PhotoShell from './PhotoShell'

const LOOK: Record<FlowId, { color: string; icon: React.ReactNode }> = {
  adult: { color: '#C8553D', icon: <UserRound size={22} /> },
  psychiatry: { color: '#1A7F7A', icon: <Pill size={22} /> },
  child: { color: '#B7832A', icon: <Baby size={22} /> },
  couple: { color: '#6D5BD0', icon: <HeartHandshake size={22} /> },
}

/**
 * The start of the pre-assessment: four direct paths, no "both" or "not sure"
 * detour. Each tile goes straight into its own questions. `hrefFor` lets the
 * in-app version point at its own route.
 */
export default function AssessmentStep1({
  hrefFor = (id: FlowId) => `/assess/form/${id}`,
  photo = true,
}: {
  hrefFor?: (id: FlowId) => string
  /** The website's login-style photo look; off inside the app's dashboard. */
  photo?: boolean
}) {
  const body = (
      <div className="pa-inner">
        <p className="pa-eyebrow">Pre-assessment</p>
        <h1 className="pa-h1">Let&apos;s find the right <em>place to begin.</em></h1>
        <p className="pa-lead">
          Through a few thoughtful questions, we get to know your concerns and preferences, then match you
          with the clinician best placed to help.
        </p>
        <ul className="pa-trust">
          <li>Free, no card needed</li>
          <li>About 4 minutes</li>
          <li>Private and confidential</li>
        </ul>

        <div className="pa-paths">
          {FLOW_ORDER.map((id) => {
            const f = FLOWS[id]
            const look = LOOK[id]
            return (
              <Link key={id} href={hrefFor(id)} className="pa-path" style={{ '--c': look.color } as React.CSSProperties}>
                <span className="pa-path-ic">{look.icon}</span>
                <span className="pa-path-body">
                  <span className="pa-path-t">{f.name}</span>
                  <span className="pa-path-d">{f.blurb}</span>
                </span>
                <span className="pa-path-go pa-path-go-row"><ArrowRight size={16} /></span>
                <span className="pa-path-m">
                  {f.questions.length} short questions
                  <span className="pa-path-go"><ArrowRight size={16} /></span>
                </span>
              </Link>
            )
          })}
        </div>

        <p className="pa-foot">
          A screening tool, not a diagnosis. Your answers are protected under the DPDP Act 2023 and only
          reach the clinician you are matched with.
        </p>
      </div>
  )
  return photo ? <PhotoShell eyebrow="Pre-assessment · about 4 minutes">{body}</PhotoShell> : <div className="pa">{body}</div>
}

export { LOOK as PATH_LOOK }
