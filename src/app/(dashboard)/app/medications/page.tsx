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
      <div className="page-head">
        <h1 className="page-title">Medications</h1>
        <span className="page-meta">
          {activeCount} active {activeCount === 1 ? 'medication' : 'medications'}
        </span>
      </div>

      <div style={{ maxWidth: 720 }}>
        <MedicationManager initial={meds} orders={orders} />
      </div>
    </>
  )
}
