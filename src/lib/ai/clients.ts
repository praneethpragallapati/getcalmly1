/**
 * Minimal provider clients built on fetch — no SDK dependencies, works in the
 * serverless/Edge-friendly Next runtime. Each call returns the text plus token
 * usage so callers can estimate cost, and never throws: on any failure it returns
 * a null answer with the error string, mirroring the notebook's tolerant design.
 */
import { aiConfig } from './config'
import { MODELS, PROVIDERS, type ModelKey } from './models'

export type ChatTurn = { role: 'user' | 'assistant'; content: string }
export type LlmResult = { answer: string | null; inp: number; out: number; error: string | null }

const RETRYABLE = ['overloaded', '529', 'rate', 'timeout', '503', '500']

async function callOpenAi(
  model: string,
  system: string,
  messages: ChatTurn[],
  temperature: number,
  maxTokens: number,
  jsonMode: boolean
): Promise<LlmResult> {
  if (!aiConfig.openAiKey) return { answer: null, inp: 0, out: 0, error: 'no_openai_key' }
  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'system', content: system }, ...messages],
  }
  if (jsonMode) body.response_format = { type: 'json_object' }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiConfig.openAiKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) return { answer: null, inp: 0, out: 0, error: `openai_${res.status}` }
  const json = await res.json()
  return {
    answer: (json.choices?.[0]?.message?.content ?? '').trim() || null,
    inp: json.usage?.prompt_tokens ?? 0,
    out: json.usage?.completion_tokens ?? 0,
    error: null,
  }
}

async function callAnthropic(
  model: string,
  system: string,
  messages: ChatTurn[],
  temperature: number,
  maxTokens: number
): Promise<LlmResult> {
  if (!aiConfig.anthropicKey) return { answer: null, inp: 0, out: 0, error: 'no_anthropic_key' }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': aiConfig.anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      // Cache the system prompt — it is large and stable across a conversation.
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages,
    }),
  })
  if (!res.ok) return { answer: null, inp: 0, out: 0, error: `anthropic_${res.status}` }
  const json = await res.json()
  const text = Array.isArray(json.content)
    ? json.content.map((b: { text?: string }) => b.text ?? '').join('').trim()
    : ''
  return {
    answer: text || null,
    inp: json.usage?.input_tokens ?? 0,
    out: json.usage?.output_tokens ?? 0,
    error: null,
  }
}

/**
 * Call a model by registry key, with up to 3 attempts on transient errors
 * (exponential backoff). `jsonMode` only applies to OpenAI; Anthropic callers
 * prompt for raw JSON and parse defensively.
 */
export async function callModel(
  modelKey: ModelKey,
  system: string,
  messages: ChatTurn[],
  opts: { temperature: number; maxTokens: number; jsonMode?: boolean } = {
    temperature: 0.7,
    maxTokens: 200,
  }
): Promise<LlmResult> {
  const model = MODELS[modelKey]
  const provider = PROVIDERS[modelKey]
  let last: LlmResult = { answer: null, inp: 0, out: 0, error: 'unknown' }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      last =
        provider === 'openai'
          ? await callOpenAi(model, system, messages, opts.temperature, opts.maxTokens, Boolean(opts.jsonMode))
          : await callAnthropic(model, system, messages, opts.temperature, opts.maxTokens)
    } catch (e) {
      last = { answer: null, inp: 0, out: 0, error: e instanceof Error ? e.message : 'fetch_error' }
    }
    if (last.answer !== null || !last.error) break
    if (!RETRYABLE.some((x) => last.error!.toLowerCase().includes(x))) break
    await new Promise((r) => setTimeout(r, 2 ** attempt * 500))
  }
  return last
}
