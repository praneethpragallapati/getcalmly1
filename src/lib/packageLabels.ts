// Human labels for package track slugs. Kept in its own client-safe module (no
// server imports) so client filter components can use it without pulling the
// server-only admin data layer into the browser bundle.

export const TRACK_LABEL: Record<string, string> = {
  therapy: 'Individual therapy',
  couples: 'Couples',
  psychiatry: 'Psychiatry',
  calmplus: 'Calm+',
  child: 'Child',
  maternal: 'Maternal',
  assessments: 'Assessments',
  specialised: 'Specialised',
}

export const trackLabel = (slug: string): string => TRACK_LABEL[slug] ?? slug
