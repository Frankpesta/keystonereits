# Phase 2 — Database & Backend (Convex)

## Objective
Model the full data domain in `convex/schema.ts` and establish the function conventions
(queries/mutations/actions, auth guards, validation, audit logging) that every later
phase's backend code will follow. Get this right once — every dashboard, form, and cron
in Phases 5–7 depends on it.

## 1. Schema

Create `convex/schema.ts`. Use `defineSchema` / `defineTable` with `v` validators from
`convex/values`. Index every field you will ever query or filter by.

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ---------- AUTH & IDENTITY ----------
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
    country: v.optional(v.string()),
    emailVerified: v.boolean(),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("restricted")),
    kycStatus: v.union(
      v.literal("not_started"), v.literal("pending"), v.literal("under_review"),
      v.literal("approved"), v.literal("rejected"), v.literal("info_required")
    ),
    referredBy: v.optional(v.id("users")),
    referralCode: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]).index("by_referralCode", ["referralCode"]),

  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("super"), v.literal("finance"), v.literal("kyc"),
      v.literal("investment"), v.literal("compliance"), v.literal("support"),
      v.literal("marketing")
    ),
    status: v.union(v.literal("active"), v.literal("disabled")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  otpCodes: defineTable({
    email: v.string(),
    codeHash: v.string(),
    purpose: v.union(
      v.literal("signup_verify"), v.literal("login_2fa"),
      v.literal("password_reset"), v.literal("admin_password_reset")
    ),
    expiresAt: v.number(),
    consumedAt: v.optional(v.number()),
    attempts: v.number(),
  }).index("by_email_purpose", ["email", "purpose"]),

  sessions: defineTable({
    subjectId: v.string(),          // users._id or admins._id as string
    subjectType: v.union(v.literal("user"), v.literal("admin")),
    tokenHash: v.string(),
    userAgent: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_tokenHash", ["tokenHash"]).index("by_subject", ["subjectId"]),

  // ---------- KYC ----------
  kycApplications: defineTable({
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"), v.literal("under_review"), v.literal("approved"),
      v.literal("rejected"), v.literal("info_required")
    ),
    fullName: v.string(),
    dateOfBirth: v.string(),
    address: v.string(),
    documentType: v.string(),
    documentFileId: v.id("_storage"),
    selfieFileId: v.optional(v.id("_storage")),
    reviewedBy: v.optional(v.id("admins")),
    reviewNote: v.optional(v.string()),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  // ---------- BALANCES ----------
  balances: defineTable({
    userId: v.id("users"),
    available: v.number(),
    invested: v.number(),
    profit: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ---------- DEPOSITS (crypto + fiat, both manually verified) ----------
  deposits: defineTable({
    userId: v.id("users"),
    method: v.union(v.literal("crypto"), v.literal("fiat")),
    amountUsd: v.number(),
    currency: v.optional(v.string()),     // e.g. "USDT", "BTC" for crypto
    network: v.optional(v.string()),      // e.g. "TRC20", "ERC20"
    txHash: v.optional(v.string()),       // crypto: user-submitted hash
    supportTicketId: v.optional(v.id("supportTickets")), // fiat: linked ticket
    status: v.union(
      v.literal("pending"), v.literal("under_review"),
      v.literal("credited"), v.literal("rejected")
    ),
    verifiedBy: v.optional(v.id("admins")),
    verifiedAt: v.optional(v.number()),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]).index("by_txHash", ["txHash"]),

  // ---------- WITHDRAWALS ----------
  withdrawals: defineTable({
    userId: v.id("users"),
    balanceSource: v.union(v.literal("available"), v.literal("profit")),
    amountUsd: v.number(),
    walletAddress: v.string(),
    network: v.string(),
    status: v.union(
      v.literal("pending"), v.literal("under_review"), v.literal("approved"),
      v.literal("processing"), v.literal("completed"), v.literal("rejected"),
      v.literal("failed"), v.literal("cancelled")
    ),
    reviewedBy: v.optional(v.id("admins")),
    reviewNote: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  // ---------- INVESTMENT PLANS ----------
  investmentPlans: defineTable({
    name: v.string(),
    description: v.string(),
    minAmount: v.number(),
    maxAmount: v.number(),
    durationDays: v.number(),
    dailyReturnPercent: v.number(),
    accrualFrequency: v.union(v.literal("daily")),
    status: v.union(
      v.literal("draft"), v.literal("active"), v.literal("paused"),
      v.literal("closed"), v.literal("archived")
    ),
    createdBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // ---------- INVESTMENTS ----------
  investments: defineTable({
    userId: v.id("users"),
    planId: v.id("investmentPlans"),
    amount: v.number(),
    startDate: v.number(),
    maturityDate: v.number(),
    accruedProfit: v.number(),
    status: v.union(
      v.literal("pending"), v.literal("active"), v.literal("maturing"),
      v.literal("completed"), v.literal("cancelled"),
      v.literal("admin_paused"), v.literal("admin_ended")   // manual overrides, see rule below
    ),
    lastAccrualAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]).index("by_plan", ["planId"]),

  profitAccruals: defineTable({
    userId: v.id("users"),
    investmentId: v.id("investments"),
    planId: v.id("investmentPlans"),
    amount: v.number(),
    accrualDate: v.string(),   // "YYYY-MM-DD", one row per investment per day
  }).index("by_investment", ["investmentId"]).index("by_user_date", ["userId", "accrualDate"]),

  // ---------- MANUAL ADMIN ACTIONS (balance + investment overrides) ----------
  balanceAdjustments: defineTable({
    userId: v.id("users"),
    balanceType: v.union(v.literal("available"), v.literal("invested"), v.literal("profit")),
    direction: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(),
    reason: v.string(),
    performedBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  investmentOverrides: defineTable({
    investmentId: v.id("investments"),
    action: v.union(v.literal("pause"), v.literal("end"), v.literal("restart")),
    reason: v.string(),
    performedBy: v.id("admins"),
    createdAt: v.number(),
  }).index("by_investment", ["investmentId"]),

  // ---------- TRANSACTIONS (unified ledger/read-model) ----------
  transactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("deposit"), v.literal("investment"), v.literal("profit_accrual"),
      v.literal("withdrawal"), v.literal("referral_earning"),
      v.literal("admin_adjustment"), v.literal("fee")
    ),
    amount: v.number(),
    status: v.string(),
    relatedId: v.optional(v.string()),   // id of the source record, as string
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_type", ["type"]),

  // ---------- REFERRALS ----------
  referralEarnings: defineTable({
    referrerId: v.id("users"),
    referredUserId: v.id("users"),
    sourceInvestmentId: v.optional(v.id("investments")),
    amount: v.number(),
    createdAt: v.number(),
  }).index("by_referrer", ["referrerId"]),

  // ---------- SUPPORT TICKETS (used for fiat-deposit account requests + general support) ----------
  supportTickets: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    category: v.union(
      v.literal("fiat_deposit"), v.literal("general"),
      v.literal("kyc"), v.literal("withdrawal"), v.literal("other")
    ),
    status: v.union(v.literal("open"), v.literal("pending_admin"), v.literal("pending_user"), v.literal("closed")),
    assignedTo: v.optional(v.id("admins")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  supportMessages: defineTable({
    ticketId: v.id("supportTickets"),
    authorType: v.union(v.literal("user"), v.literal("admin")),
    authorId: v.string(),
    body: v.string(),
    fileId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_ticket", ["ticketId"]),

  // ---------- NOTIFICATIONS ----------
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_user_read", ["userId", "read"]),

  // ---------- EMAIL LOG ----------
  emailLog: defineTable({
    recipientEmail: v.string(),
    recipientUserId: v.optional(v.id("users")),
    subject: v.string(),
    campaignId: v.optional(v.string()),
    status: v.union(v.literal("sent"), v.literal("failed")),
    createdAt: v.number(),
  }).index("by_recipient", ["recipientEmail"]).index("by_campaign", ["campaignId"]),

  // ---------- AUDIT LOG ----------
  auditLogs: defineTable({
    adminId: v.id("admins"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    amount: v.optional(v.number()),
    before: v.optional(v.any()),
    after: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_admin", ["adminId"]).index("by_target", ["targetType", "targetId"]),

  // ---------- PLATFORM SETTINGS ----------
  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),
});
```

Notes:
- `investments.status` includes `admin_paused` / `admin_ended` as first-class states (the
  PRD delta). The daily-accrual cron (Phase 7) must skip any investment not in `active`.
- `deposits` covers both crypto and fiat through one table with a `method` discriminator —
  don't create two separate tables, the review/admin UI is shared.
- `transactions` is a denormalized read-model written alongside the source-of-truth tables
  (deposits, investments, withdrawals, etc.) purely so the "Transaction History" UI can do
  one query instead of fanning out — write to it from the same mutation that writes the
  source record, in the same transaction.

## 2. Function conventions

Structure `convex/` by domain, not by CRUD verb:

```
convex/
  schema.ts
  lib/
    auth.ts          # getCurrentUser(ctx), getCurrentAdmin(ctx), requireRole(ctx, roles[])
    audit.ts          # logAdminAction(ctx, {...}) helper — call from every admin mutation
    ledger.ts          # writeTransaction(ctx, {...}) helper
  users.ts
  admins.ts
  auth.ts              # signup/login/otp/session mutations+actions (Phase 3 owns the logic, lives here)
  kyc.ts
  balances.ts
  deposits.ts
  withdrawals.ts
  investmentPlans.ts
  investments.ts
  referrals.ts
  supportTickets.ts
  notifications.ts
  emails.ts             # actions that call Resend (Phase 7)
  crons.ts               # Phase 7
  admin/
    dashboard.ts          # aggregate KPI queries
    reports.ts
```

- **Every mutation that touches money or investment state must be idempotent-safe and
  re-validate server-side** (balance sufficiency, plan min/max, investment status
  transitions) — never trust a client-passed amount/status blindly.
- **Auth guard first line of every function:** call `getCurrentUser`/`getCurrentAdmin`
  from `convex/lib/auth.ts` and throw if missing/wrong type. Admin functions additionally
  call `requireRole(ctx, [...])` for role-gated actions (e.g. only `finance`/`super` can
  approve withdrawals).
- **Any admin mutation that changes a user's money or investment state calls
  `logAdminAction`** from `convex/lib/audit.ts` before returning — this is how §11–13 of
  the PRD (manual balance adjustment, pause/end/restart, audit trail) actually gets
  implemented; do not scatter ad hoc `ctx.db.insert("auditLogs", ...)` calls.
- Use Convex **actions** (not mutations) for anything calling an external service (Resend
  email sending in Phase 7) — mutations must stay side-effect-free w.r.t. the outside
  world.
- File storage (`_storage`) is used for KYC documents/selfies and support-ticket
  attachments — use `ctx.storage.generateUploadUrl()` from an authenticated mutation, never
  expose unauthenticated upload URLs.

## 3. Manual verification flows (schema-level contract)

- **Crypto deposit:** user creates a `deposits` row with `method: "crypto"`, `txHash`, and
  `status: "pending"`. Admin reviews, sets `status: "under_review"` or `"credited"`; on
  `"credited"`, the mutation increments `balances.available` and writes a `transactions`
  row, atomically.
- **Fiat deposit:** user creates a `supportTickets` row with `category: "fiat_deposit"`
  (enforced minimum $10,000 client + server side). Admin replies via `supportMessages`
  with account details. Once payment is confirmed off-platform, admin creates a `deposits`
  row with `method: "fiat"`, `supportTicketId` set, and credits balance the same way as
  crypto.

## Definition of Done
- [ ] `convex/schema.ts` deploys with zero errors (`pnpm dlx convex dev`).
- [ ] `convex/lib/auth.ts`, `audit.ts`, `ledger.ts` helpers exist with real (not stubbed) implementations against the `sessions`/`auditLogs`/`transactions` tables.
- [ ] One seed script (`convex/seed.ts`, run via a temporary internal mutation or `convex run`) creates: one `super` admin, 2–3 investment plans in `active` status, and one demo user with a funded balance — used for manual QA in every later phase.
- [ ] Every table above exists with the exact indexes listed (or better, if you find a real query need for more).
