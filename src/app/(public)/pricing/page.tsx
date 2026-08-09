import { getPricingConfig } from '@/lib/pricingConfig'
import PricingView from './PricingView'

// Pricing is admin-editable (lib/pricingConfig); fetch the live values on the
// server and hand them to the interactive card grid.
// ISR: serve a cached render and revalidate at most every 600s. Admin edits
// call revalidatePath() so changes still appear immediately; this is the cap.
export const revalidate = 600

export default async function PricingPage() {
  const pricing = await getPricingConfig()
  return <PricingView pricing={pricing} />
}
