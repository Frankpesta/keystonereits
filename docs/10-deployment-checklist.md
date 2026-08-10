# Deployment Readiness Checklist

Phase 8 scope was polish + readiness prep only — no `convex deploy`, no Vercel
push, no DNS changes were made. This is the checklist for when you're ready
to do those yourself.

## 1. Environment variables

Verified against actual `process.env.*` reads in the codebase (not just the
Phase 8 doc's illustrative list — there is no session-signing secret; session
tokens are random values stored in the `sessions` table, not JWTs).

### Next.js app (Vercel project settings, or `.env.production`)

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex prod deployment URL. `convexServerClient()` (`src/lib/auth/convex-server.ts`) throws loudly if missing. |

`NEXT_PUBLIC_CONVEX_SITE_URL` is scaffolded in `.env.local` but nothing in
`src/` reads it — there's no `convex/http.ts` yet, so it's not required for
current functionality.

### Convex deployment (`npx convex env set <KEY> <VALUE> --prod`)

| Variable | Required | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | For real email | Without it, `convex/emailActions.tsx` falls back to a console-log dev stub — every email event still writes an `emailLog` row, but nothing is actually sent. Set this before relying on OTP/notification emails in production. |
| `RESEND_FROM_ADDRESS` | Recommended | Defaults to `Keystone REIT <onboarding@resend.dev>` (Resend's shared test sender) if unset. Set to a verified sending address on your own domain once DNS is configured (see §3). |
| `APP_URL` | Recommended | Used to build absolute links in emails (`src/components/emails/app-url.ts`). Defaults to `http://localhost:3000` if unset — must be set to the real production URL or every email link will point at localhost. |

## 2. Style guide debug route

`/style-guide` (`src/app/style-guide/page.tsx`) now calls `notFound()` when
`NODE_ENV === "production"` — no separate action needed, it self-gates on a
standard production build.

## 3. Resend sending domain

Point Resend's sending domain at your production DNS (SPF/DKIM per Resend's
dashboard instructions) before setting `RESEND_FROM_ADDRESS` to an address on
that domain — sending from an unverified domain will fail or land in spam.

## 4. Deploy steps (when you're ready)

1. `npx convex deploy` — pushes schema/functions to the Convex production
   deployment and prints the prod `NEXT_PUBLIC_CONVEX_URL`.
2. Set the Convex env vars above against that production deployment
   (`--prod` flag, or select it in the Convex dashboard).
3. Deploy the Next.js app (Vercel or your chosen host) with
   `NEXT_PUBLIC_CONVEX_URL` set to the value from step 1.
4. Confirm `(marketing)`, `(auth)`, `(user)/dashboard`, and
   `(admin)/admin` route groups all resolve correctly on the deployed URL.
5. Trigger one real email (e.g. signup OTP) and confirm it arrives — not just
   that `npx convex logs` shows the dev-stub console output.

## 5. Manual QA + Lighthouse (your pass, not run by Claude this phase)

Run the 11-step walkthrough in `docs/08-animations-polish-deployment.md`
§6 against the deployed environment, plus a Lighthouse pass in Chrome
DevTools on the production URL (marketing homepage + one dashboard page).
