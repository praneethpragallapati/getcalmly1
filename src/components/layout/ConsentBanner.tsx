'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[600] bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] p-4 pb-safe">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          We use cookies to improve your experience. By continuing, you agree to our{' '}
          <Link href="/privacy" className="text-[#C8553D] underline">Privacy Policy</Link>.
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={() => { localStorage.setItem('cookieConsent', 'declined'); setVisible(false) }}
            className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Decline
          </button>
          <button
            onClick={() => { localStorage.setItem('cookieConsent', 'accepted'); setVisible(false) }}
            className="text-sm bg-[#C8553D] text-white px-4 py-2 rounded-lg hover:bg-[#A8432D]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
