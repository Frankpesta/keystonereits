# Phase 8 — Animations, Polish & Deployment

## Objective
Turn the functionally-complete app from Phases 1–7 into the "sleek" experience the brief
asked for, then ship it. This phase is allowed to touch every earlier phase's files —
that's expected, it's a polish pass.

## 1. GSAP — structural / scroll-driven motion

Use GSAP (with `ScrollTrigger` where relevant) for:
- Marketing site: hero entrance (staggered headline/CTA reveal), section reveals on
  scroll (fade + slight y-translate, subtle — this is a financial product, not a
  portfolio site; restraint matters more than flash), plan cards on `/plans` staggering in.
- Dashboard: the investment progress visualization (Phase 5) — tween the fill/percentage
  smoothly whenever the underlying value changes, not just on mount. KPI cards on
  `/dashboard` and `/admin` count up from 0 to their real value on first paint using
  GSAP's number tweening (a small reusable `<AnimatedNumber>` client component).
- Route-level transitions: keep these minimal — a brief fade/slide on the main content
  area is enough; do not fight Next.js's own navigation model with heavy page-transition
  libraries.

Centralize GSAP setup (plugin registration, a `useGsap` hook wrapping
`useLayoutEffect`/context cleanup) in `src/hooks/use-gsap.ts` so every component follows
the same cleanup pattern and there are no leaked ScrollTriggers on unmount.

## 2. Anime.js — micro-interactions

Use Anime.js (kept distinct from GSAP's structural role) for small, cheap interaction
feedback: button press/hover states beyond what CSS transitions cover, success
checkmarks/confetti-style micro-bursts on completed actions (investment confirmed,
withdrawal submitted, KYC approved banner), toast entrance flourishes if the default
`sonner` animation feels too plain, OTP-input digit-fill feedback. Keep every one of these
under ~300ms — micro-interactions should feel instant, not showy.

## 3. Recharts polish

Revisit every chart from Phases 5/6 (`/dashboard/profit`, `/admin` KPIs, `/admin/reports`):
consistent brown/tan color scale across all charts (define once in `src/lib/chart-theme.ts`,
reuse everywhere — don't let Recharts' default palette leak through), consistent tooltip
styling matching the shadcn `card` look, responsive containers (`ResponsiveContainer`)
verified at mobile width, loading/empty states for charts with no data yet (new users,
freshly-seeded demo data).

## 4. Accessibility & responsiveness sweep

- Keyboard navigation through every form, dialog, and the sidebar (shadcn components are
  accessible by default — don't undo that with custom event handlers that swallow
  keyboard events).
- Color contrast check against the brown palette specifically — brown-on-cream and
  brown-on-white combos need verifying, not just assumed, since brown primaries often run
  darker than typical blue/purple SaaS primaries and can be fine, but verify against WCAG
  AA for text.
- Every async action (deposit submit, invest confirm, admin verify/credit, etc.) has a
  loading state and a disabled-while-pending submit button — sweep all of Phases 5/6 for
  any that were left without one.
- Full responsive pass at common breakpoints (375px, 768px, 1024px, 1440px) across
  marketing, user dashboard, and admin.

## 5. Performance

- Confirm Server Components are used by default and `"use client"` is only on components
  that truly need interactivity/hooks — audit for over-use of client components introduced
  under time pressure in earlier phases.
- Convex query subscriptions: check dashboard/admin pages aren't over-subscribing (e.g. a
  KPI card re-rendering the whole page on every unrelated write) — scope queries tightly.
- Image optimization via `next/image` everywhere on the marketing site (`/properties`
  especially).
- Run a Lighthouse pass on `/`, `/dashboard`, `/admin` and address anything scoring
  noticeably below the others.

## 6. QA pass (manual, end-to-end)

Walk the full lifecycle once, as if a real user and a real admin:
1. Sign up → verify email → land on dashboard.
2. Complete KYC → approve as admin → confirm status/email/notification all update.
3. Submit a crypto deposit with a tx hash → verify & credit as admin → balance updates,
   email/notification fire.
4. Open a fiat-deposit support ticket below $10,000 (should be blocked) and above
   (should succeed) → reply as admin with account details → thread updates live for the
   user.
5. Invest in a plan → confirm balance deduction and investment appears active with
   correct progress.
6. Manually trigger the accrual cron (or wait a day in a staging environment) → confirm
   profit balance and chart update.
7. As admin, Pause the investment → confirm no further accrual and correct badge/copy on
   the user side → Restart it → confirm accrual resumes.
8. As admin, manually credit/debit a balance → confirm audit log entry and correct
   before/after values.
9. Request a withdrawal → approve/process/complete as admin → confirm balance and
   transaction history are consistent throughout, with no double-spend window.
10. Send an admin broadcast email to a segment → confirm delivery log and that only the
    intended segment is included.
11. Log in as a `support`-role and a `finance`-role admin separately → confirm role gating
    holds on every restricted page/action.

## 7. Deployment

- Deploy Convex to production (`pnpm dlx convex deploy`), set production env vars
  (`NEXT_PUBLIC_CONVEX_URL`, `RESEND_API_KEY`, session secret(s), any settings not stored
  in the `settings` table).
- Deploy the Next.js app to Vercel (or the team's chosen host); confirm the `(marketing)`,
  `(user)`, `(admin)` route groups all resolve correctly in production, cookies are
  `secure` in production, and middleware behaves identically to local dev.
- Point Resend's sending domain at production DNS records (SPF/DKIM) before relying on
  deliverability for real users.
- Remove or gate the `/style-guide` debug page from Phase 1 behind a non-production check
  (or delete it) before considering this shippable.

## Definition of Done
- [ ] Full 11-step QA walkthrough above passes without manual database edits (everything reachable through the actual UI).
- [ ] No dark-mode artifacts, no off-palette colors anywhere (grep for hardcoded hex/rgb outside `globals.css`/`chart-theme.ts` as a sanity check).
- [ ] Lighthouse performance/accessibility scores are consistent and reasonable across marketing, user, and admin surfaces.
- [ ] Production deployment is live, Convex production deployment is connected, and a real (not test-mode) email send has been verified once.
