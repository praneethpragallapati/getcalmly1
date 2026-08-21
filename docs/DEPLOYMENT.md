# Deployment & Operations

How to run getCalmly in production, what environment variables it needs, how the
scheduled AI jobs are triggered, and how to migrate from Vercel to Hostinger
without code changes.

---

## 1. Environment variables

Secrets live **only** in environment variables — never commit them. `.env` is
gitignored. A documented template lives in `.env.example`.

| Variable | Required | Used by | Notes |
|---|---|---|---|
| `DATABASE_URL` | ✅ | App runtime (Prisma) | Supabase **transaction pooler**, port **6543**, `?pgbouncer=true`. Required for serverless. |
| `DIRECT_URL` | ✅ | `prisma migrate` / `db push` | Supabase **session pooler**, port **5432**. Used for schema changes only. |
| `NEXTAUTH_SECRET` | ✅ | NextAuth | Random 32-byte base64 string. |
| `NEXTAUTH_URL` | ✅ | NextAuth | Full site URL (e.g. `https://getcalmly.com`). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Google sign-in | Omit to disable Google login. |
| `MSG91_AUTH_KEY` / `MSG91_OTP_TEMPLATE_ID` | optional | Phone OTP login | See `docs/MSG91_SETUP.md`. |
| `RESEND_API_KEY` / `EMAIL_FROM` | optional | Email OTP login | Resend transactional email. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | optional | Payments | |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Client links | Public base URL. |
| `OPENAI_API_KEY` | ✅ for AI | Classification, insights, synthesizer | Without it those steps fall back to heuristics. |
| `ANTHROPIC_API_KEY` | ✅ for AI | Calm AI chat replies, crisis escalation | Without it chat falls back to a rule-based stand-in. |
| `CRON_SECRET` | ✅ for cron | `/api/cron/*` auth | When unset, cron routes return **403** (disabled). |
| `AI_ICALL_NUMBER`, `AI_TELEMANAS_NUMBER`, `AI_SUPPORT_EMAIL` | optional | Crisis replies | Have sensible India defaults in `src/lib/ai/config.ts`. |

