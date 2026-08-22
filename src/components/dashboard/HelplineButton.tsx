'use client'

import { useEffect, useRef, useState } from 'react'
import { LifeBuoy, Phone, X, ShieldAlert, ArrowLeft, Check, AlertTriangle } from 'lucide-react'
import { dashboardHelplines as HELPLINES, emergencyNumber } from '@/config/site'
import { raiseCrisisAlert } from '@/app/(dashboard)/app/actions'
import type { CrisisReportResult } from '@/lib/crisisReport'

/**
 * The always-available crisis access point, pinned to the corner of the
 * dashboard. Collapsed it's a small pill; open it offers:
 *
 *   1. Helplines to call right now — the fastest route to a human, always the
 *      first thing on screen, and shown to EVERYONE regardless of plan.
 *   2. Telling their own care team they are in crisis — only when there is a
 *      care team to tell.
 *
 * WHY THE ALERT IS CONDITIONAL
 * ---------------------------
 * A clinician assignment is only live while the member's package has validity
 * left; when it lapses they are effectively de-assigned. With nobody holding
 * them there is nobody to alert, and texting their family on behalf of a member
 * no clinician is watching would raise an alarm that no one is coming to answer.
 * So the button is not offered — helplines are, and those are staffed.
 *
 * `canAlertCareTeam` is decided on the server in the dashboard layout. The
 * server action re-checks it: this prop controls what is offered, never what is
 * permitted.
 *
 * WHY THE CONFIRM STEP EXISTS
 * ---------------------------
 * Pressing the alert does real things in the world: it messages the member's
 * emergency contact and puts a red alert in front of their clinicians. A
 * mis-tap that phones someone's mother is a serious harm of its own, so the
 * button never fires on the first press. The second screen states plainly who
 * will be contacted, by name where we know it, before anything happens.
 *
 * The helplines stay visible on every screen including the confirmation. Nothing
 * here should ever stand between someone and a phone number.
 */

type Step = 'menu' | 'confirm' | 'sending' | 'done'
type Severity = 'SUPPORT' | 'URGENT'

const CORAL = 'var(--c-coral, #C8553D)'
const RED = '#B3261E'

