// Human-facing account codes. Patients get a "P-…" code, clinicians an "E-…"
// (expert) code. Derived deterministically from the underlying id so they're
// stable without a schema change, and shown wherever a patient or clinician is
// referenced in the admin and dashboards.

const tail = (id: string) => (id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()

/** Patient code from their User id, e.g. "P-9F3K21". */
export function patientCode(userId: string): string {
  return `P-${tail(userId)}`
}

/** Clinician (expert) code from their TherapistProfile id, e.g. "E-7B2Q08". */
export function expertCode(profileId: string): string {
  return `E-${tail(profileId)}`
}
