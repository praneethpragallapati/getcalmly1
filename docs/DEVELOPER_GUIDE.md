# getCalmly — Developer Guide

A single document to help a developer understand the whole system: what it is,
how it's structured, how the major features work, the data model, the AI
pipeline, authentication, and the operational quirks discovered while getting it
live.

For deployment specifics see [`DEPLOYMENT.md`](./DEPLOYMENT.md). For a
feature-by-feature product description see [`FEATURES.md`](./FEATURES.md). For
the AI design rationale see [`AI_SETUP.md`](./AI_SETUP.md).

---

## 1. What it is

getCalmly is a mental-health platform with three surfaces:

1. **Public marketing/assessment site** — landing, pricing, blog, community,
   self-assessment funnel, therapist onboarding.
2. **Patient portal** (`/app`) — dashboard, mood check-ins, journal, sessions
   (with in-browser WebRTC video), medications, Calm AI chat, progress, community,
   settings.
3. **Expert/clinician portal** (`/expert`) — per-patient clinical profile, task
   assignment, and a cross-patient **risk notifications** feed.

The defining principle is a **privacy-by-design compliance boundary**: patient
data only reaches an LLM when the patient has explicitly consented, enforced in
one place (`buildPatientContext()`).

---

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) | ⚠️ See `AGENTS.md` — this version has breaking changes vs. older Next; consult `node_modules/next/dist/docs/` before writing code. |
| Language | TypeScript, React 19 | |
| DB | **PostgreSQL** on **Supabase** | Accessed via the connection pooler. |
| ORM | **Prisma 6** | |
| Auth | **NextAuth v4** (JWT sessions) | Google OAuth + phone OTP + email OTP + email/password. |
| AI | OpenAI + Anthropic (Claude) | Dual-provider, via `fetch` (no SDK dependency). |
| Payments | Razorpay | |
| Email / SMS | Resend / MSG91 | |
| Styling | Tailwind v4 + inline styles | |

---

## 3. Repository layout

```
src/
  app/
    (public)/        Marketing, blog, community, assessment, therapist apply
    (auth)/          login, register, checkout
    (dashboard)/
      app/           PATIENT portal (home, calm-ai, journal, progress,
                     sessions, medications, settings, community, therapist)
      expert/        CLINICIAN portal (patients/[id], risk)
    api/
      auth/[...nextauth]   NextAuth handler
      otp/                 send / email-send OTP endpoints
      cron/                daily-insights, weekly-insights (CRON_SECRET-gated)
      webrtc/[roomId]      signaling for the video room
  components/
    dashboard/       Client components for the portal (CalmAiChat, TaskList,
                     CheckIn, MoodWeekChart, CallRoom, PrivacyControls, …)
  lib/
    ai/              The AI pipeline (see §6)
    auth.ts          NextAuth options + providers
    password.ts      scrypt hashing for email/password sign-in
    patient.ts       Patient data access + mayFeedToAi() privacy gate
    dashboard.ts     getDashboardData(), getWeeklyProgress() — patient portal data
    expert.ts        Expert portal: caseload, patient profile, risk feed, tasks
    sessions.ts      Appointment / join-window logic
    prisma.ts        Prisma client singleton
    community.ts, blog.ts, therapist.ts, account.ts, sessions.ts, …
  data/
    dashboardDemo.ts Bundled demo data (fallback when DB read fails / no session)
    blogSeed.ts, communitySeed.ts, countries.ts
prisma/
  schema.prisma      Source of truth for the data model
  migrations/        ⚠️ INCOMPLETE — see §5
  seed.ts            Seeds blog, community, and the demo patient
  check-login.ts     Diagnostic: verifies the demo login wiring against the DB
  migrate-baseline.ts  Helper for baselining an existing DB (kept for reference)
.github/workflows/
  db-seed.yml        Manual workflow: sync schema + seed + verify login
vercel.json          Cron schedules for the AI insight routes
docs/                This guide, DEPLOYMENT, FEATURES, AI_SETUP, MSG91_SETUP
```

---

## 4. Core architectural patterns

### DB-with-fallback
Every `lib/*` data accessor tries a real per-user DB read and **falls back to
bundled demo data** (`src/data/dashboardDemo.ts`) on error, no session, or no
data. This keeps the UI rendering even before the DB is seeded.

### Privacy-by-design compliance boundary
- `mayFeedToAi()` in `src/lib/patient.ts` decides, per data category, whether a
  patient's data may be sent to an LLM, based on their `PrivacySettings` (per-
  category switches + a master `feedToLlm` toggle) and consent fields.
- `buildPatientContext()` in `src/lib/ai/context.ts` is the **single seam**:
  it only fetches a category (mood / journals / sessions / chats) when allowed,
  and returns an `allowed: {...}` map recording exactly what was included.
- **No code path sends patient data to a model except through this function.**

### Ownership-gated expert writes
All expert mutations (`assignTask`, `resolveAlert`) verify the therapist
actually has an `Appointment` with the target patient (`ownsPatient()`) before
writing. A therapist can only act on their own patients.

