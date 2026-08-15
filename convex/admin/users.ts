import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import { writeTransaction } from "../lib/ledger";
import { hashPassword } from "../lib/password";
import { invalidateAllSessions } from "../lib/sessions";
import { passwordSchema } from "../../src/lib/validation/auth";

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
