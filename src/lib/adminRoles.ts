/**
 * Admin sub-roles.
 *
 * Every admin account could reach every part of the console — including
 * clinical records and the money. These types carve it up along the lines the
 * console is already organised by, so an account only sees the work it does.
 *
 * NULL adminType means FULL access. That is deliberate: every admin that
 * already exists keeps exactly what they have today, and the restriction is
 * opt-in per account rather than something that silently locks people out on
 * deploy.
 */

export type AdminType = 'SUPER' | 'OPERATIONS' | 'FINANCE' | 'CARE' | 'CONTENT' | 'SUPPORT'

/** The areas of the console a type can be granted. */
export type AdminArea =
  | 'overview'    // dashboard, submissions inbox
  | 'people'      // clinicians, patients, supervision, account creation
  | 'clinical'    // anything touching a member's care record
  | 'money'       // revenue, payouts, pricing, the ledger
  | 'content'     // blog, perspectives, guided calm
  | 'config'      // platform configuration

export const ADMIN_TYPES: { value: AdminType; label: string; blurb: string }[] = [
  { value: 'SUPER', label: 'Super admin', blurb: 'Everything, including money and configuration.' },
  { value: 'OPERATIONS', label: 'Operations', blurb: 'Day-to-day running: people, scheduling, submissions.' },
  { value: 'FINANCE', label: 'Finance', blurb: 'Revenue, payouts, pricing and the expense ledger.' },
  { value: 'CARE', label: 'Clinical / care', blurb: 'Clinicians, members and supervision. No money.' },
  { value: 'CONTENT', label: 'Content', blurb: 'Blog, perspectives and guided calm only.' },
  { value: 'SUPPORT', label: 'Support', blurb: 'Submissions and member lookup. No money, no config.' },
]

const AREAS: Record<AdminType, AdminArea[]> = {
  SUPER: ['overview', 'people', 'clinical', 'money', 'content', 'config'],
  OPERATIONS: ['overview', 'people', 'clinical', 'content'],
  FINANCE: ['overview', 'money'],
  CARE: ['overview', 'people', 'clinical'],
  CONTENT: ['overview', 'content'],
  SUPPORT: ['overview', 'people'],
}

export function isAdminType(v: unknown): v is AdminType {
  return typeof v === 'string' && v in AREAS
}

/**
 * Whether an account may reach an area. An unrecognised or absent type means
 * full access — see the note at the top; nobody is locked out by default.
 */
export function canAccess(adminType: string | null | undefined, area: AdminArea): boolean {
  if (!isAdminType(adminType)) return true
  return AREAS[adminType].includes(area)
}

/** The label for a type, for display. */
export function adminTypeLabel(adminType: string | null | undefined): string {
  if (!isAdminType(adminType)) return 'Full access'
  return ADMIN_TYPES.find((t) => t.value === adminType)?.label ?? adminType
}

/**
 * Which area a console path belongs to. Longest prefix wins, so
 * /admin/money/<id> resolves like /admin/money rather than falling through to
 * the dashboard.
 */
const PATH_AREA: [string, AdminArea][] = [
  ['/admin/therapists', 'people'],
  ['/admin/supervision', 'people'],
  ['/admin/patients', 'clinical'],
  ['/admin/create', 'people'],
  ['/admin/feedback', 'people'],
  ['/admin/operations', 'clinical'],
  ['/admin/money', 'money'],
  ['/admin/revenue', 'money'],
  ['/admin/pricing', 'money'],
  ['/admin/referrals', 'money'],
  ['/admin/finance', 'money'],
  ['/admin/content', 'content'],
  ['/admin/perspectives', 'content'],
  ['/admin/guided', 'content'],
  ['/admin/media', 'content'],
  ['/admin/config', 'config'],
  ['/admin/submissions', 'overview'],
  ['/admin/notifications', 'overview'],
  ['/admin', 'overview'],
]

export function areaForPath(pathname: string): AdminArea {
  for (const [prefix, area] of PATH_AREA) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return area
  }
  return 'overview'
}
