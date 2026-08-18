import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import { writeTransaction } from "../lib/ledger";
import { hashPassword } from "../lib/password";
import { createSession, invalidateAllSessions } from "../lib/sessions";
import { passwordSchema } from "../../src/lib/validation/auth";

/** Both are irreversible/high-blast-radius — permanent deletion and silent full account access — so unlike the other admin actions in this file, only "super" may perform them. */
const CAN_DELETE_OR_IMPERSONATE: Doc<"admins">["role"][] = ["super"];

const USER_STATUS = v.union(v.literal("active"), v.literal("suspended"), v.literal("restricted"));
const BALANCE_TYPE = v.union(v.literal("available"), v.literal("invested"), v.literal("profit"));

/** Bounded full-table scan — see convex/admin/dashboard.ts's note on dev/MVP scale. */
export const list = query({
  args: { sessionToken: v.string(), search: v.optional(v.string()), status: v.optional(USER_STATUS) },
  handler: async (ctx, args) => {
    await getCurrentAdmin(ctx, args.sessionToken);
    const all = await ctx.db.query("users").order("desc").take(500);

    const term = args.search?.trim().toLowerCase();
    return all
      .filter((u) => !args.status || u.status === args.status)
      .filter(
        (u) =>
          !term ||
          u.email.toLowerCase().includes(term) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(term)
      )
      .slice(0, 100);
  },
});

export const detail = query({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await getCurrentAdmin(ctx, args.sessionToken);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found.");

    const balance = await ctx.db
      .query("balances")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    const kycApplicationRaw = await ctx.db
      .query("kycApplications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    const [referredByUser, kycApplication] = await Promise.all([
      user.referredBy ? ctx.db.get(user.referredBy) : null,
      kycApplicationRaw
        ? (async () => {
            const reviewer = kycApplicationRaw.reviewedBy ? await ctx.db.get(kycApplicationRaw.reviewedBy) : null;
            return {
              ...kycApplicationRaw,
              documentUrl: await ctx.storage.getUrl(kycApplicationRaw.documentFileId),
              selfieUrl: kycApplicationRaw.selfieFileId
                ? await ctx.storage.getUrl(kycApplicationRaw.selfieFileId)
                : null,
              reviewerName: reviewer ? reviewer.name : null,
            };
          })()
        : Promise.resolve(null),
    ]);

    const [investmentsRaw, deposits, withdrawals, transactions, referralEarnings, auditEntries] = await Promise.all([
      ctx.db.query("investments").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("deposits").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("withdrawals").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("transactions").withIndex("by_user", (q) => q.eq("userId", args.userId)).order("desc").take(50),
      ctx.db.query("referralEarnings").withIndex("by_referrer", (q) => q.eq("referrerId", args.userId)).collect(),
      ctx.db.query("auditLogs").withIndex("by_target", (q) => q.eq("targetType", "user").eq("targetId", args.userId)).order("desc").take(50),
    ]);

    const investments = await Promise.all(
      investmentsRaw.map(async (inv) => ({ ...inv, plan: await ctx.db.get(inv.planId) }))
    );

    const { passwordHash, ...userWithoutPasswordHash } = user;
    void passwordHash;

    return {
      user: userWithoutPasswordHash,
      referredByUser: referredByUser
        ? { firstName: referredByUser.firstName, lastName: referredByUser.lastName, email: referredByUser.email }
        : null,
      balance,
      kycApplication,
      investments,
      deposits,
      withdrawals,
      transactions,
      referralEarnings,
      auditEntries,
    };
  },
});

export const updateStatus = mutation({
  args: { sessionToken: v.string(), userId: v.id("users"), status: USER_STATUS, reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super", "compliance"]);

    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found.");

    const before = { status: user.status };
    await ctx.db.patch(args.userId, { status: args.status });

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "user_status_update",
      targetType: "user",
      targetId: args.userId,
      before,
      after: { status: args.status, reason },
    });

    return { ok: true as const };
  },
});

export const adjustBalance = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    balanceType: BALANCE_TYPE,
    direction: v.union(v.literal("credit"), v.literal("debit")),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super", "finance"]);

    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");
    if (!Number.isFinite(args.amount) || args.amount <= 0) throw new ConvexError("Enter a valid amount.");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found.");
    const balance = await ctx.db
      .query("balances")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (!balance) throw new ConvexError("This user has no balance record yet.");

    const before = balance[args.balanceType];
    const delta = args.direction === "credit" ? args.amount : -args.amount;
    const after = before + delta;
    if (after < 0) throw new ConvexError("This debit would take the balance below zero.");

    await ctx.db.patch(balance._id, { [args.balanceType]: after, updatedAt: Date.now() });

    await ctx.db.insert("balanceAdjustments", {
      userId: args.userId,
      balanceType: args.balanceType,
      direction: args.direction,
      amount: args.amount,
      reason,
      performedBy: admin._id,
      createdAt: Date.now(),
    });

    await writeTransaction(ctx, {
      userId: args.userId,
      type: "admin_adjustment",
      amount: args.amount,
      status: args.direction,
    });

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "balance_adjustment",
      targetType: "balances",
      targetId: balance._id,
      amount: args.amount,
      before: { [args.balanceType]: before },
      after: { [args.balanceType]: after, reason },
    });

    return { ok: true as const };
  },
});

