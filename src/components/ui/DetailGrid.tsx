import { countryName } from '@/lib/countries'

export type DetailField = { label: string; value: string | null | undefined }

/**
 * A labelled read-only field grid — the same presentation wherever a full
 * contact / personal record is shown (a clinician's own profile, a patient's
 * record in the expert portal, and both records in the admin console), so the
 * fields read identically in every place they appear.
 *
 * Empty fields render as "Not provided" rather than being dropped: an admin
 * chasing a missing emergency contact needs to see that it's missing, not to
 * wonder whether the field exists at all.
 */
export function DetailGrid({ fields }: { fields: DetailField[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '14px 22px',
        marginTop: 10,
      }}
    >
      {fields.map((f) => {
        const filled = Boolean(f.value && String(f.value).trim())
        return (
          <div key={f.label} style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                color: 'var(--c-gray, #8E9EAE)', marginBottom: 3,
              }}
            >
              {f.label}
            </div>
            <div
              style={{
                fontSize: 13.5, lineHeight: 1.5, wordBreak: 'break-word',
                color: filled ? 'var(--c-charcoal, #1C2B3A)' : 'var(--c-gray, #A0ADB8)',
                fontStyle: filled ? undefined : 'italic',
              }}
            >
              {filled ? f.value : 'Not provided'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** The one-line postal address, from its parts. Empty when nothing is set. */
export function formatAddress(a: {
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  state?: string | null
  postalCode?: string | null
  country?: string | null
}): string {
  return [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode, countryName(a.country)]
    .map((p) => (p ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

/** "Name (Relationship) · phone", or empty when no contact is on record. */
export function formatEmergencyContact(e: {
  emergencyName?: string | null
  emergencyPhone?: string | null
  emergencyRelation?: string | null
}): string {
  if (!e.emergencyName && !e.emergencyPhone) return ''
  const who = [e.emergencyName, e.emergencyRelation ? `(${e.emergencyRelation})` : null]
    .filter(Boolean).join(' ')
  return [who, e.emergencyPhone].filter(Boolean).join(' · ')
}

/** Age in whole years from a yyyy-mm-dd string or Date, or null if unknown. */
export function ageFrom(dob: string | Date | null | undefined): number | null {
  if (!dob) return null
  const d = dob instanceof Date ? dob : new Date(dob)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getUTCFullYear() - d.getUTCFullYear()
  const m = now.getUTCMonth() - d.getUTCMonth()
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) age--
  return age >= 0 && age < 130 ? age : null
}
