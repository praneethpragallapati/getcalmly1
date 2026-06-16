import { NextRequest, NextResponse } from 'next/server'
import { sendEmailOtp } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: 'Enter a valid email address.' }, { status: 400 })
    }
    const result = await sendEmailOtp(email.toLowerCase().trim())
    return NextResponse.json(result, { status: result.ok ? 200 : 502 })
  } catch (err) {
    console.error('email-send error', err)
    return NextResponse.json({ ok: false, message: 'Server error.' }, { status: 500 })
  }
}
