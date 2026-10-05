'use client'

import { GENDER_OPTIONS } from '@/lib/memberOnboardingShared'
import type { VisitorDetails } from '@/data/assessments'

/**
 * The five personal details (name, email, phone, date of birth, gender) in the
 * assessment's own style. Shared by the assessment's last step and the direct
 * booking flow, so both look and read the same.
 */
export default function DetailsFields({
  details,
  onChange,
}: {
  details: VisitorDetails
  onChange: (key: keyof VisitorDetails, value: string) => void
}) {
  return (
    <div className="pa-form">
      <label className="pa-field">
        <span className="pa-pref-l">Full name</span>
        <input className="pa-input" value={details.name} onChange={(e) => onChange('name', e.target.value)} autoComplete="name" placeholder="e.g. Priya Sharma" />
      </label>
      <div className="pa-field-row">
        <label className="pa-field">
          <span className="pa-pref-l">Email</span>
          <input className="pa-input" type="email" value={details.email} onChange={(e) => onChange('email', e.target.value)} autoComplete="email" placeholder="you@example.com" />
        </label>
        <label className="pa-field">
          <span className="pa-pref-l">Phone</span>
          <input className="pa-input" type="tel" value={details.phone} onChange={(e) => onChange('phone', e.target.value)} autoComplete="tel" placeholder="+91 98765 43210" />
        </label>
      </div>
      <label className="pa-field" style={{ maxWidth: 280 }}>
        <span className="pa-pref-l">Date of birth</span>
        <input className="pa-input" type="date" value={details.dateOfBirth} onChange={(e) => onChange('dateOfBirth', e.target.value)} max={new Date().toISOString().slice(0, 10)} />
      </label>
      <div className="pa-field">
        <span className="pa-pref-l">Gender</span>
        <div className="pa-pills" role="radiogroup" aria-label="Gender">
          {GENDER_OPTIONS.map((g) => (
            <button key={g} type="button" role="radio" aria-checked={details.gender === g} className={`pa-pill${details.gender === g ? ' on' : ''}`} onClick={() => onChange('gender', g)}>
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
