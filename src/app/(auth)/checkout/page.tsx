import { getPricingConfig } from '@/lib/pricingConfig'
import { packsForIn, type BuyableTrack } from '@/data/pricing'
import CheckoutClient, { type CheckoutPrices } from './CheckoutClient'

// Prices are admin-editable, so they are read per request.
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const pricing = await getPricingConfig()
  const one = (t: BuyableTrack) => ({
    first: pricing.firstSession[t],
    packFrom: Math.min(...packsForIn(pricing, t).map((p) => Math.round(p.total / p.sessions))),
  })
  const prices: CheckoutPrices = { therapy: one('therapy'), psychiatry: one('psychiatry'), couples: one('couples') }
  return <CheckoutClient prices={prices} />
}
