'use client'

import { useRouter } from 'next/navigation'

/**
 * Direct-booking entry point on a clinician's profile.
 *
 * This is the "book her directly" path: it deliberately bypasses the
 * assessment and the clinician-matching step. We stash the chosen clinician in
 * a short-lived cookie so it survives the details → sign-in → checkout hops,
 * then open /book/[slug]: the assessment's "about you" step, a one-time code
 * to the phone just given, then checkout, which assigns this exact clinician.
 */
export default function BookSessionButton({
  slug,
  name,
  accent,
}: {
  slug: string
  name: string
  accent: string
}) {
  const router = useRouter()

  const book = () => {
    // 30-minute window is plenty to get through login + details + payment.
    document.cookie = `gc_book_clinician=${encodeURIComponent(slug)}; path=/; max-age=1800; samesite=lax`
    router.push(`/book/${encodeURIComponent(slug)}`)
  }

  return (
    <button
      type="button"
      onClick={book}
      style={{
        padding: '15px 30px', borderRadius: 50, border: 'none', cursor: 'pointer',
        background: accent, color: '#fff', fontSize: 15.5, fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif", boxShadow: `0 10px 26px ${accent}55`,
      }}
    >
      Book a session with {name.split(' ').slice(0, 2).join(' ')}
    </button>
  )
}
