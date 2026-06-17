// Ephemeral WebRTC signaling relay for in-app video sessions (#4).
//
// The patient and the expert exchange SDP offers/answers and ICE candidates
// through this relay *only* until a direct peer-to-peer connection forms; after
// that the audio/video flows browser-to-browser and never touches our servers.
//
// COMPLIANCE: nothing here is written to the database. Signals live in memory,
// scoped to a single roomId, capped in length, and swept after a short TTL. The
// call itself is peer-to-peer and is never recorded or proxied — there is no
// session media for us (or an LLM) to retain. Whether a session *summary* is fed
// to the AI pipeline is decided separately, behind PrivacySettings.collectSessions.

export type SignalKind = 'hello' | 'offer' | 'answer' | 'ice' | 'bye'

export type Signal = {
  seq: number
  peerId: string
  kind: SignalKind
  data: unknown
  at: number
}

type Room = { signals: Signal[]; seq: number; lastActive: number }

const ROOM_TTL_MS = 30 * 60 * 1000 // a room idle for 30 min is dropped
const MAX_SIGNALS = 200 // keep only the most recent N signals per room

// Module-level store, stashed on globalThis so it survives dev hot-reloads. This
// works for a single server instance (our current deployment); for a multi-
// instance setup, swap this for Redis / a durable pub-sub keyed by roomId.
const g = globalThis as unknown as { __calmlySignaling?: Map<string, Room> }
const rooms: Map<string, Room> = g.__calmlySignaling ?? (g.__calmlySignaling = new Map())

function sweep(): void {
  const now = Date.now()
  for (const [id, room] of rooms) {
    if (now - room.lastActive > ROOM_TTL_MS) rooms.delete(id)
  }
}

/** Append a signal to a room and return it (with its assigned sequence number). */
export function postSignal(
  roomId: string,
  peerId: string,
  kind: SignalKind,
  data: unknown
): Signal {
  sweep()
  let room = rooms.get(roomId)
  if (!room) {
    room = { signals: [], seq: 0, lastActive: Date.now() }
    rooms.set(roomId, room)
  }
  const signal: Signal = { seq: ++room.seq, peerId, kind, data, at: Date.now() }
  room.signals.push(signal)
  if (room.signals.length > MAX_SIGNALS) room.signals.splice(0, room.signals.length - MAX_SIGNALS)
  room.lastActive = Date.now()
  return signal
}

/**
 * Return signals in a room newer than `since`, excluding the caller's own (so a
 * peer never receives its own messages back). Also returns the latest sequence
 * number so the caller can advance its cursor.
 */
export function getSignals(
  roomId: string,
  peerId: string,
  since: number
): { signals: Signal[]; seq: number } {
  sweep()
  const room = rooms.get(roomId)
  if (!room) return { signals: [], seq: since }
  room.lastActive = Date.now()
  const signals = room.signals.filter((s) => s.seq > since && s.peerId !== peerId)
  return { signals, seq: room.seq }
}
