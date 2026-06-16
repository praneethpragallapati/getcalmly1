# MSG91 OTP login — setup guide

GetCalmly uses **MSG91** to send and verify phone OTPs for login. This guide
walks you through creating the account, getting DLT approval (mandatory for SMS
in India), creating the OTP template, and plugging the credentials into the app.

The integration is already built:

- `src/lib/msg91.ts` — send / verify / resend helpers (MSG91 API v5)
- `src/app/api/otp/send/route.ts` — sends an OTP to a phone number
- `src/lib/auth.ts` — a NextAuth `phone-otp` credentials provider that verifies
  the OTP server-side and creates/links the user
- `src/app/(auth)/login/page.tsx` — the login UI is wired to the above

You only need to (1) create the account, (2) complete DLT, (3) create a template,
and (4) set two environment variables.

---

## 1. Create your MSG91 account

1. Go to <https://msg91.com> and click **Sign up**.
2. Register with your **GetCalmly business email** (e.g. connect@getcalmly.com)
   and a phone number you control.
3. Verify your email and phone.
4. You'll land in the MSG91 dashboard at <https://control.msg91.com>.

## 2. Complete DLT registration (required for India)

Indian telecom regulation (TRAI) requires every SMS sender to be registered on a
**DLT (Distributed Ledger Technology) platform** before sending. MSG91 has a
guided flow, but you register on a DLT operator portal (Jio/Airtel/Vodafone/BSNL).

You will need:
- **Business PAN** and **GST** (or equivalent registration proof)
- **Authorised signatory** details
- A **Letter of Authorisation** (MSG91 provides a template)

Steps:
1. In the MSG91 dashboard, open **SMS → DLT** and follow "Get started with DLT".
2. Register your **Entity** (your company) — you'll get a **Principal Entity ID (PEID)**.
3. Register a **Header / Sender ID** (6 characters, e.g. `CALMLY`). This is what
   recipients see as the sender.
4. Register a **Content Template** for OTP (see next section).

> DLT approval can take 1–3 business days. You can do steps 1–3 of the next
> section in the meantime, but messages won't deliver until DLT is approved.

## 3. Create the OTP template

1. On the DLT portal, create a **Service Implicit / OTP** content template, e.g.:

   ```
   {#var#} is your GetCalmly verification code. It is valid for 10 minutes. Do not share it with anyone.
   ```

   The `{#var#}` is the OTP placeholder. Submit for approval and note the
   **DLT Template ID**.
2. Back in MSG91, go to **OTP → Configuration** (or **SMS → Templates**), link the
   approved DLT template, and MSG91 will give you an **MSG91 Template ID**.
   This is the value you put in `MSG91_OTP_TEMPLATE_ID`.

## 4. Get your Auth Key

1. In the MSG91 dashboard, click your profile → **API** (or **Settings → API Keys**).
2. Copy the **Auth Key**. This is `MSG91_AUTH_KEY`.

## 5. Set environment variables

Add these to your `.env` (local) and to your hosting provider (Vercel/Railway):

```bash
MSG91_AUTH_KEY="paste-your-auth-key"
MSG91_OTP_TEMPLATE_ID="paste-your-msg91-template-id"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="https://your-domain.com"   # http://localhost:3000 in dev
```

> `MSG91_OTP_TEMPLATE_ID` is optional for the very first smoke test — MSG91 can
> send a default OTP without a template — but it is **required** for production
> delivery in India.

## 6. Test it

1. `npm run dev`
2. Open `/login`, choose **Mobile**, enter a real number, tap **Send OTP**.
3. You should receive an SMS. Enter the code and tap **Verify & Sign in**.

Under the hood:
- `POST /api/otp/send` → `sendOtp()` → MSG91 sends the code.
- `Verify & Sign in` → `signIn('phone-otp', { mobile, otp })` →
  the `phone-otp` provider calls `verifyOtp()`; on success it upserts a `User`
  (by phone) and creates the session.

## Notes & next steps

- **Pricing:** MSG91 bills per SMS segment; transactional/OTP SMS in India is
  typically a few paise per message. Add credits in the dashboard before going live.
- **International numbers:** the login passes the full number with country code,
  so OTPs work outside India too (subject to MSG91 international rates; no DLT
  needed for non-Indian numbers).
- **Rate limiting / abuse:** before launch, add basic rate limiting to
  `/api/otp/send` (e.g. max 5 sends per number per hour) to control cost.
- **Profile capture:** after first OTP login a bare `User` row is created. The
  registration wizard fills in the `PatientProfile` (patient id, couple id,
  contacts, address, consents).