### Shared progress contract
`getWeeklyProgress(userId)` (`src/lib/dashboard.ts`) is rendered **identically**
on both the patient Progress page and the expert patient-profile page, so both
sides always see the same numbers.

---

## 5. Database & migrations

### ⚠️ Migration files are incomplete
`prisma/migrations/` was hand-written and does **not** `CREATE` every model in
`schema.prisma` (e.g. `PatientProfile`, `Subscription`, `Task`, `Appointment`
have no CREATE statement; migration `0005` even `ALTER`s `PatientProfile` without
it ever being created). The original DB was built with `prisma db push`, which
doesn't generate migration files.

**Consequence:** `prisma migrate deploy` fails with
`relation "PatientProfile" does not exist`. Do not use it as-is.

### How the schema is applied
Use `prisma db push`, which syncs the full `schema.prisma` directly:

```bash
npx prisma db push                 # additive
npx prisma db push --force-reset   # DESTRUCTIVE clean rebuild
```

The `db-seed.yml` workflow uses `db push --force-reset` then seeds.

### Recommended future cleanup (optional)
To regain proper migration history: with the live schema correct, delete
`prisma/migrations/`, run `prisma migrate diff` / `migrate dev --create-only`
to generate one fresh baseline migration from `schema.prisma`, then
`migrate resolve --applied <baseline>` against production. After that,
`migrate deploy` becomes usable again. Until then, **`db push` is the path**.

### Data model (high level)
Auth: `Account`, `Session`, `VerificationToken`, `User`.
Patient: `PatientProfile`, `RelatedPerson`, `PrivacySettings`, `Subscription`,
`Task`, `Medication`, `MoodEntry`, `JournalEntry`, `Appointment`, `Assessment`.
Therapist: `TherapistApplication`, `TherapistProfile`.
AI: `AiProfile`, `AiInsight`, `CalmAiMessage`, `ClinicalContext`,
`AssessmentScore`, `CrisisAlert`.
Content: `BlogPost`, `CommunityPost`, `CommunityComment`.

---

## 6. The AI pipeline (`src/lib/ai/`)

**Status: fully integrated end-to-end.** Activated by setting `OPENAI_API_KEY`
and `ANTHROPIC_API_KEY`; degrades to rule-based fallbacks when absent.

