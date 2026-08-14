import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Diagnostic: measures the real round-trip latency to the database. Open
 * /api/db-ping in a browser. `firstQueryMs` includes any cold connection setup;
 * `warmQueryMs` is a reused-connection round trip. If warmQueryMs is more than
 * ~50–80ms, the database is far from the serverless region and/or not pooled —
 * that network distance, not the app code, is what makes pages feel slow.
 */
export async function GET() {
  const t0 = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const firstQueryMs = Date.now() - t0

    // A few warm round trips to average out jitter.
    const samples: number[] = []
    for (let i = 0; i < 5; i++) {
      const s = Date.now()
      await prisma.$queryRaw`SELECT 1`
      samples.push(Date.now() - s)
    }
    const warmQueryMs = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)

    return NextResponse.json({
      ok: true,
      firstQueryMs,
      warmQueryMs,
      warmSamples: samples,
      hint:
        warmQueryMs > 80
          ? 'High per-query latency — the DB is far from the serverless region and/or the connection is not pooled. Fix region + use the Supabase pooled connection string.'
          : 'Per-query latency looks healthy; a slow page is likely cold-start boot, not the DB.',
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
