import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./lib/auth";
import { writeTransaction } from "./lib/ledger";
import { notifyAdminsByRole } from "./lib/notify";
import { pendingWithdrawalTotals } from "./lib/withdrawals";
import type { Doc } from "./_generated/dataModel";

const WITHDRAWAL_NOTIFY_ROLES: Doc<"admins">["role"][] = ["super", "finance"];

export const request = mutation({
  args: {
    sessionToken: v.string(),
    balanceSource: v.union(v.literal("available"), v.literal("profit")),
    amountUsd: v.number(),
    walletAddress: v.string(),
    network: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);

    if (!Number.isFinite(args.amountUsd) || args.amountUsd <= 0) {
      throw new ConvexError("Enter a valid withdrawal amount.");
    }
    const walletAddress = args.walletAddress.trim();
    const network = args.network.trim();
    if (!walletAddress || !network) {
      throw new ConvexError("Enter a destination wallet address and network.");
    }

    const balance = await ctx.db
      .query("balances")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    const raw = balance?.[args.balanceSource] ?? 0;
    const pending = await pendingWithdrawalTotals(ctx, user._id);
    const earmarked = pending[args.balanceSource];
    const availableToWithdraw = Math.max(0, raw - earmarked);

    if (args.amountUsd > availableToWithdraw) {
      throw new ConvexError(
        `You can only withdraw up to $${availableToWithdraw.toLocaleString()} from this balance right now.`
      );
    }

    const withdrawalId = await ctx.db.insert("withdrawals", {
      userId: user._id,
      balanceSource: args.balanceSource,
      amountUsd: args.amountUsd,
      walletAddress,
      network,
      status: "pending",
      createdAt: Date.now(),
    });

    await writeTransaction(ctx, {
      userId: user._id,
      type: "withdrawal",
      amount: args.amountUsd,
      status: "pending",
      relatedId: withdrawalId,
    });
    await ctx.db.insert("notifications", {
      userId: user._id,
      type: "withdrawal_pending",
      title: "Withdrawal Requested",
      body: `Your withdrawal request for $${args.amountUsd.toLocaleString()} has been received and is pending review.`,
      read: false,
      createdAt: Date.now(),
    });
    await notifyAdminsByRole(ctx, {
      roles: WITHDRAWAL_NOTIFY_ROLES,
      type: "admin_withdrawal_requested",
      title: "New Withdrawal Request",
      body: `${user.firstName} ${user.lastName} requested a $${args.amountUsd.toLocaleString()} withdrawal.`,
    });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendWithdrawalStatusEmail, {
      to: user.email,
      firstName: user.firstName,
      amountUsd: args.amountUsd,
      status: "pending",
      userId: user._id,
    });

    return { ok: true as const, withdrawalId };
  },
});

export const myWithdrawals = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    return await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});
