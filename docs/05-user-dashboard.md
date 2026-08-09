# Phase 5 — User Dashboard

## Objective
Build the full authenticated user experience inside `(user)/dashboard`, using the
Phase-1 sidebar block forked for the user nav, real-time Convex data throughout, and the
manual-verification deposit flows from Phase 2.

## Layout & nav

`src/app/(user)/dashboard/layout.tsx` wraps everything in the forked sidebar shell.
Nav groups: **Overview**, **Deposit**, **Invest** (Plans, Active Investments), **Profit
Balance**, **Withdraw**, **Transactions**, **Referrals**, **Support**, **Notifications**,
**Profile & Security**. Top bar shows KYC status pill, notification bell (unread count
via `notifications` `by_user_read` index), avatar dropdown (Profile, Security, Logout).

## Pages

### `/dashboard` — Overview
Cards: Available Balance, Investment Balance, Profit Balance, Total Portfolio Value
(computed client-side from the three, or a small derived query). Below: active
investments summary list (top 3–5, link to full list), recent transactions (last 5),
recent notifications, KYC status banner if not yet approved (with CTA into KYC flow).

### `/dashboard/kyc`
Multi-step form (Zustand wizard store): personal info → document upload → selfie upload
(optional per schema) → review & submit. File uploads go through
`ctx.storage.generateUploadUrl()`. Show current status prominently
(`not_started/pending/under_review/approved/rejected/info_required`) via
`<StatusBadge>`. If `info_required`, surface the admin's note and allow resubmission.

### `/dashboard/deposit`
Tabs: **Crypto** and **Fiat**.
- **Crypto tab:** select currency/network (from a small static list or a `settings` row
  for "supported cryptocurrencies"), display the platform's receiving address (static per
  currency/network for MVP, sourced from `settings`), form to submit **amount + tx hash**,
  creates a `deposits` row (`method: "crypto"`, `status: "pending"`). Show a clear notice:
  *"Deposits are manually verified once your transaction confirms on-chain — this
  typically completes within minutes."* List the user's past crypto deposits with status.
- **Fiat tab:** explain the **$10,000 minimum**, and that fiat deposits require opening a
  support ticket to receive bank account details. Include copy explaining *why* crypto is
  preferred (fast — funds arrive in the Keystone wallet within minutes — versus the
  manual bank transfer + verification time for fiat). A button "Request Fiat Deposit
  Details" pre-fills and opens a new support ticket (`category: "fiat_deposit"`) via the
  Phase-2 flow — do not let the form submit below $10,000 (client **and** server
  validation).

### `/dashboard/invest`
Grid of active plans (`investmentPlans` where `status == "active"`), each card shows
min/max, duration, daily return, a "View & Invest" button opening a `dialog` with an
amount input (live-validated against min/max and current available balance before
submit), summary, and confirm. On confirm: Convex mutation validates everything
server-side again, creates the `investments` row (`status: "pending"` → immediately
`"active"` once amount is deducted in the same mutation), decrements `balances.available`,
writes a `transactions` row.

### `/dashboard/investments`
List/grid of the user's investments (active, maturing, completed, cancelled, and the
admin-driven `admin_paused`/`admin_ended` states — render these with clear, non-alarming
copy, e.g. "Paused by support — contact us for details," not a scary red error). Each
item expands to the detail view below.

#### Investment detail
Amount, start date, maturity date, accrued profit, status, and a **progress
visualization** driven by `(now - startDate) / (maturityDate - startDate)`. Build this as
an SVG/DOM element animated with **GSAP** (a filling bar or radial progress) — actual
progress math computed in a plain function, GSAP only handles the visual tween from the
previous rendered value to the new one so it animates smoothly on data refresh rather than
snapping. See Phase 8 for the full animation pass; a working (if unpolished) version
should exist by the end of this phase since it's core UX, not decoration.

### `/dashboard/profit`
Current profit balance, total profit earned all-time, a Recharts line/area chart of daily
accruals over time (`profitAccruals` by user, grouped by date), and a paginated accrual
history table.

### `/dashboard/withdraw`
Select source balance (`available` or `profit`), amount, destination wallet + network,
submit → `withdrawals` row (`status: "pending"`). Server-side validates sufficient
balance and zeroes it out of the *available-to-withdraw* view immediately (funds are
earmarked, not deducted from the real balance until admin marks `completed` — decide and
document one approach clearly, then apply it consistently: earmarking via a
"pending withdrawal total" derived value is the safer pattern so a user can't submit two
overlapping withdrawal requests that double-spend the same balance). List of past
withdrawal requests with status.

### `/dashboard/transactions`
Unified table reading the `transactions` ledger, filterable by type/date/status, paginated
(shadcn `pagination`).

### `/dashboard/referrals`
Referral link/code (copy-to-clipboard), referred-users list, referral earnings list and
total, simple share buttons (mailto/social links are fine for MVP).

### `/dashboard/support`
List of the user's tickets (`supportTickets` by user), "New Ticket" flow (subject,
category, message — `fiat_deposit` category pre-selectable from the deposit page), thread
view per ticket using `supportMessages`, with attachment upload reusing the storage
pattern from KYC.

### `/dashboard/notifications`
Full list, mark-as-read (individually and "mark all read"), same `<StatusBadge>`/icon
conventions as the bell dropdown.

### `/dashboard/profile`
Profile fields (name, phone, country — email is view-only, changing it should be a
separate verified flow if built at all; out of scope for MVP unless requested), password
change (current + new + confirm, re-verifies current password server-side), session
list/"log out other devices" is a nice-to-have if time allows, not required for MVP.

## Definition of Done
- [ ] Every route above exists, reads/writes real Convex data (no mocked arrays left in place), and is reachable only when logged in as a user.
- [ ] Crypto and fiat deposit flows produce correctly-shaped `deposits`/`supportTickets` rows exactly as defined in Phase 2, including the $10,000 fiat minimum enforced server-side.
- [ ] Investing end-to-end works: balance decreases, investment appears active, shows on the overview.
- [ ] Progress visualization renders correctly for an investment partway through its duration (verify with a seeded investment whose dates are manually set to ~40% elapsed).
- [ ] Withdrawal request flow prevents a user from requesting more than their available (non-earmarked) balance.
- [ ] Support ticket thread works both directions once Phase 6 admin support UI exists (can be verified with direct Convex dashboard writes in the meantime).
- [ ] Fully responsive; sidebar collapses to icon-only or a sheet on mobile per the shadcn block's built-in behavior.
