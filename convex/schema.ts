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
  })
    .index("by_email", ["email"])
    .index("by_referralCode", ["referralCode"])
    .index("by_referredBy", ["referredBy"]),

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
    subjectId: v.string(), // users._id or admins._id as string
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
    currency: v.optional(v.string()), // e.g. "USDT", "BTC" for crypto
    network: v.optional(v.string()), // e.g. "TRC20", "ERC20"
    txHash: v.optional(v.string()), // legacy: pre-file-upload deposits only, no longer collected
    proofFileId: v.optional(v.id("_storage")), // crypto: user-uploaded proof of payment
    supportTicketId: v.optional(v.id("supportTickets")), // fiat: linked ticket
    status: v.union(
      v.literal("pending"), v.literal("under_review"),
      v.literal("credited"), v.literal("rejected")
    ),
    verifiedBy: v.optional(v.id("admins")),
    verifiedAt: v.optional(v.number()),
    note: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

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
    weeklyReturnPercent: v.number(),
    accrualFrequency: v.union(v.literal("weekly")),
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
      v.literal("admin_paused"), v.literal("admin_ended") // manual overrides, see rule below
    ),
    lastAccrualAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]).index("by_plan", ["planId"]),

  profitAccruals: defineTable({
    userId: v.id("users"),
    investmentId: v.id("investments"),
    planId: v.id("investmentPlans"),
    amount: v.number(),
    accrualDate: v.string(), // "YYYY-MM-DD", one row per investment per day
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
    relatedId: v.optional(v.string()), // id of the source record, as string
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
  // Exactly one of userId/adminId is set per row (a user notification or an
  // admin notification) — fanned out one row per recipient on write, same
  // pattern as the rest of this table.
  notifications: defineTable({
    userId: v.optional(v.id("users")),
    adminId: v.optional(v.id("admins")),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    relatedId: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_admin", ["adminId"])
    .index("by_admin_read", ["adminId", "read"]),

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

  // ---------- RATE LIMITING (Phase 3) ----------
  // Generic fixed-window counter reused for every rate-limited auth flow
  // (login attempts, OTP resend, password-reset requests) rather than a
  // bespoke table per flow. `key` is flow-specific, e.g. "login:<email>".
  rateLimits: defineTable({
    key: v.string(),
    windowStart: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),

  // ---------- PUBLIC CONTACT FORM (Phase 4) ----------
  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("read")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),
});