export const resetPassword = mutation({
  args: { sessionToken: v.string(), userId: v.id("users"), newPassword: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super", "compliance"]);

    const passwordParsed = passwordSchema.safeParse(args.newPassword);
    if (!passwordParsed.success) {
      throw new ConvexError(passwordParsed.error.issues[0]?.message ?? "Invalid password.");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found.");

    await ctx.db.patch(args.userId, { passwordHash: await hashPassword(passwordParsed.data) });
    await invalidateAllSessions(ctx, user._id);

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "user_password_reset",
      targetType: "user",
      targetId: args.userId,
    });

    return { ok: true as const };
  },
});

/**
 * Mints a real session for the target user with no OTP, email, or
 * notification of any kind — the user is never made aware. The only trace
 * is the audit log entry below, which is only ever visible to admins.
 */
export const impersonate = mutation({
  args: { sessionToken: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, CAN_DELETE_OR_IMPERSONATE);

    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found.");

    const { token, expiresAt } = await createSession(ctx, {
      subjectId: user._id,
      subjectType: "user",
    });

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "user_impersonated",
      targetType: "user",
      targetId: args.userId,
    });

    return { token, expiresAt };
  },
});

/**
 * Permanently erases a user and every record that belongs to them —
 * irreversible. Requires re-typing the account's email as a confirmation
 * guard against misclicks, since there is no undo.
 *
 * Records another user co-owns alongside this one (a referrer's earning row
 * where this user is only the referred party, e.g.) are left in place with a
 * dangling reference rather than deleted — that money and history belongs to
 * the other account. Every read path already treats a missing referenced
 * user as optional (see admin/referrals.ts's "Unknown user" fallback).
 *
 * A final audit log entry survives the purge as the only record that this
 * happened, and is written after everything else so it isn't itself wiped.
 */
export const deleteUser = mutation({
  args: { sessionToken: v.string(), userId: v.id("users"), confirmEmail: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, CAN_DELETE_OR_IMPERSONATE);

    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new ConvexError("User not found.");
    if (args.confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      throw new ConvexError("Confirmation email does not match this account.");
    }

    const [
      balance,
      kycApplication,
      deposits,
      withdrawals,
      investments,
      transactions,
      referralEarningsAsReferrer,
      balanceAdjustments,
      supportTickets,
      notifications,
      emailLogEntries,
      auditLogEntries,
      referredUsers,
    ] = await Promise.all([
      ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", args.userId)).unique(),
      ctx.db.query("kycApplications").withIndex("by_user", (q) => q.eq("userId", args.userId)).unique(),
      ctx.db.query("deposits").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("withdrawals").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("investments").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("transactions").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("referralEarnings").withIndex("by_referrer", (q) => q.eq("referrerId", args.userId)).collect(),
      ctx.db.query("balanceAdjustments").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("supportTickets").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("notifications").withIndex("by_user", (q) => q.eq("userId", args.userId)).collect(),
      ctx.db.query("emailLog").withIndex("by_recipient", (q) => q.eq("recipientEmail", user.email)).collect(),
      ctx.db.query("auditLogs").withIndex("by_target", (q) => q.eq("targetType", "user").eq("targetId", args.userId)).collect(),
      ctx.db.query("users").withIndex("by_referredBy", (q) => q.eq("referredBy", args.userId)).collect(),
    ]);

    if (kycApplication) {
      await ctx.storage.delete(kycApplication.documentFileId);
      if (kycApplication.selfieFileId) await ctx.storage.delete(kycApplication.selfieFileId);
      await ctx.db.delete(kycApplication._id);
    }
    if (balance) await ctx.db.delete(balance._id);

    for (const deposit of deposits) {
      if (deposit.proofFileId) await ctx.storage.delete(deposit.proofFileId);
      await ctx.db.delete(deposit._id);
    }
    for (const withdrawal of withdrawals) await ctx.db.delete(withdrawal._id);

    for (const investment of investments) {
      const [accruals, overrides] = await Promise.all([
        ctx.db.query("profitAccruals").withIndex("by_investment", (q) => q.eq("investmentId", investment._id)).collect(),
        ctx.db.query("investmentOverrides").withIndex("by_investment", (q) => q.eq("investmentId", investment._id)).collect(),
      ]);
      for (const accrual of accruals) await ctx.db.delete(accrual._id);
      for (const override of overrides) await ctx.db.delete(override._id);
      await ctx.db.delete(investment._id);
    }

    for (const transaction of transactions) await ctx.db.delete(transaction._id);
    for (const earning of referralEarningsAsReferrer) await ctx.db.delete(earning._id);
    for (const adjustment of balanceAdjustments) await ctx.db.delete(adjustment._id);

    for (const ticket of supportTickets) {
      const messages = await ctx.db
        .query("supportMessages")
        .withIndex("by_ticket", (q) => q.eq("ticketId", ticket._id))
        .collect();
      for (const message of messages) {
        if (message.fileId) await ctx.storage.delete(message.fileId);
        await ctx.db.delete(message._id);
      }
      await ctx.db.delete(ticket._id);
    }

    for (const notification of notifications) await ctx.db.delete(notification._id);
    for (const entry of emailLogEntries) await ctx.db.delete(entry._id);
    for (const entry of auditLogEntries) await ctx.db.delete(entry._id);

    // Users this account referred keep their own history; only the dangling
    // pointer back to the now-deleted referrer is cleared.
    for (const referredUser of referredUsers) {
      await ctx.db.patch(referredUser._id, { referredBy: undefined });
    }

    await invalidateAllSessions(ctx, args.userId);
    await ctx.db.delete(args.userId);

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "user_deleted",
      targetType: "user",
      targetId: args.userId,
      before: { email: user.email, firstName: user.firstName, lastName: user.lastName, reason },
    });

    return { ok: true as const };
  },
});
