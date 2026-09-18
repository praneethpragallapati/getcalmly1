import type { SectionTab } from '@/components/ui/SectionTabs'
import { MEMBER_TASKS_TABS } from '@/data/sectionTabs'

/**
 * The Tasks section tabs (Activities / Forms) with a live count on each, so a
 * member sees what's waiting on either tab regardless of which one they're on.
 */
export function taskTabsWithBadges(activities: number, forms: number): SectionTab[] {
  return MEMBER_TASKS_TABS.map((t) => {
    const n = t.href === '/app/tasks' ? activities : t.href === '/app/forms' ? forms : 0
    return n > 0 ? { ...t, badge: n } : t
  })
}
