import { NextResponse } from 'next/server'
import { sendOtp } from '@/lib/msg91'
import { rateLimit, clientIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json()
    if (!mobile || typeof mobile !== 'string' || mobile.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ ok: false, message: 'A valid mobile number is required.' }, { status: 400 })
    }
    const digits = mobile.replace(/\D/g, '')
    // Each send is a real (billed) SMS, so throttle hard: at most 5 per number
    // per 10 min, and 20 per client IP per hour, to blunt SMS-bombing / cost abuse.
    const byNumber = rateLimit(`otp:num:${digits}`, 5, 10 * 60 * 1000)
    const byIp = rateLimit(`otp:ip:${clientIp(req)}`, 20, 60 * 60 * 1000)
    if (!byNumber.ok || !byIp.ok) {
      const retryAfterSec = Math.max(byNumber.retryAfterSec, byIp.retryAfterSec)
      return NextResponse.json(
        { ok: false, message: 'Too many code requests. Please wait a little and try again.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
      )
    }
    const result = await sendOtp(digits)
    return NextResponse.json(result, { status: result.ok ? 200 : 502 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not send OTP'
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
