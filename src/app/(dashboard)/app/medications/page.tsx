import { getMedications } from '@/lib/account'
import { MedicationManager } from '@/components/dashboard/MedicationManager'

export default async function MedicationsPage() {
  const meds = await getMedications()
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
        <MedicationManager initial={meds} />
      </div>
    </>
  )
}
