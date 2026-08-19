import type { SectionTab } from '@/components/ui/SectionTabs'

// Grouped destinations that share one sidebar entry. Each group keeps its own
// routes (so existing links and revalidatePath calls stay valid) and is tied
// together by the SectionTabs header.

export const REAL_TALK_TABS: SectionTab[] = [
  { href: '/app/community', label: 'Feed' },
  { href: '/app/polls', label: 'Polls' },
]

export const PERSPECTIVES_TABS: SectionTab[] = [
  { href: '/app/blogs', label: 'Read' },
  { href: '/app/perspectives', label: 'Watch' },
]

export const CARE_TEAM_TABS: SectionTab[] = [
  { href: '/app/therapist', label: 'Care team' },
  { href: '/app/medications', label: 'Medications' },
]
