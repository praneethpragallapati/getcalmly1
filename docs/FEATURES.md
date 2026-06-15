# getCalmly — Features & Logic

> Living document. Update this whenever a feature, route, or business rule
> changes. Last updated: 2026-06-15.

getCalmly is an Indian mental-health **SaaS** platform: *Mental Healthcare,
Powered by Experts, Personalized by AI*. It connects people with RCI-verified
therapists and psychiatrists, with AI-assisted insights, mood tracking, a
journal, and a moderated community.

---

## 1. Brand

| Token | Value | Use |
| --- | --- | --- |
| Coral | `#C8553D` | Patient / landing primary |
| Charcoal | `#1C2B3A` | Text, dark sections |
| Warm white | `#FFF8F5` | Background |
| Green | `#3D9E72` → portal `#1A7F7A` | Doctor / therapist portal |
| Purple | `#6D5BD0` | Admin portal |
| Gold | `#C9973A` | Ratings / accents |

- **Fonts:** Big Shoulders Display (headings, `scaleX` compressed) + DM Sans (body).
- **Logo:** wordmark `get` (charcoal-gray) + `Calmly.` (coral, compressed) with the
  tagline *“Mental Healthcare, Powered by Experts, Personalized by AI”*
  (“Personalized by AI” in coral). Implemented in `src/components/ui/Logo.tsx`
  and shown wherever the logo appears (header + footer).

---

## 2. Tech stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind v4** + scoped mockup CSS (`src/components/site/landing.css`, scoped under `.lp-page`)
- **Prisma 6** + **PostgreSQL**
- **NextAuth v4** (Google OAuth; email/phone OTP planned via MSG91)
- **Razorpay** (payments, planned), **Google Meet/Calendar** (sessions, planned)
- **Deployment:** Railway (app + managed Postgres). See §8.

---

## 3. Information architecture (routes)

Public marketing pages live in `src/app/(public)` and share `SiteShell`
(fixed brand header + footer + landing runtime).

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Home / landing | Faithful port of the v2 mockup (hero, how-it-works, features, dashboard preview, assessment break, pricing, community, testimonials, final CTA) |
| `/services` | Services catalogue | All assessment & therapy categories |
| `/blog` | Blog index | Expert articles (placeholder content) |
| `/community` | Community | Moderated peer groups |
| `/about` | About | Mission / team |
| `/for-therapists` | Clinician value page | Benefits + application CTA |
| `/contact` | Contact | |
| `/safety` | Safety & ethics + crisis helplines | DPDP / compliance |
| `/assess` | Pre-assessment flow | See §5 |
| `/login`, `/register` | Auth | NextAuth |

**Header nav order:** Home · Services · Features · Pricing · Blog · Community · About
→ right: **For Therapists** · Log in · **Book a free session**.
*Features* and *Pricing* link to home sections (`/#features`, `/#pricing`); the
rest are individual pages.

---

## 4. Header / navigation logic

- Header is `position:fixed`, gains a `stuck` style after 40px scroll.
- Primary CTA everywhere = **“Book a free session”** → `/assess` (we push the
  free first session; we do **not** offer manual therapist browsing — we match).
- Reveal-on-scroll: any `.reveal` element animates in via IntersectionObserver.

---

## 5. Pre-assessment & matching logic (`/assess`)

The **older multi-step flow** (not the single modal):

1. **Step 1 — Support type:** Therapy / Medication / Both / Not sure.
2. **Step 2 — Recipient:** Myself (adult) / My child / My partner & I (couple).
3. **Routing to a form:**
   - `Medication` → **psychiatry** form.
   - `Therapy` → form by recipient: adult / child / couple.
   - `Both` → match a psychiatrist **and** route by recipient.
   - `Not sure` → route by recipient.
4. **Questionnaire** (PHQ-9 / GAD-7 style) → scored.
5. **Risk screening:** if the self-harm question = **Yes**, show the
   **emergency modal** with crisis helplines and prompt immediate support.
6. **Results:** severity level (Minimal / Mild / Moderate / Severe) + areas of
   concern + **3 matched therapists** (we match; the user does not pick from a
   directory). Matching considers form type (psychiatry/couple/child) and
   language preference.

State is held in `sessionStorage` between steps. Therapist data in
`src/data/therapists.ts`.

---

## 6. Subscription plans

| Plan | Price | Highlights |
| --- | --- | --- |
| Free | ₹0 | Assessment, daily mood check-in, 5 journals/mo, community, basic AI insights |
| Growth | ₹799/mo | Unlimited journaling + AI, Calm AI 24/7, 2 sessions/mo, full mood dashboard, weekly reports, priority matching |
| Clinical | ₹1,999/mo | Unlimited sessions, care coordinator, psychiatrist access, hospital referral, family (up to 4) |

All plan CTAs route to `/assess` (start free, then convert).

---

## 7. Data model (Prisma)

Enums: `Role` (PATIENT/THERAPIST/ADMIN), `AppointmentStatus`,
`AssessmentType` (ADULT/CHILD/COUPLE/PSYCHIATRY), `SeverityLevel`
(MINIMAL/MILD/MODERATE/SEVERE).

Models: `User`, `Account`, `Session`, `VerificationToken`, `TherapistProfile`,
`Assessment`, `Appointment`, `MoodEntry`, `JournalEntry`.

Migration: `prisma/migrations/0001_init`. Applied automatically on Railway via
`prisma migrate deploy` (see §8).

---

## 8. Deployment (Railway)

- **Why Railway:** SaaS needs a managed Postgres + always-on Node server in one
  place; Railway provides both. Config in `railway.json`.
- **Build:** `npm ci && npm run build` (runs `prisma generate` first).
- **Start:** `npx prisma migrate deploy && npm run start` — migrations apply on
  every deploy, so the schema stays in sync without manual SQL.
- **Provision:** add a **PostgreSQL** plugin in Railway; it injects
  `DATABASE_URL`. Set `DIRECT_URL` to the same value (no PgBouncer needed on
  Railway), plus `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and
  OAuth/Razorpay/MSG91 keys.

### Required env vars
`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
`NEXT_PUBLIC_SITE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`MSG91_AUTH_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.

---

## 9. SEO (from day one)

- Per-page `metadata` (title template, description, canonical, OpenGraph, Twitter).
- `src/app/sitemap.ts` and `src/app/robots.ts`.
- `MedicalOrganization` JSON-LD in the root layout.
- Semantic headings, `lang="en"`, `locale: en_IN`, descriptive alt/aria on logo.
- Set `NEXT_PUBLIC_SITE_URL` to the production domain so canonical/OG/sitemap URLs are correct.

---

## 10. Status & roadmap

**Done**
- Landing page (faithful v2 port) + shared header/footer with new logo + tagline
- Individual pages: services, blog, community, about, for-therapists, contact, safety
- Pre-assessment flow + emergency modal + results matching
- SEO base, Railway config, Prisma schema + migration

**Next**
- Patient dashboard (mood, journal, sessions, Calm AI insight) — coral
- Therapist portal (schedule, pre-session briefs, notes) — green `#1A7F7A`
- Admin portal — purple
- Booking + Razorpay + Google Meet/Calendar
- Auth: Google OAuth live + email/phone OTP (MSG91)
- Consent flows (DPDP) at signup / pre-session / minors
- Mobile app (after web)
