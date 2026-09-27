'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type Step = { route: string; selector?: string; title: string; body: string }

/**
 * A guided walkthrough of the member app, mirroring the mobile prototype's tour.
 * It lives in the dashboard layout so it survives client-side navigation, and it
 * drives the router between features. Started from the account menu, which fires
 * a `gc-tour-start` window event. Best-effort highlight: it rings the in-page
 * target when present, otherwise the matching sidebar link.
 */
const STEPS: Step[] = [
  {
    route: '/app',
    selector: '.hero',
    title: 'AI insights',
    body: 'Every morning, getCalmly AI reads your check-ins and journal and surfaces the patterns, hidden drivers and quiet wins behind how you feel.',
  },
  {
    route: '/app/forms',
    selector: '.by-tp',
    title: 'Forms',
    body: 'Forms are information your therapist asks you to complete — intake, consent, session feedback. Anything marked “Requested by your care team” came from your therapist.',
  },
  {
    route: '/app/progress',
    title: 'My Progress',
    body: 'Every mood check-in and Pulse score charts here over time, so you and your therapist can see what’s actually shifting between sessions.',
  },
  {
    route: '/app/calm-ai',
    title: 'Talk to getCalmly AI',
    body: 'Chat any time you need to think something through. It remembers your story across conversations, and never replaces your therapist — it flags anything urgent to your care team.',
  },
  {
    route: '/app/community',
    title: 'Calm Club',
    body: 'A safe, moderated community — share what you’re working through, join challenges and cheer others on. You’re not doing this alone.',
  },
  {
    route: '/app/therapist',
    title: 'My Care Team',
    body: 'Your therapist, your sessions and your medications in one place — book or join a call, or manage a prescription without hunting through screens.',
  },
]

export function ProductTour() {
  const [active, setActive] = useState(false)
  const [i, setI] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const hiRef = useRef<HTMLElement | null>(null)

  const clearHi = () => {
    if (hiRef.current) {
      hiRef.current.classList.remove('gc-tour-hi')
      hiRef.current = null
    }
  }

  const finish = useCallback(() => {
    clearHi()
    setActive(false)
  }, [])

  // Start when the account menu (or anything else) fires the event.
  useEffect(() => {
    const onStart = () => {
      clearHi()
      setI(0)
      setActive(true)
      if (window.location.pathname !== STEPS[0].route) router.push(STEPS[0].route)
    }
    window.addEventListener('gc-tour-start', onStart)
    return () => window.removeEventListener('gc-tour-start', onStart)
  }, [router])

  // Once active and on the step's route, ring the target (retrying while the
  // page settles), preferring the in-page element, then the sidebar link.
  useEffect(() => {
    if (!active) return
    const step = STEPS[i]
    if (pathname !== step.route) return
    let timer = 0
    let tries = 0
    const attempt = () => {
      clearHi()
      const inPage = step.selector ? (document.querySelector(step.selector) as HTMLElement | null) : null
      const nav = document.querySelector(`.app-sidebar a[href="${step.route}"]`) as HTMLElement | null
      const el = inPage ?? nav
      if (el) {
        el.classList.add('gc-tour-hi')
        hiRef.current = el
        try {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        } catch {
          /* older browsers: no smooth scroll, fine */
        }
      } else if (tries++ < 20) {
        timer = window.setTimeout(attempt, 120)
      }
    }
    attempt()
    return () => {
      window.clearTimeout(timer)
      clearHi()
    }
  }, [active, i, pathname])

  const go = (n: number) => {
    if (n >= STEPS.length) {
      finish()
      return
    }
    if (n < 0) return
    clearHi()
    setI(n)
    if (window.location.pathname !== STEPS[n].route) router.push(STEPS[n].route)
  }

  if (!active) return null
  const step = STEPS[i]
  const last = i === STEPS.length - 1

  return (
    <>
      <div className="gc-tour-scrim" onClick={finish} />
      <div className="gc-tour-card" role="dialog" aria-live="polite" aria-label="Guided tour">
        <div className="gc-tour-step">Step {i + 1} of {STEPS.length}</div>
        <div className="gc-tour-title">{step.title}</div>
        <div className="gc-tour-body">{step.body}</div>
        <div className="gc-tour-foot">
          <div className="gc-tour-dots">
            {STEPS.map((_, k) => (
              <span key={k} className={`gc-tour-dot${k === i ? ' on' : ''}`} />
            ))}
          </div>
          {i > 0 && (
            <button type="button" className="gc-tour-skip" onClick={() => go(i - 1)}>
              Back
            </button>
          )}
          <button type="button" className="gc-tour-skip" onClick={finish}>
            Skip
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => go(i + 1)}>
            {last ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </>
  )
}