export function HelplineButton({ canAlertCareTeam = false }: { canAlertCareTeam?: boolean }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('menu')
  const [severity, setSeverity] = useState<Severity>('SUPPORT')
  const [note, setNote] = useState('')
  const [result, setResult] = useState<CrisisReportResult | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  /**
   * Close and reset together. Reopening always lands on the helplines, never
   * mid-flow in a stale confirmation someone half-completed an hour ago.
   * Done here rather than in an effect keyed on `open`, which would be a
   * setState during render-commit and re-render the panel twice on every close.
   */
  function close() {
    setOpen(false)
    setStep('menu')
    setNote('')
    setResult(null)
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      // Never dismiss mid-send by an accidental click outside.
      if (step === 'sending') return
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && step !== 'sending') close() }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, step])

  async function send() {
    setStep('sending')
    try {
      const r = await raiseCrisisAlert({ severity, note: note.trim() || null })
      setResult(r)
    } catch {
      setResult({
        ok: false, recorded: false, careTeam: [], hasCareTeam: false, emergencyContact: { status: 'none' },
        error: 'We could not reach our servers. Please call a helpline above right now.',
      })
    }
    setStep('done')
  }

  return (
    <div ref={ref} style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 70 }}>
      {open && (
        <div style={{
          position: 'absolute', right: 0, bottom: 'calc(100% + 12px)', width: 320, maxWidth: '90vw',
          background: '#fff', borderRadius: 16, boxShadow: '0 18px 48px rgba(28,43,58,.24)',
          border: '1px solid rgba(28,43,58,.08)', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px', background: '#1c2b3a' }}>
            <span style={{ color: '#fff', fontSize: 13.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              {step === 'menu' ? <><LifeBuoy size={15} /> Get help now</> : <><ShieldAlert size={15} /> Alert my care team</>}
            </span>
            <button onClick={close} aria-label="Close" disabled={step === 'sending'}
              style={{ background: 'none', border: 'none', cursor: step === 'sending' ? 'default' : 'pointer', color: 'rgba(255,255,255,.8)', display: 'inline-flex' }}>
              <X size={16} />
            </button>
          </div>

          {/* Helplines: always first, on every step. */}
          <div style={{ padding: '6px 6px 2px' }}>
            {HELPLINES.map((h) => (
              <a key={h.tel} href={`tel:${h.tel}`} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', textDecoration: 'none', borderRadius: 10 }}
                 onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-coral-pale, #FDEAE6)')}
                 onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'var(--c-coral-pale, #FDEAE6)', color: CORAL, flexShrink: 0 }}>
                  <Phone size={14} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--c-charcoal, #1C2B3A)' }}>{h.name}</span>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: CORAL }}>{h.number}</span>
                </span>
              </a>
            ))}
          </div>

          {step === 'menu' && (
            <div style={{ padding: '8px 14px 14px', borderTop: '1px solid rgba(28,43,58,.06)', marginTop: 6 }}>
              <p style={{ fontSize: 11.5, color: 'var(--c-gray, #8E9EAE)', lineHeight: 1.55, marginBottom: canAlertCareTeam ? 10 : 0 }}>
                In immediate danger? Call emergency services ({emergencyNumber}).
              </p>
              {/* No care team, no button. Someone without a clinician is not
                  offered an alert that would only be refused — the helplines
                  above are the answer, and they are staffed. */}
              {canAlertCareTeam && (
                <>
                  <button onClick={() => setStep('confirm')} style={{
                    width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px 14px', borderRadius: 11, border: `1.5px solid ${RED}33`, background: '#FDF2F1',
                    color: RED, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <ShieldAlert size={15} /> Tell my care team I&apos;m in crisis
                  </button>
                  <p style={{ fontSize: 11, color: 'var(--c-gray, #8E9EAE)', lineHeight: 1.5, marginTop: 8, textAlign: 'center' }}>
                    We&apos;ll show you exactly who gets contacted before anything is sent.
                  </p>
                </>
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(28,43,58,.06)', marginTop: 6 }}>
              {/* The warning, stated before the choice rather than after it. */}
              <div style={{ display: 'flex', gap: 8, background: '#FDF2F1', border: `1px solid ${RED}22`, borderRadius: 11, padding: '10px 12px', marginBottom: 12 }}>
                <AlertTriangle size={15} style={{ color: RED, flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: '#5A2E2A', lineHeight: 1.55 }}>
                  <strong style={{ color: RED }}>This alerts real people.</strong> Your emergency
                  contact will get a text message, and your care team and our support team will be
                  notified straight away. Please only send this if you need help.
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-charcoal, #1C2B3A)', marginBottom: 6 }}>How urgent is it?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 11 }}>
                {([
                  ['SUPPORT', 'I need support now', 'I’m struggling and need someone today.'],
                  ['URGENT', 'I’m in immediate danger', 'I may act on thoughts of harming myself.'],
                ] as const).map(([key, label, blurb]) => (
                  <button key={key} onClick={() => setSeverity(key)} style={{
                    textAlign: 'left', padding: '9px 11px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                    border: severity === key ? `1.5px solid ${RED}` : '1.5px solid #E2E8F0',
                    background: severity === key ? '#FDF2F1' : '#fff',
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: severity === key ? RED : 'var(--c-charcoal, #1C2B3A)' }}>{label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--c-gray-d, #5A6B7A)', marginTop: 1 }}>{blurb}</div>
                  </button>
                ))}
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything you want them to know? (optional)"
                rows={2}
                maxLength={500}
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: 10,
                  border: '1.5px solid #E2E8F0', fontSize: 12.5, fontFamily: 'inherit', resize: 'none',
                  color: 'var(--c-charcoal, #1C2B3A)', outline: 'none', marginBottom: 11,
                }}
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep('menu')} style={{
                  flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '10px 12px',
                  borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff',
                  color: 'var(--c-gray-d, #5A6B7A)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <button onClick={send} style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10, border: 'none', background: RED,
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Yes, alert them now
                </button>
              </div>
            </div>
          )}

          {step === 'sending' && (
            <div style={{ padding: '18px 14px 20px', borderTop: '1px solid rgba(28,43,58,.06)', marginTop: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-charcoal, #1C2B3A)' }}>Alerting your care team…</div>
              <div style={{ fontSize: 12, color: 'var(--c-gray, #8E9EAE)', marginTop: 4 }}>Please stay on this screen.</div>
            </div>
          )}

          {step === 'done' && result && (
            <div style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(28,43,58,.06)', marginTop: 6 }}>
              {result.ok ? (
                <>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: '#E8F5EE', color: '#1B7F4D', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Check size={15} />
                    </span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-charcoal, #1C2B3A)', lineHeight: 1.45 }}>
                      Your care team has been alerted.
                    </div>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--c-gray-d, #5A6B7A)', lineHeight: 1.7 }}>
                    {/* Members with no clinician yet must not be told "your care
                        team" has been notified — there isn't one. Ops is the
                        responder in that case, and the copy says exactly that. */}
                    <li>
                      {result.careTeam.length > 0
                        ? `${result.careTeam.join(' and ')} ${result.careTeam.length === 1 ? 'has' : 'have'} been notified.`
                        : 'You don’t have a clinician assigned yet, so our support team has been alerted and will reach out.'}
                    </li>
                    {/* Never claim the contact was reached when they weren't. */}
                    {result.emergencyContact.status === 'sent' && (
                      <li>{result.emergencyContact.name ?? 'Your emergency contact'} has been sent a message.</li>
                    )}
                    {result.emergencyContact.status === 'failed' && (
                      <li style={{ color: RED }}>
                        We could <strong>not</strong> reach {result.emergencyContact.name ?? 'your emergency contact'}
                        {result.emergencyContact.phone ? <> — please call <a href={`tel:${result.emergencyContact.phone.replace(/[^\d+]/g, '')}`} style={{ color: RED, fontWeight: 700 }}>{result.emergencyContact.phone}</a> yourself.</> : '.'}
                      </li>
                    )}
                    {result.emergencyContact.status === 'none' && (
                      <li>No emergency contact is on file — add one in your profile.</li>
                    )}
                  </ul>
                  <p style={{ fontSize: 11.5, color: 'var(--c-gray, #8E9EAE)', lineHeight: 1.55, marginTop: 10 }}>
                    If you are in immediate danger, please still call {emergencyNumber} or a helpline above.
                    We are not an emergency service.
                  </p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: RED, marginBottom: 6 }}>We couldn&apos;t send that alert.</div>
                  <p style={{ fontSize: 12, color: 'var(--c-gray-d, #5A6B7A)', lineHeight: 1.6 }}>{result.error}</p>
                  <button onClick={() => setStep('confirm')} style={{
                    marginTop: 10, width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0',
                    background: '#fff', color: 'var(--c-charcoal, #1C2B3A)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    Try again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Get help now"
        aria-expanded={open}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 15px', borderRadius: 999,
          border: '1px solid rgba(200,85,61,.25)', background: '#fff', color: CORAL,
          fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 8px 24px rgba(28,43,58,.16)',
        }}
      >
        <LifeBuoy size={16} /> Get help
      </button>
    </div>
  )
}