| File | Responsibility |
|---|---|
| `config.ts` | Reads keys from env; `hasLlm()`; free-tier daily cap; helpline contacts. |
| `clients.ts` | Dual-provider client (OpenAI + Anthropic) via `fetch`, prompt caching, retry w/ backoff, returns `{ answer, inp, out, error }` for cost tracking. |
| `context.ts` | `buildPatientContext()` — the privacy gate (see §4). |
| `models.ts` | Label sets (`HIGH_STAKE_LABELS`), intensity scoring, model routing constants. |
| `chat.ts` | `runChat()` — the full chat pipeline (below). |
| `synthesizer.ts` | Condenses raw expert session notes into an AI-safe synthesized note. |
| `insights.ts` | `runInsightBatch('DAILY'|'WEEKLY')`, `generateDailyInsight`, `generateWeeklyInsight`. |
| `cron.ts` | `authorizeCron()` — Bearer/`?key` check against `CRON_SECRET`. |
| `index.ts` | `rebuildAiProfile()` — derives the abridged `AiProfile` (errors swallowed by design; it's a derived convenience). |
| `tracks.ts` | Track-specific (anxiety, etc.) curated framing for prompts. |

### Chat request flow
1. UI `CalmAiChat.tsx` → server action `sendCalmAiMessage()`
   (`src/app/(dashboard)/app/actions.ts`).
2. `runChat(userId, question)` (`chat.ts`):
   - Early-exit to fallback if no LLM key configured.
   - `buildPatientContext(userId)` — privacy-gated context.
   - Free-tier daily limit check.
   - **Classify** the message (cheap OpenAI model, heuristic fallback) →
     `{ label, intent, intensity }`.
   - **Route**: high-stake labels (`CRISIS`, `VENT_DISTRESS`) escalate to a
     stronger model (Claude Sonnet for paid, Haiku for free).
   - Call the routed model with the gated context + recent history.
   - **Persist** both user and assistant turns to `CalmAiMessage` with classifier
     metadata (`label`, `intent`, `intensity`, `highStake`, `model`).
   - If high-stake, write a `CrisisAlert` hand-off row (`resolved: false`).
3. Action calls `rebuildAiProfile(userId)` and revalidates `/app/calm-ai`.

### Risk surfacing (expert side)
`src/lib/expert.ts` counts `CalmAiMessage.highStake = true` and unresolved
`CrisisAlert`s per patient, surfacing them in the **`/expert/risk`** feed and on
each patient profile. A declining mood trend (`moodTrendOf()`) also flags.

### Scheduled insights
`/api/cron/daily-insights` and `/api/cron/weekly-insights` call
`runInsightBatch(...)`, gated by `CRON_SECRET`. Scheduled via `vercel.json`
(see `DEPLOYMENT.md` §3).

### Only expert input that reaches AI
Per product decision, the **only** expert-authored text fed to the AI is the
**synthesized** session note (`synthesizer.ts`), plus track-scoped
`ClinicalContext` (which track the patient is in, what's helped, triggers, etc.)
— never raw notes.

---

## 7. Authentication (`src/lib/auth.ts`)

NextAuth v4, **JWT sessions** (required because Credentials providers don't
support DB sessions). Providers:

- **Google OAuth**
- **`phone-otp`** — MSG91 OTP; upserts a `User` by phone.
- **`email-otp`** — Resend OTP; upserts a `User` by email.
- **`password`** — email + password. Verifies against `User.passwordHash` using
  `src/lib/password.ts` (Node `scrypt`, format `scrypt$salt$hash`, constant-time
  compare). Nullable so OAuth/OTP-only accounts are unaffected.

All login flows redirect to **`/app`**. The JWT callback puts the user id on
`token.uid`; the session callback exposes it as `session.user.id`.

---

## 8. Demo account & seeding

`prisma/seed.ts` (`npm run db:seed`, idempotent) creates **1 admin, 5 clinicians
and 9 patients** — accounts only. No appointments, packages, moods, journals,
tasks or mappings; those are built from the admin dashboard.

Every account is fictional and every address is under `example.com`, which RFC
2606 reserves and no mail server delivers to. That is deliberate: a seeded
account must not be able to receive an OTP or a notification meant for a real
person, even if the seed is pointed at the wrong database.

| Role | Email |
| --- | --- |
| Admin | `admin@example.com` |
| Clinicians | `arjun.desai@`, `ananya.sharma@`, `rohan.verma@`, `meera.iyer@`, `kabir.rao@` `example.com` |
| Patients | `rhea.kapoor@`, `aarav.patel@`, … `example.com` |

The password for every seeded account is `SEED_PASSWORD`, defaulting to
`DemoSeed@2026` for local development. Set `SEED_PASSWORD` for anything shared —
it is a credential, so it belongs in the environment.

`prisma/seed_users.sql` does the same job in plain SQL, for running in the
Supabase SQL editor without a Node environment. It is **destructive**
(`TRUNCATE … CASCADE`) — read its header before running it.

Verify a login with `npx tsx prisma/check-login.ts <email> <password>` (prints
✓/✗ for column existence, user presence, and password match).

> **Security:** these files previously carried scrypt hashes of two real
> people's real passwords, alongside their names and personal Gmail addresses,
> and this guide printed one of those passwords in plaintext. A hash in a
> repository is offline-crackable at leisure. If those credentials were ever
> used anywhere real, rotate them.

---

## 9. Other notable features

- **Sessions / video** — `lib/sessions.ts` computes a 10-minute join window;
  in-browser **WebRTC** room with signaling via `api/webrtc/[roomId]`
  (`components/dashboard/CallRoom.tsx`, `lib/signaling.ts`).
- **Tasks** — assigned by experts (`expert/actions.ts → assignTask`, ownership-
  gated, with expiry), completed by patients (`app/actions.ts → toggleTask`,
  optimistic UI with revert-on-failure), counted in weekly progress.
- **Progress** — real mood-over-time (4 weekly buckets), month-over-month %
  change, streaks (`computeStreak()`), milestones — all from real queries with
  honest fallbacks.
- **Community & blog** — Prisma-backed, seeded; cross-linked.

---

## 10. Local development

```bash
npm install
# create .env from .env.example and fill in DATABASE_URL, DIRECT_URL,
# NEXTAUTH_SECRET, NEXTAUTH_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY, CRON_SECRET
npx prisma db push      # sync schema (NOT migrate deploy — see §5)
npm run db:seed         # demo data
npm run dev             # http://localhost:3000
```

Quality gates used throughout: `npx tsc --noEmit`, `npx eslint`, `npm run build`.

---

## 11. Operational gotchas (learned the hard way)

1. **Supabase pooler host is `aws-1-…`, not `aws-0-…`** for this project. Always
   copy from **Supabase → Connect**. A wrong host gives
   `ENOTFOUND … Tenant or user not found`.
2. **Two URLs, two ports:** `DATABASE_URL` = transaction pooler `6543`
   (`?pgbouncer=true`); `DIRECT_URL` = session pooler `5432` (for schema ops).
3. **`migrate deploy` is broken** here — use `db push` (§5).
4. **`P3005`** = schema exists but no migration history → use `db push`.
5. **`P1000`** = wrong DB password. Reset in Supabase, update everywhere it's used
   (app host + any CI secrets).
6. **AI keys are gitignored** (in `.env`) — they must be added separately to each
   environment (Vercel, CI, future VPS).
7. **Resetting the Supabase DB password** also breaks the live app until you
   update its env vars too.
