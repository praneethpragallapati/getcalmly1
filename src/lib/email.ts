// Email OTP via Resend (https://resend.com).
// Required env: RESEND_API_KEY, EMAIL_FROM (e.g. "GetCalmly <noreply@getcalmly.com>")

import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function client() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

function from() {
  return process.env.EMAIL_FROM ?? 'GetCalmly <noreply@getcalmly.com>'
}

// Generate a 6-digit numeric OTP, store it in VerificationToken, and email it.
export async function sendEmailOtp(email: string): Promise<{ ok: boolean; message: string }> {
  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const token = crypto.createHash('sha256').update(`${email}:${otp}`).digest('hex')
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Upsert: delete any existing token for this email first, then create fresh.
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } })

  const resend = client()
  const { error } = await resend.emails.send({
    from: from(),
    to: email,
    subject: `${otp} is your GetCalmly code`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:28px;font-weight:900;color:#1C2B3A;margin:0 0 8px">Your GetCalmly code</h2>
        <p style="color:#6B7D8E;font-size:15px;margin:0 0 28px;line-height:1.6">
          Use this code to sign in. It expires in 10 minutes.
        </p>
        <div style="background:#F5F7FA;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px">
          <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#1C2B3A">${otp}</span>
        </div>
        <p style="color:#A0ADB8;font-size:13px;margin:0;line-height:1.6">
          If you didn't request this, you can safely ignore this email.<br>
          Never share this code with anyone.
        </p>
      </div>
    `,
  })

  if (error) return { ok: false, message: error.message ?? 'Failed to send email' }
  return { ok: true, message: 'OTP sent' }
}

// Verify an email OTP. Returns ok:true if valid and not expired.
export async function verifyEmailOtp(email: string, otp: string): Promise<{ ok: boolean; message: string }> {
  const token = crypto.createHash('sha256').update(`${email}:${otp}`).digest('hex')
  const record = await prisma.verificationToken.findUnique({ where: { token } })

  if (!record || record.identifier !== email) {
    return { ok: false, message: 'Invalid code' }
  }
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } })
    return { ok: false, message: 'Code has expired. Please request a new one.' }
  }

  // Consume the token — one-time use.
  await prisma.verificationToken.delete({ where: { token } })
  return { ok: true, message: 'OTP verified' }
}
