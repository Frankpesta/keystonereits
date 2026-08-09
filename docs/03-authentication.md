# Phase 3 — Authentication

## Objective
Build fully custom, separate authentication systems for users and admins — no
NextAuth/Clerk/Auth.js. Users get signup + email/password + OTP verification. Admins get
login-only (no signup route) + password reset, both gated behind email OTP.

## 1. Shared primitives (`convex/lib/auth.ts` + `src/lib/auth/`)

- Passwords: hash with a strong algorithm available in Convex's runtime (e.g. a WebCrypto-
  based scrypt/PBKDF2 implementation, or `bcryptjs` if it runs in Convex's environment —
  verify compatibility first; do not roll your own hashing).
- Sessions: on successful login, generate a random 32-byte token, store only its hash in
  `sessions.tokenHash`, set the raw token as an **httpOnly, secure, sameSite=lax** cookie
  from a Next.js Server Action / Route Handler. Two distinct cookies: `keystone_user_session`
  and `keystone_admin_session` — never share a cookie name or a session table row shape
  between the two subject types (the `subjectType` field exists precisely so one lookup
  function can serve both but never cross-authenticate).
- OTP codes: 6-digit numeric, store only a hash in `otpCodes.codeHash`, 10-minute expiry,
  max 5 attempts before requiring a fresh code, one active (unconsumed) code per
  `email + purpose` at a time (delete/replace on resend).
- All password-reset and OTP flows are **rate-limited** — track attempts per email per
  15-minute window (a simple counter row or reuse `otpCodes.attempts`) and reject with a
  generic error once exceeded, to avoid enumeration/brute-force.

## 2. User auth flow

### Signup (`/signup`)
Full form per the PRD ("complete with necessary user info"): first name, last name,
email, phone, country, password, confirm password, referral code (optional, prefilled
from `?ref=` query param if present), terms acceptance checkbox. Validate with a shared
`zod` schema in `src/lib/validation/auth.ts` (imported by both the client form and re-run
server-side in the Convex mutation — never trust client validation alone).

Flow:
1. Client submits → Convex mutation `auth.signup` creates the `users` row
   (`emailVerified: false`), generates and stores an OTP (`purpose: "signup_verify"`),
   triggers a Resend action (Phase 7) to email the code.
2. Redirect to `/verify-email` (email prefilled/hidden in state, not re-typed).
3. User enters 6-digit code → `auth.verifySignupOtp` mutation checks hash + expiry +
   attempts, sets `emailVerified: true`, creates a `balances` row (all zero), generates a
   unique `referralCode`, creates the session, sets the cookie, redirects to
   `/dashboard`.
4. Resend-code affordance with a visible cooldown (e.g. 60s) backed by `expiresAt`.

### Login (`/login`)
Email + password → verify hash → if valid, do **not** log in immediately: send a fresh
OTP (`purpose: "login_2fa"`) and redirect to `/verify-login`, same OTP component reused
from signup. On success, create session + cookie, redirect to `/dashboard`. This is the
"OTP code verification" 2FA style the user chose — every login requires the emailed code,
not just signup.

### Forgot / Reset password (`/forgot-password`, `/reset-password`)
Email → OTP (`purpose: "password_reset"`) → code + new password + confirm on one screen →
mutation verifies OTP, updates `passwordHash`, invalidates all existing sessions for that
user (defense in depth), redirects to `/login`.

## 3. Admin auth flow

Everything above minus signup. Only:
- `/admin/login` — email + password → OTP (`purpose: "login_2fa"`, but scoped to the
  `admins` table lookup, not `users`) → `/admin/verify-login` → session with the
  `keystone_admin_session` cookie → `/admin`.
- `/admin/forgot-password`, `/admin/reset-password` — identical pattern to user side,
  against `admins`.
- **No `/admin/signup` route exists at all** — not hidden, not feature-flagged, simply
  absent from the router. New admins are created exclusively via an existing `super`
  admin's User Management → Admins screen (Phase 6).

## 4. Route protection (middleware)

Use `src/middleware.ts` with path-based branching:

```ts
// pseudo-structure — implement with real cookie/session validation
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (isAdminAuthRoute(pathname)) return NextResponse.next(); // login/forgot/reset/verify
    return requireValidSession(req, "keystone_admin_session", "/admin/login");
  }

  if (pathname.startsWith("/dashboard")) {
    return requireValidSession(req, "keystone_user_session", "/login");
  }

  return NextResponse.next(); // marketing site, public
}

export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };
```

Session validation should be a lightweight cookie-presence + expiry check in middleware
(Edge-safe); do the authoritative Convex lookup inside each Server Component/Server
Action so a forged-but-expired cookie can't slip through. Never do the full Convex
session lookup inside `middleware.ts` if it risks Edge runtime incompatibilities — keep
middleware fast and coarse, and treat the real page-level `getCurrentUser`/`getCurrentAdmin`
call as the source of truth.

## 5. UI conventions for this phase

- One shared `<AuthCard>` shell (logo, brown-accented card, footer link) reused by every
  auth screen on both surfaces, styled from the Phase 1 tokens — do not build bespoke
  layouts per screen.
- One shared `<OtpInput>` 6-digit component used by signup verify, login 2FA (user and
  admin), and password reset.
- Use shadcn `form` + `input` + `button`, `zod` + `react-hook-form` for all auth forms.
- Loading/disabled states on every submit button; server errors surface via `sonner`
  toasts with specific-but-not-enumerable messages ("Invalid email or password" — never
  reveal which field was wrong).

## Definition of Done
- [ ] A brand-new user can sign up, verify email via OTP, land on `/dashboard`, log out, and log back in through the full password + OTP flow.
- [ ] A seeded admin (from Phase 2's seed script) can log in via `/admin/login` through password + OTP and land on `/admin`.
- [ ] Visiting `/dashboard` or `/admin` while logged out redirects to the correct login page; visiting `/admin/signup` 404s (route doesn't exist).
- [ ] Forgot/reset password works end-to-end on both surfaces and invalidates old sessions.
- [ ] Rate limiting on OTP requests and login attempts is verifiably in place (test by exceeding the threshold).
- [ ] No cross-contamination: a user session cookie cannot access any `/admin` route and vice versa.
