import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import { writeTransaction } from "../lib/ledger";
import type { MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

/** Shared by both the notification and email sent on every status transition below. */
const WITHDRAWAL_STATUS_COPY: Record<string, { title: string; body: (reason?: string) => string }> = {
  approved: { title: "Withdrawal Approved", body: () => "Your withdrawal request has been approved and is queued for processing." },
  processing: { title: "Withdrawal Processing", body: () => "Your withdrawal is now processing." },
  completed: { title: "Withdrawal Completed", body: () => "Your withdrawal has been sent." },
  rejected: { title: "Withdrawal Rejected", body: (reason) => reason ?? "Your withdrawal request was rejected." },
  failed: { title: "Withdrawal Failed", body: (reason) => reason ?? "Your withdrawal could not be completed." },
};

const WITHDRAWAL_ROLES: Doc<"admins">["role"][] = ["super", "finance"];
const STATUS = v.union(
  v.literal("pending"),
  v.literal("under_review"),
  v.literal("approved"),
  v.literal("processing"),
  v.literal("completed"),
  v.literal("rejected"),
  v.literal("failed"),
  v.literal("cancelled")
);

export const list = query({
  args: { sessionToken: v.string(), status: v.optional(STATUS) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, WITHDRAWAL_ROLES);

    const all = args.status
      ? await ctx.db.query("withdrawals").withIndex("by_status", (q) => q.eq("status", args.status!)).order("desc").take(300)
      : await ctx.db.query("withdrawals").order("desc").take(300);

    return await Promise.all(
      all.map(async (w) => {
        const user = await ctx.db.get(w.userId);
        return { ...w, userName: user ? `${user.firstName} ${user.lastName}` : "Unknown user", userEmail: user?.email };
      })
    );
  },
});

export const detail = query({
  args: { sessionToken: v.string(), withdrawalId: v.id("withdrawals") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, WITHDRAWAL_ROLES);

    const withdrawal = await ctx.db.get(args.withdrawalId);
    if (!withdrawal) throw new ConvexError("Withdrawal not found.");
    const user = await ctx.db.get(withdrawal.userId);
    const balance = await ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", withdrawal.userId)).unique();

    return { ...withdrawal, user, balance };
  },
});

async function transition(
  ctx: MutationCtx,
  args: {
    adminId: Id<"admins">;
    withdrawalId: Id<"withdrawals">;
    allowedFrom: Doc<"withdrawals">["status"][];
    toStatus: Doc<"withdrawals">["status"];
    reason?: string;
    action: string;
  }
) {
  const withdrawal = await ctx.db.get(args.withdrawalId);
  if (!withdrawal) throw new ConvexError("Withdrawal not found.");
  if (!args.allowedFrom.includes(withdrawal.status)) {
    throw new ConvexError(`Cannot move a withdrawal from "${withdrawal.status}" to "${args.toStatus}".`);
  }

  const now = Date.now();
  await ctx.db.patch(args.withdrawalId, {
    status: args.toStatus,
    reviewedBy: args.adminId,
    reviewNote: args.reason,
  });

  const copy = WITHDRAWAL_STATUS_COPY[args.toStatus];
  if (copy) {
    const body = copy.body(args.reason);
    await ctx.db.insert("notifications", {
      userId: withdrawal.userId,
      type: `withdrawal_${args.toStatus}`,
      title: copy.title,
      body,
      read: false,
      createdAt: now,
    });
    const user = await ctx.db.get(withdrawal.userId);
    if (user) {
      await ctx.scheduler.runAfter(0, internal.emailActions.sendWithdrawalStatusEmail, {
        to: user.email,
        firstName: user.firstName,
        amountUsd: withdrawal.amountUsd,
        status: args.toStatus as "approved" | "processing" | "completed" | "rejected" | "failed",
        reason: args.reason,
        userId: user._id,
      });
    }
  }

  await logAdminAction(ctx, {
    adminId: args.adminId,
    action: args.action,
    targetType: "withdrawal",
    targetId: args.withdrawalId,
    amount: withdrawal.amountUsd,
    before: { status: withdrawal.status },
    after: { status: args.toStatus, reason: args.reason },
  });

  return withdrawal;
}

export const approve = mutation({
  args: { sessionToken: v.string(), withdrawalId: v.id("withdrawals") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, WITHDRAWAL_ROLES);
    await transition(ctx, {
      adminId: admin._id,
      withdrawalId: args.withdrawalId,
      allowedFrom: ["pending", "under_review"],
      toStatus: "approved",
      action: "withdrawal_approve",
    });
    return { ok: true as const };
  },
});

export const markProcessing = mutation({
  args: { sessionToken: v.string(), withdrawalId: v.id("withdrawals") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, WITHDRAWAL_ROLES);
    await transition(ctx, {
      adminId: admin._id,
      withdrawalId: args.withdrawalId,
      allowedFrom: ["approved"],
      toStatus: "processing",
      action: "withdrawal_processing",
    });
    return { ok: true as const };
  },
});

/**
 * The only transition that actually moves money: earmarked funds (Phase 5's
 * withdrawal design) become a real balance decrement here, not at request
 * time. See convex/lib/withdrawals.ts.
 */
export const complete = mutation({
  args: { sessionToken: v.string(), withdrawalId: v.id("withdrawals") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, WITHDRAWAL_ROLES);

    const withdrawal = await transition(ctx, {
      adminId: admin._id,
      withdrawalId: args.withdrawalId,
      allowedFrom: ["approved", "processing"],
      toStatus: "completed",
      action: "withdrawal_complete",
    });

    const balance = await ctx.db.query("balances").withIndex("by_user", (q) => q.eq("userId", withdrawal.userId)).unique();
    if (!balance) throw new ConvexError("This user has no balance record.");
    const current = balance[withdrawal.balanceSource];
    if (current < withdrawal.amountUsd) {
      throw new ConvexError("Balance is insufficient to complete this withdrawal — investigate before retrying.");
    }

    const now = Date.now();
    await ctx.db.patch(balance._id, { [withdrawal.balanceSource]: current - withdrawal.amountUsd, updatedAt: now });
    await ctx.db.patch(args.withdrawalId, { completedAt: now });
    await writeTransaction(ctx, {
      userId: withdrawal.userId,
      type: "withdrawal",
      amount: withdrawal.amountUsd,
      status: "completed",
      relatedId: args.withdrawalId,
    });

    return { ok: true as const };
  },
});

export const rejectOrFail = mutation({
  args: {
    sessionToken: v.string(),
    withdrawalId: v.id("withdrawals"),
    outcome: v.union(v.literal("rejected"), v.literal("failed")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, WITHDRAWAL_ROLES);
    const reason = args.reason.trim();
    if (!reason) throw new ConvexError("A reason is required.");

    await transition(ctx, {
      adminId: admin._id,
      withdrawalId: args.withdrawalId,
      allowedFrom: ["pending", "under_review", "approved", "processing"],
      toStatus: args.outcome,
      reason,
      action: `withdrawal_${args.outcome}`,
    });

    return { ok: true as const };
  },
});
