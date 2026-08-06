import { NextRequest, NextResponse } from 'next/server'
import { sendEmailOtp } from '@/lib/email'
import { rateLimit, clientIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'Enter a valid email address.' }, { status: 400 })
    }
    const addr = email.toLowerCase().trim()
    const byAddr = rateLimit(`eotp:addr:${addr}`, 5, 10 * 60 * 1000)
    const byIp = rateLimit(`eotp:ip:${clientIp(req)}`, 20, 60 * 60 * 1000)
    if (!byAddr.ok || !byIp.ok) {
      return NextResponse.json(
        { ok: false, message: 'Too many code requests. Please wait a little and try again.' },
        { status: 429, headers: { 'Retry-After': String(Math.max(byAddr.retryAfterSec, byIp.retryAfterSec)) } },
      )
    }
    const result = await sendEmailOtp(addr)
    return NextResponse.json(result, { status: result.ok ? 200 : 502 })
  } catch (err) {
    console.error('email-send error', err)
    return NextResponse.json({ ok: false, message: 'Server error.' }, { status: 500 })
  }
}
