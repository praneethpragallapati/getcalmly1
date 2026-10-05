'use client'

import { useState } from 'react'
import CountrySelect from './CountrySelect'
import { splitPhone, joinPhone } from '@/lib/phone'

/**
 * Phone number with a country code picker (India by default), in the
 * assessment's field style. The value is "+91 9876543210".
 */
export default function PhoneField({
  value,
  onChange,
  readOnly,
}: {
  value: string
  onChange: (v: string) => void
  readOnly?: boolean
}) {
  const [country, setCountry] = useState(() => splitPhone(value).country)
  const local = splitPhone(value).local

  if (readOnly) {
    return <input className="pa-input" type="tel" value={value} readOnly />
  }
  return (
    <div className="pa-input pa-phone">
      <CountrySelect value={country} onChange={(c) => { setCountry(c); onChange(joinPhone(c, local)) }} />
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        aria-label="Phone number"
        placeholder="98765 43210"
        value={local}
        onChange={(e) => onChange(joinPhone(country, e.target.value))}
      />
    </div>
  )
}
