/**
 * AI pipeline health check. The whole pipeline degrades *silently* — every
 * failure returns a null answer, never an error to the user — so "it's not
 * working" gives you nothing to go on. This turns that silence into a plain
 * report: which keys are present, and what the providers actually say when
 * called.
 *
 * Run where the env vars live (locally with a .env, or a one-off on the
 * deployment). It prints NO secret values, only booleans and status codes.
 *
 *   npx tsx scripts/check-ai.ts
 */
import { aiConfig, hasLlm } from '../src/lib/ai/config'
import { callModel } from '../src/lib/ai/clients'
import { MODELS, PROVIDERS, INSIGHT_MODEL, PAID_ROUTINE } from '../src/lib/ai/models'

async function probe(label: string, key: Parameters<typeof callModel>[0]) {
  const model = MODELS[key]
  const provider = PROVIDERS[key]
  process.stdout.write(`\n${label}: ${key} → ${provider}/${model}\n`)
  const r = await callModel(
    key,
    'You output only valid JSON.',
    [{ role: 'user', content: 'Return exactly {"ok":true} and nothing else.' }],
    { temperature: 0, maxTokens: 20, jsonMode: true },
  )
  if (r.answer) {
    console.log(`  OK — replied: ${r.answer.slice(0, 60)}  (in ${r.inp} / out ${r.out} tokens)`)
  } else {
    console.log(`  FAILED — error: ${r.error}`)
    console.log('  (no_openai_key / no_anthropic_key = key missing; openai_401 / anthropic_401 = bad key;')
    console.log('   anthropic_404 / openai_404 = the model id is not valid for this account.)')
  }
}

async function main() {
  console.log('=== Keys present (booleans only) ===')
  console.log('OPENAI_API_KEY   :', Boolean(aiConfig.openAiKey))
  console.log('ANTHROPIC_API_KEY:', Boolean(aiConfig.anthropicKey))
  console.log('CRON_SECRET      :', Boolean(aiConfig.cronSecret), aiConfig.cronSecret ? '' : '  <-- cron endpoints return 403 without this; insights never regenerate')
  console.log('hasLlm()         :', hasLlm())

  if (!hasLlm()) {
    console.log('\nNo provider key set — Calm AI uses the rule-based fallback and the insight jobs are no-ops.')
    console.log('Set OPENAI_API_KEY (needed for insights) and/or ANTHROPIC_API_KEY (chat), then re-run.')
    return
  }

  console.log('\n=== Live provider calls ===')
  // Insights, classifier and synthesizer all use this one (OpenAI). If this
  // fails, the daily/weekly insights cannot generate even when the cron fires.
  await probe('INSIGHT / classifier model', INSIGHT_MODEL)
  // A representative chat model (Anthropic) for paid routing.
  await probe('CHAT paid-routine model', PAID_ROUTINE)

  console.log('\nReminder: insights only (re)generate when a scheduler POSTs')
  console.log('  /api/cron/daily-insights  and  /api/cron/weekly-insights  with the CRON_SECRET.')
  console.log('vercel.json schedules both; confirm CRON_SECRET is set in the deployment or they 403.')
}

main().catch((e) => { console.error(e); process.exit(1) })
