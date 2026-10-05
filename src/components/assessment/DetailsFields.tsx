'use client'

import { GENDER_OPTIONS } from '@/lib/memberOnboardingShared'
import type { VisitorDetails } from '@/data/assessments'
import DobPicker from '@/components/ui/DobPicker'
import PhoneField from '@/components/ui/PhoneField'

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
        <div className="pa-field">
          <span className="pa-pref-l">Phone</span>
          <PhoneField value={details.phone} onChange={(v) => onChange('phone', v)} />
        </div>
      </div>
      <div className="pa-field">
        <span className="pa-pref-l">Date of birth</span>
        <DobPicker value={details.dateOfBirth} onChange={(v) => onChange('dateOfBirth', v)} />
      </div>
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
