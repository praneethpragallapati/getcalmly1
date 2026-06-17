import { NextResponse } from 'next/server'
import { authorizeCron } from '@/lib/ai/cron'
import { runInsightBatch } from '@/lib/ai/insights'

// Daily insight generation (#10). Trigger every morning from any scheduler with
// `Authorization: Bearer $CRON_SECRET`. Not cached; always runs at request time.
export const dynamic = 'force-dynamic'
// Insight batches can run longer than the default; allow up to 5 minutes.
export const maxDuration = 300

export async function POST(req: Request) {
  const auth = authorizeCron(req)
  if (!auth.ok) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: auth.status })
  try {
    const result = await runInsightBatch('DAILY')
    return NextResponse.json({ ok: true, kind: 'DAILY', ...result })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// Allow GET too, for schedulers that only issue GET requests.
export const GET = POST
