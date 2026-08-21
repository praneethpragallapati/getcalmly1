/**
 * AI runtime configuration. Secrets live ONLY in environment variables (never in
 * the repo, the notebooks' bundled gc1.env / patients.json are intentionally not
 * carried over). When a key is absent the pipeline degrades gracefully to the
 * transparent rule-based behaviour, so the app never breaks without credentials.
 */
import { pickHelplines, supportEmail } from '@/config/site'

export const aiConfig = {
  openAiKey: process.env.OPENAI_API_KEY ?? '',
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  // Shared secret that authenticates the scheduled insight cron route handlers.
  cronSecret: process.env.CRON_SECRET ?? '',
  // Helpline + support contacts surfaced in crisis replies. These come from
  // src/config/site.ts, not from the environment: they are neither secret nor
  // per-deployment, and the AI's crisis reply must never be able to quote a
  // different number from the one on the safety page. They used to be three
  // separate env vars whose defaults had already drifted — the support address
  // here was help@getcalmly.com, which appears nowhere else in the product.
  iCall: pickHelplines('icall')[0].number,
  teleManas: pickHelplines('telemanas')[0].number,
  supportEmail,
}

/** Whether at least one LLM provider is configured. */
export function hasLlm(): boolean {
  return Boolean(aiConfig.openAiKey || aiConfig.anthropicKey)
}

/** Free-tier daily message cap for Calm AI (paid plans are unlimited). */
export const FREE_DAILY_LIMIT = 10
