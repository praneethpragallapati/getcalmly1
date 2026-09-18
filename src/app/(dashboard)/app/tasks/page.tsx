import { getSessionUserId } from '@/lib/patient'
import { getMyTasks } from '@/lib/dashboard'
import { TaskList } from '@/components/dashboard/TaskList'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { MEMBER_TASKS_TABS } from '@/data/sectionTabs'

export const dynamic = 'force-dynamic'

/**
 * Activities — the exercises, readings and reflections a member's care team
 * assigns. Sits under the "Tasks" section alongside Forms.
 */
export default async function ActivitiesPage() {
  const userId = await getSessionUserId()
  const tasks = userId ? await getMyTasks(userId) : []
  const open = tasks.filter((t) => !t.done).length

  return (
    <>
      <SectionTabs
        eyebrow="Tasks"
        title="Activities"
        meta={open > 0 ? `${open} to do` : 'All caught up'}
        tabs={MEMBER_TASKS_TABS.map((t) => (t.href === '/app/tasks' && open > 0 ? { ...t, badge: open } : t))}
        active="/app/tasks"
      />
      <div className="stack" style={{ maxWidth: 720 }}>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 12 }}>Your activities</div>
          <TaskList tasks={tasks} />
        </div>
      </div>
    </>
  )
}
