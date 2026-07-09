import { NextResponse } from 'next/server'
import { aiConfig } from '@/lib/ai/config'

/**
 * TEMPORARY diagnostic: reports whether the AI keys are present in the running
 * environment and whether a minimal live call to each provider succeeds. Never
 * returns key values, only presence, length, a masked fingerprint, and the
 * provider's HTTP status. Gated by CRON_SECRET so it isn't world-readable.
 *
 * Call: /api/ai-health?key=<CRON_SECRET>
 * Remove this route once the AI is confirmed working.
 */
export const dynamic = 'force-dynamic'

function fingerprint(v: string): string {
  if (!v) return '(empty)'
  const clean = v.trim()
  const hasWhitespace = clean.length !== v.length
  return `len=${v.length}${hasWhitespace ? ' ⚠️HAS_SURROUNDING_WHITESPACE' : ''} starts=${v.slice(0, 6)} ends=${v.slice(-4)}`
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get('key') ?? ''
  if (!aiConfig.cronSecret || key !== aiConfig.cronSecret) {
    return NextResponse.json({ ok: false, error: 'unauthorized (pass ?key=CRON_SECRET)' }, { status: 401 })
  }

  const out: Record<string, unknown> = {
    openaiKey: aiConfig.openAiKey ? fingerprint(aiConfig.openAiKey) : 'MISSING',
    anthropicKey: aiConfig.anthropicKey ? fingerprint(aiConfig.anthropicKey) : 'MISSING',
    cronSecret: aiConfig.cronSecret ? 'set' : 'MISSING',
  }

  // Live test: OpenAI
  if (aiConfig.openAiKey) {
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${aiConfig.openAiKey.trim()}` },
        body: JSON.stringify({ model: 'gpt-4.1-nano', max_tokens: 5, messages: [{ role: 'user', content: 'hi' }] }),
      })
      const body = await r.json()
      out.openaiTest = r.ok ? 'OK 200' : `FAIL ${r.status}: ${body?.error?.message ?? ''}`
    } catch (e) {
      out.openaiTest = `THREW: ${e instanceof Error ? e.message : 'unknown'}`
    }
  }

  // Live test: Anthropic
  if (aiConfig.anthropicKey) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': aiConfig.anthropicKey.trim(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      })
      const body = await r.json()
      out.anthropicTest = r.ok ? 'OK 200' : `FAIL ${r.status}: ${body?.error?.message ?? ''}`
    } catch (e) {
      out.anthropicTest = `THREW: ${e instanceof Error ? e.message : 'unknown'}`
    }
  }

  return NextResponse.json({ ok: true, ...out })
}
