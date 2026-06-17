/**
 * AI runtime configuration. Secrets live ONLY in environment variables (never in
 * the repo — the notebooks' bundled gc1.env / patients.json are intentionally not
 * carried over). When a key is absent the pipeline degrades gracefully to the
 * transparent rule-based behaviour, so the app never breaks without credentials.
 */
export const aiConfig = {
  openAiKey: process.env.OPENAI_API_KEY ?? '',
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  // Shared secret that authenticates the scheduled insight cron route handlers.
  cronSecret: process.env.CRON_SECRET ?? '',
  // India helpline + support contacts surfaced in crisis replies.
  iCall: process.env.AI_ICALL_NUMBER ?? '9152987821',
  teleManas: process.env.AI_TELEMANAS_NUMBER ?? '14416',
  supportEmail: process.env.AI_SUPPORT_EMAIL ?? 'help@getcalmly.com',
}

/** Whether at least one LLM provider is configured. */
export function hasLlm(): boolean {
  return Boolean(aiConfig.openAiKey || aiConfig.anthropicKey)
}

/** Free-tier daily message cap for Calm AI (paid plans are unlimited). */
export const FREE_DAILY_LIMIT = 10
