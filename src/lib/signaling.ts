// Durable WebRTC signaling relay for in-app video sessions (#4).
//
// The patient and the expert exchange SDP offers/answers and ICE candidates
// through this relay *only* until a direct peer-to-peer connection forms; after
// that the audio/video flows browser-to-browser and never touches our servers.
//
// This relay is backed by the database (WebrtcSignal), NOT process memory. On
// serverless (Vercel) the two participants are load-balanced onto different
// instances, so an in-memory relay never lets their signals meet — both sides
// sit forever on "waiting for … to join". A shared table fixes that.
//
// COMPLIANCE: only the tiny setup handshake (SDP/ICE) is stored, briefly, and
// swept after a short TTL. The call itself is peer-to-peer and is never recorded
// or proxied — there is no session media for us (or an LLM) to retain.

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type SignalKind = 'hello' | 'offer' | 'answer' | 'ice' | 'bye'

export type Signal = {
  seq: number
  peerId: string
  kind: SignalKind
  data: unknown
  at: number
}

const ROOM_TTL_MS = 30 * 60 * 1000 // a signal older than 30 min is swept
const SWEEP_PROB = 0.05 // ~1 in 20 posts triggers a cleanup, so it stays cheap

async function sweep(): Promise<void> {
  try {
    await prisma.webrtcSignal.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - ROOM_TTL_MS) } } })
  } catch {
    /* best-effort cleanup — never block signaling on it */
  }
}

/** Append a signal to a room and return it (with its assigned sequence number). */
export async function postSignal(
  roomId: string,
  peerId: string,
  kind: SignalKind,
  data: unknown
): Promise<Signal> {
  const row = await prisma.webrtcSignal.create({
    // Prisma needs its JsonNull sentinel for a SQL NULL in a Json column (a bare
    // JS null isn't accepted); 'hello'/'bye' carry no payload.
    data: {
      roomId, peerId, kind,
      data: data === null || data === undefined ? Prisma.JsonNull : (data as Prisma.InputJsonValue),
    },
    select: { seq: true, createdAt: true },
  })
  if (Math.random() < SWEEP_PROB) void sweep()
  return { seq: row.seq, peerId, kind, data, at: row.createdAt.getTime() }
}

/**
 * Return signals in a room newer than `since`, excluding the caller's own (so a
 * peer never receives its own messages back). The returned `seq` advances past
 * the caller's own messages too, so the cursor never stalls.
 */
export async function getSignals(
  roomId: string,
  peerId: string,
  since: number
): Promise<{ signals: Signal[]; seq: number }> {
  const rows = await prisma.webrtcSignal.findMany({
    where: { roomId, seq: { gt: since } },
    orderBy: { seq: 'asc' },
    take: 200,
    select: { seq: true, peerId: true, kind: true, data: true, createdAt: true },
  })
  const maxSeq = rows.length ? rows[rows.length - 1].seq : since
  const signals: Signal[] = rows
    .filter((r) => r.peerId !== peerId)
    .map((r) => ({ seq: r.seq, peerId: r.peerId, kind: r.kind as SignalKind, data: r.data, at: r.createdAt.getTime() }))
  return { signals, seq: maxSeq }
}
