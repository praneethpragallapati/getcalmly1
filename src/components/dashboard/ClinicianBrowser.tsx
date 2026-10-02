'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Check } from 'lucide-react'
import { chooseMyClinician } from '@/app/(dashboard)/app/actions'
import { useToast } from '@/components/ui/Toast'
import { Celebration } from '@/components/dashboard/Celebration'
import type { BrowseClinician, SlotKey } from '@/lib/clinicianChoice'

/**
 * The clinicians a patient can choose from, one card each. Choosing asks once
 * to confirm, then attaches them. If personal details are still missing, the
 * patient fills them in first and comes straight back with their pick kept.
 */
export function ClinicianBrowser({
  slot,
  clinicians,
  initialPick,
}: {
  slot: SlotKey
  clinicians: BrowseClinician[]
  initialPick?: string | null
}) {
  const router = useRouter()
  const toast = useToast()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState<string | null>(
    initialPick && clinicians.some((c) => c.profileId === initialPick) ? initialPick : null,
  )
  const [chosen, setChosen] = useState<BrowseClinician | null>(null)
  const [nextHref, setNextHref] = useState('/app/therapist')

  function choose(c: BrowseClinician) {
    startTransition(async () => {
      const res = await chooseMyClinician({ slot, profileId: c.profileId })
      if (res.needsDetails) {
        const back = `/app/therapist/browse?care=${slot}&pick=${c.profileId}`
        router.push(`/welcome?next=${encodeURIComponent(back)}`)
        return
      }
      if (!res.ok) { toast.error(res.error ?? 'Could not save your choice.'); return }
      setNextHref(res.next ?? '/app/therapist')
      setChosen(c)
    })
  }

  if (clinicians.length === 0) {
    return (
      <div className="card">
        <p className="muted" style={{ margin: 0 }}>
          No clinicians are taking new patients for this right now. Try <b>Match your clinician</b> and we will
          find the right person for you.
        </p>
      </div>
    )
  }

  return (
    <>
      <Celebration
        show={!!chosen}
        title="Clinician chosen"
        sub={nextHref.startsWith('/app/billing') ? 'Next, your first session with them.' : 'You can book your first session now.'}
        detail={chosen ? { avatar: chosen.initials, name: chosen.name, meta: chosen.designation } : undefined}
        onDone={() => router.push(nextHref)}
      />
      <div className="br-grid">
        {clinicians.map((c) => {
          const first = c.name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '').split(' ')[0] || c.name
          const isConfirming = confirming === c.profileId
          return (
            <div key={c.profileId} className={`card br-card${isConfirming ? ' on' : ''}`}>
              <div className="br-who">
                <span className="br-av" style={c.photoUrl ? { backgroundImage: `url(${c.photoUrl})` } : undefined} aria-hidden>
                  {c.photoUrl ? '' : c.initials}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="br-name">{c.name}</div>
                  <div className="br-desig">{c.designation}</div>
                  <span className="br-lic"><ShieldCheck size={12} style={{ verticalAlign: '-2px' }} /> {c.licence} licensed</span>
                </div>
              </div>
              {c.specializations.length > 0 && (
                <div className="br-tags">{c.specializations.slice(0, 4).map((s) => <span key={s}>{s}</span>)}</div>
              )}
              {c.bio && <p className="br-bio">{c.bio}</p>}
              {c.languages.length > 0 && <div className="muted" style={{ fontSize: 12.5 }}>Speaks {c.languages.slice(0, 3).join(', ')}</div>}
              <div className="br-actions">
                {isConfirming ? (
                  <>
                    <span className="br-confirm">Choose {first} as your clinician?</span>
                    <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => choose(c)}>
                      <Check size={14} /> {pending ? 'Saving…' : `Yes, choose ${first}`}
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" disabled={pending} onClick={() => setConfirming(null)}>
                      Not yet
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setConfirming(c.profileId)}>
                    Choose {first}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
