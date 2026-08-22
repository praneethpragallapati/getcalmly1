// MSG91 OTP integration (API v5).
// Docs: https://docs.msg91.com/otp
//
// Required env:
//   MSG91_AUTH_KEY     , your account auth key
//   MSG91_OTP_TEMPLATE_ID, the approved OTP template id (DLT) used to send codes
//
// `mobile` must be the full number WITH country code and no "+", e.g. 919876543210.

import { guardedFetch } from '@/lib/resilience'

const BASE = 'https://control.msg91.com/api/v5'

// OTP is on the login path — keep it snappy and fail fast if MSG91 is down.
const SMS_GUARD = { timeoutMs: 10_000, failureThreshold: 5, cooldownMs: 20_000, maxConcurrent: 12 }

function authKey(): string {
  const key = process.env.MSG91_AUTH_KEY
  if (!key) throw new Error('MSG91_AUTH_KEY is not set')
  return key
}

export type Msg91Result = { ok: boolean; message: string; raw?: unknown }

/** Send an OTP to the given mobile number (with country code, no "+"). */
export async function sendOtp(mobile: string): Promise<Msg91Result> {
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID
  const params = new URLSearchParams({ mobile })
  if (templateId) params.set('template_id', templateId)
  // 6-digit numeric OTP, valid for 10 minutes.
  params.set('otp_length', '6')
  params.set('otp_expiry', '10')

  const res = await guardedFetch('msg91', `${BASE}/otp?${params.toString()}`, {
    method: 'POST',
    headers: { authkey: authKey(), 'Content-Type': 'application/json' },
    // Body lets MSG91 fill template variables if your template needs them.
    body: JSON.stringify({}),
    cache: 'no-store',
  }, SMS_GUARD)
  const data = await res.json().catch(() => ({}))
  const ok = res.ok && data?.type !== 'error'
  return { ok, message: data?.message ?? (ok ? 'OTP sent' : 'Failed to send OTP'), raw: data }
}

/** Verify a user-entered OTP against MSG91. */
export async function verifyOtp(mobile: string, otp: string): Promise<Msg91Result> {
  const params = new URLSearchParams({ mobile, otp })
  const res = await guardedFetch('msg91', `${BASE}/otp/verify?${params.toString()}`, {
    method: 'GET',
    headers: { authkey: authKey() },
    cache: 'no-store',
  }, SMS_GUARD)
  const data = await res.json().catch(() => ({}))
  // MSG91 returns { type: 'success', message: 'OTP verified success' } on success.
  const ok = res.ok && data?.type === 'success'
  return { ok, message: data?.message ?? (ok ? 'OTP verified' : 'Invalid OTP'), raw: data }
}

/** Resend an OTP (text or voice). */
export async function resendOtp(mobile: string, retrytype: 'text' | 'voice' = 'text'): Promise<Msg91Result> {
  const params = new URLSearchParams({ mobile, retrytype })
  const res = await guardedFetch('msg91', `${BASE}/otp/retry?${params.toString()}`, {
    method: 'GET',
    headers: { authkey: authKey() },
    cache: 'no-store',
  }, SMS_GUARD)
  const data = await res.json().catch(() => ({}))
  const ok = res.ok && data?.type !== 'error'
  return { ok, message: data?.message ?? (ok ? 'OTP resent' : 'Failed to resend OTP'), raw: data }
}

/**
 * Send a crisis alert SMS to a member's emergency contact.
 *
 * Uses the Flow API rather than the OTP endpoint: this is a transactional
 * message with named variables, not a code. India's DLT rules mean the text is
 * fixed by the approved template — `vars` fills its placeholders, it does not
 * carry free-form wording.
 *
 * Returns `configured: false` rather than throwing when MSG91_CRISIS_TEMPLATE_ID
 * or the auth key is unset. That distinction matters: the caller must be able to
 * tell the member "we could not reach your emergency contact" instead of
 * claiming an alert was sent that never left the building.
 */
export async function sendCrisisSms(
  mobile: string,
  vars: Record<string, string>,
): Promise<Msg91Result & { configured: boolean }> {
  const templateId = process.env.MSG91_CRISIS_TEMPLATE_ID
  if (!templateId || !process.env.MSG91_AUTH_KEY) {
    return { ok: false, configured: false, message: 'Crisis SMS is not configured (MSG91_CRISIS_TEMPLATE_ID).' }
  }
  try {
    const res = await guardedFetch('msg91', `${BASE}/flow`, {
      method: 'POST',
      headers: { authkey: authKey(), 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        template_id: templateId,
        // MSG91 takes one recipients array; each entry is a number plus its
        // template variables.
        recipients: [{ mobiles: mobile, ...vars }],
      }),
      cache: 'no-store',
    }, SMS_GUARD)
    const data = await res.json().catch(() => ({}))
    const ok = res.ok && data?.type !== 'error'
    return { ok, configured: true, message: data?.message ?? (ok ? 'Alert sent' : 'Failed to send alert'), raw: data }
  } catch (e) {
    return { ok: false, configured: true, message: e instanceof Error ? e.message : 'Failed to send alert' }
  }
}

// Normalise a country dial code + local number into MSG91's "919876543210" form.
export function toMsg91Mobile(dialCode: string, localNumber: string): string {
  const cc = dialCode.replace(/[^\d]/g, '')
  const num = localNumber.replace(/[^\d]/g, '')
  return `${cc}${num}`
}
