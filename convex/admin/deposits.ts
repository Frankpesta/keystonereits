import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import { writeTransaction } from "../lib/ledger";
import type { Doc } from "../_generated/dataModel";

const DEPOSIT_ROLES: Doc<"admins">["role"][] = ["super", "finance"];
const METHOD = v.union(v.literal("crypto"), v.literal("fiat"));
const STATUS = v.union(v.literal("pending"), v.literal("under_review"), v.literal("credited"), v.literal("rejected"));

export const list = query({
  args: { sessionToken: v.string(), method: v.optional(METHOD), status: v.optional(STATUS) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, DEPOSIT_ROLES);

    const all = args.status
      ? await ctx.db.query("deposits").withIndex("by_status", (q) => q.eq("status", args.status!)).order("desc").take(300)
      : await ctx.db.query("deposits").order("desc").take(300);

    const filtered = all.filter((d) => !args.method || d.method === args.method);
    return await Promise.all(
      filtered.map(async (d) => {
        const user = await ctx.db.get(d.userId);
        return { ...d, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown user", userEmail: user?.email, userKycStatus: user?.kycStatus };
      })
    );
  },
});

export const detail = query({
  args: { sessionToken: v.string(), depositId: v.id("deposits") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, DEPOSIT_ROLES);

    const deposit = await ctx.db.get(args.depositId);
    if (!deposit) throw new ConvexError("Deposit not found.");
    const user = await ctx.db.get(deposit.userId);
    const supportTicket = deposit.supportTicketId ? await ctx.db.get(deposit.supportTicketId) : null;
    const proofUrl = deposit.proofFileId ? await ctx.storage.getUrl(deposit.proofFileId) : null;

    return { ...deposit, user, supportTicket, proofUrl };
  },
});

export const verifyAndCredit = mutation({
  args: { sessionToken: v.string(), depositId: v.id("deposits"), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, DEPOSIT_ROLES);

    const deposit = await ctx.db.get(args.depositId);
    if (!deposit) throw new ConvexError("Deposit not found.");
    if (deposit.status === "credited") throw new ConvexError("This deposit has already been credited.");

    const balance = await ctx.db
      .query("balances")
      .withIndex("by_user", (q) => q.eq("userId", deposit.userId))
      .unique();
    if (!balance) throw new ConvexError("This user has no balance record yet.");

    const now = Date.now();
    await ctx.db.patch(balance._id, { available: balance.available + deposit.amountUsd, updatedAt: now });
    await ctx.db.patch(args.depositId, {
      status: "credited",
      verifiedBy: admin._id,
      verifiedAt: now,
      note: args.note,
    });
    await writeTransaction(ctx, {
      userId: deposit.userId,
      type: "deposit",
      amount: deposit.amountUsd,
      status: "credited",
      relatedId: args.depositId,
    });
    await ctx.db.insert("notifications", {
      userId: deposit.userId,
      type: "deposit_credited",
      title: "Deposit Credited",
      body: `Your $${deposit.amountUsd.toLocaleString()} deposit has been credited to your available balance.`,
      read: false,
      createdAt: now,
    });
    const depositor = await ctx.db.get(deposit.userId);
    if (depositor) {
      await ctx.scheduler.runAfter(0, internal.emailActions.sendDepositCreditedEmail, {
        to: depositor.email,
        firstName: depositor.firstName,
        amountUsd: deposit.amountUsd,
        userId: depositor._id,
      });
    }

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "deposit_credit",
      targetType: "deposit",
      targetId: args.depositId,
      amount: deposit.amountUsd,
      before: { status: deposit.status },
      after: { status: "credited" },
    });

    return { ok: true as const };
  },
});

export const reject = mutation({
  args: { sessionToken: v.string(), depositId: v.id("deposits"), reason: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, DEPOSIT_ROLES);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    const deposit = await ctx.db.get(args.depositId);
    if (!deposit) throw new ConvexError("Deposit not found.");
    if (deposit.status === "credited") throw new ConvexError("This deposit has already been credited.");

    const now = Date.now();
    await ctx.db.patch(args.depositId, { status: "rejected", verifiedBy: admin._id, verifiedAt: now, note: reason });
    await ctx.db.insert("notifications", {
      userId: deposit.userId,
      type: "deposit_rejected",
      title: "Deposit Rejected",
      body: reason,
      read: false,
      createdAt: now,
    });

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "deposit_reject",
      targetType: "deposit",
      targetId: args.depositId,
      before: { status: deposit.status },
      after: { status: "rejected", reason },
    });

    return { ok: true as const };
  },
});
