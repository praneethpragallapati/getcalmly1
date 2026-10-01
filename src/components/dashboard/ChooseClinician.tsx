import Link from 'next/link'
import { Sparkles, Users, ArrowRight } from 'lucide-react'

/**
 * The first-assignment fork: "Match your clinician" (a few questions, we
 * recommend) or "Browse your clinician" (pick from the list yourself). Shown
 * only while a care type has a package but no clinician; once one is
 * attached, the care team shows them instead and this never appears again.
 */
export function ChooseClinician({
  label,
  matchHref,
  browseHref,
  meta,
}: {
  /** Care type, e.g. "Individual therapy". Omit for a general prompt. */
  label?: string
  matchHref: string
  browseHref: string
  /** Small line under the heading, e.g. sessions left. */
  meta?: string
}) {
  return (
    <div className="card cc-card">
      {label && <div className="cc-eyebrow">{label}</div>}
      <div className="cc-title">Let&apos;s find your clinician</div>
      <p className="cc-sub">
        Your sessions are ready to use. Choose how you would like to meet the person you will work with.
        {meta ? <span className="cc-meta"> {meta}</span> : null}
      </p>

      <div className="cc-options">
        <Link href={matchHref} className="cc-option cc-match">
          <span className="cc-ic"><Sparkles size={20} /></span>
          <span className="cc-opt-t">Match your clinician</span>
          <span className="cc-opt-d">Answer a few gentle questions and we will recommend the clinician best suited to you.</span>
          <span className="cc-go">Get matched <ArrowRight size={15} /></span>
        </Link>
        <Link href={browseHref} className="cc-option cc-browse">
          <span className="cc-ic"><Users size={20} /></span>
          <span className="cc-opt-t">Browse your clinician</span>
          <span className="cc-opt-d">See our clinicians, read about how they work, and choose the one who feels right.</span>
          <span className="cc-go">Browse clinicians <ArrowRight size={15} /></span>
        </Link>
      </div>
    </div>
  )
}
