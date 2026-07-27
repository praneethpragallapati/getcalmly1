'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { submitContactMessage } from '@/app/(public)/actions'

const coral = '#C8553D'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    startTransition(async () => {
      const res = await submitContactMessage({ name, email, phone, message })
      if (res.ok) setDone(true)
      else setErr(res.error ?? 'Could not send your message.')
    })
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 8px' }}>
        <div style={{ fontSize: 30, marginBottom: 10 }}>✅</div>
        <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontSize: 24, fontWeight: 700, color: '#1C2B3A', marginBottom: 8 }}>Message received</div>
        <p style={{ fontSize: 14.5, color: '#6B7D8E', lineHeight: 1.6 }}>Thanks for reaching out. Our team usually replies within a working day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label className="clabel">Name</label>
        <input type="text" className="cfield" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className="clabel">Email</label>
          <input type="email" className="cfield" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="clabel">Phone <span style={{ color: '#A0ADB8', fontWeight: 400 }}>(optional)</span></label>
          <input type="tel" className="cfield" placeholder="+91" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="clabel">Message</label>
        <textarea rows={5} className="cfield" placeholder="How can we help?" style={{ resize: 'vertical' }} value={message} onChange={(e) => setMessage(e.target.value)} required />
      </div>
      <button type="submit" disabled={pending} style={{ background: coral, color: '#fff', padding: '15px', borderRadius: 12, fontSize: 15.5, fontWeight: 700, border: 'none', cursor: pending ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: `0 8px 22px ${coral}45`, opacity: pending ? 0.7 : 1 }}>
        {pending ? 'Sending…' : 'Send message →'}
      </button>
      {err && <p style={{ fontSize: 13, color: coral, textAlign: 'center' }}>{err}</p>}
      <p style={{ fontSize: 12.5, color: '#A0ADB8', textAlign: 'center', lineHeight: 1.6 }}>
        By sending, you agree to our{' '}
        <Link href="/privacy" style={{ color: coral, fontWeight: 600 }}>Privacy Policy</Link>.
      </p>
    </form>
  )
}
