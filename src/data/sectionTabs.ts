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

// Calm Club is one sidebar entry that tabs across community, blogs and polls.
// Watch (/app/perspectives) is hidden for now.
export const CALM_CLUB_TABS: SectionTab[] = [
  { href: '/app/community', label: 'The Circles' },
  { href: '/app/blogs', label: 'Fresh Reads' },
  { href: '/app/polls', label: 'Polls' },
]

export const CARE_TEAM_TABS: SectionTab[] = [
  { href: '/app/therapist', label: 'Care team' },
  { href: '/app/medications', label: 'Medications' },
]

// Tasks is one sidebar entry that tabs across Activities and Forms.
export const MEMBER_TASKS_TABS: SectionTab[] = [
  { href: '/app/tasks', label: 'Activities' },
  { href: '/app/forms', label: 'Forms' },
]

// ── Expert portal ────────────────────────────────────────────────────────────

export const EXPERT_SCHEDULE_TABS: SectionTab[] = [
  { href: '/expert/schedule', label: 'Schedule' },
  { href: '/expert/availability', label: 'Availability' },
]

// Tasks and Forms share one sidebar entry ("Tasks").
export const EXPERT_TASKS_TABS: SectionTab[] = [
  { href: '/expert/tasks', label: 'Activities' },
  { href: '/expert/forms', label: 'Forms' },
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
