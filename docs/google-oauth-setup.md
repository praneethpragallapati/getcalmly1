# Google login / signup — setup

The code is fully wired. Google sign-in is **hidden until you provide credentials**,
so nothing breaks before you configure it. To turn it on:

## 1. Create OAuth credentials (Google Cloud Console)
- APIs & Services → Credentials → **Create credentials → OAuth client ID**
- Application type: **Web application**
- **Authorized JavaScript origins:**
  - `https://YOUR_DOMAIN`
  - `http://localhost:3000` (for local dev)
- **Authorized redirect URIs** (this exact path — NextAuth's Google callback):
  - `https://YOUR_DOMAIN/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`

Copy the **Client ID** and **Client secret**.

## 2. Set environment variables
```
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxx
NEXTAUTH_URL=https://YOUR_DOMAIN        # exact site URL; http://localhost:3000 locally
NEXTAUTH_SECRET=<a long random string>  # openssl rand -base64 32
```
Redeploy. The "Continue with Google" / "Sign up with Google" buttons appear
automatically once both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present.

## How it behaves
- **New Google email →** a Patient account is created and lands on `/app`.
- **Existing email (any method) →** Google links to that same account by email —
  no duplicate — and routes by role: Patient → `/app`, Therapist → `/expert`,
  Admin → `/admin` (via `/postlogin`).
- The session id is always the real DB user id (never Google's raw account id), so
  packages / check-ins / assignments always attach to the account admin sees.

## Notes
- No database adapter is used (JWT sessions). Account linking is done by email in
  the NextAuth `jwt` callback in `src/lib/auth.ts`.
- A brand-new Google patient has no assessment yet, so the dashboard prompts them
  to take it — same as any other new patient.
