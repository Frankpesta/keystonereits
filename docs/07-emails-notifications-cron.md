# Phase 7 — Emails, Notifications & Cron

## Objective
Wire up transactional and broadcast email via Resend + react-email, in-app notifications,
and the Convex cron jobs that drive daily profit accrual and investment maturity — the
automation backbone that makes Phases 5–6 actually function over time rather than only on
manual admin clicks.

## 1. React Email templates

Create `src/components/emails/` (or `emails/` at repo root if you want the standalone
react-email dev server `pnpm dlx react-email dev` to preview them — either location works,
just be consistent and document the choice in the README).

Build one shared `<EmailLayout>` (logo, brown-accented header bar, footer with legal
links/unsubscribe-note for broadcast mail) and templates for:

- `OtpCodeEmail` — signup verify / login 2FA / password reset (parameterize by purpose so
  copy is accurate, one template, not three near-duplicates).
- `WelcomeEmail` — after signup verification completes.
- `KycStatusEmail` — approved / rejected / info-required variants.
- `DepositReceivedEmail` — deposit submitted (pending review).
- `DepositCreditedEmail` — deposit verified and credited.
- `InvestmentCreatedEmail`
- `InvestmentCompletedEmail`
- `WithdrawalStatusEmail` — requested / approved / completed / rejected variants.
- `SupportTicketReplyEmail` — new message on a ticket (used for the fiat-deposit
  account-details reply too — no separate template needed, the ticket category already
  carries that context).
- `AdminBroadcastEmail` — generic subject/body wrapper for the admin Email Center's
  platform-wide/segment sends.
- `SecurityAlertEmail` — new login / password changed.

Render with `@react-email/render` inside a Convex **action** (never a mutation) that calls
Resend's API. One shared `sendEmail(ctx, {to, subject, react})` helper in `convex/lib/`
(or `convex/emails.ts`) that: renders the template, calls Resend, and writes an `emailLog`
row regardless of success/failure (`status: "sent" | "failed"`).

## 2. Wiring emails to events

Every mutation from Phases 2/5/6 that changes state a user should be told about should
`ctx.scheduler.runAfter(0, internal.emails.sendX, {...})` (a Convex action scheduled from
the mutation) rather than trying to call Resend directly from a mutation. Cover at
minimum: OTP send (signup/login/reset), welcome, KYC status change, deposit
submitted/credited, investment created/completed, withdrawal status changes, support
ticket replies, admin broadcast/individual/segment sends.

## 3. In-app notifications

Alongside (not instead of) email, write a `notifications` row for the same set of events
listed above, read via `useQuery` in the Phase-5 bell dropdown and `/dashboard/notifications`
page — this should already be functional from Phase 5's UI, this phase is where the
*writes* actually start happening from real events instead of being manually seeded.

## 4. Cron jobs (`convex/crons.ts`)

```ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "accrue-daily-profit",
  { hourUTC: 0, minuteUTC: 5 },
  internal.investments.accrueDailyProfit
);

crons.daily(
  "process-maturing-investments",
  { hourUTC: 0, minuteUTC: 15 },
  internal.investments.processMaturities
);

export default crons;
```

- **`accrueDailyProfit`** — iterate investments where `status == "active"` (explicitly
  excluding `pending`, `admin_paused`, `admin_ended`, `completed`, `cancelled`), skip any
  investment whose `lastAccrualAt` is already today (idempotency — cron re-runs or manual
  triggers must not double-credit), compute `amount = investment.amount *
  plan.dailyReturnPercent / 100`, insert a `profitAccruals` row, increment
  `balances.profit`, update `investment.accruedProfit` and `lastAccrualAt`, write a
  `transactions` row (`type: "profit_accrual"`).
- **`processMaturities`** — for investments where `status == "active"` (or `"maturing"` if
  you introduce a pre-maturity grace window) and `maturityDate <= now`, transition to
  `completed`, trigger the completion email/notification, and apply whatever
  principal-return business rule is confirmed (mirrors the `// TODO` noted in Phase 6 for
  admin-ended investments — resolve both together).

## Definition of Done
- [ ] Every email template renders correctly in the react-email preview server with realistic sample props (no broken layout, brown branding consistent, no dark-mode styles).
- [ ] Signup, login, and password-reset OTP emails send and are received in a real test inbox (or Resend's test mode) during manual QA.
- [ ] A seeded active investment with `lastAccrualAt` set to yesterday correctly accrues today when the cron (or a manually invoked internal mutation, for testing) runs, and does **not** double-accrue on a second run the same day.
- [ ] `admin_paused` and `admin_ended` investments are confirmed to be skipped by the accrual cron.
- [ ] Admin Email Center's individual/broadcast/segment sends all produce correct `emailLog` rows and reach real recipients in test mode.
- [ ] In-app notification bell reflects new notifications in real time (no refresh) as events fire.
