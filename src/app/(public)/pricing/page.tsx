import { getPricingConfig } from '@/lib/pricingConfig'
import PricingView from './PricingView'

// Pricing is admin-editable (lib/pricingConfig); fetch the live values on the
// server and hand them to the interactive card grid.
export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const pricing = await getPricingConfig()
  return <PricingView pricing={pricing} />
}
