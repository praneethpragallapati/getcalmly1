import { Download } from 'lucide-react'
import { getMedications } from '@/lib/account'
import { getSessionUserId } from '@/lib/patient'
import { getMedicationOrders } from '@/lib/orders'
import { MedicationManager } from '@/components/dashboard/MedicationManager'
import { SectionTabs } from '@/components/ui/SectionTabs'
import { CARE_TEAM_TABS } from '@/data/sectionTabs'

export default async function MedicationsPage() {
  const userId = await getSessionUserId()
  const [meds, orders] = await Promise.all([
    getMedications(),
    userId ? getMedicationOrders(userId) : Promise.resolve([]),
  ])
  const activeCount = meds.filter((m) => m.active).length

  return (
    <>
      <SectionTabs
        title="My Care Team"
        meta={`${activeCount} active ${activeCount === 1 ? 'medication' : 'medications'}`}
        tabs={CARE_TEAM_TABS.map((t) => (t.href === '/app/medications' ? { ...t, badge: activeCount } : t))}
        active="/app/medications"
      />
      {activeCount > 0 && (
        <div style={{ marginBottom: 16 }}>
          <a href="/app/medications/prescription" target="_blank" rel="noopener" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Download size={15} /> Download e-prescription
          </a>
        </div>
      )}

      <div style={{ maxWidth: 720 }}>
        <MedicationManager initial={meds} orders={orders} />
      </div>
    </>
  )
}
