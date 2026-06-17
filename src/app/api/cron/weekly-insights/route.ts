import { NextResponse } from 'next/server'
import { authorizeCron } from '@/lib/ai/cron'
import { runInsightBatch } from '@/lib/ai/insights'

// Weekly insight generation (#12). Trigger every Sunday from any scheduler with
// `Authorization: Bearer $CRON_SECRET`. The schedule (Sunday) is owned by the
// scheduler; this handler just generates when called.
export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function POST(req: Request) {
  const auth = authorizeCron(req)
  if (!auth.ok) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: auth.status })
  try {
    const result = await runInsightBatch('WEEKLY')
    return NextResponse.json({ ok: true, kind: 'WEEKLY', ...result })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export const GET = POST
