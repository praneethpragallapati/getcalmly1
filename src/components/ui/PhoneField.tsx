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
  // The country and the number are kept apart here, so the box only ever
  // holds the local number; the code lives in the picker on the left.
  const [country, setCountry] = useState(() => splitPhone(value).country)
  const [local, setLocal] = useState(() => splitPhone(value).local)

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
        onChange={(e) => {
          // A pasted "+91 …" or "91…" for the chosen country loses its code.
          let d = e.target.value.replace(/[^\d ]/g, '')
          const digits = d.replace(/\D/g, '')
          if (e.target.value.trim().startsWith('+') || (digits.startsWith(country.dial) && digits.length > country.dial.length + 9)) {
            d = digits.startsWith(country.dial) ? digits.slice(country.dial.length) : digits
          }
          setLocal(d)
          onChange(joinPhone(country, d))
        }}
      />
    </div>
  )
}
