// Mock delivery pricing — client-safe (no server imports). Replaced by the real
// pharmacy partner's quote once Tata 1mg (etc.) is integrated.

/** Estimated delivery price for a course: flat delivery fee + per-day charge. */
export function estimateOrderAmount(durationDays: number | null | undefined): number {
  const days = durationDays && durationDays > 0 ? durationDays : 30
  return 99 + days * 8 // ₹99 delivery + ₹8/day of medication
}
