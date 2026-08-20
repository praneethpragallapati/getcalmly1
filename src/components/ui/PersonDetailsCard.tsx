import { DetailGrid, formatAddress, formatEmergencyContact, ageFrom } from '@/components/ui/DetailGrid'
import type { PersonContact } from '@/lib/expert'
import { countryName } from '@/lib/countries'
import { fmtIST } from '@/lib/tz'

/**
 * The full identity + contact record for a patient, rendered identically for the
 * treating clinician and for admin. Both need to reach the person (and their
 * emergency contact) between sessions, so the same block serves both rather than
 * two views that drift apart.
 */
export function PersonDetailsCard({
  contact,
  name,
  title = 'Contact & personal details',
  note,
  codeLabel = 'Patient ID',
}: {
  contact: PersonContact
  name?: string
  title?: string
  note?: string
  /** What `contact.code` is — the patient identifier, or a clinician's registration. */
  codeLabel?: string
}) {
  const age = ageFrom(contact.dateOfBirth)
  const dob = contact.dateOfBirth
    ? `${fmtIST(new Date(contact.dateOfBirth), { day: 'numeric', month: 'short', year: 'numeric' })}${age != null ? ` · ${age}` : ''}`
    : null

  return (
    <div className="card">
      <div className="section-title">{title}</div>
      {note && <p className="muted" style={{ fontSize: 12.5, margin: '4px 0 0' }}>{note}</p>}
      <DetailGrid
        fields={[
          ...(name ? [{ label: 'Name', value: name }] : []),
          { label: codeLabel, value: contact.code },
          { label: 'Email', value: contact.email },
          { label: 'Phone', value: contact.phone },
          { label: 'Date of birth', value: dob },
          { label: 'Gender', value: contact.gender },
          ...(contact.maritalStatus !== null || contact.occupation !== null
            ? [
                { label: 'Marital status', value: contact.maritalStatus },
                { label: 'Occupation', value: contact.occupation },
              ]
            : []),
          { label: 'Preferred language', value: contact.preferredLanguage },
          { label: 'Country', value: countryName(contact.country) },
          { label: 'Address', value: formatAddress(contact) },
          { label: 'Emergency contact', value: formatEmergencyContact(contact) },
          { label: 'Member since', value: contact.joinedLabel },
        ]}
      />
    </div>
  )
}
