# AI pipeline setup

Calm AI chat, the information synthesizer, and the daily/weekly insight jobs all
live under `src/lib/ai/`. They read patient data **only** through
`buildPatientContext`, which enforces `PrivacySettings` (the per-category
collect\* switches and the master `feedToLlm`). Raw records are never sent to a
model when a category is disallowed.

The pipeline degrades gracefully: with **no** provider key configured, Calm AI
falls back to the transparent rule-based reply, and the insight jobs are no-ops.

## Environment variables

Set these as **secrets** in your host / the remote environment — never commit
real values (the notebooks' bundled `gc1.env` / `patients.json` are deliberately
not carried into the repo).

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Classifier, synthesizer, daily/weekly insights (cost-routed cheap calls). |
| `ANTHROPIC_API_KEY` | Calm AI chat replies + high-stake/crisis routing. |
| `CRON_SECRET` | Authenticates the scheduled insight route handlers. |
| `AI_ICALL_NUMBER` | _(optional)_ India iCall helpline shown in crisis replies. Default `9152987821`. |
| `AI_TELEMANAS_NUMBER` | _(optional)_ Tele-MANAS helpline. Default `14416`. |
| `AI_SUPPORT_EMAIL` | _(optional)_ Support email for app-support replies. Default `help@getcalmly.com`. |

At least one of `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` is required for live AI.

## Model routing

Configured in `src/lib/ai/models.ts` (cost-routed, multi-provider):

- **Classifier / insights / synthesizer:** `gpt-4.1-nano` (cheap).
- **Chat — routine:** Haiku (paid) / nano (free).
- **Chat — high-stake (CRISIS / VENT_DISTRESS):** Sonnet (paid) / Haiku (free).

Change models in one place via the routing constants at the top of that file.

## Scheduling the insight jobs

The generators are exposed as authenticated route handlers so any scheduler can
drive them (host-agnostic — Vercel Cron, Railway, GitHub Actions, …):

- `POST /api/cron/daily-insights` — run every morning (#10).
- `POST /api/cron/weekly-insights` — run every Sunday (#12).

Authenticate with either header or query param:

```bash
curl -X POST https://YOUR_HOST/api/cron/daily-insights \
  -H "Authorization: Bearer $CRON_SECRET"
# or, for schedulers that can't set headers:
curl -X POST "https://YOUR_HOST/api/cron/weekly-insights?key=$CRON_SECRET"
```

### Example: Vercel Cron (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/daily-insights", "schedule": "30 1 * * *" },
    { "path": "/api/cron/weekly-insights", "schedule": "0 2 * * 0" }
  ]
}
```

(Vercel Cron sends the request with the project's protection automatically; set
`CRON_SECRET` and have the handler verify it, or front it with Vercel's cron
auth header — see the handler in `src/lib/ai/cron.ts`.)

## Data model

The migration `0005_ai_integration` adds the clinical containers the pipeline
reads (mirroring the notebooks' `patients.json` vocabulary so the expert
dashboard and the AI share the same fields):

- `PatientProfile`: `diagnosis`, `trackLabel`, `subTrack`, `currentSituation`,
  `therapyStatus`.
- `ClinicalContext` (1:1): scale, trend, what-has(-not)-helped, recurring
  triggers, risk flags (passive SI history, sleep disturbance, safety plan).
- `AssessmentScore`: clinical scale score time series (e.g. GAD-7 over time).
- `CalmAiMessage`: classifier metadata (`label`, `intent`, `intensity`,
  `highStake`, `model`).
- `CrisisAlert`: durable care-team hand-off record written on high-stake turns.
- `AiInsight.meta`: generation metadata + the `Pattern[]` cards the dashboard
  renders (daily → Home "detected this week", weekly → Journal patterns).
