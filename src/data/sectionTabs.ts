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

// ── Expert portal ────────────────────────────────────────────────────────────

export const EXPERT_SCHEDULE_TABS: SectionTab[] = [
  { href: '/expert/schedule', label: 'Schedule' },
  { href: '/expert/availability', label: 'Availability' },
]

export const EXPERT_PUBLISH_TABS: SectionTab[] = [
  { href: '/expert/blogs', label: 'Read' },
  { href: '/expert/perspectives', label: 'Watch' },
]

// ── Admin ────────────────────────────────────────────────────────────────────

export const ADMIN_CONTENT_TABS: SectionTab[] = [
  { href: '/admin/content', label: 'Community & blogs' },
  { href: '/admin/perspectives', label: 'Perspectives' },
  { href: '/admin/guided', label: 'Guided calm' },
]

export const ADMIN_MONEY_TABS: SectionTab[] = [
  { href: '/admin/revenue', label: 'Revenue' },
  { href: '/admin/money', label: 'Clinician payouts' },
]

export const ADMIN_PRICING_TABS: SectionTab[] = [
  { href: '/admin/pricing', label: 'Packages & pricing' },
  { href: '/admin/referrals', label: 'Referrals' },
]

export const ADMIN_CLINICIAN_TABS: SectionTab[] = [
  { href: '/admin/therapists', label: 'Clinicians' },
  { href: '/admin/supervision', label: 'Supervision' },
]
