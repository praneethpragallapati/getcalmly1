# GetCalmly

A privacy-first, vernacular-enabled digital mental health platform connecting people across
India with RCI-licensed therapists, counsellors, and psychiatrists — matched by concern,
language, and budget.

> **Phase 1 scope (this repo):** Public landing page + 3-step pre-assessment & matching flow,
> with the data model and auth scaffolding for the full platform.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Prisma 6** + **PostgreSQL** (Supabase)
- **NextAuth** (Google OAuth — placeholder credentials)

## What's built

- **Landing page** — hero, stats, how-it-works, full services grid, featured therapists,
  plans, testimonials, blog & community previews, and a crisis/emergency banner.
- **Pre-assessment flow** (`/assess`):
  1. Support type — Therapy / Medication / Both / Not Sure
  2. Recipient — Myself / Child / Couple
  3. Tailored questionnaire (adult / child / couple / psychiatry) with a confidential
     **risk screening** question that triggers an emergency-resources modal.
  4. Results — severity level, areas of concern, and matched therapists.
- **Pages** — Services, About, Contact, Safety & Ethics (compliance), Login, Register.
- **Prisma schema** — Users, Therapist Profiles, Assessments, Appointments, Mood Entries,
  Journal Entries (+ NextAuth tables).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` from the example and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   At minimum set `DATABASE_URL` (your Supabase connection string).

3. Generate the Prisma client and push the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `.env.example`. Phase 1 placeholders are provided for Google OAuth, MSG91 (OTP),
and Razorpay (payments) — wire in real credentials when ready.

## Project Structure

```
src/
  app/
    (public)/      # landing page, assess flow, services, about, contact, safety
    (auth)/        # login, register
    api/auth/      # NextAuth route
  components/
    layout/        # Header, Footer, CrisisBanner, ConsentBanner
    landing/       # landing page sections
    assessment/    # pre-assessment steps, form, results, emergency modal
    ui/            # shared UI
  data/            # mock therapist data (Phase 1)
  lib/             # Prisma client
prisma/
  schema.prisma    # data model
```

## Compliance Notes

Built with India's mental health regulations in mind — MHCA 2017, Telemedicine Practice
Guidelines 2020, and the DPDP Act 2023. Crisis helplines are surfaced throughout, and the
Safety & Ethics page documents confidentiality limits and the emergency protocol.
