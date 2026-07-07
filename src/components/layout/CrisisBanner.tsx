'use client'
import { useLocalStorageFlag } from '@/lib/useLocalStorageFlag'

export default function CrisisBanner() {
  const [dismissed, setDismissed] = useLocalStorageFlag('crisisBannerDismissed')

  const dismiss = () => setDismissed('1')

  if (dismissed) return null

  return (
    <div className="bg-red-50 border-b border-red-200 py-2 px-4 text-center text-sm text-red-800 relative">
      <span>
        If you&apos;re in crisis, call{' '}
        <a href="tel:9152987821" className="font-bold underline">iCall: 9152987821</a>
        {' '}or{' '}
        <a href="tel:7893078930" className="font-bold underline">One Life: 78930-78930</a>
        {' '}(24/7)
      </span>
      <button
        onClick={dismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 text-xl leading-none font-bold"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  )
}
