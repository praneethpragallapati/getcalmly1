import { SignJWT } from 'jose'

/**
 * 100ms video integration (server-side).
 *
 * NOTE: server-only module. It reads the secret app credentials and talks to the
 * 100ms REST API — never import it into a client component.
 *
 * Per session we create (or reuse) a 100ms room named after the appointment's
 * unguessable roomId, fetch the prebuilt room-code for the joiner's role, and
 * return an embeddable meeting URL. The clinician joins as host, the patient as
 * guest, so both land in the same room.
 *
 * Configure these env vars (100ms Dashboard → Developer):
 *   HMS_ACCESS_KEY    app access key
 *   HMS_SECRET        app secret (used only to sign the management token here)
 *   HMS_TEMPLATE_ID   the template id that defines the roles below
 *   HMS_SUBDOMAIN     your prebuilt host, e.g. "getcalmly-abc.app.100ms.live"
 *   HMS_ROLE_HOST     (optional) role name for the clinician, default "host"
 *   HMS_ROLE_GUEST    (optional) role name for the patient, default "guest"
 *
 * With these unset, video is simply "not configured" and the room page says so.
 */

const API = 'https://api.100ms.live/v2'

export type HmsRole = 'host' | 'guest'

export function hmsConfigured(): boolean {
  return Boolean(
    process.env.HMS_ACCESS_KEY && process.env.HMS_SECRET && process.env.HMS_TEMPLATE_ID && process.env.HMS_SUBDOMAIN
  )
}

function roleName(role: HmsRole): string {
  return role === 'host' ? process.env.HMS_ROLE_HOST || 'host' : process.env.HMS_ROLE_GUEST || 'guest'
}

/** Short-lived management token for the 100ms REST API (HS256, app-signed). */
async function managementToken(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.HMS_SECRET)
  return new SignJWT({ access_key: process.env.HMS_ACCESS_KEY, type: 'management', version: 2 })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setNotBefore(Math.floor(Date.now() / 1000) - 10)
    .setExpirationTime('10m')
    .sign(secret)
}

async function api(path: string, token: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  })
}

/** Ensure a 100ms room exists for this session and return its id. */
async function ensureRoom(token: string, name: string): Promise<string | null> {
  // Try to reuse an existing room with this name first.
  const existing = await api(`/rooms?name=${encodeURIComponent(name)}`, token)
  if (existing.ok) {
    const j = (await existing.json()) as { data?: { id: string }[] }
    if (j.data && j.data.length > 0) return j.data[0].id
  }
  const created = await api('/rooms', token, {
    method: 'POST',
    body: JSON.stringify({ name, template_id: process.env.HMS_TEMPLATE_ID }),
  })
  if (!created.ok) return null
  const room = (await created.json()) as { id?: string }
  return room.id ?? null
}

/** The prebuilt room-code for a given role, creating codes if none exist yet. */
async function roomCodeForRole(token: string, roomId: string, role: HmsRole): Promise<string | null> {
  const want = roleName(role)
  const pick = (data?: { code: string; role: string; enabled: boolean }[]): string | null =>
    data?.find((c) => c.role === want && c.enabled)?.code ?? null

  const list = await api(`/room-codes/room/${roomId}`, token)
  if (list.ok) {
    const j = (await list.json()) as { data?: { code: string; role: string; enabled: boolean }[] }
    const found = pick(j.data)
    if (found) return found
  }
  // None yet — create codes for every role, then pick ours.
  const created = await api(`/room-codes/room/${roomId}`, token, { method: 'POST' })
  if (!created.ok) return null
  const j = (await created.json()) as { data?: { code: string; role: string; enabled: boolean }[] }
  return pick(j.data)
}

/**
 * Build an embeddable 100ms meeting URL for one participant. Returns null when
 * 100ms isn't configured or the API calls fail (the room page then shows a
 * friendly "video unavailable" state instead of crashing).
 */
export async function getHmsMeetingUrl(
  roomKey: string,
  displayName: string,
  role: HmsRole
): Promise<string | null> {
  if (!hmsConfigured()) return null
  try {
    const token = await managementToken()
    const roomId = await ensureRoom(token, `getcalmly-${roomKey}`)
    if (!roomId) return null
    const code = await roomCodeForRole(token, roomId, role)
    if (!code) return null
    const params = new URLSearchParams({ name: displayName, skip_preview_headful: 'true' })
    return `https://${process.env.HMS_SUBDOMAIN}/meeting/${code}?${params.toString()}`
  } catch {
    return null
  }
}
