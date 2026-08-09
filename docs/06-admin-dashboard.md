# Phase 6 — Admin Dashboard

## Objective
Build the complete operational control surface at `/admin`, including the manual
balance-adjustment and investment pause/end/restart controls that are the one deliberate
deviation from the base PRD — every such action must be validated server-side and
audit-logged via `convex/lib/audit.ts` from Phase 2.

## Layout & nav

Fork the same sidebar block from Phase 1 with an admin-specific `NavItem[]`: **Overview**,
**Users**, **KYC Review**, **Deposits**, **Withdrawals**, **Investment Plans**,
**Investments**, **Referrals**, **Support Tickets**, **Email Center**, **Reports**,
**Audit Logs**, **Admins & Roles**, **Settings**. Gate individual nav items and pages by
`admins.role` using `requireRole` from Phase 2 — e.g. `finance` shouldn't see "Admins &
Roles"; render a 403 state (not a silent redirect) if a logged-in admin without the right
role navigates directly to a gated URL.

## Pages

### `/admin` — Dashboard
KPI cards (per PRD §20/§11): total/verified users, pending KYC, total deposits/
withdrawals/invested, active/completed investments, total accrued profit, referral
activity, pending withdrawals/deposits, recent activity feed. Use **Recharts** for at
least: a deposits-vs-withdrawals trend line and an investments-by-plan bar/pie — pull
from lightweight aggregate queries in `convex/admin/dashboard.ts`, not client-side
reduction of full tables.

### `/admin/users`
Searchable/filterable table (name, email, ID). Row → detail page: profile, balances, KYC
status/link, investments, deposits, withdrawals, profits, referrals, transactions,
account activity, and a **Restrict/Suspend** action (updates `users.status`, audit-logged).

### `/admin/kyc`
Queue filtered by status, click into an application to view uploaded documents (signed
URL via `ctx.storage.getUrl`), approve / reject / request-info actions (each sets
`kycApplications.status`, `reviewedBy`, `reviewedAt`, `reviewNote`; approve also updates
`users.kycStatus`; triggers the matching Phase-7 notification/email).

### `/admin/deposits`
Table of all `deposits` (both crypto and fiat), filter by method/status. Detail drawer
shows tx hash (crypto) or linked support ticket (fiat). **Verify & Credit** action: sets
`status: "credited"`, atomically increments `balances.available`, writes a `transactions`
row, audit-logs the action. **Reject** action with required reason. This is the one place
in the app where the manual crypto/fiat verification promised in the PRD actually happens
— make the reviewer's job easy: show amount, currency/network or ticket link, and the
user's KYC status inline so an admin isn't tab-switching.

### `/admin/withdrawals`
Same pattern: table filterable by status, detail view, Approve → Processing → Completed
progression (or Reject/Fail with reason), each transition audit-logged and each terminal
state (`completed`/`rejected`/`failed`) reconciles the earmarked balance from Phase 5's
withdrawal design.

### `/admin/investment-plans`
CRUD for `investmentPlans` (create/edit/activate/pause/close/archive), form validation
mirrors the PRD fields (min/max, duration, daily return). "View Investors" link per plan
→ filtered `/admin/investments?plan=...`.

### `/admin/investments`
Full searchable/filterable investment table (investor, ID, plan, amount, start/maturity,
status, accrued profit, progress). Detail view adds the **manual override controls**:
- **Pause** — sets `status: "admin_paused"`, writes an `investmentOverrides` row
  (`action: "pause"`, required `reason`), stops future daily accrual for this investment
  (cron in Phase 7 must check for `active` status only).
- **End** — sets `status: "admin_ended"`, writes an `investmentOverrides` row
  (`action: "end"`, required `reason`); decide and document the payout behavior (e.g.
  accrued profit so far stays credited, principal handling per business rule — leave a
  clear `// TODO: confirm payout policy with product owner` if genuinely undecided rather
  than guessing silently).
- **Restart** — only enabled from `admin_paused`, sets `status: "active"` again, writes an
  `investmentOverrides` row (`action: "restart"`).
Every one of these three buttons requires a confirmation dialog (shadcn `alert-dialog`)
with a mandatory reason field — never a bare button that fires on one click.

### `/admin/manual-balance` (or a "Manual Adjustment" action available from a user's detail page — either is fine, but it must exist and be easy to find)
Select user, select balance type (available/invested/profit), credit or debit, amount,
required reason → `balanceAdjustments` row + balance mutation + `transactions` row
(`type: "admin_adjustment"`) + audit log, all in one mutation. Show the user's current
balance inline before/after so the admin can sanity-check the change before confirming.

### `/admin/referrals`
Overview of referral activity platform-wide, searchable by referrer.

### `/admin/support`
Ticket queue (filter by status/category — surface `fiat_deposit` tickets prominently
since they gate real deposits), thread view with reply box (writes `supportMessages`,
`authorType: "admin"`), assign-to-admin, close ticket. Replying to a `fiat_deposit`
ticket is where the admin actually sends the bank account details copy.

### `/admin/email-center`
Individual send (pick a user, subject, body), Platform-Wide broadcast, and Targeted
segments (KYC-approved, KYC-pending, active investors, has-deposited, has-not-invested,
referral users, etc. — implement segment filters as real Convex queries, not a hardcoded
list). All sends go through the Phase-7 Resend action and log to `emailLog`. History view
below the composer.

### `/admin/reports`
User, Financial, and Investment report views with date/user/plan/status filters and CSV
export (generate client-side from the filtered query result, or a Convex action if the
dataset is large).

### `/admin/audit-logs`
Read-only, filterable/searchable table over `auditLogs` — admin, action, target,
amount, before/after (rendered as a small diff or JSON viewer), timestamp.

### `/admin/admins` (Super admin only)
List admins, **create new admin** (this is how new admin accounts are provisioned — there
is still no public signup route; this form lives behind an authenticated super-admin
session), edit role, disable/enable.

### `/admin/settings`
Platform name/branding, contact info, supported cryptocurrencies + receiving addresses
(feeds the Phase-5 deposit page), deposit/withdrawal/investment/referral configuration
(e.g. the $10,000 fiat minimum should live here, not be hardcoded, so it's adjustable),
notification/email config, maintenance mode toggle. Persist to the `settings` table
(key/value).

## Definition of Done
- [ ] Every page above exists, is role-gated appropriately, and operates on real Convex data.
- [ ] Manual crypto/fiat deposit verification, manual balance adjustment, and pause/end/restart all work end-to-end and each produces a correct, inspectable `auditLogs` row.
- [ ] The $10,000 fiat minimum is read from `settings`, not hardcoded, and enforced both in the Phase-5 user form and server-side.
- [ ] Recharts visuals on `/admin` render from real aggregate data and update as seed/demo data changes.
- [ ] A `finance`-role admin cannot see/access `/admin/admins`; a `support`-role admin cannot approve withdrawals — verify both.
- [ ] Support ticket replies from admin are visible in the user's Phase-5 ticket thread (and vice versa) in real time via Convex reactivity — no manual refresh needed.