> **The AI pipeline degrades gracefully.** If `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
> are missing, the app still runs — it just uses rule-based fallbacks instead of
> live models. So a missing key never breaks the app; it only disables real AI.

---

## 2. Database (Supabase)

- **Host:** the pooler host is region-specific. This project's is
  `aws-1-ap-southeast-1.pooler.supabase.com` (note: **`aws-1`**, not `aws-0`).
  Always copy the authoritative strings from **Supabase → Connect**.
- **Runtime** uses the transaction pooler (`6543`).
- **Schema changes** use the session pooler (`5432`).

### Applying the schema

⚠️ The hand-written files in `prisma/migrations/` are **incomplete** — they do
not `CREATE` every model in `schema.prisma` (the project was originally built
with `prisma db push`). Do **not** rely on `prisma migrate deploy`; it will fail
with `relation "PatientProfile" does not exist`.

Use `db push`, which syncs the full `schema.prisma` directly:

```bash
npx prisma db push                 # safe, additive sync (adds new tables/columns)
npx prisma db push --force-reset   # DESTRUCTIVE: drops all tables, rebuilds clean
```

The **DB migrate + seed** GitHub Action mirrors this: it runs the additive
`db push` by default and only does `--force-reset` when you tick the `forceReset`
input. Use the additive default when adding new models (e.g. the expert
availability/supervision tables) so live data is preserved.

See `docs/DEVELOPER_GUIDE.md` → "Database & migrations" for the full story and
the recommended path to fix migration history later.

### Seeding demo data

```bash
npm run db:seed   # tsx prisma/seed.ts
```

Seeds blog posts, community discussions, and fictional demo accounts (1 admin,
5 clinicians, 9 patients, all under the reserved `example.com` domain).
Idempotent. Set `SEED_PASSWORD` to control the shared demo password.

### Running migrations/seed without a local machine

A manual GitHub Actions workflow does it on a runner that can reach Supabase:
**Actions → "DB migrate + seed" → Run workflow**. It needs `DATABASE_URL` and
`DIRECT_URL` as repository secrets. Defined in `.github/workflows/db-seed.yml`.

---

## 3. Scheduled AI jobs (cron)

The AI insight batches are exposed as **authenticated HTTP routes**, not
platform-specific cron primitives. This is deliberate — it makes scheduling
portable across hosts.

- `POST|GET /api/cron/daily-insights` → `runInsightBatch('DAILY')`
- `POST|GET /api/cron/weekly-insights` → `runInsightBatch('WEEKLY')`

Both require `Authorization: Bearer $CRON_SECRET` (or `?key=$CRON_SECRET` for
schedulers that can't set headers). Auth logic: `src/lib/ai/cron.ts`.

### On Vercel

`vercel.json` declares the schedules:

```json
{
  "crons": [
    { "path": "/api/cron/daily-insights",  "schedule": "30 1 * * *" },
    { "path": "/api/cron/weekly-insights", "schedule": "30 2 * * 0" }
  ]
}
```

Daily at 01:30 UTC (07:00 IST), weekly Sunday 02:30 UTC (08:00 IST). Vercel Cron
issues **GET** requests and automatically attaches `Authorization: Bearer
$CRON_SECRET` when `CRON_SECRET` is set as a project env var — no extra config.

> **Plan limits:** Vercel Hobby allows only daily crons and a small number of
> them. If the weekly schedule is rejected, fold the weekly logic into the daily
> route (run it only when `new Date().getUTCDay() === 0`).

### On Hostinger (or any VPS) — future

No code change. Replace Vercel Cron with system `crontab`:

```cron
30 1 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://getcalmly.com/api/cron/daily-insights
30 2 * * 0 curl -s -H "Authorization: Bearer $CRON_SECRET" https://getcalmly.com/api/cron/weekly-insights
```

---

## 4. Hosting

### Vercel (current)

1. Add all env vars under **Settings → Environment Variables** (Production).
2. Redeploy (env vars are injected at build/deploy time).
3. `vercel.json` cron jobs activate automatically once `CRON_SECRET` is set.

### Hostinger (planned)

Vercel runs the app **serverless**; a Hostinger VPS runs it as a **long-lived
Node server**. The app code is identical; only the run model differs.

1. `npm ci && npm run build`
2. Run `next start` behind a process manager (**PM2**) and a reverse proxy
   (**Nginx**) terminating TLS.
3. Set the same env vars in the server environment (or via a secrets manager).
4. Keep using the Supabase **transaction pooler** (`6543`) for the app.
5. Use system `crontab` for the cron routes (see §3).

A long-lived server actually *helps* AI workloads (no cold starts, reusable
connection pools).

---

## 5. Secrets management — recommended path

- **Now:** platform env vars (Vercel UI; later the VPS environment). Fine for a
  small team.
- **When scaling / migrating:** adopt a secrets manager such as **Doppler** or
  **Infisical**. Define secrets once; sync them into Vercel today and a Hostinger
  VPS tomorrow via their CLI/agent. This decouples secrets from any single host
  and makes the Vercel → Hostinger move config-only.

---

## 6. Pre-launch checklist

- [ ] All required env vars set in the host (DB, NextAuth, AI, `CRON_SECRET`).
- [ ] `DATABASE_URL` / `DIRECT_URL` use the correct `aws-1` host + current password.
- [ ] Schema applied (`prisma db push`) and (optionally) seeded.
- [ ] Login verified: `/login` → Password tab → demo account lands on `/app`.
- [ ] Calm AI chat returns a real (non-fallback) reply → AI keys are live.
- [ ] Cron routes return `200` (not `403`) when called with the Bearer secret.
- [ ] Rotate any secret that was ever shared in plaintext (DB password, API keys).
