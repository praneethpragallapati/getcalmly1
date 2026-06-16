import { NextResponse } from 'next/server'
import { sendOtp } from '@/lib/msg91'

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json()
    if (!mobile || typeof mobile !== 'string' || mobile.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ ok: false, message: 'A valid mobile number is required.' }, { status: 400 })
    }
    const result = await sendOtp(mobile.replace(/\D/g, ''))
    return NextResponse.json(result, { status: result.ok ? 200 : 502 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not send OTP'
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
