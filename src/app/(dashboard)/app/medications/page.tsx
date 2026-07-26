import { redirect } from 'next/navigation'

// Medications is hidden while psychiatry is not offered. The prescribing and
// medication backend stays dormant; this route redirects so no stale UI is
// reachable by direct link. Restore the original page to switch it back on.
export default function MedicationsPage() {
  redirect('/app')
}
