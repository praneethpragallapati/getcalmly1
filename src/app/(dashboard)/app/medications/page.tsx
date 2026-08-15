import { Download } from 'lucide-react'
import { getMedications } from '@/lib/account'
import { getSessionUserId } from '@/lib/patient'
import { getMedicationOrders } from '@/lib/orders'
import { MedicationManager } from '@/components/dashboard/MedicationManager'

export default async function MedicationsPage() {
  const userId = await getSessionUserId()
  const [meds, orders] = await Promise.all([
    getMedications(),
    userId ? getMedicationOrders(userId) : Promise.resolve([]),
  ])
  const activeCount = meds.filter((m) => m.active).length

  return (
    <>
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">Medications</h1>
          <span className="page-meta">
            {activeCount} active {activeCount === 1 ? 'medication' : 'medications'}
          </span>
        </div>
        {activeCount > 0 && (
          <a href="/app/medications/prescription" target="_blank" rel="noopener" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Download size={15} /> Download e-prescription
          </a>
        )}
      </div>

      <div style={{ maxWidth: 720 }}>
        <MedicationManager initial={meds} orders={orders} />
      </div>
    </>
  )
}
