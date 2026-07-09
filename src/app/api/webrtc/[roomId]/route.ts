import type { NextRequest } from 'next/server'
import { getSignals, postSignal, type SignalKind } from '@/lib/signaling'
import { canAccessRoom } from '@/lib/sessions'
import { getSessionUserId } from '@/lib/patient'

// Signaling endpoint for in-app WebRTC video sessions (#4). Patient & expert
// clients short-poll GET to receive the other side's offer/answer/ICE, and POST
// to send their own. Access is gated to a room's participants for real rooms; the
// relay is in-memory and ephemeral (see lib/signaling.ts), no media or signal is
// persisted, so there is nothing here for the AI pipeline to ever read.

export const dynamic = 'force-dynamic'

const VALID_KINDS: SignalKind[] = ['hello', 'offer', 'answer', 'ice', 'bye']

export async function GET(req: NextRequest, ctx: RouteContext<'/api/webrtc/[roomId]'>) {
  const { roomId } = await ctx.params
  const userId = await getSessionUserId()
  if (!(await canAccessRoom(roomId, userId))) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const peerId = searchParams.get('peerId') ?? ''
  const since = Number(searchParams.get('since') ?? '0') || 0
  if (!peerId) return Response.json({ error: 'peerId required' }, { status: 400 })

  const { signals, seq } = getSignals(roomId, peerId, since)
  return Response.json({ signals, seq })
}

export async function POST(req: NextRequest, ctx: RouteContext<'/api/webrtc/[roomId]'>) {
  const { roomId } = await ctx.params
  const userId = await getSessionUserId()
  if (!(await canAccessRoom(roomId, userId))) {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }

  let body: { peerId?: string; kind?: string; data?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'invalid body' }, { status: 400 })
  }

  const { peerId, kind, data } = body
  if (!peerId || !kind || !VALID_KINDS.includes(kind as SignalKind)) {
    return Response.json({ error: 'peerId and a valid kind required' }, { status: 400 })
  }

  const signal = postSignal(roomId, peerId, kind as SignalKind, data)
  return Response.json({ ok: true, seq: signal.seq })
}
